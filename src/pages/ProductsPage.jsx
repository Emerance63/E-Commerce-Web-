import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiSearch } from 'react-icons/fi';
import { useProducts } from '../api/products';
import { ProductCard } from '../components/ProductCard';
import { CategoryFilter } from '../components/CategoryFilter';
import { SearchBar } from '../components/SearchBar';
import { Pagination } from '../components/Pagination';
import { SkeletonCard } from '../components/LoadingStates';
import { ErrorState, EmptyState } from '../components/FeedbackStates';

const PRODUCTS_PER_PAGE = 24;

export const ProductsPage = () => {
  // --- UI State: URL Search Params ---
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category') || '';
  const pageParam = parseInt(searchParams.get('page') || '1', 10);
  
  // --- UI State: Local Component State ---
  const [searchQuery, setSearchQuery] = useState('');

  // --- Server State: TanStack Query ---
  // If FakestoreAPI doesn't support built-in pagination/search, we might have to fetch all and filter locally,
  // but we build it to pass filters to the API layer as requested.
  const { data, isLoading, isError, refetch, isFetching } = useProducts({ 
    category: categoryParam,
    page: pageParam,
    limit: PRODUCTS_PER_PAGE,
    // Note: passing search to API layer. If API doesn't support it, we'll filter locally below.
  });

  // --- Handlers ---
  const handleCategorySelect = (category) => {
    setSearchParams(prev => {
      if (category) prev.set('category', category);
      else prev.delete('category');
      prev.set('page', '1'); // Reset to page 1 on filter change
      return prev;
    });
  };

  const handlePageChange = (newPage) => {
    setSearchParams(prev => {
      prev.set('page', newPage.toString());
      return prev;
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // --- Data processing ---
  let products = Array.isArray(data) ? data : data?.results || [];
  let totalPages = data?.totalPages || 1;
  let totalCount = data?.total || products.length;

  // Local Search Filtering
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    products = products.filter(p => 
      (p.title || p.name || '').toLowerCase().includes(q) || 
      (p.description || '').toLowerCase().includes(q)
    );
    totalCount = products.length;
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header & Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-secondary-100 p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-secondary-900 tracking-tight">Products</h1>
            <p className="text-secondary-500 mt-1">
              {totalCount > 0 ? `${totalCount} product${totalCount !== 1 ? 's' : ''} found` : 'Browse our entire collection'}
            </p>
          </div>
          <div className="w-full md:w-96">
            <SearchBar 
              onSearch={setSearchQuery} 
              placeholder="Search by product name..."
            />
          </div>
        </div>
        
        <div className="pt-4 border-t border-secondary-100">
          <CategoryFilter 
            activeCategory={categoryParam} 
            onSelectCategory={handleCategorySelect} 
          />
        </div>
      </div>

      {/* Product Grid */}
      <div className={`transition-opacity duration-200 ${isFetching && !isLoading ? 'opacity-60' : 'opacity-100'}`}>
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : isError ? (
          <ErrorState 
            title="Failed to load products" 
            message="We couldn't reach the server. Please check your connection and try again."
            onRetry={refetch} 
          />
        ) : products.length === 0 ? (
          <EmptyState 
            icon={FiSearch}
            title="No products found"
            message={searchQuery 
              ? `We couldn't find anything matching "${searchQuery}". Try adjusting your search or filters.` 
              : "There are no products in this category yet."}
            action={
              <button 
                onClick={() => {
                  setSearchQuery('');
                  setSearchParams({});
                }}
                className="text-primary-600 font-medium hover:text-primary-700"
              >
                Clear all filters
              </button>
            }
          />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <Pagination 
                currentPage={pageParam} 
                totalPages={totalPages} 
                onPageChange={handlePageChange} 
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};
