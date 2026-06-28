import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import { client } from './client';
import { ensureUser } from './auth';

export const fetchComments = async (productId) => {
  const response = await client.get('/comments', { params: { productId } });
  const data = response.data?.data;
  return data?.comments || data || [];
};

export const createComment = async ({ productId, content, rating }) => {
  const userId = await ensureUser();
  const response = await client.post('/comments', {
    userId,
    productId,
    content,
    rating: Number(rating),
  });
  return response.data?.data?.comment || response.data?.data;
};

export const useComments = (productId) => {
  return useQuery({
    queryKey: ['comments', productId],
    queryFn: () => fetchComments(productId),
    enabled: !!productId,
  });
};

export const useCreateComment = (productId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createComment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', productId] });
      queryClient.invalidateQueries({ queryKey: ['product', productId] });
      toast.success('Review posted!');
    },
    onError: (error) => {
      toast.error(`Failed to post review: ${error.message}`);
    },
  });
};
