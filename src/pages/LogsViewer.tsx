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

    const [referencedBlockCursors, setReferencedBlockCursors] = useState<Record<string, string | null>>({});
    const [loadingMoreReferenced, setLoadingMoreReferenced] = useState<Set<string>>(new Set());
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
        const sortedLogs = [...logs].sort((a, b) => {
            if (a.timestamp !== b.timestamp) return a.timestamp - b.timestamp;
            return a.id.localeCompare(b.id);
        });

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
            setReferencedBlockData(prev => ({ ...prev, [log.id]: response.logs }));
            setReferencedBlockCursors(prev => ({ ...prev, [log.id]: response.nextCursor }));
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
            setReferencedBlockCursors(prev => ({ ...prev, [logId]: response.nextCursor }));
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

    // CLEAN LAYOUT APPROACH - Using proper CSS layout
    const renderLogStructure = (logs: LogEntry[], depth = 0, keyPrefix = "root", parentTimestamp?: number): JSX.Element[] => {
        if (!logs || logs.length === 0) return [];

        const result: JSX.Element[] = [];

        // Process each log with proper sequential/parallel handling
        const processLog = (log: LogEntry, index: number) => {
            const isCollapsed = collapsed.has(log.id);
            const isLoadingReferenced = loadingReferencedBlocks.has(log.id);
            const hasReferencedBlock = !!log.referencedBlock;
            const hasChildren = log.children && log.children.length > 0;

            const currentParentTimestamp = index > 0 ? logs[index - 1].timestamp : parentTimestamp;

            // 1. Main log card
            result.push(
                <div key={`${keyPrefix}-${log.id}-${index}`} style={{ marginBottom: '8px' }}>
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

            // 2. Referenced block content (NESTED - ONLY nesting case)
            if (hasReferencedBlock && !isCollapsed && referencedBlockData[log.id]) {
                const referencedTree = buildTree(referencedBlockData[log.id]);
                result.push(
                    <div key={`${keyPrefix}-ref-${log.id}`} style={{
                        marginLeft: '40px',
                        marginTop: '8px',
                        marginBottom: '16px',
                        paddingLeft: '20px',
                        borderLeft: '3px solid var(--primary)',
                        background: 'rgba(37, 99, 235, 0.02)',
                        borderRadius: '0 8px 8px 0',
                        position: 'relative',
                        padding: '16px'
                    }}>
                        <div style={{
                            position: 'absolute',
                            top: '-1px',
                            left: '-3px',
                            background: 'var(--primary)',
                            color: 'white',
                            padding: '4px 12px',
                            borderRadius: '0 6px 6px 0',
                            fontSize: '11px',
                            fontWeight: '600',
                            letterSpacing: '0.5px'
                        }}>
                            🔗 {log.referencedBlock!.name}
                        </div>

                        <div style={{ paddingTop: '24px' }}>
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

            // 3. Handle children - NO NESTING, proper sequential/parallel
            if (hasChildren) {
                if (log.children!.length === 1) {
                    // Sequential: connector and continue
                    result.push(
                        <div key={`connector-${log.id}`} style={{
                            width: '2px',
                            height: '8px',
                            background: 'var(--border)',
                            margin: '4px 0 4px 12px',
                            borderRadius: '1px'
                        }}/>
                    );
                    processLog(log.children![0], 0); // Continue at same level
                } else {
                    // Parallel: side by side layout
                    result.push(
                        <div key={`${keyPrefix}-par-${log.id}`} style={{ margin: '16px 0' }}>
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
                                ⚡ Parallel Execution ({log.children!.length})
                                <div style={{
                                    flex: 1,
                                    height: '1px',
                                    background: 'var(--border)',
                                    marginLeft: 'var(--space)'
                                }}/>
                            </div>
                            <div style={{
                                display: 'flex',
                                gap: '24px',
                                alignItems: 'flex-start',
                                overflowX: 'auto',
                                paddingBottom: '8px'
                            }}>
                                {log.children!.map((parallelLog, idx) => (
                                    <div key={parallelLog.id} style={{
                                        flex: '0 0 auto',
                                        minWidth: '350px',
                                        padding: '12px',
                                        background: 'var(--bg)',
                                        border: '1px solid var(--border)',
                                        borderRadius: '8px',
                                        position: 'relative'
                                    }}>
                                        <div style={{
                                            position: 'absolute',
                                            top: '-8px',
                                            left: '12px',
                                            background: '#f59e0b',
                                            color: 'white',
                                            padding: '2px 8px',
                                            borderRadius: '4px',
                                            fontSize: '10px',
                                            fontWeight: '600'
                                        }}>
                                            PARALLEL {idx + 1}
                                        </div>
                                        <div style={{ marginTop: '8px' }}>
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

        // Handle siblings - if multiple logs at root level, show as siblings
        if (logs.length > 1) {
            result.push(
                <div key={`${keyPrefix}-siblings`} style={{ margin: '20px 0' }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        marginBottom: '16px',
                        color: 'var(--text-light)',
                        fontSize: '14px',
                        fontWeight: '600'
                    }}>
                        <div style={{
                            width: '20px',
                            height: '1px',
                            background: 'var(--border)',
                            marginRight: '12px'
                        }}/>
                        👥 Sibling Operations ({logs.length})
                        <div style={{
                            flex: 1,
                            height: '1px',
                            background: 'var(--border)',
                            marginLeft: '12px'
                        }}/>
                    </div>
                    <div style={{
                        display: 'flex',
                        gap: '32px',
                        alignItems: 'flex-start',
                        overflowX: 'auto',
                        paddingBottom: '16px'
                    }}>
                        {logs.map((log, idx) => (
                            <div key={log.id} style={{
                                flex: '0 0 auto',
                                minWidth: '400px',
                                padding: '16px',
                                background: 'var(--bg)',
                                border: '2px solid #ec4899',
                                borderRadius: '12px',
                                position: 'relative'
                            }}>
                                <div style={{
                                    position: 'absolute',
                                    top: '-12px',
                                    left: '16px',
                                    background: '#ec4899',
                                    color: 'white',
                                    padding: '4px 12px',
                                    borderRadius: '6px',
                                    fontSize: '11px',
                                    fontWeight: '600'
                                }}>
                                    SIBLING {idx + 1}
                                </div>
                                <div style={{ marginTop: '8px' }}>
                                    {renderLogStructure([log], depth, `${keyPrefix}-sibling-${idx}`, parentTimestamp)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            );
        } else {
            // Single log - process normally
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

            {/* Canvas Area - No constrained containers */}
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
                        padding: '40px',
                        minWidth: 'max-content', // KEY: Allow content to size naturally
                        pointerEvents: 'auto'
                    }}
                >
                    {treeStructure.length === 0
                        ? <div style={{ textAlign: 'center', color: 'var(--text-light)', padding: '60px' }}>No logs found for this block.</div>
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
                        <span>👥 Sibling Operations</span>
                        <span>⚡ Parallel Execution</span>
                        <span>⬇️ Sequential Flow</span>
                    </div>
                    <div>
                        Ctrl/Cmd + scroll to zoom • Drag to pan • Horizontal scroll for siblings
                    </div>
                </div>
            </div>
        </div>
    );
}
