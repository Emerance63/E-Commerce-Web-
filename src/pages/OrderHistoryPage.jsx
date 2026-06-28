import React from 'react';
import { Link } from 'react-router-dom';
import { FiPackage, FiShoppingBag } from 'react-icons/fi';
import { useOrders } from '../api/orders';
import { OrderCard } from '../components/OrderCard';
import { Button } from '../components/Button';
import { LoadingSpinner } from '../components/LoadingStates';
import { ErrorState, EmptyState } from '../components/FeedbackStates';

export const OrderHistoryPage = () => {
  const { data: orders, isLoading, isError, refetch } = useOrders();

  if (isLoading) return <LoadingSpinner fullScreen />;
  
  if (isError) return (
    <div className="py-12">
      <ErrorState 
        title="Failed to load your orders" 
        onRetry={refetch} 
      />
    </div>
  );

  const orderList = Array.isArray(orders) ? orders : [];

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-secondary-900 tracking-tight mb-8">Order History</h1>

      {orderList.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-secondary-100 py-12">
          <EmptyState 
            icon={FiPackage}
            title="No orders yet"
            message="You haven't placed any orders yet. Once you do, they will appear here."
            action={
              <Link to="/products">
                <Button size="lg">
                  <FiShoppingBag className="mr-2" /> Start Shopping
                </Button>
              </Link>
            }
          />
        </div>
      ) : (
        <div className="space-y-6">
          {orderList.map(order => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
};
