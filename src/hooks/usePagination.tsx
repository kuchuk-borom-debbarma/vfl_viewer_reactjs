import { useState, useCallback, useRef } from 'react';

interface UsePaginationReturn<T> {
    items: T[];
    loading: boolean;
    error: string | null;
    hasMore: boolean;
    loadMore: () => void;
    reset: () => void;
}

export function usePagination<T extends { cursor: string }>(
    fetchFn: (cursor?: string) => Promise<T[]>,
    pageSize: number
): UsePaginationReturn<T> {
    const [items, setItems] = useState<T[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [nextCursor, setNextCursor] = useState<string | undefined>();
    const [hasMore, setHasMore] = useState(true);

    // Use ref to store the fetchFn to avoid dependency issues
    const fetchFnRef = useRef(fetchFn);
    fetchFnRef.current = fetchFn;

    const loadMore = useCallback(async (append = true) => {
        if (loading) return;

        setLoading(true);
        setError(null);

        try {
            const currentCursor = append ? nextCursor : undefined;
            const newItems = await fetchFnRef.current(currentCursor);

            setItems(prev => {
                if (!append) return newItems;
                const seen = new Set(prev.map(item => item.cursor));
                return [...prev, ...newItems.filter(item => !seen.has(item.cursor))];
            });

            if (newItems.length > 0) {
                setNextCursor(newItems[newItems.length - 1].cursor);
                setHasMore(newItems.length === pageSize);
            } else {
                setHasMore(false);
            }
        } catch (err: any) {
            setError(err.message || 'Failed to load data');
        } finally {
            setLoading(false);
        }
    }, [loading, nextCursor, pageSize]); // Removed fetchFn from dependencies

    const reset = useCallback(() => {
        setItems([]);
        setNextCursor(undefined);
        setHasMore(true);
        setError(null);
        // Don't call loadMore here to avoid immediate fetch
    }, []);

    // Separate function to initialize data
    const initialize = useCallback(() => {
        if (items.length === 0 && !loading) {
            loadMore(false);
        }
    }, [items.length, loading, loadMore]);

    return { items, loading, error, hasMore, loadMore, reset, initialize };
}