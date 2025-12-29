import client from './client';

export const getAuditLogs = async (params = {}) => {
  const { data } = await client.get('/admin/audit-logs', { params });
  return data;
};
