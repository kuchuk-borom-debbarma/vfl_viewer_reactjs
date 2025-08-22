import { useState, useEffect, useCallback } from "react";
import { Block } from "../types";
import { getRootBlocks } from "../api/vfl";
import { CONFIG } from "../config/constants";

export const useBlocks = (cursor?: string) => {
    const [items, setItems] = useState<Block[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(false);
    const [nextCursor, setNextCursor] = useState<string | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const data = await getRootBlocks(CONFIG.DEFAULT_PAGE_SIZE, cursor);
            setItems(data);

            if (data.length > 0) {
                setNextCursor(data[data.length - 1].cursor);
                setHasMore(data.length >= CONFIG.DEFAULT_PAGE_SIZE);
            } else {
                setNextCursor(null);
                setHasMore(false);
            }
        } catch (err: any) {
            setError(err.message);
            setItems([]);
            setHasMore(false);
            setNextCursor(null);
        } finally {
            setLoading(false);
        }
    }, [cursor]);

    useEffect(() => {
        load();
    }, [load]);

    return {
        items,
        loading,
        error,
        hasMore,
        nextCursor
    };
};
