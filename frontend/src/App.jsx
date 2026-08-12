import { BrowserRouter as Router, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { 
  LayoutDashboard, Pill, ShoppingCart, Activity, 
  BarChart3, Users, Truck, Settings, Search, Bell, Moon 
} from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Orders from './pages/Orders';

function App() {
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
            <NavLink to="/ai" className="nav-item" onClick={e => e.preventDefault()}>
              <Activity size={20} /> AI Recommendations
            </NavLink>
            <NavLink to="/reports" className="nav-item" onClick={e => e.preventDefault()}>
              <BarChart3 size={20} /> Reports
            </NavLink>
            <NavLink to="/customers" className="nav-item" onClick={e => e.preventDefault()}>
              <Users size={20} /> Customers
            </NavLink>
            <NavLink to="/suppliers" className="nav-item" onClick={e => e.preventDefault()}>
              <Truck size={20} /> Suppliers
            </NavLink>
            <NavLink to="/settings" className="nav-item" onClick={e => e.preventDefault()}>
              <Settings size={20} /> Settings
            </NavLink>
          </div>
          
          <div className="sidebar-footer">
            <div className="user-profile">
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
              <input type="text" placeholder="Search medicines, orders, customers..." />
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
              <Moon size={20} style={{ cursor: 'pointer', marginLeft: '12px' }} />
              <div style={{ marginLeft: '12px', width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
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
            </Routes>
          </main>
        </div>

      </div>
    </Router>
  );
}

export default App;
