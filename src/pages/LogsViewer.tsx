import React, { useEffect, useRef, useState } from "react";
import { Button, LoadingState } from "../components/UI";
import BlockSidebar from "../components/BlockSidebar";
import ControlsBar from "../components/ControlsBar";
import { LogCard } from "../components/LogCard";
import { Block, LogEntry } from "../types";
import { getLogsByBlockId } from "../api/vfl";
import { CONFIG } from "../config/config";

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

    // NEW: State to track if more data is available
    const [hasMoreMainLogs, setHasMoreMainLogs] = useState(true);
    const [hasMoreReferencedLogs, setHasMoreReferencedLogs] = useState<Record<string, boolean>>({});

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

            // Check if we got fewer logs than requested (meaning we've reached the end)
            setHasMoreMainLogs(response.logs.length >= CONFIG.DEFAULT_PAGE_SIZE && !!response.nextCursor);

            initializeCollapsedState(response.logs);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const loadMoreLogs = async () => {
        if (!nextCursor || loadingMore || !hasMoreMainLogs) return;

        setLoadingMore(true);
        try {
            const response = await getLogsByBlockId(block.id, undefined, nextCursor);
            setAllLogs(prev => [...prev, ...response.logs]);
            setNextCursor(response.nextCursor);

            // Update hasMore based on returned count and cursor
            setHasMoreMainLogs(response.logs.length >= CONFIG.DEFAULT_PAGE_SIZE && !!response.nextCursor);

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoadingMore(false);
        }
    };

    const initializeCollapsedState = (logs: LogEntry[]) => {
        const referencedBlocks = new Set<string>();
        logs.forEach(log => {
            if (log.referencedBlock) {
                referencedBlocks.add(log.id);
            }
        });
        setCollapsed(referencedBlocks);
        // Clear any stale referenced block data
        setReferencedBlockData({});
        setReferencedBlockCursors({});
        setHasMoreReferencedLogs({});
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

            // Track if this referenced block has more data
            setHasMoreReferencedLogs(prev => ({
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
            setLoadingReferencedBlocks(prev => {
                const newSet = new Set(prev);
                newSet.delete(log.id);
                return newSet;
            });
        }
    };

    const loadMoreReferencedLogs = async (logId: string, referencedBlockId: string) => {
        const cursor = referencedBlockCursors[logId];
        if (!cursor || !hasMoreReferencedLogs[logId]) return;

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

            // Update hasMore for this referenced block
            setHasMoreReferencedLogs(prev => ({
                ...prev,
                [logId]: response.logs.length >= CONFIG.DEFAULT_PAGE_SIZE && !!response.nextCursor
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

    // Enhanced Load More Button Component
    const LoadMoreButton = ({
                                onClick,
                                loading,
                                hasMore,
                                label = "Load More Logs",
                                context = "main",
                                blockName,
                                isNested = false
                            }: {
        onClick: () => void;
        loading: boolean;
        hasMore: boolean;
        label?: string;
        context?: "main" | "referenced";
        blockName?: string;
        isNested?: boolean;
    }) => {
        if (!hasMore) return null;

        return (
            <div style={{
                display: 'flex',
                justifyContent: isNested ? 'flex-start' : 'center',
                margin: isNested ? '8px 0 4px 0' : 'calc(var(--space) * 2) 0',
                pointerEvents: 'auto'
            }}>
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onClick();
                    }}
                    disabled={loading}
                    style={{
                        background: context === "referenced" ? '#f0f9ff' : 'var(--primary)',
                        color: context === "referenced" ? 'var(--primary)' : 'white',
                        border: context === "referenced" ? '1px solid var(--primary)' : 'none',
                        borderRadius: '6px',
                        padding: isNested ? '4px 8px' : '8px 16px',
                        fontSize: isNested ? '11px' : '13px',
                        fontWeight: '500',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        opacity: loading ? 0.7 : 1,
                        transition: 'all 0.2s ease',
                        pointerEvents: loading ? 'none' : 'auto',
                        zIndex: 1000,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                    }}
                    title={blockName ? `Load more logs for ${blockName}` : label}
                >
                    {loading ? (
                        <>
                            <span style={{ fontSize: '10px' }}>⏳</span>
                            <span>Loading...</span>
                        </>
                    ) : (
                        <>
                            <span style={{ fontSize: '10px' }}>
                                {context === "referenced" ? '📋' : '📥'}
                            </span>
                            <span>{isNested ? 'More' : 'Load More'}</span>
                        </>
                    )}
                </button>
            </div>
        );
    };

    // CORRECTED renderLogStructure - follows design philosophy exactly
    const renderLogStructure = (logs: LogEntry[], depth = 0, keyPrefix = "root", parentTimestamp?: number): JSX.Element[] => {
        if (!logs || logs.length === 0) return [];

        const result: JSX.Element[] = [];

        // Function to process a single log and all its sequential children
        const processLog = (log: LogEntry, index: number) => {
            const isCollapsed = collapsed.has(log.id);
            const isLoadingReferenced = loadingReferencedBlocks.has(log.id);
            const hasReferencedBlock = !!log.referencedBlock;
            const hasChildren = log.children && log.children.length > 0;

            const currentParentTimestamp = index > 0 ? logs[index - 1].timestamp : parentTimestamp;

            // 1. Always render the main log card
            result.push(
                <div key={`${keyPrefix}-${log.id}-${index}`} style={{
                    position: 'relative',
                    pointerEvents: 'auto'
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

            // 2. If has referenced block and expanded, show referenced content (NESTED - ONLY CASE FOR NESTING)
            if (hasReferencedBlock && !isCollapsed && referencedBlockData[log.id]) {
                const referencedTree = buildTree(referencedBlockData[log.id]);
                result.push(
                    <div key={`${keyPrefix}-ref-${log.id}`} style={{
                        marginLeft: '30px',
                        marginTop: 'var(--space)',
                        paddingLeft: '15px',
                        borderLeft: '2px solid var(--primary)',
                        opacity: 0.95,
                        pointerEvents: 'auto',
                        background: 'rgba(37, 99, 235, 0.02)',
                        borderRadius: '0 8px 8px 0',
                        position: 'relative'
                    }}>
                        <div style={{
                            position: 'absolute',
                            top: '-1px',
                            left: '-2px',
                            background: 'var(--primary)',
                            color: 'white',
                            padding: '2px 8px',
                            borderRadius: '0 4px 4px 0',
                            fontSize: '10px',
                            fontWeight: '600',
                            letterSpacing: '0.5px'
                        }}>
                            🔗 {log.referencedBlock!.name}
                        </div>

                        <div style={{ paddingTop: '20px' }}>
                            {renderLogStructure(referencedTree, depth + 1, `${keyPrefix}-ref-${log.id}`, log.timestamp)}
                        </div>

                        <LoadMoreButton
                            onClick={() => loadMoreReferencedLogs(log.id, log.referencedBlock!.id)}
                            loading={loadingMoreReferenced.has(log.id)}
                            hasMore={hasMoreReferencedLogs[log.id] !== false}
                            label="Load More Referenced Logs"
                            context="referenced"
                            blockName={log.referencedBlock!.name}
                            isNested={true}
                        />
                    </div>
                );
            }

            // 3. Handle children - CRITICAL: Children continue at same level (no nesting)
            if (hasChildren) {
                if (log.children!.length === 1) {
                    // Single child: Continue sequential flow at same level
                    result.push(
                        <div key={`connector-${log.id}`} style={{
                            width: '2px',
                            height: '8px',
                            background: 'var(--border)',
                            margin: '4px 0 4px 12px',
                            borderRadius: '1px'
                        }}/>
                    );
                    processLog(log.children![0], 0); // Process child at same level
                } else {
                    // Multiple children: Show as parallel operations
                    result.push(
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
                }
            }
        };

        // Handle root level logs - if multiple with same parent, show as siblings
        if (logs.length > 1) {
            // Multiple logs at same level = siblings (parallel operations)
            result.push(
                <div key={`${keyPrefix}-siblings`} style={{
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
                        👥 Sibling Operations ({logs.length})
                        <div style={{
                            flex: 1,
                            height: '1px',
                            background: 'var(--border)',
                            marginLeft: 'var(--space)'
                        }}/>
                    </div>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: `repeat(${Math.min(logs.length, 3)}, 1fr)`,
                        gap: 'calc(var(--space) * 2)',
                        minHeight: '100px'
                    }}>
                        {logs.map((log, idx) => (
                            <div key={log.id} style={{
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
                                    background: '#ec4899',
                                    color: 'white',
                                    padding: '2px 8px',
                                    borderRadius: '4px',
                                    fontSize: '10px',
                                    fontWeight: '600'
                                }}>
                                    SIBLING {idx + 1}
                                </div>
                                <div style={{ marginTop: 'var(--space)' }}>
                                    {renderLogStructure([log], depth, `${keyPrefix}-sibling-${idx}`, parentTimestamp)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            );
        } else {
            // Single log - process normally with its children
            logs.forEach((log, index) => processLog(log, index));
        }

        return result;
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if (e.button !== 0) return;
        const target = e.target as HTMLElement;

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

                        <LoadMoreButton
                            onClick={loadMoreLogs}
                            loading={loadingMore}
                            hasMore={hasMoreMainLogs}
                            label="Load More Main Logs"
                            context="main"
                            blockName={block.name}
                            isNested={false}
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
                        <span>📋 Referenced Block Logs</span>
                        <span>📥 Main Block Logs</span>
                        <span>👥 Sibling Operations</span>
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
