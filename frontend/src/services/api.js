import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
});

export const getMedicines = async () => {
  const response = await api.get('/medicines');
  const medicines = Array.isArray(response.data)
    ? response.data
    : response.data?.medicines ?? [];

  return { ...response, data: medicines };
};

export const addMedicine = (data) => api.post('/medicines', data);
export const updateStock = (id, stock) => api.put(`/medicines/${id}/stock`, { stock });
export const deleteMedicine = (id) => api.delete(`/medicines/${id}`);
export const updateMedicine = (id, data) => api.put(`/medicines/${id}`, data);

export const getOrders = async () => {
  const response = await api.get('/orders');
  const orders = Array.isArray(response.data)
    ? response.data
    : response.data?.orders ?? [];

  return { ...response, data: orders };
};

export const placeOrder = ({ user_id = null, customer_name = null, medicine_list = [] }) =>
  api.post('/orders', { user_id, customer_name, medicine_list });

export const getOrderDetails = (id) => api.get(`/orders/${id}`);

export default api;
