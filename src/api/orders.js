import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import { client } from './client';
import { ensureUser, getStoredEmail } from './auth';
import { clearCart } from './cart';

const normalizeOrderItem = (item) => {
  const product = item.product || {};
  const image = product.images?.[0]?.url;

  return {
    id: item.id,
    productId: item.productId,
    quantity: item.quantity,
    price: Number(item.price ?? 0),
    product: {
      id: item.productId,
      title: product.name || product.title,
      name: product.name,
      price: Number(item.price ?? product.price ?? 0),
      image,
      thumbnail: image,
      category: product.category?.name || product.category,
    },
  };
};

export const normalizeOrder = (order) => {
  if (!order) return null;

  return {
    ...order,
    id: order.id,
    total: Number(order.total ?? 0),
    status: order.status,
    date: order.createdAt || order.date,
    email: order.user?.email || getStoredEmail(),
    items: (order.items || []).map(normalizeOrderItem),
  };
};

// --- API Functions ---

export const fetchOrders = async () => {
  const userId = await ensureUser();
  const response = await client.get('/orders', { params: { userId } });
  const orders = response.data?.data || [];
  return Array.isArray(orders) ? orders.map(normalizeOrder) : [];
};

export const fetchOrderById = async (id) => {
  const response = await client.get(`/orders/${id}`);
  const order = response.data?.data?.order || response.data?.data;
  return normalizeOrder(order);
};

export const placeOrder = async () => {
  const userId = await ensureUser();
  const response = await client.post('/orders', { userId });
  const order = response.data?.data?.order || response.data?.data;
  return normalizeOrder(order);
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
