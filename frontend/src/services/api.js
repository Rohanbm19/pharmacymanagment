import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api', // You can use import.meta.env.VITE_API_URL if configured
});

export const getMedicines = () => api.get('/medicines');
export const addMedicine = (data) => api.post('/medicines', data);
export const updateStock = (id, stock) => api.put(`/medicines/${id}/stock`, { stock });
export const deleteMedicine = (id) => api.delete(`/medicines/${id}`);
export const updateMedicine = (id, data) => api.put(`/medicines/${id}`, data);

export const placeOrder = ({ user_id = null, customer_name = null, medicine_list = [] }) =>
  api.post('/orders', { user_id, customer_name, medicine_list });

export const getOrderDetails = (id) => api.get(`/orders/${id}`);

export default api;
