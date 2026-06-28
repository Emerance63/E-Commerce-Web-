import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { client } from './client';
import toast from 'react-hot-toast';

import { getGuestUserId } from './client';

const CART_STORAGE_KEY = 'ecomus_cart';

const normalizeProduct = (product) => {
  if (!product) return null;

  const apiImage = product.images?.[0]?.url;

  return {
    ...product,
    id: product.id || product._id,
    title: product.title || product.name,
    image: product.image || apiImage || product.thumbnail,
    category: typeof product.category === 'object' ? product.category?.name : product.category,
    price: Number(product.price || 0),
  };
};

const getProductId = (product) => product?.id || product?._id;

const calculateCart = (items = []) => {
  const normalizedItems = items
    .filter((item) => item && (item.product || item.id || item.productId))
    .map((item) => {
      const product = normalizeProduct(item.product || item);
      const quantity = Math.max(1, Number(item.quantity || 1));

      return {
        ...item,
        id: item.id || `${item.variantId || 'default'}:${getProductId(product) || item.productId}`,
        productId: item.productId || getProductId(product),
        product,
        quantity,
        lineTotal: (product?.price || 0) * quantity,
      };
    });

  const total = normalizedItems.reduce((sum, item) => sum + item.lineTotal, 0);
  const itemCount = normalizedItems.reduce((sum, item) => sum + item.quantity, 0);

  return {
    items: normalizedItems,
    subtotal: total,
    total,
    itemCount,
  };
};

const readSavedCart = () => {
  try {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    return savedCart ? calculateCart(JSON.parse(savedCart).items || []) : calculateCart([]);
  } catch {
    return calculateCart([]);
  }
};

const saveCart = (cart) => {
  const calculatedCart = calculateCart(cart.items || []);
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(calculatedCart));
  return calculatedCart;
};

const fetchProductSnapshot = async (productId) => {
  const response = await client.get(`/products/${productId}`);
  const productData = response.data?.data?.product || response.data?.data || response.data;
  return normalizeProduct(productData);
};

// --- API Functions ---

// Fetch the current user's cart
export const fetchCart = async () => {
  getGuestUserId();
  return readSavedCart();
};

// Add item to cart
export const addToCart = async ({ productId, product, quantity, variantId }) => {
  getGuestUserId();

  const productSnapshot = normalizeProduct(product) || await fetchProductSnapshot(productId);
  const resolvedProductId = productId || getProductId(productSnapshot);
  const resolvedVariantId = variantId || 'default';
  const itemId = `${resolvedVariantId}:${resolvedProductId}`;
  const cart = readSavedCart();
  const requestedQuantity = Math.max(1, Number(quantity || 1));
  const existingItem = cart.items.find((item) => item.id === itemId);

  const items = existingItem
    ? cart.items.map((item) => (
        item.id === itemId
          ? { ...item, quantity: item.quantity + requestedQuantity }
          : item
      ))
    : [
        ...cart.items,
        {
          id: itemId,
          productId: resolvedProductId,
          variantId: resolvedVariantId,
          quantity: requestedQuantity,
          product: productSnapshot,
        },
      ];

  return saveCart({ items });
};

// Update item quantity
export const updateCartItem = async ({ itemId, quantity }) => {
  getGuestUserId();
  const cart = readSavedCart();
  const nextQuantity = Math.max(1, Number(quantity || 1));
  const items = cart.items.map((item) => (
    item.id === itemId ? { ...item, quantity: nextQuantity } : item
  ));
  return saveCart({ items });
};

// Remove item from cart
export const removeCartItem = async (itemId) => {
  getGuestUserId();
  const cart = readSavedCart();
  return saveCart({ items: cart.items.filter((item) => item.id !== itemId) });
};

export const clearCart = async () => {
  getGuestUserId();
  return saveCart({ items: [] });
};

// --- TanStack Query Hooks ---

export const useCart = () => {
  return useQuery({
    queryKey: ['cart'],
    queryFn: fetchCart,
    staleTime: Infinity,
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
          const items = Array.isArray(old) ? old : (old.items || []);
          const updatedItems = items.map(item =>
            item.id === itemId ? { ...item, quantity } : item
          );
          return Array.isArray(old) ? updatedItems : calculateCart(updatedItems);
        });
      }

      return { previousCart };
    },
    onSuccess: (cart) => {
      queryClient.setQueryData(['cart'], cart);
    },
    onError: (err, newTodo, context) => {
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
          const items = Array.isArray(old) ? old : (old.items || []);
          const updatedItems = items.filter(item => item.id !== itemId);
          return Array.isArray(old) ? updatedItems : calculateCart(updatedItems);
        });
      }
      return { previousCart };
    },
    onSuccess: (cart) => {
      queryClient.setQueryData(['cart'], cart);
      toast.success('Item removed');
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(['cart'], context.previousCart);
      toast.error('Failed to remove item');
    },
  });
};
