import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { 
  LayoutDashboard, Pill, ShoppingCart, Activity, 
  Users, Settings, Search, Bell, Moon, Sun 
} from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Orders from './pages/Orders';
import AIRecommendations from './pages/AIRecommendations';

function App() {
  const [isDark, setIsDark] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
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
  }, [isDark]);

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
              <div style={{ position: 'relative', cursor: 'pointer' }}>
                <Bell size={20} />
                <span style={{
                  position: 'absolute', top: '-4px', right: '-4px', 
                  backgroundColor: '#ef4444', color: 'white', fontSize: '10px', 
                  width: '14px', height: '14px', borderRadius: '50%', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>5</span>
              </div>
              <div onClick={() => setIsDark(!isDark)} style={{ cursor: 'pointer', marginLeft: '12px', display: 'flex', alignItems: 'center' }}>
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
              </div>
              <div onClick={() => setShowProfile(true)} style={{ marginLeft: '12px', width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <Users size={16} />
              </div>
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
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div className="card" style={{ width: '500px', maxWidth: '100%', backgroundColor: 'white', padding: '32px', maxHeight: '90vh', overflowY: 'auto' }}>
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
                <button className="btn btn-outline" style={{ flex: 1, backgroundColor: 'white' }}>Change Password</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Router>
  );
}

export default App;
