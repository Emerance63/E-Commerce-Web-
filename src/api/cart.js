import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { client } from './client';
import toast from 'react-hot-toast';

// --- API Functions ---

// Fetch the current user's cart
export const fetchCart = async () => {
  // Assuming a standard endpoint for getting cart items
  // Depending on the API, this might need a user ID or token
  const response = await client.get('/cart');
  return response.data;
};

// Add item to cart
export const addToCart = async ({ productId, quantity }) => {
  const response = await client.post('/cart', { productId, quantity });
  return response.data;
};

// Update item quantity
export const updateCartItem = async ({ itemId, quantity }) => {
  const response = await client.put(`/cart/${itemId}`, { quantity });
  return response.data;
};

// Remove item from cart
export const removeCartItem = async (itemId) => {
  const response = await client.delete(`/cart/${itemId}`);
  return response.data;
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
    onSuccess: () => {
      // Invalidate and refetch to ensure server state matches UI
      queryClient.invalidateQueries({ queryKey: ['cart'] });
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
    // Optimistic Update (Stretch Goal)
    onMutate: async ({ itemId, quantity }) => {
      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: ['cart'] });

      // Snapshot the previous value
      const previousCart = queryClient.getQueryData(['cart']);

      // Optimistically update to the new value
      if (previousCart) {
        queryClient.setQueryData(['cart'], (old) => {
          // This logic depends on the exact shape of the cart data
          // Assuming old is an array of items or has an items array
          const items = Array.isArray(old) ? old : (old.items || []);
          const updatedItems = items.map(item => 
            item.id === itemId ? { ...item, quantity } : item
          );
          return Array.isArray(old) ? updatedItems : { ...old, items: updatedItems };
        });
      }

      // Return a context object with the snapshotted value
      return { previousCart };
    },
    // If the mutation fails, use the context returned from onMutate to roll back
    onError: (err, newTodo, context) => {
      queryClient.setQueryData(['cart'], context.previousCart);
      toast.error('Failed to update quantity');
    },
    // Always refetch after error or success:
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
};

export const useRemoveCartItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeCartItem,
    // Optimistic Update (Stretch Goal)
    onMutate: async (itemId) => {
      await queryClient.cancelQueries({ queryKey: ['cart'] });
      const previousCart = queryClient.getQueryData(['cart']);

      if (previousCart) {
        queryClient.setQueryData(['cart'], (old) => {
          const items = Array.isArray(old) ? old : (old.items || []);
          const updatedItems = items.filter(item => item.id !== itemId);
          return Array.isArray(old) ? updatedItems : { ...old, items: updatedItems };
        });
      }
      return { previousCart };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(['cart'], context.previousCart);
      toast.error('Failed to remove item');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success('Item removed');
    },
  });
};
