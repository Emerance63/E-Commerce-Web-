import React from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingCart } from 'react-icons/fi';
import { Button } from './Button';
import { formatCurrency } from '../utils/formatCurrency';
import { useAddToCart } from '../api/cart';

export const ProductCard = ({ product, animate = false, animationDelay = 0 }) => {
  const addToCartMutation = useAddToCart();

  const handleAddToCart = (e) => {
    e.preventDefault(); // Prevent navigating to product detail if button is clicked
    e.stopPropagation();
    addToCartMutation.mutate({ productId: product.id, product, quantity: 1 });
  };

  return (
    <Link 
      to={`/products/${product.id}`}
      className={`group flex flex-col bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-secondary-100 overflow-hidden ${
        animate ? 'product-feed-enter' : ''
      }`}
      style={animate ? { animationDelay: `${animationDelay}ms` } : undefined}
    >
      {/* Product Image */}
      <div className="relative aspect-square p-6 bg-white flex items-center justify-center overflow-hidden">
        <img 
          src={product.image || product.thumbnail || 'https://via.placeholder.com/300'} 
          alt={product.title} 
          className="object-contain w-full h-full group-hover:scale-105 transition-transform duration-500"
        />
        {/* Category Badge */}
        <div className="absolute top-4 left-4">
          <span className="bg-secondary-100 text-secondary-800 text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wide">
            {product.category}
          </span>
        </div>
      </div>

      {/* Product Details */}
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="text-secondary-900 font-semibold text-lg line-clamp-2 mb-2 group-hover:text-primary-600 transition-colors">
          {product.title}
        </h3>
        
        {/* Ratings (if available in API) */}
        {product.rating && (
          <div className="flex items-center mb-3">
            <div className="flex text-amber-400">
              {'★'.repeat(Math.round(product.rating.rate))}
              <span className="text-secondary-300">
                {'★'.repeat(5 - Math.round(product.rating.rate))}
              </span>
            </div>
            <span className="text-secondary-500 text-sm ml-2">({product.rating.count})</span>
          </div>
        )}

        <div className="mt-auto flex items-center justify-between pt-4">
          <span className="text-xl font-bold text-secondary-900">
            {formatCurrency(product.price)}
          </span>
          <Button 
            variant="primary" 
            size="icon" 
            className="rounded-full h-10 w-10 shadow-sm"
            onClick={handleAddToCart}
            isLoading={addToCartMutation.isPending}
            aria-label="Add to cart"
          >
            <FiShoppingCart className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </Link>
  );
};
