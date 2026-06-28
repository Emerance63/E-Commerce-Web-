import React, { useMemo } from 'react';
import { FiSearch } from 'react-icons/fi';
import { useInfiniteProducts } from '../api/products';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import { ProductCard } from './ProductCard';
import { Pagination } from './Pagination';
import { SkeletonCard } from './LoadingStates';
import { ErrorState, EmptyState } from './FeedbackStates';

const STAGGER_MS = 70;

export const InfiniteProductFeed = ({
  category = '',
  search = '',
  limit = 12,
  emptyMessage = 'There are no products in this category yet.',
}) => {
  const {
    data,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetching,
  } = useInfiniteProducts({ category, search, limit });

  const pages = data?.pages ?? [];
  const products = useMemo(
    () => pages.flatMap((page) => page.results),
    [pages]
  );

  const lastPage = pages[pages.length - 1];
  const totalPages = lastPage?.totalPages ?? 1;
  const totalCount = lastPage?.total ?? products.length;
  const loadedPages = pages.length;
  const currentPage = loadedPages;
  const latestPageIndex = pages.length - 1;

  const sentinelRef = useInfiniteScroll({
    onLoadMore: fetchNextPage,
    hasMore: Boolean(hasNextPage),
    isLoading: isFetchingNextPage,
  });

  const handlePageChange = async (targetPage) => {
    if (targetPage < loadedPages) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (targetPage > loadedPages) {
      let pagesNeeded = targetPage - loadedPages;
      while (pagesNeeded > 0) {
        const result = await fetchNextPage();
        pagesNeeded--;
        if (result.isError) break;
        const fetchedPages = result.data?.pages ?? [];
        const fetchedLast = fetchedPages[fetchedPages.length - 1];
        if (!fetchedLast || fetchedLast.currentPage >= fetchedLast.totalPages) break;
      }
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: limit }).map((_, i) => (
          <div key={i} className="product-feed-enter" style={{ animationDelay: `${i * STAGGER_MS}ms` }}>
            <SkeletonCard />
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorState
        title="Failed to load products"
        message="We couldn't reach the server. Please check your connection and try again."
        onRetry={refetch}
      />
    );
  }

  if (products.length === 0) {
    return (
      <EmptyState
        icon={FiSearch}
        title="No products found"
        message={search
          ? `We couldn't find anything matching "${search}". Try adjusting your search or filters.`
          : emptyMessage}
      />
    );
  }

  return (
    <div
      className={`transition-opacity duration-200 ${isFetching && !isFetchingNextPage ? 'opacity-70' : 'opacity-100'}`}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {pages.flatMap((page, pageIndex) =>
          page.results.map((product, productIndex) => (
            <ProductCard
              key={product.id}
              product={product}
              animate={pageIndex === latestPageIndex}
              animationDelay={productIndex * STAGGER_MS}
            />
          ))
        )}

        {isFetchingNextPage &&
          Array.from({ length: 4 }).map((_, i) => (
            <div key={`skeleton-${i}`} className="product-feed-enter" style={{ animationDelay: `${i * STAGGER_MS}ms` }}>
              <SkeletonCard />
            </div>
          ))}
      </div>

      <div ref={sentinelRef} className="h-1 w-full" aria-hidden="true" />

      <div className="mt-10 space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-secondary-500">
          <span>
            Showing <strong className="text-secondary-800">{products.length}</strong> of{' '}
            <strong className="text-secondary-800">{totalCount}</strong> products
          </span>
          {hasNextPage && (
            <span className="flex items-center gap-2">
              {isFetchingNextPage && (
                <span className="w-4 h-4 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
              )}
              Scroll for more — page {loadedPages} of {totalPages}
            </span>
          )}
          {!hasNextPage && products.length > 0 && (
            <span className="text-emerald-600 font-medium">All products loaded</span>
          )}
        </div>

        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            disablePrev={loadedPages <= 1}
            disableNext={!hasNextPage}
          />
        )}
      </div>
    </div>
  );
};
