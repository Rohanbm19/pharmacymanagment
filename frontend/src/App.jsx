import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { 
  LayoutDashboard, Pill, ShoppingCart, Activity,
  Users, Settings, Search, Bell, Moon, Sun, AlertTriangle
} from 'lucide-react';
import { getMedicines } from './services/api';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Orders from './pages/Orders';
import AIRecommendations from './pages/AIRecommendations';

function App() {
  const [isDark, setIsDark] = useState(() => localStorage.getItem('pharmacy-theme') === 'dark');
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [lowStockMedicines, setLowStockMedicines] = useState([]);
  const [profileData, setProfileData] = useState({
    name: 'Admin User',
    email: 'admin@pharmacy.com',
    phone: '+91 98765 43210',
    address: '123 Pharmacy Street, Medical City, India',
    pharmacy_name: 'MediCare Pharmacy',
    license_number: 'PH-2024-001234',
    establishment_year: '2020'
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    localStorage.setItem('pharmacy-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  useEffect(() => {
    let mounted = true;
    const refreshLowStock = async () => {
      try {
        const response = await getMedicines();
        if (!mounted) return;
        setLowStockMedicines(response.data.filter((medicine) => Number(medicine.stock) < 10));
      } catch (error) {
        console.error('Failed to load low-stock notifications', error);
      }
    };

    const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001');
    refreshLowStock();
    socket.on('medicines:updated', refreshLowStock);
    socket.on('orders:updated', refreshLowStock);
    socket.on('lowStock', refreshLowStock);
    socket.on('connect_error', (error) => {
      console.error('Notification socket connection failed', error.message);
    });

    return () => {
      mounted = false;
      socket.disconnect();
    };
  }, []);

  return (
    <Router>
      <div className="app-container">
        
        {/* Sidebar */}
        <nav className="sidebar">
          <div className="sidebar-header">
            <div className="brand-icon">
              <Activity size={20} />
            </div>
            <div>
              <div className="brand-text">Pharmacy</div>
              <div className="brand-subtext">Management System</div>
            </div>
          </div>
          
          <div className="nav-links" style={{ marginTop: '24px' }}>
            <NavLink to="/dashboard" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
              <LayoutDashboard size={20} /> Dashboard
            </NavLink>
            <NavLink to="/inventory" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
              <Pill size={20} /> Inventory
            </NavLink>
            <NavLink to="/orders" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
              <ShoppingCart size={20} /> Orders
            </NavLink>
            <NavLink to="/ai" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
              <Activity size={20} /> AI Recommendations
            </NavLink>
            <NavLink to="/settings" className="nav-item" onClick={e => e.preventDefault()}>
              <Settings size={20} /> Settings
            </NavLink>
          </div>
          
          <div className="sidebar-footer">
            <div className="user-profile" onClick={() => setShowProfile(true)} style={{ cursor: 'pointer' }}>
              <div className="user-avatar">
                <img src="https://ui-avatars.com/api/?name=Admin+User&background=random" alt="User" style={{width: '100%', height: '100%'}}/>
              </div>
              <div className="user-info">
                <span className="user-name">Admin User</span>
                <span className="user-email">admin@pharmacy.com</span>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content Area */}
        <div className="main-area">
          
          {/* Topbar */}
          <header className="topbar">
            <div className="search-bar">
              <Search size={18} color="var(--text-muted)" />
              <input type="text" placeholder="Search medicines, orders..." />
            </div>
            <div className="topbar-actions">
              <div className="notification-wrap">
                <button
                  type="button"
                  className="topbar-icon-button notification-button"
                  aria-label={`Low stock notifications: ${lowStockMedicines.length}`}
                  aria-expanded={showNotifications}
                  onClick={() => setShowNotifications((visible) => !visible)}
                >
                  <Bell size={20} />
                  {lowStockMedicines.length > 0 && (
                    <span className="notification-count">
                      {lowStockMedicines.length > 99 ? '99+' : lowStockMedicines.length}
                    </span>
                  )}
                </button>
                {showNotifications && (
                  <div className="notification-panel">
                    <div className="notification-panel-header">
                      <div>
                        <strong>Low stock</strong>
                        <span>{lowStockMedicines.length} medicines need attention</span>
                      </div>
                      <button
                        type="button"
                        className="notification-close"
                        aria-label="Close notifications"
                        onClick={() => setShowNotifications(false)}
                      >
                        ×
                      </button>
                    </div>
                    {lowStockMedicines.length ? (
                      <div className="notification-list">
                        {lowStockMedicines.map((medicine) => (
                          <NavLink
                            key={medicine.id}
                            to="/inventory"
                            className="notification-item"
                            onClick={() => setShowNotifications(false)}
                          >
                            <span className="notification-warning-icon"><AlertTriangle size={16} /></span>
                            <span className="notification-medicine">
                              <strong>{medicine.name}</strong>
                              <small>{medicine.category || 'Medicine'}</small>
                            </span>
                            <span className="notification-stock">{medicine.stock} left</span>
                          </NavLink>
                        ))}
                      </div>
                    ) : (
                      <div className="notification-empty">
                        <span className="notification-empty-icon"><Bell size={20} /></span>
                        <strong>Stock levels look good</strong>
                        <span>No medicines below 10 units.</span>
                      </div>
                    )}
                    <NavLink
                      to="/inventory"
                      className="notification-footer-link"
                      onClick={() => setShowNotifications(false)}
                    >
                      Review inventory
                    </NavLink>
                  </div>
                )}
              </div>
              <button
                type="button"
                className="topbar-icon-button theme-toggle"
                aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
                onClick={() => setIsDark(!isDark)}
              >
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <button
                type="button"
                className="topbar-icon-button profile-button"
                aria-label="Open profile"
                onClick={() => setShowProfile(true)}
              >
                <Users size={16} />
              </button>
            </div>
          </header>

          <main className="content">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/ai" element={<AIRecommendations />} />
            </Routes>
          </main>
        </div>

        {/* Profile Modal */}
        {showProfile && (
          <div className="modal-backdrop">
            <div className="card modal-card" style={{ width: '500px', maxWidth: '100%', padding: '32px', maxHeight: '90vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ margin: 0 }}>My Profile</h2>
                <button type="button" className="btn btn-outline" onClick={() => setShowProfile(false)}>Close</button>
              </div>

              {/* Profile Avatar */}
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <div style={{ width: '100px', height: '100px', borderRadius: '50%', margin: '0 auto 16px', overflow: 'hidden', border: '3px solid #e2e8f0' }}>
                  <img src="https://ui-avatars.com/api/?name=Admin+User&background=random&size=100" alt="Profile" style={{ width: '100%', height: '100%' }} />
                </div>
                <h3 style={{ margin: '0 0 4px 0' }}>{profileData.name}</h3>
                <p style={{ margin: 0, color: 'var(--text-muted)' }}>{profileData.pharmacy_name}</p>
              </div>

              {/* Profile Information */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>Full Name</div>
                  <div style={{ fontWeight: '500' }}>{profileData.name}</div>
                </div>
                <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>Email</div>
                  <div style={{ fontWeight: '500' }}>{profileData.email}</div>
                </div>
                <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>Phone</div>
                  <div style={{ fontWeight: '500' }}>{profileData.phone}</div>
                </div>
                <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>Address</div>
                  <div style={{ fontWeight: '500' }}>{profileData.address}</div>
                </div>
                <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>Pharmacy Name</div>
                  <div style={{ fontWeight: '500' }}>{profileData.pharmacy_name}</div>
                </div>
                <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>License Number</div>
                  <div style={{ fontWeight: '500' }}>{profileData.license_number}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>Establishment Year</div>
                  <div style={{ fontWeight: '500' }}>{profileData.establishment_year}</div>
                </div>
              </div>

              <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
                <button className="btn btn-primary" style={{ flex: 1 }}>Edit Profile</button>
                <button className="btn btn-outline" style={{ flex: 1 }}>Change Password</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Router>
  );
}

export default App;
