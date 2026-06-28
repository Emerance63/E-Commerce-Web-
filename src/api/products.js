import { useQuery } from '@tanstack/react-query';
import { client } from './client';

// Helper to normalize Ecomus API products to FakeStoreAPI style used by the UI
const normalizeProduct = (product) => {
  if (!product) return null;
  return {
    ...product,
    title: product.name || product.title,
    image: product.image || product.images?.[0]?.url || 'https://via.placeholder.com/300',
    category: typeof product.category === 'object' ? product.category?.name : product.category,
    rating: product.rating || { rate: 4.5, count: 12 }, // Fallback rating for display
  };
};

// --- API Functions ---

export const fetchProducts = async ({ category, limit, sort, page, search } = {}) => {
  const url = '/products';
  const params = {
    limit: limit || 12,
    page: page || 1,
  };
  
  if (category) {
    params.categoryId = category;
  }
  
  if (search) {
    params.search = search;
  }

  const response = await client.get(url, { params });
  
  // The Ecomus API format is: { success: true, data: { all: [...], total: number } }
  // or it could be a direct array during transition.
  const apiData = response.data?.data;
  const rawProducts = Array.isArray(response.data) 
    ? response.data 
    : (apiData?.all || response.data?.results || []);
  
  const normalized = rawProducts.map(normalizeProduct);
  
  const total = apiData?.total || response.data?.total || normalized.length;
  const itemsPerPage = limit || 12;
  const totalPages = Math.ceil(total / itemsPerPage);

  return {
    results: normalized,
    totalPages: totalPages
  };
};

export const fetchProductById = async (id) => {
  const response = await client.get(`/products/${id}`);
  // If response.data wraps product in a data property
  const productData = response.data?.data || response.data;
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

