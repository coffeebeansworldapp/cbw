import client from './client';

export const getDashboardKPIs = async () => {
  const { data } = await client.get('/admin/dashboard/kpis');
  return data;
};
