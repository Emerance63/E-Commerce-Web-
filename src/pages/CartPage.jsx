import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiArrowRight } from 'react-icons/fi';
import { useCart } from '../api/cart';
import { CartItem } from '../components/CartItem';
import { Button } from '../components/Button';
import { formatCurrency } from '../utils/formatCurrency';
import { LoadingSpinner } from '../components/LoadingStates';
import { ErrorState, EmptyState } from '../components/FeedbackStates';

export const CartPage = () => {
  const navigate = useNavigate();
  const { data: cartData, isLoading, isError, refetch } = useCart();

  if (isLoading) return <LoadingSpinner fullScreen />;
  
  if (isError) return (
    <div className="py-12">
      <ErrorState 
        title="Failed to load your cart" 
        onRetry={refetch} 
      />
    </div>
  );

  // Normalize cart data structure (array vs object with items)
  const items = Array.isArray(cartData) ? cartData : (cartData?.items || []);
  
  const hasItems = items.length > 0;
  
  const subtotal = items.reduce((sum, item) => {
    const price = item.product?.price || item.price || 0;
    const qty = item.quantity || 1;
    return sum + (price * qty);
  }, 0);

  const shipping = hasItems ? (subtotal > 50 ? 0 : 10) : 0;
  const total = subtotal + shipping;

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-secondary-900 tracking-tight mb-8">Shopping Cart</h1>

      {!hasItems ? (
        <div className="bg-white rounded-2xl shadow-sm border border-secondary-100 py-8">
          <EmptyState 
            icon={FiShoppingCart}
            title="Your cart is empty"
            message="Looks like you haven't added anything to your cart yet."
            action={
              <Link to="/products">
                <Button size="lg">Start Shopping</Button>
              </Link>
            }
          />
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items List */}
          <div className="lg:w-2/3">
            <div className="bg-white rounded-2xl shadow-sm border border-secondary-100 overflow-hidden">
              <div className="p-6">
                {items.map((item, index) => (
                  <CartItem key={item.id || index} item={item} />
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-2xl shadow-sm border border-secondary-100 p-6 sticky top-24">
              <h2 className="text-lg font-bold text-secondary-900 mb-6 pb-4 border-b border-secondary-100">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-secondary-600">
                  <span>Subtotal</span>
                  <span className="font-medium text-secondary-900">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-secondary-600">
                  <span>Shipping</span>
                  <span className="font-medium text-secondary-900">
                    {shipping === 0 ? <span className="text-emerald-600 font-semibold">Free</span> : formatCurrency(shipping)}
                  </span>
                </div>
                {shipping > 0 && (
                  <div className="text-xs text-secondary-500">
                    Spend {formatCurrency(50 - subtotal)} more to get free shipping!
                  </div>
                )}
                
                <div className="pt-4 border-t border-secondary-100 flex justify-between items-center">
                  <span className="text-lg font-bold text-secondary-900">Total</span>
                  <span className="text-2xl font-bold text-primary-600">{formatCurrency(total)}</span>
                </div>
              </div>

              <Button 
                size="lg" 
                className="w-full text-lg h-14"
                onClick={() => navigate('/checkout')}
              >
                Proceed to Checkout <FiArrowRight className="ml-2 w-5 h-5" />
              </Button>
              
              <div className="mt-4 text-center">
                <Link to="/products" className="text-sm font-medium text-secondary-500 hover:text-primary-600 transition-colors">
                  or Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
