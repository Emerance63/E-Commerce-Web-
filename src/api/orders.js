import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import { client } from './client';
import { ensureUser, getStoredEmail, clearStoredUser } from './auth';
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
  if (!userId) return [];
  const response = await client.get('/orders', { params: { userId } });
  const orders = response.data?.data || [];
  return Array.isArray(orders) ? orders.map(normalizeOrder) : [];
};

export const fetchOrderById = async (id) => {
  const response = await client.get(`/orders/${id}`);
  const order = response.data?.data?.order || response.data?.data;
  return normalizeOrder(order);
};

/**
 * Place an order. If the first attempt fails due to a stale/corrupt user session,
 * clears credentials and retries with a fresh guest account.
 */
export const placeOrder = async () => {
  let userId;
  try {
    userId = await ensureUser();
  } catch (err) {
    throw new Error('Unable to create a guest session. Please refresh the page and try again.');
  }

  if (!userId) {
    throw new Error('Unable to create a guest session. Please refresh the page and try again.');
  }

  try {
    const response = await client.post('/orders', { userId });
    const order = response.data?.data?.order || response.data?.data;
    return normalizeOrder(order);
  } catch (firstError) {
    // If the server crashed because of a stale session (e.g. "Cannot read properties of undefined (reading 'userId')"),
    // clear credentials, create a fresh user, and retry once.
    const msg = firstError?.message || '';
    if (msg.includes('userId') || msg.includes('unauthorized') || msg.includes('Unauthorized')) {
      console.warn('Order failed due to stale session — retrying with fresh credentials…');
      clearStoredUser();

      try {
        const freshUserId = await ensureUser(true);
        if (!freshUserId) throw new Error('Retry failed');

        const response = await client.post('/orders', { userId: freshUserId });
        const order = response.data?.data?.order || response.data?.data;
        return normalizeOrder(order);
      } catch (retryError) {
        throw new Error('Your session expired. Please add items to your cart again and retry checkout.');
      }
    }

    // Re-throw other errors as-is
    throw firstError;
  }
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
      try {
        const emptyCart = await clearCart();
        queryClient.setQueryData(['cart'], emptyCart);
      } catch {
        // Cart clear failed — not critical, just invalidate
        queryClient.invalidateQueries({ queryKey: ['cart'] });
      }
      if (order?.id) {
        queryClient.setQueryData(['order', String(order.id)], order);
      }
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Order placed successfully!');
    },
    onError: (error) => {
      toast.error(`Checkout failed: ${error.message}`);
    },
  });
};
