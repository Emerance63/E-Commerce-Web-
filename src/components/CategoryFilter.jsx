import React from 'react';
import { useCategories } from '../api/categories';
import { SkeletonCard } from './LoadingStates';

export const CategoryFilter = ({ activeCategory, onSelectCategory }) => {
  const { data: categories, isLoading, isError } = useCategories();

  if (isLoading) {
    return (
      <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-10 w-24 bg-secondary-200 animate-pulse rounded-full shrink-0" />
        ))}
      </div>
    );
  }

  if (isError) {
    return null; // Fail gracefully
  }

  // Handle both array of strings (fakestoreapi) or array of objects
  const normalizeCategory = (cat) => typeof cat === 'string' ? cat : cat.name || cat.slug;

  return (
    <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
      <button
        onClick={() => onSelectCategory('')}
        className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
          !activeCategory
            ? 'bg-primary-600 text-white shadow-sm'
            : 'bg-white text-secondary-600 border border-secondary-200 hover:border-primary-300 hover:text-primary-600'
        }`}
      >
        All Products
      </button>
      
      {categories?.map((cat) => {
        const value = typeof cat === 'string' ? cat : cat.id || cat._id || cat.name;
        const displayName = typeof cat === 'string' ? cat : cat.name;
        const isActive = activeCategory === value;
        return (
          <button
            key={value}
            onClick={() => onSelectCategory(value)}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium capitalize transition-colors ${
              isActive
                ? 'bg-primary-600 text-white shadow-sm'
                : 'bg-white text-secondary-600 border border-secondary-200 hover:border-primary-300 hover:text-primary-600'
            }`}
          >
            {displayName}
          </button>
        );
      })}
    </div>
  );
};
