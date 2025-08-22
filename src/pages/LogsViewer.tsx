import React, { useEffect, useRef, useState } from "react";
import { Button, LoadingState } from "../components/UI";
import BlockSidebar from "../components/BlockSidebar";
import ControlsBar from "../components/ControlsBar";
import { LogCard } from "../components/LogCard";
import { Block, LogEntry } from "../types";
import { getLogsByBlockId } from "../api/vfl";

export default function LogsViewer({
                                       block,
                                       goBack,
                                       onNavigateToBlock
                                   }: {
    block: Block;
    goBack: () => void;
    onNavigateToBlock?: (block: Block) => void;
}) {
    const [allLogs, setAllLogs] = useState<LogEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [nextCursor, setNextCursor] = useState<string | null>(null);
    const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
    const [loadingReferencedBlocks, setLoadingReferencedBlocks] = useState<Set<string>>(new Set());
    const [referencedBlockData, setReferencedBlockData] = useState<Record<string, LogEntry[]>>({});

    // New state for contextual load more functionality
    const [referencedBlockCursors, setReferencedBlockCursors] = useState<Record<string, string | null>>({});
    const [loadingMoreReferenced, setLoadingMoreReferenced] = useState<Set<string>>(new Set());

    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [inputMode, setInputMode] = useState<"mouse" | "trackpad">("mouse");
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const canvasRef = useRef<HTMLDivElement>(null);

    // Build tree structure from flat logs
    const buildTree = (logs: LogEntry[]): LogEntry[] => {
        // Sort logs by timestamp, then by ID
        const sortedLogs = [...logs].sort((a, b) => {
            if (a.timestamp !== b.timestamp) return a.timestamp - b.timestamp;
            return a.id.localeCompare(b.id);
        });

        // Create parent-child map
        const childrenMap = new Map<string, LogEntry[]>();
        const rootLogs: LogEntry[] = [];

        sortedLogs.forEach(log => {
            if (log.parentLogId === null) {
                rootLogs.push(log);
            } else {
                if (!childrenMap.has(log.parentLogId)) {
                    childrenMap.set(log.parentLogId, []);
                }
                childrenMap.get(log.parentLogId)!.push(log);
            }
        });

        // Recursively attach children
        const attachChildren = (log: LogEntry): LogEntry => {
            const children = childrenMap.get(log.id) || [];
            return {
                ...log,
                children: children.map(attachChildren)
            };
        };

        return rootLogs.map(attachChildren);
    };

    useEffect(() => {
        loadLogs();
    }, [block.id]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const handleWheel = (e: WheelEvent) => {
            e.preventDefault();
            e.stopPropagation();

            if (inputMode === "mouse") {
                if (e.ctrlKey || e.metaKey) {
                    const delta = e.deltaY > 0 ? -0.1 : 0.1;
                    setZoom(prev => Math.min(Math.max(prev + delta, 0.1), 3));
                } else {
                    setPan(prev => ({ ...prev, y: prev.y - e.deltaY }));
                }
            } else if (inputMode === "trackpad") {
                if (e.ctrlKey || e.metaKey) {
                    const delta = e.deltaY > 0 ? -0.04 : 0.04;
                    setZoom(prev => Math.min(Math.max(prev + delta, 0.1), 3));
                } else {
                    setPan(prev => ({
                        x: prev.x - e.deltaX,
                        y: prev.y - e.deltaY
                    }));
                }
            }
        };

        canvas.addEventListener('wheel', handleWheel, { passive: false });
        return () => canvas.removeEventListener('wheel', handleWheel);
    }, [inputMode]);

    const loadLogs = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await getLogsByBlockId(block.id);
            setAllLogs(response.logs);
            setNextCursor(response.nextCursor);
            initializeCollapsedState(response.logs);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const loadMoreLogs = async () => {
        if (!nextCursor || loadingMore) return;

        setLoadingMore(true);
        try {
            const response = await getLogsByBlockId(block.id, undefined, nextCursor);
            setAllLogs(prev => [...prev, ...response.logs]);
            setNextCursor(response.nextCursor);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoadingMore(false);
        }
    };

    const initializeCollapsedState = (logs: LogEntry[]) => {
        const referencedBlocks = new Set<string>();
        logs.forEach(log => {
            if (log.referencedBlock) referencedBlocks.add(log.id);
        });
        setCollapsed(referencedBlocks);
    };

    const toggleCollapse = (logId: string) => {
        setCollapsed(prev => {
            const newCollapsed = new Set(prev);
            if (newCollapsed.has(logId)) newCollapsed.delete(logId);
            else newCollapsed.add(logId);
            return newCollapsed;
        });
    };

    const handleExpandReferencedBlock = async (log: LogEntry) => {
        if (!log.referencedBlock) return;

        if (referencedBlockData[log.id]) {
            toggleCollapse(log.id);
            return;
        }

        setLoadingReferencedBlocks(prev => new Set([...prev, log.id]));

        try {
            const response = await getLogsByBlockId(log.referencedBlock.id);
            setReferencedBlockData(prev => ({
                ...prev,
                [log.id]: response.logs
            }));

            // Track the cursor for this referenced block
            setReferencedBlockCursors(prev => ({
                ...prev,
                [log.id]: response.nextCursor
            }));

            setCollapsed(prev => {
                const newSet = new Set(prev);
                newSet.delete(log.id);
                return newSet;
            });

        } catch (err: any) {
            setError(`Failed to load referenced block: ${err.message}`);
        } finally {
            setLoadingReferencedBlocks(prev => {
                const newSet = new Set(prev);
                newSet.delete(log.id);
                return newSet;
            });
        }
    };

    const loadMoreReferencedLogs = async (logId: string, referencedBlockId: string) => {
        const cursor = referencedBlockCursors[logId];
        if (!cursor) return;

        setLoadingMoreReferenced(prev => new Set([...prev, logId]));

        try {
            const response = await getLogsByBlockId(referencedBlockId, undefined, cursor);

            setReferencedBlockData(prev => ({
                ...prev,
                [logId]: [...(prev[logId] || []), ...response.logs]
            }));

            setReferencedBlockCursors(prev => ({
                ...prev,
                [logId]: response.nextCursor
            }));

        } catch (err: any) {
            setError(`Failed to load more logs: ${err.message}`);
        } finally {
            setLoadingMoreReferenced(prev => {
                const newSet = new Set(prev);
                newSet.delete(logId);
                return newSet;
            });
        }
    };

    // Load More Button Component
    const LoadMoreButton = ({
                                onClick,
                                loading,
                                hasMore,
                                label = "Load More Logs"
                            }: {
        onClick: () => void;
        loading: boolean;
        hasMore: boolean;
        label?: string;
    }) => {
        if (!hasMore) return null;

        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                margin: 'calc(var(--space) * 2) 0',
                pointerEvents: 'auto' // Ensure button can be clicked
            }}>
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onClick();
                    }}
                    disabled={loading}
                    style={{
                        background: 'var(--primary)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '8px 16px',
                        fontSize: '13px',
                        fontWeight: '600',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        opacity: loading ? 0.7 : 1,
                        transition: 'all 0.2s ease',
                        pointerEvents: loading ? 'none' : 'auto',
                        zIndex: 1000 // Ensure button is above canvas
                    }}
                >
                    {loading ? '⏳ Loading...' : `📥 ${label}`}
                </button>
            </div>
        );
    };

    const renderLogStructure = (logs: LogEntry[], depth = 0, keyPrefix = "root", parentTimestamp?: number, contextLogId?: string): JSX.Element[] => {
        if (!logs || logs.length === 0) return [];

        const elements = logs.flatMap((log, index) => {
            const isCollapsed = collapsed.has(log.id);
            const isLoadingReferenced = loadingReferencedBlocks.has(log.id);
            const hasReferencedBlock = !!log.referencedBlock;
            const hasChildren = log.children && log.children.length > 0;
            const isParallel = hasChildren && log.children.length > 1;
            const isSequential = hasChildren && log.children.length === 1;

            const currentParentTimestamp = index > 0 ? logs[index - 1].timestamp : parentTimestamp;
            const logElements: JSX.Element[] = [];

            // 1. Always render the main log card
            logElements.push(
                <div key={`${keyPrefix}-${log.id}-${index}`} style={{
                    position: 'relative',
                    pointerEvents: 'auto' // Ensure log cards can be clicked
                }}>
                    <LogCard
                        log={log}
                        collapsed={isCollapsed}
                        loadingReferenced={isLoadingReferenced}
                        onToggleExpand={() => hasReferencedBlock && handleExpandReferencedBlock(log)}
                        onNavigateToBlock={onNavigateToBlock}
                        parentTimestamp={currentParentTimestamp}
                    />
                </div>
            );

            // 2. If has referenced block and expanded, show referenced content (NESTED)
            if (hasReferencedBlock && !isCollapsed && referencedBlockData[log.id]) {
                const referencedTree = buildTree(referencedBlockData[log.id]);
                logElements.push(
                    <div key={`${keyPrefix}-ref-${log.id}`} style={{
                        marginLeft: '30px',
                        marginTop: 'var(--space)',
                        paddingLeft: '15px',
                        borderLeft: '2px solid var(--primary)',
                        opacity: 0.9,
                        pointerEvents: 'auto'
                    }}>
                        {renderLogStructure(referencedTree, depth + 1, `${keyPrefix}-ref-${log.id}`, log.timestamp, log.id)}

                        {/* Load more button for this referenced block */}
                        <LoadMoreButton
                            onClick={() => loadMoreReferencedLogs(log.id, log.referencedBlock!.id)}
                            loading={loadingMoreReferenced.has(log.id)}
                            hasMore={!!referencedBlockCursors[log.id]}
                            label="Load More Referenced Logs"
                        />
                    </div>
                );
            }

            // 3. Handle original children (SEQUENTIAL/PARALLEL)
            if (isParallel) {
                logElements.push(
                    <div key={`${keyPrefix}-par-${log.id}`} style={{
                        marginTop: '16px',
                        marginBottom: '16px',
                        pointerEvents: 'auto'
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            marginBottom: '12px',
                            color: 'var(--text-light)',
                            fontSize: '12px',
                            fontWeight: '500'
                        }}>
                            <div style={{
                                width: '20px',
                                height: '1px',
                                background: 'var(--border)',
                                marginRight: 'var(--space)'
                            }}/>
                            ⚡ Parallel Execution
                            <div style={{
                                flex: 1,
                                height: '1px',
                                background: 'var(--border)',
                                marginLeft: 'var(--space)'
                            }}/>
                        </div>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: `repeat(${log.children!.length}, 1fr)`,
                            gap: 'calc(var(--space) * 2)',
                            minHeight: '100px'
                        }}>
                            {log.children!.map((parallelLog, idx) => (
                                <div key={parallelLog.id} style={{
                                    padding: 'var(--space)',
                                    background: 'var(--bg)',
                                    border: '1px solid var(--border)',
                                    borderRadius: '8px',
                                    position: 'relative',
                                    pointerEvents: 'auto'
                                }}>
                                    <div style={{
                                        position: 'absolute',
                                        top: '-8px',
                                        left: 'var(--space)',
                                        background: '#f59e0b',
                                        color: 'white',
                                        padding: '2px 8px',
                                        borderRadius: '4px',
                                        fontSize: '10px',
                                        fontWeight: '600'
                                    }}>
                                        PARALLEL {idx + 1}
                                    </div>
                                    <div style={{ marginTop: 'var(--space)' }}>
                                        {renderLogStructure([parallelLog], depth, `${keyPrefix}-par-${log.id}-${idx}`, log.timestamp)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            } else if (isSequential) {
                logElements.push(
                    <div key={`connector-${log.id}`} style={{
                        width: '2px',
                        height: '8px',
                        background: 'var(--border)',
                        margin: '4px 0 4px 12px',
                        borderRadius: '1px'
                    }}/>
                );
                logElements.push(...renderLogStructure(log.children!, depth, keyPrefix, log.timestamp));
            }

            return logElements;
        });

        return elements;
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        // Only start dragging if clicking on the canvas background, not on interactive elements
        if (e.button !== 0) return;
        const target = e.target as HTMLElement;

        // Don't start dragging if clicking on buttons, cards, or other interactive elements
        if (target.closest('button') || target.closest('.card') || target.closest('[data-interactive]')) {
            return;
        }

        e.stopPropagation();
        setIsDragging(true);
        setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging) {
            e.stopPropagation();
            setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
        }
    };

    const handleMouseUp = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsDragging(false);
    };

    const resetView = () => {
        setZoom(1);
        setPan({ x: 0, y: 0 });
    };

    const zoomIn = () => setZoom(prev => Math.min(prev + 0.2, 3));
    const zoomOut = () => setZoom(prev => Math.max(prev - 0.2, 0.1));

    const expandAll = () => setCollapsed(new Set());
    const collapseAll = () => {
        const allReferencedBlocks = new Set<string>();
        allLogs.forEach(log => {
            if (log.referencedBlock) allReferencedBlocks.add(log.id);
        });
        setCollapsed(allReferencedBlocks);
    };

    if (loading) {
        return (
            <div style={{
                minHeight: '100vh',
                background: 'linear-gradient(to bottom right, var(--bg), #f3f4f6, var(--surface))',
                paddingTop: 'calc(var(--space) * 6)'
            }}>
                <div className="container">
                    <Button variant="outline" className="mb" onClick={goBack}>← Back</Button>
                    <h2 className="section-title">Loading logs for {block.name}</h2>
                    <LoadingState message="Loading execution logs..."/>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{
                minHeight: '100vh',
                background: 'linear-gradient(to bottom right, var(--bg), #f3f4f6, var(--surface))',
                paddingTop: 'calc(var(--space) * 6)'
            }}>
                <div className="container">
                    <Button variant="outline" className="mb" onClick={goBack}>← Back</Button>
                    <h2 className="section-title">Execution Logs</h2>
                    <div className="text-center error">{error}</div>
                </div>
            </div>
        );
    }

    const treeStructure = buildTree(allLogs);

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(to bottom right, var(--bg), #f3f4f6, var(--surface))',
            display: 'flex',
            flexDirection: 'column'
        }}>
            <BlockSidebar
                block={block}
                isOpen={sidebarOpen}
                onToggle={() => setSidebarOpen(!sidebarOpen)}
            />

            <div className="container"
                 style={{
                     paddingTop: 'calc(var(--space) * 3)',
                     paddingBottom: 'calc(var(--space) * 2)',
                     marginLeft: sidebarOpen ? '300px' : '0',
                     transition: 'margin-left 0.3s ease'
                 }}
            >
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 'var(--space)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Button variant="outline" onClick={goBack}>← Back</Button>
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            style={{
                                marginLeft: 8,
                                zIndex: 1010,
                                width: '40px',
                                height: '40px',
                                borderRadius: '8px',
                                border: '1px solid var(--border)',
                                background: 'var(--surface)',
                                color: 'var(--primary)',
                                fontSize: '18px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                transition: 'all 0.3s ease'
                            }}
                            title={sidebarOpen ? "Hide block info" : "Show block info"}
                        >
                            {sidebarOpen ? '◀' : 'ℹ️'}
                        </button>
                        <h2 style={{
                            fontSize: '24px',
                            fontWeight: '600',
                            margin: 'calc(var(--space) * 2) 0 var(--space)',
                            color: 'var(--text)'
                        }}>
                            Execution Flow: <span className="highlight">{block.name}</span>
                        </h2>
                    </div>
                    <ControlsBar
                        zoom={zoom}
                        onZoomIn={zoomIn}
                        onZoomOut={zoomOut}
                        onResetView={resetView}
                        onExpandAll={expandAll}
                        onCollapseAll={collapseAll}
                        inputMode={inputMode}
                        onInputModeChange={setInputMode}
                    />
                </div>
            </div>

            <div
                ref={canvasRef}
                style={{
                    flex: 1,
                    overflow: 'hidden',
                    cursor: isDragging ? 'grabbing' : 'grab',
                    position: 'relative',
                    marginLeft: sidebarOpen ? '300px' : '0',
                    transition: 'margin-left 0.3s ease',
                    pointerEvents: 'auto'
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                <div
                    style={{
                        transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                        transformOrigin: '0 0',
                        padding: 'calc(var(--space) * 4)',
                        minHeight: '100%',
                        pointerEvents: 'auto'
                    }}
                >
                    <div className="container">
                        {treeStructure.length === 0
                            ? <div className="text-center muted">No logs found for this block.</div>
                            : renderLogStructure(treeStructure)
                        }

                        {/* Main block load more button */}
                        <LoadMoreButton
                            onClick={loadMoreLogs}
                            loading={loadingMore}
                            hasMore={!!nextCursor}
                            label="Load More Main Logs"
                        />
                    </div>
                </div>
            </div>

            <div style={{
                borderTop: '1px solid var(--border)',
                padding: 'var(--space) 0',
                background: 'var(--surface)',
                fontSize: '12px',
                color: 'var(--text-light)',
                marginLeft: sidebarOpen ? '300px' : '0',
                transition: 'margin-left 0.3s ease'
            }}>
                <div className="container" style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 'var(--space)'
                }}>
                    <div style={{ display: 'flex', gap: 'calc(var(--space) * 3)' }}>
                        <span>🔗 Referenced Block</span>
                        <span>⚡ Parallel Execution</span>
                        <span>⬇️ Sequential Flow</span>
                    </div>
                    <div>
                        Ctrl/Cmd + scroll to zoom • Drag to pan • Click cards to expand or navigate
                    </div>
                </div>
            </div>
        </div>
    );
}
