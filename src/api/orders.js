import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import { getGuestUserId } from './client';
import { clearCart } from './cart';

const ORDERS_STORAGE_KEY = 'ecomus_orders';

const readSavedOrders = () => {
  try {
    const userId = getGuestUserId();
    const savedOrders = JSON.parse(localStorage.getItem(ORDERS_STORAGE_KEY) || '[]');
    return savedOrders.filter((order) => order.userId === userId);
  } catch {
    return [];
  }
};

const saveOrders = (orders) => {
  localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
  return orders;
};

// --- API Functions ---

export const fetchOrders = async () => {
  return readSavedOrders();
};

export const fetchOrderById = async (id) => {
  return readSavedOrders().find((order) => String(order.id) === String(id)) || null;
};

export const placeOrder = async (orderData) => {
  const userId = getGuestUserId();
  const savedOrders = JSON.parse(localStorage.getItem(ORDERS_STORAGE_KEY) || '[]');
  const order = {
    ...orderData,
    id: Date.now().toString(),
    userId,
    status: 'confirmed',
    date: orderData.date || new Date().toISOString(),
  };

  saveOrders([order, ...savedOrders]);
  return order;
};

// --- TanStack Query Hooks ---

export const useOrders = () => {
  return useQuery({
    queryKey: ['orders'],
    queryFn: fetchOrders,
  });
};

export const useOrder = (id) => {
  return useQuery({
    queryKey: ['order', id],
    queryFn: () => fetchOrderById(id),
    enabled: !!id,
  });
};

export const usePlaceOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: placeOrder,
    onSuccess: async (order) => {
      const emptyCart = await clearCart();
      queryClient.setQueryData(['cart'], emptyCart);
      queryClient.setQueryData(['order', String(order.id)], order);
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Order placed successfully!');
    },
    onError: (error) => {
      toast.error(`Checkout failed: ${error.message}`);
    },
  });
};
