import { useQuery } from '@tanstack/react-query';
import { client } from './client';

// Curated product images keyed by product name (lowercase)
const PRODUCT_IMAGE_MAP = {
  'sony wh-1000xm4 wireless headphones': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop',
  'apple ipad air (5th gen)': 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500&h=500&fit=crop',
  'classic leather jacket': 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&h=500&fit=crop',
  'minimalist analog watch': 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop',
};

// Generate a deterministic fallback image from the product id
const getFallbackImage = (product) => {
  const name = (product.name || product.title || '').toLowerCase();
  if (PRODUCT_IMAGE_MAP[name]) return PRODUCT_IMAGE_MAP[name];
  // Use picsum with a seed derived from the product id for consistent, unique images
  const seed = product.id || product._id || Math.random().toString(36).slice(2);
  return `https://picsum.photos/seed/${seed}/500/500`;
};

// Helper to normalize Ecomus API products to FakeStoreAPI style used by the UI
const normalizeProduct = (product) => {
  if (!product) return null;
  const apiImage = product.images?.[0]?.url;
  return {
    ...product,
    title: product.name || product.title,
    image: apiImage || getFallbackImage(product),
    category: typeof product.category === 'object' ? product.category?.name : product.category,
    rating: product.rating || { rate: 4.5, count: 12 }, // Fallback rating for display
  };
};

// --- API Functions ---

export const fetchProducts = async ({ category, limit, sort, page, search } = {}) => {
  const url = '/products';
  const params = {
    limit: limit || 24,
    page: page || 1,
  };
  
  if (category) {
    params.categoryId = category;
  }
  
  if (search) {
    params.search = search;
  }

  const response = await client.get(url, { params });
  
  // Ecomus API: { success, data: { all: [...], grouped: {...}, pagination: { page, limit, total, pages } } }
  const apiData = response.data?.data;
  const pagination = apiData?.pagination || response.data?.pagination;
  const rawProducts = Array.isArray(response.data) 
    ? response.data 
    : (apiData?.all || response.data?.results || []);
  
  const normalized = rawProducts.map(normalizeProduct);
  
  const totalPages = pagination?.pages || Math.ceil((pagination?.total || normalized.length) / (limit || 24));

  return {
    results: normalized,
    totalPages,
    currentPage: pagination?.page || page || 1,
    total: pagination?.total || normalized.length,
  };
};

export const fetchProductById = async (id) => {
  const response = await client.get(`/products/${id}`);
  // API returns { success: true, data: { product: {...} } }
  const productData = response.data?.data?.product || response.data?.data || response.data;
  return normalizeProduct(productData);
};

// --- TanStack Query Hooks ---

export const useProducts = (filters = {}) => {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => fetchProducts(filters),
  });
};

export const useProduct = (id) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => fetchProductById(id),
    enabled: !!id, // Only run the query if an ID is provided
  });
};

