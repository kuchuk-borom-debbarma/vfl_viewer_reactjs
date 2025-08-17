import React, { useState } from "react";
import { LogEntry, getLogsByBlockId } from "../api/vfl";
import LogItem from "./LogItem";

interface Props {
    logs: LogEntry[];
    blockId: string;
    maxDepth: number;
    maxChildren: number;
    onLoadMoreSiblings?: (cursor: string) => void;
    showLoadMoreSiblings?: boolean;
    loadingSiblings?: boolean;
    parentLog?: LogEntry | null;
    depth?: number;
}

export default function LogTree({
                                    logs,
                                    blockId,
                                    maxDepth,
                                    maxChildren,
                                    onLoadMoreSiblings,
                                    showLoadMoreSiblings = false,
                                    loadingSiblings = false,
                                    parentLog = null,
                                    depth = 0
                                }: Props) {
    return (
        <div className="log-tree" style={{
            marginLeft: depth > 0 ? 20 : 0,
            borderLeft: depth > 0 ? '2px solid var(--color-border)' : 'none',
            paddingLeft: depth > 0 ? 12 : 0
        }}>
            {logs.map((log, index) => (
                <LogNode
                    key={log.id}
                    log={log}
                    blockId={blockId}
                    maxDepth={maxDepth}
                    maxChildren={maxChildren}
                    depth={depth}
                />
            ))}

            {showLoadMoreSiblings && onLoadMoreSiblings && (
                <div className="load-more-container">
                    <button
                        className="btn btn-outline load-more-siblings"
                        onClick={() => {
                            const lastLog = logs[logs.length - 1];
                            if (lastLog) {
                                onLoadMoreSiblings(lastLog.siblingCursor);
                            }
                        }}
                        disabled={loadingSiblings}
                    >
                        {loadingSiblings ? "Loading siblings..." : "Load more siblings"}
                    </button>
                </div>
            )}
        </div>
    );
}

function LogNode({ log, blockId, maxDepth, maxChildren, depth }: {
    log: LogEntry;
    blockId: string;
    maxDepth: number;
    maxChildren: number;
    depth: number;
}) {
    const [children, setChildren] = useState<LogEntry[]>(log.children || []);
    const [showChildren, setShowChildren] = useState(log.children && log.children.length > 0);
    const [loadingChildren, setLoadingChildren] = useState(false);
    const [reachedEndChildren, setReachedEndChildren] = useState(false);
    const [nextChildrenCursor, setNextChildrenCursor] = useState<string | undefined>(
        log.childrenCursor || undefined
    );

    const hasInitialChildren = log.children && log.children.length > 0;
    const canLoadMoreChildren = !reachedEndChildren && nextChildrenCursor;

    async function loadMoreChildren() {
        if (!nextChildrenCursor || loadingChildren) return;

        setLoadingChildren(true);
        try {
            const res = await getLogsByBlockId(blockId, maxDepth, maxChildren, nextChildrenCursor);

            if (res.length === 0) {
                setReachedEndChildren(true);
                return;
            }

            // Merge new children with existing ones, deduplicate by id
            setChildren(prev => {
                const seen = new Set(prev.map(c => c.id));
                const newChildren = res.filter(c => !seen.has(c.id));
                return [...prev, ...newChildren].sort((a, b) => a.timestamp - b.timestamp);
            });

            // Update cursor for next pagination
            if (res.length > 0) {
                setNextChildrenCursor(res[res.length - 1].childrenCursor);
            }

            if (res.length < maxChildren) {
                setReachedEndChildren(true);
            }

            setShowChildren(true);
        } catch (error) {
            console.error("Failed to load children:", error);
        } finally {
            setLoadingChildren(false);
        }
    }

    function toggleChildren() {
        if (!hasInitialChildren && children.length === 0) {
            loadMoreChildren();
        } else {
            setShowChildren(!showChildren);
        }
    }

    return (
        <div className="log-node">
            <div className="log-node-header">
                <LogItem log={log} />

                {(hasInitialChildren || canLoadMoreChildren || children.length > 0) && (
                    <button
                        className="btn-toggle-children"
                        onClick={toggleChildren}
                        disabled={loadingChildren}
                    >
                        {loadingChildren ? "⏳" : showChildren ? "▼" : "▶"}
                    </button>
                )}
            </div>

            {showChildren && children.length > 0 && (
                <div className="log-children">
                    <LogTree
                        logs={children}
                        blockId={blockId}
                        maxDepth={maxDepth}
                        maxChildren={maxChildren}
                        depth={depth + 1}
                    />

                    {canLoadMoreChildren && (
                        <div className="load-more-container">
                            <button
                                className="btn btn-outline load-more-children"
                                onClick={loadMoreChildren}
                                disabled={loadingChildren}
                            >
                                {loadingChildren ? "Loading children..." : "Load more children"}
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}