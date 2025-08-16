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
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchRootLogs() {
            setLoading(true);
            setError(null);
            try {
                const res = await getLogsByBlockId(blockId, 2, 5); // default load
                setLogs(res);
            } catch (err: any) {
                setError(err.message || "Failed to load logs");
            } finally {
                setLoading(false);
            }
        }
        fetchRootLogs();
    }, [blockId]);

    return (
        <div className="container section-padding">
            <button className="btn btn-outline mb-lg" onClick={goBack}>
                ← Back
            </button>
            <h2 className="section-title">Logs for Block {blockId}</h2>

            {loading && logs.length === 0 && (
                <div className="muted text-center">Loading logs...</div>
            )}
            {error && <div className="error text-center">{error}</div>}
            {logs.length === 0 && !loading ? (
                <div className="muted text-center">No logs found.</div>
            ) : (
                <div className="logs-list">
                    {logs.map(log => (
                        <LogTree
                            key={log.id}
                            log={log}
                            blockId={blockId}
                            maxDepth={2}
                            maxChildren={2}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
