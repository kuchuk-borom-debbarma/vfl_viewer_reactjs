import { useState, useEffect } from "react";

export function usePagination<T extends { cursor: string; id: string }>(
    fetchFn: (limit: number, cursor?: string) => Promise<T[]>
) {
    const [items, setItems] = useState<T[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [cursor, setCursor] = useState<string>();

    const load = async (append = false) => {
        setLoading(true);
        setError(null);

        try {
            const data = await fetchFn(5, append ? cursor : undefined);

            setItems(prev => {
                if (append) {
                    const seen = new Set(prev.map(item => item.id));
                    return [...prev, ...data.filter(item => !seen.has(item.id))];
                }
                return data;
            });

            if (data.length > 0) {
                setCursor(data[data.length - 1].cursor);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    return { items, loading, error, loadMore: () => load(true) };
}