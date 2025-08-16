import React, { useState } from "react";
import { LogEntry, getLogsByBlockId } from "../api/vfl";
import LogItem from "./LogItem";

interface Props {
    log: LogEntry;
    blockId: string;
    maxDepth: number;
    maxChildren: number;
}

export default function LogTree({ log, blockId, maxDepth, maxChildren }: Props) {
    const [children, setChildren] = useState<LogEntry[]>(log.children || []);
    const [loading, setLoading] = useState(false);
    const [reachedEnd, setReachedEnd] = useState(children.length === 0);

    // Derive latest cursor from current children (last child)
    const childCursor = children.length > 0 ? children[children.length - 1].cursor : undefined;

    function mergeChildren(existing: LogEntry[], incoming: LogEntry[]) {
        const seen = new Set(existing.map(c => c.id));
        const deduped = incoming.filter(c => !seen.has(c.id));
        return [...existing, ...deduped].sort((a, b) => a.timestamp - b.timestamp);
    }

    async function loadMore() {
        if (loading || reachedEnd) return;
        setLoading(true);
        try {
            const res = await getLogsByBlockId(blockId, maxDepth, maxChildren, childCursor);

            if (res.length === 0) {
                setReachedEnd(true);
                return;
            }

            setChildren(prev => mergeChildren(prev, res));
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="log-tree">
            <LogItem log={log} />
            <div className="log-children" style={{ marginLeft: 20, marginTop: 6 }}>
                {children.map(child => (
                    <LogTree
                        key={child.id}
                        log={child}
                        blockId={blockId}
                        maxDepth={maxDepth}
                        maxChildren={maxChildren}
                    />
                ))}
                {!reachedEnd && (
                    <button className="btn btn-outline" onClick={loadMore} disabled={loading}>
                        {loading ? "Loading..." : "Load More"}
                    </button>
                )}
            </div>
        </div>
    );
}
