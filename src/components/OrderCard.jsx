import React, { useState } from 'react';
import { FiPackage, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { formatCurrency } from '../utils/formatCurrency';

export const OrderCard = ({ order }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Fallback data structure handling since API shape is unknown
  const orderDate = order.date ? new Date(order.date).toLocaleDateString() : 'Unknown Date';
  const orderTotal = order.total || order.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;
  const items = order.items || order.products || [];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-secondary-200 overflow-hidden mb-6">
      <div 
        className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between cursor-pointer hover:bg-secondary-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-4 mb-4 sm:mb-0">
          <div className="bg-primary-50 p-3 rounded-full">
            <FiPackage className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h3 className="text-secondary-900 font-semibold">Order #{order.id}</h3>
            <p className="text-sm text-secondary-500">{orderDate}</p>
          </div>
        </div>
        
        <div className="flex items-center justify-between w-full sm:w-auto sm:space-x-8">
          <div className="text-left sm:text-right">
            <p className="text-sm text-secondary-500">Total</p>
            <p className="font-bold text-secondary-900">{formatCurrency(orderTotal)}</p>
          </div>
          <button className="p-2 text-secondary-400 hover:text-secondary-600 focus:outline-none">
            {isExpanded ? <FiChevronUp className="w-5 h-5" /> : <FiChevronDown className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {isExpanded && items.length > 0 && (
        <div className="border-t border-secondary-200 bg-secondary-50/50 p-5">
          <h4 className="text-sm font-semibold text-secondary-900 mb-4 uppercase tracking-wider">Items</h4>
          <ul className="space-y-4">
            {items.map((item, index) => {
              // Handle potentially nested product object
              const product = item.product || item;
              const quantity = item.quantity || 1;
              return (
                <li key={index} className="flex justify-between items-center bg-white p-3 rounded-lg border border-secondary-100">
                  <div className="flex items-center space-x-4">
                    <img 
                      src={product.image || product.thumbnail || 'https://via.placeholder.com/50'} 
                      alt={product.title} 
                      className="w-12 h-12 object-contain bg-secondary-50 rounded"
                    />
                    <div>
                      <p className="text-sm font-medium text-secondary-900 line-clamp-1">{product.title}</p>
                      <p className="text-xs text-secondary-500">Qty: {quantity}</p>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-secondary-900 shrink-0 ml-4">
                    {formatCurrency(product.price * quantity)}
                  </p>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};
