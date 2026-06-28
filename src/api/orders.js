import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { client } from './client';
import toast from 'react-hot-toast';

import { getGuestUserId } from './client';

// --- API Functions ---

export const fetchOrders = async () => {
  const userId = getGuestUserId();
  const response = await client.get('/orders', {
    params: { userId }
  });
  return response.data?.data || response.data;
};

export const fetchOrderById = async (id) => {
  const response = await client.get(`/orders/${id}`);
  return response.data?.data || response.data;
};

export const placeOrder = async (orderData) => {
  const userId = getGuestUserId();
  const response = await client.post('/orders', {
    ...orderData,
    userId
  });
  return response.data;
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
    onSuccess: () => {
      // Clear the cart when order is placed successfully
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      // Invalidate orders list so the new order shows up
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Order placed successfully!');
    },
    onError: (error) => {
      toast.error(`Checkout failed: ${error.message}`);
    },
  });
};
