import { useState } from 'react';
import { Search, Filter, Plus, ShoppingBag, Package, Clock, XCircle, Eye, ChevronLeft, ChevronRight } from 'lucide-react';

// Mock Data matching the mockup
const mockOrders = [
  { id: '#ORD-2025-0320', customer: 'Rajesh Kumar', date: 'May 31, 2025, 10:30 AM', items: 5, amount: 2450.00, status: 'Delivered', payment: 'Paid' },
  { id: '#ORD-2025-0319', customer: 'Priya Sharma', date: 'May 31, 2025, 09:15 AM', items: 3, amount: 1230.00, status: 'Processing', payment: 'Paid' },
  { id: '#ORD-2025-0318', customer: 'Amit Singh', date: 'May 30, 2025, 06:45 PM', items: 4, amount: 3560.00, status: 'Shipped', payment: 'Paid' },
  { id: '#ORD-2025-0317', customer: 'Neha Verma', date: 'May 30, 2025, 04:20 PM', items: 2, amount: 850.00, status: 'Processing', payment: 'COD' },
  { id: '#ORD-2025-0316', customer: 'Suresh Patel', date: 'May 29, 2025, 11:10 AM', items: 6, amount: 1780.00, status: 'Cancelled', payment: 'Refunded' },
];

export default function Orders() {
  const [stats] = useState({
    total: 320,
    delivered: 180,
    processing: 95,
    cancelled: 45
  });

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
          <button className="btn btn-primary">
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
            {mockOrders.map((order, i) => (
              <tr key={i}>
                <td className="font-semibold text-muted">{order.id}</td>
                <td className="font-semibold">{order.customer}</td>
                <td className="text-muted">{order.date}</td>
                <td className="text-muted">{order.items} items</td>
                <td>{order.amount.toFixed(2)}</td>
                <td>{getStatusBadge(order.status)}</td>
                <td>{getPaymentBadge(order.payment)}</td>
                <td>
                  <button className="btn-icon"><Eye size={16} /></button>
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
    </div>
  );
}
