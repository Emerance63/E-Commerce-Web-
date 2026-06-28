import React from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

export const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center space-x-2 mt-8">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-lg border border-secondary-200 text-secondary-500 hover:bg-secondary-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        aria-label="Previous page"
      >
        <FiChevronLeft className="w-5 h-5" />
      </button>
      
      <span className="text-sm font-medium text-secondary-700 mx-4">
        Page {currentPage} of {totalPages}
      </span>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-lg border border-secondary-200 text-secondary-500 hover:bg-secondary-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        aria-label="Next page"
      >
        <FiChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
};
