import client from './client';

// Get all carousel slides (admin)
export const getCarouselSlides = async () => {
  const response = await client.get('/admin/carousel');
  return response.data;
};

// Get single carousel slide
export const getCarouselSlide = async (id) => {
  const response = await client.get(`/admin/carousel/${id}`);
  return response.data;
};

// Create carousel slide
export const createCarouselSlide = async (slideData) => {
  const response = await client.post('/admin/carousel', slideData);
  return response.data;
};

// Update carousel slide
export const updateCarouselSlide = async (id, slideData) => {
  const response = await client.put(`/admin/carousel/${id}`, slideData);
  return response.data;
};

// Delete carousel slide
export const deleteCarouselSlide = async (id) => {
  const response = await client.delete(`/admin/carousel/${id}`);
  return response.data;
};

// Reorder carousel slides
export const reorderCarouselSlides = async (slideIds) => {
  const response = await client.put('/admin/carousel/reorder/batch', { slideIds });
  return response.data;
};

// Toggle carousel slide active status
export const toggleCarouselSlide = async (id) => {
  const response = await client.patch(`/admin/carousel/${id}/toggle`);
  return response.data;
};
