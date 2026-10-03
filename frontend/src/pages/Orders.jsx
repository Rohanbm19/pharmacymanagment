import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { Filter, Plus, ShoppingBag, Package, Clock, XCircle, Eye, ChevronLeft, ChevronRight, Trash2, PlusSquare } from 'lucide-react';
import { placeOrder, getOrderDetails, getMedicines, getOrders } from '../services/api';

export default function Orders() {
  const [orders, setOrders] = useState([]);

  const [stats, setStats] = useState({
    total: 0,
    delivered: 0,
    processing: 0,
    cancelled: 0
  });

  const [showNewOrder, setShowNewOrder] = useState(false);
  const [newCustomer, setNewCustomer] = useState('');
  const [medicines, setMedicines] = useState([]);
  const [lineItems, setLineItems] = useState([{ medicine_id: '', quantity: 1 }]);
  const [viewDetails, setViewDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [orderError, setOrderError] = useState('');

  const resetNewOrderForm = () => {
    setNewCustomer('');
    setLineItems([{ medicine_id: '', quantity: 1 }]);
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Delivered': return <span className="badge badge-success">Delivered</span>;
      case 'Processing': return <span className="badge badge-info">Processing</span>;
      case 'Shipped': return <span className="badge badge-warning">Shipped</span>;
      case 'Cancelled': return <span className="badge badge-danger">Cancelled</span>;
      default: return <span className="badge">{status}</span>;
    }
  };

  const getPaymentBadge = (payment) => {
    switch(payment) {
      case 'Paid': return <span className="badge badge-success">Paid</span>;
      case 'COD': return <span className="badge badge-warning">COD</span>;
      case 'Refunded': return <span className="badge badge-danger">Refunded</span>;
      default: return <span className="badge">{payment}</span>;
    }
  };

  const handleOpenNew = () => {
    setOrderError('');
    setShowNewOrder(true);
  };

  const fetchMedicinesLive = async () => {
    try {
      const resp = await getMedicines();
      setMedicines(Array.isArray(resp.data) ? resp.data : resp.data?.medicines || []);
    } catch (err) {
      console.error('Failed to load medicines', err);
    }
  };

  const fetchOrdersLive = async () => {
    try {
      const resp = await getOrders();
      const rows = Array.isArray(resp.data) ? resp.data : resp.data?.orders || [];

      const mapped = rows.map((order) => ({
        id: `#ORD-${order.id}`,
        customer: order.customer || 'Guest',
        date: order.date ? new Date(order.date).toLocaleString() : 'N/A',
        items: Number(order.items || 0),
        amount: Number(order.amount || 0),
        status: order.status || 'Processing',
        payment: order.payment || 'Pending',
        order_id: order.id
      }));

      setOrders(mapped);
      setStats({
        total: rows.length,
        delivered: rows.filter(o => String(o.status).toLowerCase() === 'delivered').length,
        processing: rows.filter(o => String(o.status).toLowerCase() === 'processing').length,
        cancelled: rows.filter(o => String(o.status).toLowerCase() === 'cancelled').length
      });
    } catch (err) {
      console.error('Failed to load orders', err);
    }
  };

  useEffect(() => {
    let mounted = true;
    const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001');

    const loadData = async () => {
      if (!mounted) return;
      await fetchMedicinesLive();
      await fetchOrdersLive();
    };

    loadData();

    socket.on('connect', () => console.log('Orders socket connected'));
    socket.on('orders:updated', loadData);
    socket.on('medicines:updated', loadData);

    return () => {
      mounted = false;
      socket.disconnect();
    };
  }, []);

  const addLineItem = () => {
    setOrderError('');
    setLineItems(prev => [...prev, { medicine_id: '', quantity: 1 }]);
  };
  const removeLineItem = (idx) => {
    setOrderError('');
    setLineItems(prev => prev.filter((_, i) => i !== idx));
  };
  const updateLineItem = (idx, patch) => {
    setOrderError('');
    setLineItems(prev => prev.map((it, i) => i === idx ? { ...it, ...patch } : it));
  };

  const computeTotals = () => {
    let total = 0; let itemsCount = 0;
    for (const it of lineItems) {
      const m = medicines.find(m => String(m.id) === String(it.medicine_id));
      const qty = Number(it.quantity) || 0;
      if (m) total += Number(m.price || 0) * qty;
      itemsCount += qty;
    }
    return { total, itemsCount };
  };

  const hasAvailableMedicines = medicines.some((medicine) => Number(medicine.stock) > 0);

  const handleSubmitNew = async (e) => {
    e.preventDefault();

    if (!newCustomer.trim()) {
      setOrderError('Enter the customer name to continue.');
      return;
    }

    const medicine_list = lineItems
      .map(li => ({ medicine_id: Number(li.medicine_id), quantity: Number(li.quantity) }))
      .filter(li => li.medicine_id && li.quantity > 0);

    if (medicine_list.length !== lineItems.length || medicine_list.length === 0) {
      setOrderError('Choose a medicine and a valid quantity for every order line.');
      return;
    }

    for (const item of medicine_list) {
      const medicine = medicines.find((entry) => Number(entry.id) === item.medicine_id);
      if (!medicine) {
        setOrderError('One of the selected medicines is no longer available. Refresh the list and try again.');
        return;
      }
      if (item.quantity > Number(medicine.stock)) {
        setOrderError(`${medicine.name} has only ${medicine.stock} in stock.`);
        return;
      }
    }

    setOrderError('');
    setLoading(true);
    try {
      await placeOrder({ customer_name: newCustomer.trim(), medicine_list });
      setShowNewOrder(false);
      resetNewOrderForm();
      await fetchOrdersLive();
    } catch (err) {
      console.error(err);
      setOrderError(err.response?.data?.message || err.message || 'Failed to place order. Please try again.');
    } finally { setLoading(false); }
  };

  const handleView = async (order) => {
    // If we have numeric order_id, fetch details; otherwise show summary
    if (order.order_id) {
      try {
        const resp = await getOrderDetails(order.order_id);
        setViewDetails({ order, rows: resp.data });
      } catch (err) {
        console.error(err);
        alert('Failed to load order details');
      }
    } else {
      setViewDetails({ order, rows: null });
    }
  };

  const closeView = () => setViewDetails(null);

  return (
    <div>
      <div className="page-header">
        <div className="page-title">
          <h1>Orders</h1>
          <p>Track and manage customer orders</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-outline">
            <Filter size={16} /> Filter
          </button>
          <button className="btn btn-primary" onClick={handleOpenNew}>
            <Plus size={16} /> New Order
          </button>
        </div>
      </div>

      <div className="stat-cards-grid">
        <div className="stat-card" style={{ padding: '24px' }}>
          <div className="icon-box icon-blue"><ShoppingBag size={24} /></div>
          <div className="stat-content">
            <div className="stat-label">Total Orders</div>
            <div className="stat-value">{stats.total}</div>
            <div className="text-muted text-sm">This Month</div>
          </div>
        </div>
        <div className="stat-card" style={{ padding: '24px' }}>
          <div className="icon-box icon-green"><Package size={24} /></div>
          <div className="stat-content">
            <div className="stat-label">Delivered</div>
            <div className="stat-value">{stats.delivered}</div>
            <div className="text-muted text-sm">56.25%</div>
          </div>
        </div>
        <div className="stat-card" style={{ padding: '24px' }}>
          <div className="icon-box icon-orange"><Clock size={24} /></div>
          <div className="stat-content">
            <div className="stat-label">Processing</div>
            <div className="stat-value">{stats.processing}</div>
            <div className="text-muted text-sm">29.69%</div>
          </div>
        </div>
        <div className="stat-card" style={{ padding: '24px' }}>
          <div className="icon-box icon-purple"><XCircle size={24} /></div>
          <div className="stat-content">
            <div className="stat-label">Cancelled</div>
            <div className="stat-value">{stats.cancelled}</div>
            <div className="text-muted text-sm">14.06%</div>
          </div>
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Items</th>
              <th>Total Amount (₹)</th>
              <th>Status</th>
              <th>Payment</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order, i) => (
              <tr key={i}>
                <td className="font-semibold text-muted">{order.id}</td>
                <td className="font-semibold">{order.customer}</td>
                <td className="text-muted">{order.date}</td>
                <td className="text-muted">{order.items} items</td>
                <td>{(order.amount || 0).toFixed(2)}</td>
                <td>{getStatusBadge(order.status)}</td>
                <td>{getPaymentBadge(order.payment)}</td>
                <td>
                  <button className="btn-icon" onClick={() => handleView(order)}><Eye size={16} /></button>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan="8" className="orders-empty-state">
                  <span className="orders-empty-icon"><ShoppingBag size={22} /></span>
                  <strong>No orders yet</strong>
                  <span>Create an order to see it listed here.</span>
                </td>
              </tr>
            )}
          </tbody>
        </table>
        
        {/* Pagination */}
        <div className="pagination">
          <div>Showing {orders.length ? 1 : 0} to {orders.length} of {stats.total} entries</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div className="page-controls">
              <button className="page-btn"><ChevronLeft size={16} /></button>
              <button className="page-btn active">1</button>
              <button className="page-btn">2</button>
              <button className="page-btn">3</button>
              <div style={{ padding: '0 8px', color: 'var(--text-muted)', display: 'flex', alignItems: 'flex-end' }}>...</div>
              <button className="page-btn">64</button>
              <button className="page-btn"><ChevronRight size={16} /></button>
            </div>
            <div style={{ color: 'var(--text-muted)' }}>5 / page</div>
          </div>
        </div>
      </div>

      {/* New Order Modal */}
      {showNewOrder && (
        <div className="modal-backdrop" onMouseDown={(event) => {
          if (event.target === event.currentTarget && !loading) setShowNewOrder(false);
        }}>
          <div className="card modal-card order-modal">
            <div className="order-modal-header">
              <div>
                <span className="order-modal-kicker">SALES</span>
                <h2>Create an order</h2>
                <p>Add a customer and the medicines they need.</p>
              </div>
              <button type="button" className="btn btn-outline" onClick={() => setShowNewOrder(false)} disabled={loading}>Close</button>
            </div>

            <form className="order-form" onSubmit={handleSubmitNew}>
              <div className="order-form-section">
                <label className="order-field-label" htmlFor="order-customer">Customer name</label>
                <input
                  id="order-customer"
                  value={newCustomer}
                  onChange={e => setNewCustomer(e.target.value)}
                  placeholder="e.g. Priya Sharma"
                  autoComplete="name"
                  required
                />
              </div>

              <div className="order-form-section">
                <div className="order-items-heading">
                  <div>
                    <label className="order-field-label">Order items</label>
                    <span className="order-field-hint">Select medicines and quantities. Price is calculated automatically.</span>
                  </div>
                  <button type="button" className="btn btn-outline" onClick={addLineItem} disabled={!hasAvailableMedicines}>
                    <PlusSquare size={16} /> Add item
                  </button>
                </div>

                {!hasAvailableMedicines && (
                  <div className="order-empty-inventory">
                    <Package size={19} />
                    <span>No medicines are currently in stock. Update inventory before creating an order.</span>
                  </div>
                )}

                {lineItems.map((item, idx) => {
                  const selectedMedicine = medicines.find(m => String(m.id) === String(item.medicine_id));
                  const itemTotal = selectedMedicine ? Number(selectedMedicine.price || 0) * Number(item.quantity || 0) : 0;
                  const selectedElsewhere = lineItems
                    .filter((_, lineIndex) => lineIndex !== idx)
                    .map((line) => String(line.medicine_id));

                  return (
                    <div className="order-line" key={idx}>
                      <select
                        aria-label={`Medicine for item ${idx + 1}`}
                        value={item.medicine_id}
                        onChange={e => updateLineItem(idx, { medicine_id: e.target.value })}
                        required
                      >
                        <option value="">Select medicine</option>
                        {medicines.map(med => (
                          <option
                            key={med.id}
                            value={med.id}
                            disabled={Number(med.stock) <= 0 || selectedElsewhere.includes(String(med.id))}
                          >
                            {med.name} · {med.stock} in stock · ₹{Number(med.price || 0).toFixed(2)}
                          </option>
                        ))}
                      </select>

                      <input
                        type="number"
                        aria-label={`Quantity for item ${idx + 1}`}
                        min="1"
                        max={selectedMedicine?.stock}
                        value={item.quantity}
                        onChange={e => updateLineItem(idx, { quantity: Number(e.target.value) || 1 })}
                        required
                      />

                      <div className="order-line-total">
                        <span>Line total</span>
                        <strong>₹{itemTotal.toFixed(2)}</strong>
                      </div>

                      <button
                        type="button"
                        className="order-remove-button"
                        onClick={() => removeLineItem(idx)}
                        disabled={lineItems.length === 1}
                        title="Remove item"
                        aria-label={`Remove item ${idx + 1}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="order-summary">
                <div>
                  <span className="order-field-hint">Total quantity</span>
                  <strong>{computeTotals().itemsCount} {computeTotals().itemsCount === 1 ? 'item' : 'items'}</strong>
                </div>
                <div className="order-grand-total">
                  <span>Order total</span>
                  <strong>₹{computeTotals().total.toFixed(2)}</strong>
                </div>
              </div>

              {orderError && <div className="order-error" role="alert">{orderError}</div>}

              <div className="order-form-actions">
                <button type="button" className="btn btn-outline" onClick={() => { setShowNewOrder(false); resetNewOrderForm(); setOrderError(''); }} disabled={loading}>
                  Cancel
                </button>
                <button className="btn btn-primary order-submit" type="submit" disabled={loading || !hasAvailableMedicines}>
                  <ShoppingBag size={16} />
                  {loading ? 'Placing order…' : 'Place order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {viewDetails && (
        <div className="modal-backdrop">
          <div className="card modal-card" style={{ width: '640px', maxWidth: '100%', padding: '32px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3>Order Details - {viewDetails.order.id}</h3>
            {viewDetails.rows ? (
              <div>
                <table>
                  <thead><tr><th>Medicine</th><th>Qty</th><th>Price</th><th>Subtotal</th></tr></thead>
                  <tbody>
                    {viewDetails.rows.map((r, idx) => (
                      <tr key={idx}>
                        <td>{r.name}</td>
                        <td>{r.quantity}</td>
                        <td>{r.price.toFixed(2)}</td>
                        <td>{(r.price * r.quantity).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div>
                <p>Summary:</p>
                <p>Customer: {viewDetails.order.customer}</p>
                <p>Items: {viewDetails.order.items}</p>
                <p>Amount: ₹{(viewDetails.order.amount || 0).toFixed(2)}</p>
              </div>
            )}
            <div style={{ marginTop: 8 }}>
              <button className="btn btn-primary" onClick={closeView}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
