import axios from 'axios';

// Remove /api suffix since media routes are at /api/media not /api/admin/media
const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:4000/api').replace('/api', '');

/**
 * Upload image to Cloudinary via backend
 * @param {File} file - The file to upload
 * @returns {Promise<{url: string, id: string}>}
 */
export async function uploadImage(file) {
  const formData = new FormData();
  formData.append('file', file);

  // Media upload is at /api/media/upload (legacy route, not under /api/admin)
  const response = await axios.post(`${API_BASE}/api/media/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
    },
  });

  return response.data;
}

/**
 * Delete image from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 */
export async function deleteImage(publicId) {
  const response = await axios.delete(`${API_BASE}/api/media/${encodeURIComponent(publicId)}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
    },
  });
  return response.data;
}
