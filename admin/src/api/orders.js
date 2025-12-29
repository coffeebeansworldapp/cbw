import client from './client';

export const getOrders = async (params = {}) => {
  const { data } = await client.get('/admin/orders', { params });
  return data;
};

export const getOrder = async (id) => {
  const { data } = await client.get(`/admin/orders/${id}`);
  return data;
};

export const updateOrderStatus = async (id, status, notes = '') => {
  const { data } = await client.patch(`/admin/orders/${id}/status`, {
    status,
    notes,
  });
  return data;
};

export const addOrderNote = async (id, notes) => {
  const { data } = await client.patch(`/admin/orders/${id}/notes`, { notes });
  return data;
};
