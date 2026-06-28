import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CategoryFilter } from '../components/CategoryFilter';
import { SearchBar } from '../components/SearchBar';
import { InfiniteProductFeed } from '../components/InfiniteProductFeed';
import { useDebounce } from '../hooks/useDebounce';

const PRODUCTS_PER_PAGE = 12;

export const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category') || '';
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);

  const handleCategorySelect = (category) => {
    setSearchParams((prev) => {
      if (category) prev.set('category', category);
      else prev.delete('category');
      prev.delete('page');
      return prev;
    });
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="bg-white rounded-2xl shadow-sm border border-secondary-100 p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-secondary-900 tracking-tight">Products</h1>
            <p className="text-secondary-500 mt-1">Scroll to load more — new items appear as you browse</p>
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

      <InfiniteProductFeed
        category={categoryParam}
        search={debouncedSearch}
        limit={PRODUCTS_PER_PAGE}
        emptyMessage={
          debouncedSearch
            ? `We couldn't find anything matching "${debouncedSearch}". Try adjusting your search or filters.`
            : 'There are no products in this category yet.'
        }
      />
    </div>
  );
};
