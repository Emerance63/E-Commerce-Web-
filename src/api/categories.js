import { useQuery } from '@tanstack/react-query';
import { client } from './client';

// --- API Functions ---

export const fetchCategories = async () => {
  const response = await client.get('/categories');
  return response.data?.data || response.data;
};

// --- TanStack Query Hooks ---

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    // Categories rarely change, so we can keep them cached longer
    staleTime: 24 * 60 * 60 * 1000, 
  });
};

