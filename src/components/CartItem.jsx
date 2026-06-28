import React from 'react';
import { Link } from 'react-router-dom';
import { FiTrash2, FiMinus, FiPlus } from 'react-icons/fi';
import { Button } from './Button';
import { formatCurrency } from '../utils/formatCurrency';
import { useUpdateCartItem, useRemoveCartItem } from '../api/cart';

export const CartItem = ({ item }) => {
  const updateItemMutation = useUpdateCartItem();
  const removeItemMutation = useRemoveCartItem();

  // Assuming item has a product object nested, or flatten structure depending on API
  const product = item.product || item; 
  const quantity = item.quantity || 1;
  const lineTotal = product.price * quantity;

  const handleUpdateQuantity = (newQuantity) => {
    if (newQuantity < 1) return;
    updateItemMutation.mutate({ itemId: item.id, quantity: newQuantity });
  };

  const handleRemove = () => {
    removeItemMutation.mutate(item.id);
  };

  const isUpdating = updateItemMutation.isPending;
  const isRemoving = removeItemMutation.isPending;

  return (
    <div className="flex flex-col sm:flex-row items-center py-6 border-b border-secondary-200 gap-4 sm:gap-6">
      {/* Product Image */}
      <Link to={`/products/${product.id}`} className="shrink-0">
        <div className="w-24 h-24 sm:w-32 sm:h-32 bg-white rounded-lg border border-secondary-200 p-2 flex items-center justify-center">
          <img 
            src={product.image || product.thumbnail} 
            alt={product.title} 
            className="object-contain w-full h-full"
          />
        </div>
      </Link>

      {/* Details */}
      <div className="flex-1 flex flex-col min-w-0 w-full">
        <div className="flex justify-between items-start gap-4">
          <div>
            <Link to={`/products/${product.id}`}>
              <h3 className="text-base font-semibold text-secondary-900 hover:text-primary-600 line-clamp-2">
                {product.title}
              </h3>
            </Link>
            <p className="mt-1 text-sm text-secondary-500 capitalize">{product.category}</p>
          </div>
          <p className="text-base font-bold text-secondary-900 shrink-0">
            {formatCurrency(product.price)}
          </p>
        </div>

        <div className="mt-4 flex items-center justify-between w-full">
          {/* Quantity Stepper */}
          <div className="flex items-center border border-secondary-300 rounded-lg bg-white">
            <button
              type="button"
              className="p-2 text-secondary-600 hover:bg-secondary-50 hover:text-primary-600 disabled:opacity-50 transition-colors rounded-l-lg"
              onClick={() => handleUpdateQuantity(quantity - 1)}
              disabled={quantity <= 1 || isUpdating}
            >
              <FiMinus className="w-4 h-4" />
            </button>
            <span className="w-12 text-center text-sm font-medium text-secondary-900">
              {quantity}
            </span>
            <button
              type="button"
              className="p-2 text-secondary-600 hover:bg-secondary-50 hover:text-primary-600 disabled:opacity-50 transition-colors rounded-r-lg"
              onClick={() => handleUpdateQuantity(quantity + 1)}
              disabled={isUpdating}
            >
              <FiPlus className="w-4 h-4" />
            </button>
          </div>

          {/* Remove Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            isLoading={isRemoving}
            className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
          >
            <FiTrash2 className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Remove</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
