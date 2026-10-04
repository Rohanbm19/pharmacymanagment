import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { 
  LayoutDashboard, Pill, ShoppingCart, Activity,
  ShieldCheck, Settings, Search, Bell, Moon, Sun, AlertTriangle
} from 'lucide-react';
import { getMedicines } from './services/api';
import supabase from './services/supabase';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Orders from './pages/Orders';
import AIRecommendations from './pages/AIRecommendations';
import Admin from './pages/Admin';

function App() {
  const [isDark, setIsDark] = useState(() => localStorage.getItem('pharmacy-theme') === 'dark');
  const [showNotifications, setShowNotifications] = useState(false);
  const [lowStockMedicines, setLowStockMedicines] = useState([]);
  const [session, setSession] = useState(null);
  const [authLoaded, setAuthLoaded] = useState(!supabase);

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

  useEffect(() => {
    if (!supabase) return undefined;

    let mounted = true;
    const loadSession = async () => {
      try {
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        if (error) throw error;
        if (mounted) setSession(currentSession);
      } catch (error) {
        console.error('Failed to load Supabase session', error);
      } finally {
        if (mounted) setAuthLoaded(true);
      }
    };

    loadSession();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setAuthLoaded(true);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
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
            <NavLink to="/admin" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
              <ShieldCheck size={20} />
              <div className="user-info">
                <span className="user-name">Admin panel</span>
                <span className="user-email">Manage inventory</span>
              </div>
            </NavLink>
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
              <NavLink
                className="topbar-icon-button profile-button"
                aria-label="Open admin page"
                title="Admin"
                to="/admin"
              >
                <ShieldCheck size={18} />
              </NavLink>
            </div>
          </header>

          <main className="content">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/admin" element={<Admin session={session} authLoaded={authLoaded} />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/ai" element={<AIRecommendations />} />
            </Routes>
          </main>
        </div>

      </div>
    </Router>
  );
}

export default App;
