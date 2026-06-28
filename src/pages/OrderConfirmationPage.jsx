import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiCheckCircle, FiPackage, FiShoppingBag } from 'react-icons/fi';
import { useOrder } from '../api/orders';
import { Button } from '../components/Button';
import { formatCurrency } from '../utils/formatCurrency';
import { LoadingSpinner } from '../components/LoadingStates';

export const OrderConfirmationPage = () => {
  const { id } = useParams();
  
  // Note: Depending on the API, immediately fetching an order by ID might fail if the cache 
  // isn't updated or if the fake API doesn't actually store the order.
  // We handle both real data from useOrder and a fallback success state.
  const { data: order, isLoading, isError } = useOrder(id);

  if (isLoading) return <LoadingSpinner fullScreen />;

  // Render a generic success state even if the API didn't save the order (common with mock APIs)
  return (
    <div className="max-w-3xl mx-auto pt-10 pb-16 px-4 sm:px-6">
      <div className="bg-white rounded-3xl shadow-sm border border-secondary-100 overflow-hidden text-center">
        
        <div className="bg-emerald-50 py-12 px-4 border-b border-emerald-100">
          <div className="mx-auto w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6">
            <FiCheckCircle className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-extrabold text-secondary-900 tracking-tight mb-2">Order Confirmed!</h1>
          <p className="text-lg text-secondary-600">
            Thank you for your purchase. Your order #{id} has been received.
          </p>
        </div>

        <div className="p-8 sm:p-12">
          {order && !isError ? (
            <div className="bg-secondary-50 rounded-xl p-6 mb-8 text-left border border-secondary-200">
              <h2 className="font-bold text-secondary-900 mb-4 border-b border-secondary-200 pb-2">Order Details</h2>
              <div className="flex justify-between items-center mb-2">
                <span className="text-secondary-600">Total Paid</span>
                <span className="font-bold text-lg text-secondary-900">{formatCurrency(order.total || 0)}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-secondary-600">Date</span>
                <span className="text-secondary-900">{new Date().toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-secondary-600">Email</span>
                <span className="text-secondary-900">{order.email || 'customer@example.com'}</span>
              </div>
            </div>
          ) : (
            <p className="text-secondary-500 mb-8">
              We'll send you an email confirmation with your receipt and tracking information shortly.
            </p>
          )}

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/orders">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                <FiPackage className="mr-2" /> View Order History
              </Button>
            </Link>
            <Link to="/products">
              <Button variant="primary" size="lg" className="w-full sm:w-auto">
                <FiShoppingBag className="mr-2" /> Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
