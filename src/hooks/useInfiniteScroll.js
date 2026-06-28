import { useEffect, useRef } from 'react';

/**
 * Triggers callback when the sentinel element enters the viewport.
 * Used for YouTube-style infinite scroll loading.
 */
export function useInfiniteScroll({ onLoadMore, hasMore, isLoading, rootMargin = '400px' }) {
  const sentinelRef = useRef(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          onLoadMore();
        }
      },
      { rootMargin, threshold: 0 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [onLoadMore, hasMore, isLoading, rootMargin]);

  return sentinelRef;
}
