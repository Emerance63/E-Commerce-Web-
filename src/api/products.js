import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { client } from './client';

export const FASHION_CATEGORY_ID = '6a41247952deb9cfee038765';
export const ELECTRONICS_CATEGORY_ID = '6a40217b52deb9cfee038763';

const CATEGORY_NAMES = {
  [FASHION_CATEGORY_ID]: 'Fashion',
  [ELECTRONICS_CATEGORY_ID]: 'Electronics',
};

// Products miscategorized under Electronics on the API — treat as Fashion
const CATEGORY_PRODUCT_OVERRIDES = {
  [FASHION_CATEGORY_ID]: [
    '6a41247e52deb9cfee038768', // Classic Leather Jacket
    '6a41248052deb9cfee038769', // Minimalist Analog Watch
  ],
};

// Curated product images keyed by product name (lowercase)
const PRODUCT_IMAGE_MAP = {
  'sony wh-1000xm4 wireless headphones': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop',
  'apple ipad air (5th gen)': 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500&h=500&fit=crop',
  'classic leather jacket': 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&h=500&fit=crop',
  'minimalist analog watch': 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop',
};

const getFallbackImage = (product) => {
  const name = (product.name || product.title || '').toLowerCase();
  if (PRODUCT_IMAGE_MAP[name]) return PRODUCT_IMAGE_MAP[name];
  const seed = product.id || product._id || Math.random().toString(36).slice(2);
  return `https://picsum.photos/seed/${seed}/500/500`;
};

const extractProducts = (response) => {
  const apiData = response.data?.data;
  if (Array.isArray(response.data)) return response.data;
  if (Array.isArray(apiData)) return apiData;
  return apiData?.all || response.data?.results || [];
};

const getOverrideCategoryId = (productId) => {
  for (const [categoryId, productIds] of Object.entries(CATEGORY_PRODUCT_OVERRIDES)) {
    if (productIds.includes(productId)) return categoryId;
  }
  return null;
};

const applyCategoryOverride = (product) => {
  const overrideCategoryId = getOverrideCategoryId(product.id);
  if (!overrideCategoryId || product.categoryId === overrideCategoryId) return product;

  return {
    ...product,
    categoryId: overrideCategoryId,
    category: {
      id: overrideCategoryId,
      name: CATEGORY_NAMES[overrideCategoryId] || product.category?.name,
    },
  };
};

const normalizeProduct = (product) => {
  if (!product) return null;
  const withCategory = applyCategoryOverride(product);
  const apiImage = withCategory.images?.[0]?.url;
  const commentCount = withCategory.comments?.length ?? 0;
  const avgRating = withCategory.avgRating;

  return {
    ...withCategory,
    title: withCategory.name || withCategory.title,
    image: apiImage || getFallbackImage(withCategory),
    category: typeof withCategory.category === 'object'
      ? withCategory.category?.name
      : withCategory.category,
    variants: withCategory.variants || [],
    rating: withCategory.rating || (avgRating != null
      ? { rate: avgRating, count: commentCount }
      : { rate: 4.5, count: commentCount || 12 }),
  };
};

const filterByCategory = (products, category) => {
  const overrideIds = CATEGORY_PRODUCT_OVERRIDES[category] || [];
  return products.filter(
    (product) => product.categoryId === category || overrideIds.includes(product.id)
  );
};

const paginate = (items, page, limit) => {
  const start = (page - 1) * limit;
  return items.slice(start, start + limit);
};

// --- API Functions ---

export const fetchProducts = async ({ category, limit, sort, page, search } = {}) => {
  const pageLimit = limit || 24;
  const currentPage = page || 1;
  const overrideIds = category ? (CATEGORY_PRODUCT_OVERRIDES[category] || []) : [];
  const needsClientCategoryFilter = category && overrideIds.length > 0;

  const params = {
    limit: needsClientCategoryFilter ? 100 : pageLimit,
    page: needsClientCategoryFilter ? 1 : currentPage,
  };

  if (category && !needsClientCategoryFilter) {
    params.categoryId = category;
  }

  if (search) {
    params.search = search;
  }

  const response = await client.get('/products', { params });
  let rawProducts = extractProducts(response);

  if (category) {
    rawProducts = filterByCategory(rawProducts, category);

    if (needsClientCategoryFilter) {
      const total = rawProducts.length;
      const totalPages = Math.max(1, Math.ceil(total / pageLimit));
      rawProducts = paginate(rawProducts, currentPage, pageLimit);

      return {
        results: rawProducts.map(normalizeProduct),
        totalPages,
        currentPage,
        total,
      };
    }
  }

  const apiData = response.data?.data;
  const pagination = apiData?.pagination || response.data?.pagination;
  const normalized = rawProducts.map(normalizeProduct);
  const totalPages = pagination?.pages || Math.ceil((pagination?.total || normalized.length) / pageLimit);

  return {
    results: normalized,
    totalPages,
    currentPage: pagination?.page || currentPage,
    total: pagination?.total || normalized.length,
  };
};

export const fetchProductById = async (id) => {
  const response = await client.get(`/products/${id}`);
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

export const useInfiniteProducts = (filters = {}) => {
  return useInfiniteQuery({
    queryKey: ['products', 'infinite', filters],
    queryFn: ({ pageParam = 1 }) => fetchProducts({ ...filters, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.currentPage < lastPage.totalPages) {
        return lastPage.currentPage + 1;
      }
      return undefined;
    },
  });
};

export const useProduct = (id) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => fetchProductById(id),
    enabled: !!id,
  });
};
