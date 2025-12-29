import client from './client';

export const getProducts = async (params = {}) => {
  const { data } = await client.get('/admin/products', { params });
  return data;
};

export const getProduct = async (id) => {
  const { data } = await client.get(`/admin/products/${id}`);
  return data;
};

export const createProduct = async (productData) => {
  const { data } = await client.post('/admin/products', productData);
  return data;
};

export const updateProduct = async (id, productData) => {
  const { data } = await client.put(`/admin/products/${id}`, productData);
  return data;
};

export const deleteProduct = async (id) => {
  const { data } = await client.delete(`/admin/products/${id}`);
  return data;
};

export const toggleProductActive = async (id) => {
  const { data } = await client.patch(`/admin/products/${id}/toggle-active`);
  return data;
};

export const updateVariant = async (productId, variantId, variantData) => {
  const { data } = await client.patch(
    `/admin/products/${productId}/variants/${variantId}`,
    variantData
  );
  return data;
};

export const getCategories = async () => {
  const { data } = await client.get('/public/categories');
  return data;
};
