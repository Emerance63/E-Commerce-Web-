import React from 'react';
import { FiAlertTriangle } from 'react-icons/fi';
import { Button } from './Button';

export const ErrorState = ({ title = 'Something went wrong', message, onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="bg-rose-100 p-4 rounded-full mb-4">
        <FiAlertTriangle className="w-8 h-8 text-rose-600" />
      </div>
      <h3 className="text-lg font-medium text-secondary-900 mb-2">{title}</h3>
      {message && <p className="text-secondary-500 max-w-md mb-6">{message}</p>}
      {onRetry && (
        <Button onClick={onRetry} variant="outline">
          Try Again
        </Button>
      )}
    </div>
  );
};

export const EmptyState = ({ icon: Icon, title, message, action }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {Icon && (
        <div className="bg-secondary-100 p-6 rounded-full mb-6">
          <Icon className="w-10 h-10 text-secondary-400" />
        </div>
      )}
      <h3 className="text-xl font-medium text-secondary-900 mb-2">{title}</h3>
      <p className="text-secondary-500 max-w-md mb-8">{message}</p>
      {action}
    </div>
  );
};
