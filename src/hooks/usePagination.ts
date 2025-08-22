import { useState, useEffect, useCallback } from "react";

interface PaginatedItem {
    id: string;
    cursor: string;
}

interface UsePaginationOptions<T> {
    fetchFn: (limit: number, cursor?: string) => Promise<T[]>;
    pageSize?: number;
    autoLoad?: boolean;
}

export function usePagination<T extends PaginatedItem>({
                                                           fetchFn,
                                                           pageSize = 5,
                                                           autoLoad = true
                                                       }: UsePaginationOptions<T>) {
    const [items, setItems] = useState<T[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [cursor, setCursor] = useState<string>();
    const [hasMore, setHasMore] = useState(true);

    const load = useCallback(async (append = false) => {
        setLoading(true);
        setError(null);

        try {
            const data = await fetchFn(pageSize, append ? cursor : undefined);

            setItems(prev => {
                if (append) {
                    const seen = new Set(prev.map(item => item.id));
                    return [...prev, ...data.filter(item => !seen.has(item.id))];
                }
                return data;
            });

            if (data.length > 0) {
                setCursor(data[data.length - 1].cursor);
                setHasMore(data.length >= pageSize);
            } else {
                setHasMore(false);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [fetchFn, pageSize, cursor]);

    const loadMore = useCallback(() => load(true), [load]);
    const refresh = useCallback(() => {
        setCursor(undefined);
        setHasMore(true);
        load(false);
    }, [load]);

    useEffect(() => {
        if (autoLoad) {
            load();
        }
    }, [autoLoad, load]);

    return {
        items,
        loading,
        error,
        hasMore,
        loadMore,
        refresh
    };
}