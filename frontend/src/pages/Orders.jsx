import { useState, useEffect } from 'react';
import { Search, Filter, Plus, ShoppingBag, Package, Clock, XCircle, Eye, ChevronLeft, ChevronRight, Trash2, PlusSquare } from 'lucide-react';
import { placeOrder, getOrderDetails, getMedicines } from '../services/api';

// Mock Data matching the mockup
const mockOrders = [
  { id: '#ORD-2025-0320', customer: 'Rajesh Kumar', date: 'May 31, 2025, 10:30 AM', items: 5, amount: 2450.00, status: 'Delivered', payment: 'Paid' },
  { id: '#ORD-2025-0319', customer: 'Priya Sharma', date: 'May 31, 2025, 09:15 AM', items: 3, amount: 1230.00, status: 'Processing', payment: 'Paid' },
  { id: '#ORD-2025-0318', customer: 'Amit Singh', date: 'May 30, 2025, 06:45 PM', items: 4, amount: 3560.00, status: 'Shipped', payment: 'Paid' },
  { id: '#ORD-2025-0317', customer: 'Neha Verma', date: 'May 30, 2025, 04:20 PM', items: 2, amount: 850.00, status: 'Processing', payment: 'COD' },
  { id: '#ORD-2025-0316', customer: 'Suresh Patel', date: 'May 29, 2025, 11:10 AM', items: 6, amount: 1780.00, status: 'Cancelled', payment: 'Refunded' },
];

export default function Orders() {
  const [orders, setOrders] = useState(mockOrders);

  const [stats, setStats] = useState({
    total: 320,
    delivered: 180,
    processing: 95,
    cancelled: 45
  });

  const [showNewOrder, setShowNewOrder] = useState(false);
  const [newCustomer, setNewCustomer] = useState('');
  const [medicines, setMedicines] = useState([]);
  const [lineItems, setLineItems] = useState([{ medicine_id: '', quantity: 1 }]);
  const [viewDetails, setViewDetails] = useState(null);
  const [loading, setLoading] = useState(false);

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
      case 'Paid': return <span className="badge badge-success" style={{ backgroundColor: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' }}>Paid</span>;
      case 'COD': return <span className="badge badge-warning" style={{ backgroundColor: '#fffbeb', color: '#d97706', border: '1px solid #fef3c7' }}>COD</span>;
      case 'Refunded': return <span className="badge badge-danger" style={{ backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}>Refunded</span>;
      default: return <span className="badge">{payment}</span>;
    }
  };

  const handleOpenNew = () => setShowNewOrder(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const resp = await getMedicines();
        if (!mounted) return;
        setMedicines(resp.data || []);
      } catch (err) {
        console.error('Failed to load medicines', err);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const addLineItem = () => setLineItems(prev => [...prev, { medicine_id: '', quantity: 1 }]);
  const removeLineItem = (idx) => setLineItems(prev => prev.filter((_, i) => i !== idx));
  const updateLineItem = (idx, patch) => setLineItems(prev => prev.map((it, i) => i === idx ? { ...it, ...patch } : it));

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

  const handleSubmitNew = async (e) => {
    e.preventDefault();
    const medicine_list = lineItems
      .map(li => ({ medicine_id: Number(li.medicine_id), quantity: Number(li.quantity) }))
      .filter(li => li.medicine_id && li.quantity > 0);
    if (medicine_list.length === 0) { alert('Please add at least one medicine and quantity'); return; }

    setLoading(true);
    try {
      const resp = await placeOrder({ customer_name: newCustomer, medicine_list });
      const data = resp.data;
      const { total, itemsCount } = computeTotals();
      const newOrder = {
        id: `#ORD-${data.order_id}`,
        customer: newCustomer || 'Guest',
        date: new Date().toLocaleString(),
        items: itemsCount,
        amount: total,
        status: 'Processing',
        payment: 'Pending',
        order_id: data.order_id
      };
      setOrders(prev => [newOrder, ...prev]);
      setStats(prev => ({ ...prev, total: prev.total + 1, processing: prev.processing + 1 }));
      setShowNewOrder(false);
      setNewCustomer('');
      setLineItems([{ medicine_id: '', quantity: 1 }]);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || err.message || 'Failed to place order');
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
          <button className="btn btn-outline" style={{ backgroundColor: 'white' }}>
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
          <div className="icon-box icon-purple" style={{ backgroundColor: '#f3e8ff', color: '#9333ea' }}><XCircle size={24} /></div>
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
          </tbody>
        </table>
        
        {/* Pagination */}
        <div className="pagination">
          <div>Showing 1 to {mockOrders.length} of {stats.total} entries</div>
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
        <div className="modal-overlay">
          <div className="modal">
            <h3>New Order</h3>
            <form onSubmit={handleSubmitNew}>
              <div>
                <label>Customer Name</label>
                <input value={newCustomer} onChange={e => setNewCustomer(e.target.value)} placeholder="Customer name" />
              </div>
              <div>
                <label>Medicine List (JSON)</label>
                <textarea value={newItemsText} onChange={e => setNewItemsText(e.target.value)} rows={6} />
                <div className="text-muted">Example: [&#123;"medicine_id":1,"quantity":2&#125;]</div>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button className="btn btn-primary" type="submit" disabled={loading}>{loading ? 'Placing...' : 'Place Order'}</button>
                <button type="button" className="btn btn-outline" onClick={() => setShowNewOrder(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {viewDetails && (
        <div className="modal-overlay">
          <div className="modal">
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
