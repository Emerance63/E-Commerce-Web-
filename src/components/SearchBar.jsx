import React, { useState, useEffect } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';
import { useDebounce } from '../hooks/useDebounce';

export const SearchBar = ({ initialValue = '', onSearch, placeholder = 'Search products...' }) => {
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Notify parent component when the debounced value changes
  useEffect(() => {
    onSearch(debouncedSearchTerm);
  }, [debouncedSearchTerm, onSearch]);

  const handleClear = () => {
    setSearchTerm('');
  };

  return (
    <div className="relative w-full max-w-md">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <FiSearch className="h-5 w-5 text-secondary-400" />
      </div>
      <input
        type="text"
        className="block w-full pl-10 pr-10 py-2.5 border border-secondary-300 rounded-lg leading-5 bg-white placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors shadow-sm"
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      {searchTerm && (
        <button
          type="button"
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-secondary-400 hover:text-secondary-600 focus:outline-none"
          onClick={handleClear}
        >
          <FiX className="h-5 w-5" />
        </button>
      )}
    </div>
  );
};
