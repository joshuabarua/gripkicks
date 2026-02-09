"use client";

import { useCallback, useRef, useEffect, useState } from 'react';

interface PaginatedListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  itemsPerPage?: number;
  className?: string;
  loadingIndicator?: React.ReactNode;
  onEndReached?: () => void;
  hasMore?: boolean;
  isLoading?: boolean;
  completedIndicator?: React.ReactNode;
}

export function PaginatedList<T>({
  items,
  renderItem,
  itemsPerPage = 15,
  className = "",
  loadingIndicator,
  onEndReached,
  hasMore,
  isLoading,
  completedIndicator,
}: PaginatedListProps<T>) {
  const [visibleCount, setVisibleCount] = useState(itemsPerPage);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const visibleItems = items.slice(0, visibleCount);
  const computedHasMore = hasMore ?? visibleCount < items.length;
  const computedIsLoading = isLoading ?? false;
  const showLoadingIndicator = computedHasMore && computedIsLoading;
  const showCompletedIndicator = !computedHasMore && !computedIsLoading && items.length > 0;

  const loadMoreItems = useCallback(() => {
    setVisibleCount((prev: number) => Math.min(prev + itemsPerPage, items.length));
    onEndReached?.();
  }, [items.length, itemsPerPage, onEndReached]);

  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current || computedIsLoading || !computedHasMore) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100;

    if (isNearBottom && computedHasMore) {
      loadMoreItems();
    }
  }, [computedIsLoading, computedHasMore, loadMoreItems]);

  useEffect(() => {
    setVisibleCount(itemsPerPage);
  }, [items, itemsPerPage]);

  return (
    <div
      ref={scrollContainerRef}
      onScroll={handleScroll}
      className={`overflow-y-auto min-h-0 ${className}`}
    >
      <div className="space-y-2">
        {visibleItems.map((item, index) => renderItem(item, index))}
      </div>
      
      {showLoadingIndicator && loadingIndicator && (
        <div className="text-center py-4">
          {loadingIndicator}
        </div>
      )}

      {computedHasMore && !computedIsLoading && (
        <div className="text-center py-4">
          <button
            type="button"
            onClick={loadMoreItems}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            Load more
          </button>
        </div>
      )}

      {showCompletedIndicator && (
        <div className="text-center py-4 text-white/60 text-sm">
          {completedIndicator ?? 'No more items to load'}
        </div>
      )}
    </div>
  );
}
