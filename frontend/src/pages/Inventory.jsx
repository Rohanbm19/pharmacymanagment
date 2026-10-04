import { useState, useEffect } from 'react';
import { getMedicines, addMedicine, updateMedicine } from '../services/api';
import { io } from 'socket.io-client';
import { Plus, Pill, Search, Filter, ChevronLeft, ChevronRight, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

export default function Inventory() {
  const [medicines, setMedicines] = useState([]);
  const [stats, setStats] = useState({ total: 0, inStock: 0, lowStock: 0, outOfStock: 0 });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newMed, setNewMed] = useState({ name: '', category: '', stock: 0, price: 0 });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editMed, setEditMed] = useState(null);

  useEffect(() => {
    fetchMedicines();

    const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001');

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
    });

    socket.on('medicines:updated', (payload) => {
      console.log('medicines:updated', payload);
      fetchMedicines();
    });

    socket.on('orders:updated', () => {
      fetchMedicines();
    });

    socket.on('lowStock', (payload) => {
      console.warn('lowStock', payload);
      fetchMedicines();
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const fetchMedicines = async () => {
    try {
      const response = await getMedicines();
      const medsData = response.data.medicines || response.data || [];
      const meds = medsData.map((med, i) => ({
        ...med,
        // Mock fields to match mockup
        company: ['Crocin', 'Cipla', 'Dr. Reddy\'s', 'Sun Pharma'][i % 4],
        expiryDate: ['Dec 2025', 'Jan 2026', 'Oct 2025', 'Sep 2025', 'Mar 2026'][i % 5]
      }));
      setMedicines(meds);
      
      setStats({
        total: meds.length,
        inStock: meds.filter(m => m.stock >= 20).length,
        lowStock: meds.filter(m => m.stock > 0 && m.stock < 20).length,
        outOfStock: meds.filter(m => m.stock === 0).length
      });
    } catch (error) {
      console.error('Error fetching medicines', error);
    }
  };

  const handleAddMedicine = async (e) => {
    e.preventDefault();
    try {
      await addMedicine(newMed);
      setIsAddModalOpen(false);
      setNewMed({ name: '', category: '', stock: 0, price: 0 });
      fetchMedicines();
    } catch (error) {
      console.error('Error adding medicine', error);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateMedicine(editMed.id, {
        name: editMed.name,
        category: editMed.category,
        stock: editMed.stock,
        price: editMed.price
      });
      setIsEditModalOpen(false);
      setEditMed(null);
      fetchMedicines();
    } catch (error) {
      console.error('Error updating medicine', error);
    }
  };

  const getStatusBadge = (stock) => {
    if (stock >= 20) return <span className="badge badge-success">In Stock</span>;
    if (stock > 0) return <span className="badge badge-warning">Low Stock</span>;
    return <span className="badge badge-danger">Out of Stock</span>;
  };

  const getStockColor = (stock) => {
    if (stock >= 20) return '#16a34a';
    if (stock > 0) return '#ea580c';
    return '#dc2626';
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title">
          <h1>Inventory</h1>
          <p>Manage your medicines and stock levels</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div className="search-bar inventory-search">
            <Search size={16} color="var(--text-muted)" />
            <input type="text" placeholder="Search medicines..." />
          </div>
          <button className="btn btn-outline">
            <Filter size={16} /> Filter
          </button>
          <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)}>
            <Plus size={16} /> Add Medicine
          </button>
        </div>
      </div>

      <div className="stat-cards-grid">
        <div className="stat-card" style={{ padding: '24px' }}>
          <div className="icon-box icon-blue"><Pill size={24} /></div>
          <div className="stat-content">
            <div className="stat-label">Total Medicines</div>
            <div className="stat-value">{stats.total}</div>
            <div className="text-muted text-sm">All medicines</div>
          </div>
        </div>
        <div className="stat-card" style={{ padding: '24px' }}>
          <div className="icon-box icon-green"><CheckCircle size={24} /></div>
          <div className="stat-content">
            <div className="stat-label">In Stock</div>
            <div className="stat-value">{stats.inStock}</div>
            <div className="text-muted text-sm">88.5% of total</div>
          </div>
        </div>
        <div className="stat-card" style={{ padding: '24px' }}>
          <div className="icon-box icon-orange"><AlertTriangle size={24} /></div>
          <div className="stat-content">
            <div className="stat-label">Low Stock</div>
            <div className="stat-value">{stats.lowStock}</div>
            <div className="text-muted text-sm">Need attention</div>
          </div>
        </div>
        <div className="stat-card" style={{ padding: '24px' }}>
          <div className="icon-box icon-red"><XCircle size={24} /></div>
          <div className="stat-content">
            <div className="stat-label">Out of Stock</div>
            <div className="stat-value">{stats.outOfStock}</div>
            <div className="text-muted text-sm">Unavailable</div>
          </div>
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Medicine Name</th>
              <th>Category</th>
              <th>Company</th>
              <th>Stock</th>
              <th>Price (₹)</th>
              <th>Expiry Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {medicines.map((med, i) => (
              <tr key={med.id || i}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '32px', height: '32px', backgroundColor: '#eff6ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}>
                      <Pill size={16} />
                    </div>
                    <span className="font-semibold">{med.name}</span>
                  </div>
                </td>
                <td className="text-muted">{med.category}</td>
                <td className="text-muted">{med.company}</td>
                <td style={{ fontWeight: '600', color: getStockColor(med.stock) }}>{med.stock}</td>
                <td>{Number(med.price).toFixed(2)}</td>
                <td className="text-muted">{med.expiryDate}</td>
                <td>{getStatusBadge(med.stock)}</td>
              </tr>
            ))}
            {medicines.length === 0 && (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                  No medicines found. Add some to your inventory.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        
        {/* Pagination */}
        <div className="pagination">
          <div>Showing 1 to {medicines.length} of {stats.total} entries</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div className="page-controls">
              <button className="page-btn"><ChevronLeft size={16} /></button>
              <button className="page-btn active">1</button>
              <button className="page-btn">2</button>
              <button className="page-btn">3</button>
              <div style={{ padding: '0 8px', color: 'var(--text-muted)', display: 'flex', alignItems: 'flex-end' }}>...</div>
              <button className="page-btn">249</button>
              <button className="page-btn"><ChevronRight size={16} /></button>
            </div>
            <div style={{ color: 'var(--text-muted)' }}>5 / page</div>
          </div>
        </div>
      </div>

      {isAddModalOpen && (
        <div className="modal-backdrop">
          <div className="card modal-card" style={{ width: '400px', maxWidth: '100%', padding: '32px' }}>
            <h2 className="section-title" style={{ marginBottom: '24px' }}>Add Medicine</h2>
            <form onSubmit={handleAddMedicine}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '8px', fontWeight: '500' }}>Name</label>
                <input type="text" required value={newMed.name} onChange={e => setNewMed({...newMed, name: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border)' }} />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '8px', fontWeight: '500' }}>Category</label>
                <input type="text" required value={newMed.category} onChange={e => setNewMed({...newMed, category: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border)' }} />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '8px', fontWeight: '500' }}>Stock</label>
                <input type="number" required value={newMed.stock} onChange={e => setNewMed({...newMed, stock: parseInt(e.target.value)})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border)' }} />
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '8px', fontWeight: '500' }}>Price (₹)</label>
                <input type="number" step="0.01" required value={newMed.price} onChange={e => setNewMed({...newMed, price: parseFloat(e.target.value)})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border)' }} />
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-outline" onClick={() => setIsAddModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Add Medicine</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isEditModalOpen && editMed && (
        <div className="modal-backdrop">
          <div className="card modal-card" style={{ width: '400px', maxWidth: '100%', padding: '32px' }}>
            <h2 className="section-title" style={{ marginBottom: '24px' }}>Edit Medicine</h2>
            <form onSubmit={handleEditSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '8px', fontWeight: '500' }}>Name</label>
                <input type="text" required value={editMed.name} onChange={e => setEditMed({...editMed, name: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border)' }} />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '8px', fontWeight: '500' }}>Category</label>
                <input type="text" required value={editMed.category} onChange={e => setEditMed({...editMed, category: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border)' }} />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '8px', fontWeight: '500' }}>Stock</label>
                <input type="number" required value={editMed.stock} onChange={e => setEditMed({...editMed, stock: parseInt(e.target.value)})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border)' }} />
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '8px', fontWeight: '500' }}>Price (₹)</label>
                <input type="number" step="0.01" required value={editMed.price} onChange={e => setEditMed({...editMed, price: parseFloat(e.target.value)})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border)' }} />
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-outline" onClick={() => { setIsEditModalOpen(false); setEditMed(null); }}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
