import client from './client';

export const getPremiumBeans = async () => {
  const { data } = await client.get('/admin/premium-beans');
  return data;
};

export const getPremiumBean = async (id) => {
  const { data } = await client.get(`/admin/premium-beans/${id}`);
  return data;
};

export const createPremiumBean = async (beanData) => {
  const { data } = await client.post('/admin/premium-beans', beanData);
  return data;
};

export const updatePremiumBean = async (id, beanData) => {
  const { data } = await client.put(`/admin/premium-beans/${id}`, beanData);
  return data;
};

export const deletePremiumBean = async (id) => {
  const { data } = await client.delete(`/admin/premium-beans/${id}`);
  return data;
};

export const togglePremiumBean = async (id) => {
  const { data } = await client.patch(`/admin/premium-beans/${id}/toggle`);
  return data;
};

export const reorderPremiumBeans = async (beanIds) => {
  const { data } = await client.put('/admin/premium-beans/reorder/batch', { beanIds });
  return data;
};
