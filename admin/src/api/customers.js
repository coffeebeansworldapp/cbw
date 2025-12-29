import client from './client';

export const getCustomers = async (params = {}) => {
  const { data } = await client.get('/admin/customers', { params });
  return data;
};

export const getCustomer = async (id) => {
  const { data } = await client.get(`/admin/customers/${id}`);
  return data;
};
