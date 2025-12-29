import client from './client';

export const getAdminUsers = async () => {
  const { data } = await client.get('/admin/users');
  return data;
};

export const createAdminUser = async (userData) => {
  const { data } = await client.post('/admin/users', userData);
  return data;
};

export const updateAdminUser = async (id, userData) => {
  const { data } = await client.put(`/admin/users/${id}`, userData);
  return data;
};

export const deleteAdminUser = async (id) => {
  const { data } = await client.delete(`/admin/users/${id}`);
  return data;
};
