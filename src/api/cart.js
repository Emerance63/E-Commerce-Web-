import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import { client } from './client';
import { ensureUser } from './auth';
import { ensureVariantForProduct } from './variants';

const normalizeCartItem = (item) => {
  const variant = item.variant;
  const variantImage = variant?.images?.[0]?.url;

  const product = {
    id: item.productId,
    title: item.productName,
    name: item.productName,
    price: Number(item.unitPrice ?? variant?.price ?? 0),
    category: item.category,
    image: variantImage,
    thumbnail: variantImage,
  };

  return {
    id: item.id,
    productId: item.productId,
    variantId: variant?.id,
    quantity: item.quantity,
    product,
    lineTotal: Number(item.subtotal ?? product.price * item.quantity),
  };
};

export const normalizeCart = (cart) => {
  const items = (cart?.items || []).map(normalizeCartItem);
  const total = Number(cart?.total ?? 0);
  const itemCount = Number(cart?.itemCount ?? items.reduce((sum, i) => sum + i.quantity, 0));

  return {
    items,
    subtotal: total,
    total,
    itemCount,
  };
};

const emptyCart = () => normalizeCart({ items: [], total: 0, itemCount: 0 });

// --- API Functions ---

export const fetchCart = async () => {
  const userId = await ensureUser();
  const response = await client.get('/cart', { params: { userId } });
  const cart = response.data?.data?.cart;
  return cart ? normalizeCart(cart) : emptyCart();
};

export const addToCart = async ({ productId, quantity, variantId }) => {
  const userId = await ensureUser();
  const resolvedVariantId = variantId || await ensureVariantForProduct(productId);

  const response = await client.post('/cart/items', {
    userId,
    productId,
    variantId: resolvedVariantId,
    quantity: Math.max(1, Number(quantity || 1)),
  });

  return normalizeCart(response.data?.data?.cart);
};

export const updateCartItem = async ({ itemId, quantity }) => {
  const userId = await ensureUser();
  const response = await client.patch(`/cart/items/${itemId}`, {
    userId,
    quantity: Math.max(1, Number(quantity || 1)),
  });

  return normalizeCart(response.data?.data?.cart);
};

export const removeCartItem = async (itemId) => {
  const userId = await ensureUser();
  const response = await client.delete(`/cart/items/${itemId}`, {
    params: { userId },
  });

  return normalizeCart(response.data?.data?.cart);
};

export const clearCart = async () => {
  const userId = await ensureUser();
  await client.delete('/cart', { params: { userId } });
  return emptyCart();
};

// --- TanStack Query Hooks ---

export const useCart = () => {
  return useQuery({
    queryKey: ['cart'],
    queryFn: fetchCart,
  });
};

export const useAddToCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addToCart,
    onSuccess: (cart) => {
      queryClient.setQueryData(['cart'], cart);
      toast.success('Added to cart');
    },
    onError: (error) => {
      toast.error(`Failed to add to cart: ${error.message}`);
    },
  });
};

export const useUpdateCartItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCartItem,
    onMutate: async ({ itemId, quantity }) => {
      await queryClient.cancelQueries({ queryKey: ['cart'] });
      const previousCart = queryClient.getQueryData(['cart']);

      if (previousCart) {
        queryClient.setQueryData(['cart'], (old) => {
          if (!old?.items) return old;
          const updatedItems = old.items.map((item) =>
            item.id === itemId
              ? { ...item, quantity, lineTotal: (item.product?.price || 0) * quantity }
              : item
          );
          const total = updatedItems.reduce((sum, i) => sum + i.lineTotal, 0);
          return {
            ...old,
            items: updatedItems,
            total,
            subtotal: total,
            itemCount: updatedItems.reduce((sum, i) => sum + i.quantity, 0),
          };
        });
      }

      return { previousCart };
    },
    onSuccess: (cart) => {
      queryClient.setQueryData(['cart'], cart);
    },
    onError: (_err, _vars, context) => {
      queryClient.setQueryData(['cart'], context.previousCart);
      toast.error('Failed to update quantity');
    },
  });
};

export const useRemoveCartItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeCartItem,
    onMutate: async (itemId) => {
      await queryClient.cancelQueries({ queryKey: ['cart'] });
      const previousCart = queryClient.getQueryData(['cart']);

      if (previousCart) {
        queryClient.setQueryData(['cart'], (old) => {
          if (!old?.items) return old;
          const updatedItems = old.items.filter((item) => item.id !== itemId);
          const total = updatedItems.reduce((sum, i) => sum + i.lineTotal, 0);
          return {
            ...old,
            items: updatedItems,
            total,
            subtotal: total,
            itemCount: updatedItems.reduce((sum, i) => sum + i.quantity, 0),
          };
        });
      }
      return { previousCart };
    },
    onSuccess: (cart) => {
      queryClient.setQueryData(['cart'], cart);
      toast.success('Item removed');
    },
    onError: (_err, _vars, context) => {
      queryClient.setQueryData(['cart'], context.previousCart);
      toast.error('Failed to remove item');
    },
  });
};
