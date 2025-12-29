import client from './client';

export const login = async (email, password) => {
  const { data } = await client.post('/admin/auth/login', { email, password });
  return data;
};

export const logout = async () => {
  const refreshToken = localStorage.getItem('adminRefreshToken');
  await client.post('/admin/auth/logout', { refreshToken });
};

export const refreshToken = async () => {
  const refreshToken = localStorage.getItem('adminRefreshToken');
  const { data } = await client.post('/admin/auth/refresh', { refreshToken });
  return data;
};
