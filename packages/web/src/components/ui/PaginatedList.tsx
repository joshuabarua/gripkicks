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
}

export function PaginatedList<T>({
  items,
  renderItem,
  itemsPerPage = 25,
  className = "",
  loadingIndicator,
  onEndReached,
  hasMore = false,
  isLoading = false,
}: PaginatedListProps<T>) {
  const [visibleCount, setVisibleCount] = useState(itemsPerPage);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const visibleItems = items.slice(0, visibleCount);
  const showLoadingIndicator = hasMore && isLoading;

  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current || isLoading || !hasMore) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100;

    if (isNearBottom && hasMore) {
      setVisibleCount((prev: number) => Math.min(prev + itemsPerPage, items.length));
      onEndReached?.();
    }
  }, [isLoading, hasMore, items.length, itemsPerPage, onEndReached]);

  useEffect(() => {
    setVisibleCount(itemsPerPage);
  }, [items, itemsPerPage]);

  return (
    <div
      ref={scrollContainerRef}
      onScroll={handleScroll}
      className={`overflow-y-auto ${className}`}
    >
      <div className="space-y-2">
        {visibleItems.map((item, index) => renderItem(item, index))}
      </div>
      
      {showLoadingIndicator && loadingIndicator && (
        <div className="text-center py-4">
          {loadingIndicator}
        </div>
      )}
    </div>
  );
}
