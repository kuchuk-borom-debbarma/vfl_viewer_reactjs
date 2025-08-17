import React, { useEffect, useState } from "react";
import { getLogsByBlockId, LogEntry } from "../api/vfl";
import LogTree from "../components/LogTree";

export default function LogsPage({
                                     blockId,
                                     goBack,
                                 }: {
    blockId: string;
    goBack: () => void;
}) {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingSiblings, setLoadingSiblings] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [reachedEnd, setReachedEnd] = useState(false);

    const maxDepth = 3;
    const maxChildren = 5;

    async function fetchRootLogs(cursor?: string, append = false) {
        const targetLoading = cursor ? setLoadingSiblings : setLoading;
        targetLoading(true);
        setError(null);

        try {
            const res = await getLogsByBlockId(blockId, maxDepth, maxChildren, cursor);

            setLogs(prev => {
                if (append) {
                    // Merge and deduplicate
                    const seen = new Set(prev.map(l => l.id));
                    const newLogs = res.filter(l => !seen.has(l.id));
                    return [...prev, ...newLogs].sort((a, b) => a.timestamp - b.timestamp);
                }
                return res;
            });

            if (res.length < maxChildren) {
                setReachedEnd(true);
            }
        } catch (err: any) {
            setError(err.message || "Failed to load logs");
        } finally {
            targetLoading(false);
        }
    }

    async function handleLoadMoreSiblings(cursor: string) {
        await fetchRootLogs(cursor, true);
    }

    useEffect(() => {
        fetchRootLogs();
    }, [blockId]);

    return (
        <div className="logs-page">
            <div className="logs-header">
                <button className="btn btn-outline" onClick={goBack}>
                    ← Back to Operations
                </button>
                <h2 className="logs-title">Logs for Block {blockId}</h2>
            </div>

            <div className="logs-container">
                {loading && logs.length === 0 && (
                    <div className="logs-loading">
                        <div className="loading-spinner"></div>
                        <span>Loading logs...</span>
                    </div>
                )}

                {error && (
                    <div className="logs-error">
                        <span>⚠️ {error}</span>
                        <button className="btn btn-outline" onClick={() => fetchRootLogs()}>
                            Retry
                        </button>
                    </div>
                )}

                {logs.length === 0 && !loading && !error && (
                    <div className="logs-empty">
                        <span>📝 No logs found for this block</span>
                    </div>
                )}

                {logs.length > 0 && (
                    <LogTree
                        logs={logs}
                        blockId={blockId}
                        maxDepth={maxDepth}
                        maxChildren={maxChildren}
                        onLoadMoreSiblings={handleLoadMoreSiblings}
                        showLoadMoreSiblings={!reachedEnd}
                        loadingSiblings={loadingSiblings}
                    />
                )}
            </div>
        </div>
    );
}