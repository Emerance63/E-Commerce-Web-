import React from 'react';
import { Link } from 'react-router-dom';
import { FiHome } from 'react-icons/fi';
import { Button } from '../components/Button';

export const NotFoundPage = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-9xl font-extrabold text-primary-100 mb-4">404</h1>
      <h2 className="text-3xl font-bold text-secondary-900 mb-4 tracking-tight">Page Not Found</h2>
      <p className="text-lg text-secondary-500 max-w-md mb-8">
        Oops! The page you're looking for doesn't exist. It might have been moved or deleted.
      </p>
      <Link to="/">
        <Button size="lg">
          <FiHome className="mr-2" /> Back to Home
        </Button>
      </Link>
    </div>
  );
};
