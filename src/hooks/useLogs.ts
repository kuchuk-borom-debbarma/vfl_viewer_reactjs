import { useState, useEffect, useCallback } from 'react';
import { LogEntry, Block } from '../types';
import { getLogsByBlockId } from '../api/vfl';
import { CONFIG } from '../config/constants';

export const useLogs = (block: Block) => {
    const [allLogs, setAllLogs] = useState<LogEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [nextCursor, setNextCursor] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(true);

    // Referenced block states
    const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
    const [loadingReferenced, setLoadingReferenced] = useState<Set<string>>(new Set());
    const [referencedBlockData, setReferencedBlockData] = useState<Record<string, LogEntry[]>>({});
    const [referencedCursors, setReferencedCursors] = useState<Record<string, string | null>>({});
    const [loadingMoreReferenced, setLoadingMoreReferenced] = useState<Set<string>>(new Set());
    const [hasMoreReferenced, setHasMoreReferenced] = useState<Record<string, boolean>>({});

    const loadLogs = useCallback(async (append = false) => {
        const isInitial = !append;
        if (isInitial) setLoading(true); else setLoadingMore(true);
        setError(null);

        try {
            const response = await getLogsByBlockId(
                block.id,
                CONFIG.DEFAULT_PAGE_SIZE,
                append ? nextCursor : undefined
            );

            setAllLogs(prev => append ? [...prev, ...response.logs] : response.logs);
            setNextCursor(response.nextCursor);
            setHasMore(response.logs.length >= CONFIG.DEFAULT_PAGE_SIZE && !!response.nextCursor);

            if (isInitial) {
                // Initialize collapsed state for logs with referenced blocks
                const referencedBlocks = new Set<string>();
                response.logs.forEach(log => {
                    if (log.referencedBlock) referencedBlocks.add(log.id);
                });
                setCollapsed(referencedBlocks);
                setReferencedBlockData({});
                setReferencedCursors({});
                setHasMoreReferenced({});
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            if (isInitial) setLoading(false); else setLoadingMore(false);
        }
    }, [block.id, nextCursor]);

    const loadReferencedBlock = useCallback(async (log: LogEntry) => {
        if (!log.referencedBlock) return;

        if (referencedBlockData[log.id]) {
            toggleCollapse(log.id);
            return;
        }

        setLoadingReferenced(prev => new Set([...prev, log.id]));

        try {
            const response = await getLogsByBlockId(log.referencedBlock.id);
            setReferencedBlockData(prev => ({ ...prev, [log.id]: response.logs }));
            setReferencedCursors(prev => ({ ...prev, [log.id]: response.nextCursor }));
            setHasMoreReferenced(prev => ({
                ...prev,
                [log.id]: response.logs.length >= CONFIG.DEFAULT_PAGE_SIZE && !!response.nextCursor
            }));
            setCollapsed(prev => {
                const newSet = new Set(prev);
                newSet.delete(log.id);
                return newSet;
            });
        } catch (err: any) {
            setError(`Failed to load referenced block: ${err.message}`);
        } finally {
            setLoadingReferenced(prev => {
                const newSet = new Set(prev);
                newSet.delete(log.id);
                return newSet;
            });
        }
    }, [referencedBlockData]);

    // NEW: Load more referenced logs function
    const loadMoreReferencedLogs = useCallback(async (logId: string, referencedBlockId: string) => {
        const cursor = referencedCursors[logId];
        if (!cursor) return;

        setLoadingMoreReferenced(prev => new Set([...prev, logId]));

        try {
            const response = await getLogsByBlockId(referencedBlockId, CONFIG.DEFAULT_PAGE_SIZE, cursor);

            setReferencedBlockData(prev => ({
                ...prev,
                [logId]: [...(prev[logId] || []), ...response.logs]
            }));

            setReferencedCursors(prev => ({
                ...prev,
                [logId]: response.nextCursor
            }));

            setHasMoreReferenced(prev => ({
                ...prev,
                [logId]: response.logs.length >= CONFIG.DEFAULT_PAGE_SIZE && !!response.nextCursor
            }));
        } catch (err: any) {
            setError(`Failed to load more referenced logs: ${err.message}`);
        } finally {
            setLoadingMoreReferenced(prev => {
                const newSet = new Set(prev);
                newSet.delete(logId);
                return newSet;
            });
        }
    }, [referencedCursors]);

    const toggleCollapse = useCallback((logId: string) => {
        setCollapsed(prev => {
            const newCollapsed = new Set(prev);
            if (newCollapsed.has(logId)) newCollapsed.delete(logId);
            else newCollapsed.add(logId);
            return newCollapsed;
        });
    }, []);

    const expandAll = useCallback(() => setCollapsed(new Set()), []);

    const collapseAll = useCallback(() => {
        const allReferencedBlocks = new Set<string>();
        allLogs.forEach(log => {
            if (log.referencedBlock) allReferencedBlocks.add(log.id);
        });
        setCollapsed(allReferencedBlocks);
    }, [allLogs]);

    useEffect(() => { loadLogs(); }, [loadLogs]);

    return {
        allLogs,
        loading,
        loadingMore,
        error,
        hasMore,
        collapsed,
        loadingReferenced,
        referencedBlockData,
        loadingMoreReferenced,
        hasMoreReferenced,
        loadMore: () => loadLogs(true),
        loadReferencedBlock,
        toggleCollapse,
        expandAll,
        collapseAll,
        loadMoreReferencedLogs  // NEW: Added this function
    };
};
