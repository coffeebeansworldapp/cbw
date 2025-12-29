const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

// Products API
export async function fetchProducts(category = 'all') {
  const url = category && category !== 'all' 
    ? `${API_BASE}/products?category=${category}`
    : `${API_BASE}/products`;
  
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch products');
  return res.json();
}

export async function fetchProductById(id) {
  const res = await fetch(`${API_BASE}/products/${id}`);
  if (!res.ok) throw new Error('Failed to fetch product');
  return res.json();
}

// Premium Beans API (for hero rotator)
export async function fetchPremiumBeans() {
  const res = await fetch(`${API_BASE}/premium-beans`);
  if (!res.ok) throw new Error('Failed to fetch premium beans');
  return res.json();
}

// Categories API
export async function fetchCategories() {
  const res = await fetch(`${API_BASE}/categories`);
  if (!res.ok) throw new Error('Failed to fetch categories');
  return res.json();
}

export default {
  fetchProducts,
  fetchProductById,
  fetchPremiumBeans,
  fetchCategories
};
