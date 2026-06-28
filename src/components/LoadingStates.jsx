import React from 'react';

export const SkeletonCard = () => {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-secondary-100 animate-pulse flex flex-col h-[350px]">
      <div className="w-full bg-secondary-200 rounded-lg aspect-square mb-4"></div>
      <div className="h-4 bg-secondary-200 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-secondary-200 rounded w-1/2 mb-4"></div>
      <div className="mt-auto flex justify-between items-center">
        <div className="h-6 bg-secondary-200 rounded w-1/4"></div>
        <div className="h-10 w-10 bg-secondary-200 rounded-full"></div>
      </div>
    </div>
  );
};

export const LoadingSpinner = ({ fullScreen = false }) => {
  const content = (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
      <p className="text-secondary-500 font-medium">Loading...</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
};
