import { useState, useEffect } from "react";
import { getRootBlocks, Block } from "../api/vfl";

export const useBlocks = () => {
    const [blocks, setBlocks] = useState<Block[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [nextCursor, setNextCursor] = useState<string>();
    const [reachedEnd, setReachedEnd] = useState(false);

    const fetchBlocks = async (cursor?: string, append = false) => {
        setLoading(true);
        setError(null);

        try {
            const data = await getRootBlocks(5, cursor);
            setBlocks(prev => {
                if (append) {
                    const seen = new Set(prev.map(b => b.id));
                    return [...prev, ...data.filter(b => !seen.has(b.id))];
                }
                return data;
            });

            if (data.length > 0) {
                setNextCursor(data[data.length - 1].cursor);
                setReachedEnd(data.length < 5);
            } else {
                setReachedEnd(true);
            }
        } catch (err: any) {
            setError(err.message || "Failed to load blocks");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchBlocks(); }, []);

    const loadMore = () => !reachedEnd && !loading && fetchBlocks(nextCursor, true);

    return { blocks, loading, error, reachedEnd, loadMore };
};