import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import { getMedicines, getOrders } from '../services/api';
import { ShoppingBag, ShoppingCart, Pill, AlertCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

// Mock Data for Charts
const salesData = [
  { name: 'May 25', uv: 10000 },
  { name: 'May 26', uv: 22000 },
  { name: 'May 27', uv: 16000 },
  { name: 'May 28', uv: 32000 },
  { name: 'May 29', uv: 48000 },
  { name: 'May 30', uv: 26000 },
  { name: 'May 31', uv: 28000 },
];

const topSellingData = [
  { name: 'Paracetamol 650mg', value: 32, color: '#3b82f6' },
  { name: 'Amoxicillin 500mg', value: 24, color: '#10b981' },
  { name: 'Cetirizine 10mg', value: 18, color: '#8b5cf6' },
  { name: 'Omeprazole 20mg', value: 14, color: '#f59e0b' },
  { name: 'Others', value: 12, color: '#94a3b8' },
];

const mockRecentOrders = [
  { id: '#ORD-2025-3210', customer: 'Rajesh Kumar', date: 'May 31, 2025', amount: 2450, status: 'Delivered' },
  { id: '#ORD-2025-3209', customer: 'Priya Sharma', date: 'May 31, 2025', amount: 1230, status: 'Processing' },
  { id: '#ORD-2025-3208', customer: 'Amit Singh', date: 'May 30, 2025', amount: 3560, status: 'Shipped' },
  { id: '#ORD-2025-3207', customer: 'Neha Verma', date: 'May 30, 2025', amount: 850, status: 'Delivered' },
  { id: '#ORD-2025-3206', customer: 'Suresh Patel', date: 'May 29, 2025', amount: 1780, status: 'Cancelled' },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [medicines, setMedicines] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [stats, setStats] = useState({
    totalMedicines: 0,
    lowStock: 0,
    totalSales: '0',
    totalOrders: 0
  });

  const fetchMedicines = async () => {
    try {
      const response = await getMedicines();
      const meds = response.data || [];
      setMedicines(meds);

      const totalMedicines = meds.length;
      const lowStock = meds.filter(m => Number(m.stock) < 10).length;

      setStats(prev => ({ ...prev, totalMedicines, lowStock }));
    } catch (error) {
      console.error('Failed to fetch dashboard stats', error);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await getOrders();
      const rows = Array.isArray(response.data) ? response.data : response.data?.orders || [];
      const mapped = rows.slice(0, 5).map((order) => ({
        id: `#ORD-${order.id}`,
        customer: order.customer || 'Guest',
        date: order.date ? new Date(order.date).toLocaleString() : 'N/A',
        amount: Number(order.amount || 0),
        status: order.status || 'Processing'
      }));

      setRecentOrders(mapped);
      setStats(prev => ({ ...prev, totalOrders: rows.length, totalSales: rows.reduce((sum, order) => sum + Number(order.amount || 0), 0).toLocaleString('en-IN') }));
    } catch (error) {
      console.error('Failed to fetch recent orders', error);
    }
  };

  useEffect(() => {
    const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001');

    const refreshData = async () => {
      await fetchMedicines();
      await fetchOrders();
    };

    refreshData();

    socket.on('connect', () => console.log('Dashboard socket connected'));
    socket.on('medicines:updated', refreshData);
    socket.on('orders:updated', refreshData);
    socket.on('lowStock', refreshData);

    return () => socket.disconnect();
  }, []);

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Delivered': return <span className="badge badge-success">Delivered</span>;
      case 'Processing': return <span className="badge badge-info">Processing</span>;
      case 'Shipped': return <span className="badge badge-warning">Shipped</span>;
      case 'Cancelled': return <span className="badge badge-danger">Cancelled</span>;
      default: return <span className="badge">{status}</span>;
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title">
          <h1>Dashboard</h1>
          <p>Welcome back! Here's what's happening with your pharmacy.</p>
        </div>
        <div className="date-chip">
          📅 May 25 - May 31, 2025
        </div>
      </div>
      
      <div className="stat-cards-grid">
        <div className="stat-card">
          <div className="icon-box icon-blue"><ShoppingBag size={24} /></div>
          <div className="stat-content">
            <div className="stat-label">Total Sales</div>
            <div className="stat-value">₹{stats.totalSales}</div>
            <div className="stat-trend trend-up">↑ 18.2% <span className="text-muted" style={{marginLeft: '4px'}}>vs last week</span></div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="icon-box icon-green"><ShoppingCart size={24} /></div>
          <div className="stat-content">
            <div className="stat-label">Total Orders</div>
            <div className="stat-value">{stats.totalOrders}</div>
            <div className="stat-trend trend-up">↑ 12.5% <span className="text-muted" style={{marginLeft: '4px'}}>vs last week</span></div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="icon-box icon-purple"><Pill size={24} /></div>
          <div className="stat-content">
            <div className="stat-label">Total Medicines</div>
            <div className="stat-value">{stats.totalMedicines}</div>
            <div className="stat-trend trend-up">↑ 8.4% <span className="text-muted" style={{marginLeft: '4px'}}>vs last week</span></div>
          </div>
        </div>

        <div className="stat-card">
          <div className="icon-box icon-orange"><AlertCircle size={24} /></div>
          <div className="stat-content">
            <div className="stat-label">Low Stock Items</div>
            <div className="stat-value">{stats.lowStock}</div>
            <div className="stat-trend trend-down">↓ 5.1% <span className="text-muted" style={{marginLeft: '4px'}}>vs last week</span></div>
          </div>
        </div>
      </div>
      
      <div className="dashboard-layout">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>          {/* Recent Orders */}
          <div className="card" style={{ padding: '0' }}>
            <div className="section-header" style={{ padding: '24px 24px 0 24px' }}>
              <h2 className="section-title">Recent Orders</h2>
              <a href="/orders" style={{ color: 'var(--primary)', fontSize: '0.9rem', textDecoration: 'none', fontWeight: '500' }}>View All Orders</a>
            </div>
            <div className="table-container" style={{ border: 'none', boxShadow: 'none' }}>
              <table>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order, i) => (
                    <tr key={i}>
                      <td className="font-semibold text-muted">{order.id}</td>
                      <td className="font-semibold">{order.customer}</td>
                      <td className="text-muted">{order.date}</td>
                      <td>₹{order.amount}</td>
                      <td>{getStatusBadge(order.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Low Stock Alert */}
          <div className="card">
            <div className="section-header">
              <h2 className="section-title">Low Stock Alert</h2>
              <a href="/inventory" style={{ color: 'var(--primary)', fontSize: '0.9rem', textDecoration: 'none', fontWeight: '500' }}>View All</a>
            </div>
            <div>
              {medicines.filter(m => m.stock < 10).map((med, idx, arr) => (
                <div className="list-item" key={med.id || idx} style={idx === arr.length - 1 ? { borderBottom: 'none' } : {}}>
                  <div className="low-stock-medicine-icon"><Pill size={16}/></div>
                  <div style={{ flex: 1 }}>
                    <div className="font-semibold" style={{ fontSize: '0.95rem' }}>{med.name}</div>
                    <div className="text-muted text-sm">{med.category}</div>
                  </div>
                  <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                    <div style={{ color: '#dc2626', fontWeight: '600', fontSize: '0.9rem' }}>Stock: {med.stock}</div>
                    <button onClick={() => navigate('/inventory')} className="btn btn-primary" style={{ padding: '4px 8px', fontSize: '0.75rem' }}>Update</button>
                  </div>
                </div>
              ))}
              {medicines.filter(m => m.stock < 10).length === 0 && (
                <div style={{ padding: '16px 0', color: 'var(--text-muted)', textAlign: 'center' }}>No low stock items!</div>
              )}
            </div>
          </div>

          {/* Top Selling */}
          <div className="card">
            <div className="section-header">
              <h2 className="section-title">Top Selling Medicines</h2>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', height: '200px' }}>
              <div style={{ width: '50%', height: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={topSellingData} innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value">
                      {topSellingData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ width: '50%', paddingLeft: '16px' }}>
                {topSellingData.map((item, index) => (
                  <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', fontSize: '0.85rem' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: item.color, marginRight: '8px' }}></div>
                    <div style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--text-muted)' }}>{item.name}</div>
                    <div className="font-semibold">{item.value}%</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
