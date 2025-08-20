import React, { useState, useEffect, useRef } from "react";
import { Button, LoadingState } from "../components/UI";
import { getLogsByBlockId, LogEntry, Block } from "../api/vfl";
import { getLogSymbol } from "../utils/LogUtil";
import { getTrimmedId, truncate } from "../utils/General";
import BlockSidebar from "../components/BlockSidebar";
import ControlsBar from "../components/ControlsBar";

const formatDuration = (start: number, end?: number | null) => {
    const ms = (end ?? Date.now()) - start;
    if (ms < 1000) return `${ms}ms`;
    const s = Math.floor(ms / 1000) % 60, m = Math.floor(ms / 60000) % 60, h = Math.floor(ms / 3600000);
    return [h && `${h}h`, m && `${m}m`, `${s}s`].filter(Boolean).join(" ");
};

function LogCard({
                     log,
                     collapsed,
                     loadingReferenced,
                     onToggleExpand,
                     onNavigateToBlock
                 }: {
    log: LogEntry;
    collapsed: boolean;
    loadingReferenced: boolean;
    onToggleExpand?: () => void;
    onNavigateToBlock?: (block: Block) => void;
}) {
    const { referencedBlock: ref } = log;

    const handleExpandClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (ref && onToggleExpand) {
            onToggleExpand();
        }
    };

    const handleBlockCardClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (ref && onNavigateToBlock) {
            onNavigateToBlock(ref);
        }
    };

    return (
        <div style={{ marginBottom: 'var(--space)' }}>
            {/* Main Log Row */}
            <div
                className="card"
                style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    transition: 'all 0.2s ease'
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: 'var(--space)' }}>
                    {ref && (
                        <button
                            onClick={handleExpandClick}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--primary)',
                                fontSize: 12,
                                cursor: 'pointer',
                                padding: '4px',
                                borderRadius: '4px',
                                transition: 'all 0.2s ease',
                                transform: !collapsed ? 'rotate(90deg)' : 'rotate(0deg)',
                            }}
                            title={collapsed ? "Expand referenced block logs" : "Collapse referenced block logs"}
                        >
                            {loadingReferenced ? "⏳" : "▶"}
                        </button>
                    )}
                    <span style={{ fontSize: 16 }}>{getLogSymbol(log)}</span>
                    <span className="muted" style={{ fontSize: 11, fontFamily: "monospace" }}>
                        {getTrimmedId(log.id)}
                    </span>
                    <span style={{ fontWeight: 500, flex: 1 }}>
                        {truncate(log.message || "(no message)", 60)}
                    </span>
                    <span className="muted" style={{ fontSize: 12 }}>
                        {log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : ""}
                    </span>
                </div>
            </div>

            {/* Referenced Block Card - Clickable to Navigate */}
            {ref && (
                <div
                    className="card clickable"
                    onClick={handleBlockCardClick}
                    style={{
                        marginTop: 'var(--space)',
                        background: '#eff6ff',
                        border: '2px solid var(--primary)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                    }}
                >
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: 'var(--space)'
                    }}>
                        <div style={{
                            fontWeight: 600,
                            color: 'var(--primary)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            Referenced Block
                            <span style={{
                                background: 'var(--primary)',
                                color: 'white',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontSize: '10px',
                                fontWeight: '500'
                            }}>
                                Click to view
                            </span>
                        </div>
                        <span style={{
                            color: 'var(--text-light)',
                            fontSize: '12px'
                        }}>
                            →
                        </span>
                    </div>

                    <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>
                        {ref.name}
                    </div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'auto 1fr',
                        gap: '4px 12px',
                        fontSize: '13px',
                        marginBottom: '8px'
                    }}>
                        <span className="muted">ID:</span>
                        <span style={{ fontFamily: 'monospace', fontSize: 12 }}>
                            {getTrimmedId(ref.id)}
                        </span>

                        <span className="muted">Created:</span>
                        <span>
                            {ref.createdAt ? new Date(ref.createdAt).toLocaleString() : "(unknown)"}
                        </span>

                        <span className="muted">Duration:</span>
                        <span>{formatDuration(ref.startTime, ref.endTime)}</span>

                        <span className="muted">Status:</span>
                        <span style={{
                            color: ref.endTime ? '#059669' : '#d97706',
                            fontWeight: '500'
                        }}>
                            {ref.endTime ? '✅ Completed' : '⏳ Running'}
                        </span>
                    </div>

                    {ref.endMessage && (
                        <div style={{
                            padding: '6px 8px',
                            background: '#f0f4ff',
                            borderRadius: '6px',
                            fontStyle: 'italic',
                            borderLeft: '3px solid var(--primary)',
                            color: 'var(--primary)',
                            fontSize: '12px'
                        }}>
                            💬 {truncate(ref.endMessage, 60)}
                        </div>
                    )}
                </div>
            )}

            {/* Referenced block logs - only children not matching current log */}
            {ref && !collapsed && log.children && log.children.length > 0 && (
                <div style={{
                    marginTop: 'var(--space)',
                    marginLeft: 'calc(var(--space) * 2)',
                    paddingLeft: 'var(--space)',
                    borderLeft: '2px solid var(--primary)',
                    background: 'rgba(37, 99, 235, 0.02)',
                    borderRadius: '0 8px 8px 0'
                }}>
                    <div style={{
                        fontSize: '12px',
                        fontWeight: '600',
                        color: 'var(--primary)',
                        marginBottom: 'var(--space)',
                        padding: '4px 0'
                    }}>
                        Referenced Block Execution Logs
                    </div>
                    {log.children.filter(l => l.id !== log.id).map((refLog, idx) =>
                        <div key={refLog.id || idx} style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 'var(--space)',
                            padding: '6px 8px',
                            margin: '4px 0',
                            background: 'var(--surface)',
                            border: '1px solid var(--border)',
                            borderRadius: '6px',
                            fontSize: 13
                        }}>
                            <span>{getLogSymbol(refLog)}</span>
                            <span className="muted" style={{ fontFamily: 'monospace', fontSize: 10 }}>
                                {getTrimmedId(refLog.id)}
                            </span>
                            <span style={{ flex: 1 }}>
                                {truncate(refLog.message || "(no message)", 50)}
                            </span>
                            <span className="muted" style={{ fontSize: 11 }}>
                                {refLog.timestamp ? new Date(refLog.timestamp).toLocaleTimeString() : ""}
                            </span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default function LogsViewer({
                                       block,
                                       goBack,
                                       onNavigateToBlock
                                   }: {
    block: Block;
    goBack: () => void;
    onNavigateToBlock?: (block: Block) => void;
}) {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
    const [loadingReferencedBlocks, setLoadingReferencedBlocks] = useState<Set<string>>(new Set());
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [inputMode, setInputMode] = useState<"mouse" | "trackpad">("mouse");
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const canvasRef = useRef<HTMLDivElement>(null);

    useEffect(() => { loadLogs(); }, [block.id]);
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
            const logsData = await getLogsByBlockId(block.id, 10, 50);
            setLogs(logsData);
            initializeCollapsedState(logsData);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const initializeCollapsedState = (logs: LogEntry[]) => {
        const referencedBlocks = new Set<string>();
        const findReferencedBlocks = (entries: LogEntry[]) => {
            entries.forEach(log => {
                if (log.referencedBlock) referencedBlocks.add(log.id);
                if (log.children?.length) findReferencedBlocks(log.children);
            });
        };
        findReferencedBlocks(logs);
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
        if (!collapsed.has(log.id) && log.children?.length > 0) {
            toggleCollapse(log.id);
            return;
        }
        setLoadingReferencedBlocks(prev => new Set([...prev, log.id]));
        try {
            const referencedLogs = await getLogsByBlockId(log.referencedBlock.id, 10, 50);
            setLogs(prev => {
                const updateLogWithChildren = (logEntry: LogEntry): LogEntry => {
                    if (logEntry.id === log.id)
                        return { ...logEntry, children: referencedLogs };
                    if (logEntry.children?.length)
                        return { ...logEntry, children: logEntry.children.map(updateLogWithChildren) };
                    return logEntry;
                };
                return prev.map(updateLogWithChildren);
            });
            const newReferencedBlocks = new Set<string>();
            const findNewReferencedBlocks = (entries: LogEntry[]) => {
                entries.forEach(entry => {
                    if (entry.referencedBlock) newReferencedBlocks.add(entry.id);
                    if (entry.children?.length) findNewReferencedBlocks(entry.children);
                });
            };
            findNewReferencedBlocks(referencedLogs);
            setCollapsed(prev => {
                const updated = new Set([...prev, ...newReferencedBlocks]);
                updated.delete(log.id);
                return updated;
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

    const renderLogStructure = (logs: LogEntry[], depth = 0, keyPrefix = "root") => {
        if (!logs || logs.length === 0) return null;
        const result: JSX.Element[] = [];

        logs.forEach((log, i) => {
            const isCollapsed = collapsed.has(log.id);
            const isLoadingReferenced = loadingReferencedBlocks.has(log.id);
            const hasNextSibling = i < logs.length - 1;

            const sequentialConnector = hasNextSibling ? (
                <div key={`connector-${log.id}`} style={{
                    width: '2px', height: '8px', background: 'var(--border)',
                    margin: '4px 0 4px 12px', borderRadius: '1px'
                }} />
            ) : null;

            result.push(
                <div key={`${keyPrefix}-${i}`} style={{ position: 'relative' }}>
                    <LogCard
                        log={log}
                        collapsed={isCollapsed}
                        loadingReferenced={isLoadingReferenced}
                        onToggleExpand={() => log.referencedBlock && handleExpandReferencedBlock(log)}
                        onNavigateToBlock={onNavigateToBlock}
                    />
                </div>
            );

            if (hasNextSibling && !log.children?.length) result.push(sequentialConnector);

            if (log.referencedBlock && log.children?.length > 0 && !isCollapsed) {
                result.push(
                    <div
                        key={`${log.id}-referenced`}
                        style={{
                            marginLeft: 'calc(var(--space) * 4)',
                            marginTop: 'var(--space)',
                            marginBottom: 'var(--space)',
                            paddingLeft: 'var(--space)',
                            borderLeft: '2px solid var(--primary)',
                            opacity: 0.95
                        }}
                    >
                        {renderLogStructure(log.children, depth + 1, `${keyPrefix}-ref-${log.id}`)}
                    </div>
                );
            }

            if (!log.referencedBlock && Array.isArray(log.children) && log.children.length > 1) {
                result.push(
                    <div key={`${log.id}-parallels`} style={{ margin: 'calc(var(--space) * 2) 0' }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            marginBottom: 'var(--space)',
                            color: 'var(--text-light)',
                            fontSize: '12px',
                            fontWeight: '500'
                        }}>
                            <div style={{ width: '20px', height: '1px', background: 'var(--border)', marginRight: 'var(--space)' }} />
                            Parallel Execution
                            <div style={{ flex: 1, height: '1px', background: 'var(--border)', marginLeft: 'var(--space)' }} />
                        </div>
                        <div className="grid" style={{
                            gridTemplateColumns: `repeat(${log.children.length}, 1fr)`,
                            gap: 'calc(var(--space) * 2)'
                        }}>
                            {log.children.map((parallelLog, idx) => (
                                <div key={parallelLog.id} style={{
                                    padding: 'var(--space)',
                                    background: 'var(--bg)',
                                    border: '1px solid var(--border)',
                                    borderRadius: '8px',
                                    position: 'relative'
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
                                        Branch {idx + 1}
                                    </div>
                                    <div style={{ marginTop: 'var(--space)' }}>
                                        {renderLogStructure([parallelLog], depth, `${keyPrefix}-${log.id}-parallel-${idx}`)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            } else if (!log.referencedBlock && Array.isArray(log.children) && log.children.length === 1) {
                result.push(
                    <div key={`${log.id}-sequential`}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            margin: '4px 0',
                            color: 'var(--text-light)',
                            fontSize: '11px'
                        }}>
                            <div style={{
                                width: '12px', height: '1px',
                                background: 'var(--border)', marginRight: '4px'
                            }} />
                            ⬇️
                        </div>
                        {renderLogStructure(log.children, depth, `${keyPrefix}-${log.id}-seq`)}
                    </div>
                );
            }

            if (hasNextSibling && log.children?.length) result.push(sequentialConnector);
        });

        return <>{result}</>;
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if (e.button !== 0) return;
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
    const resetView = () => { setZoom(1); setPan({ x: 0, y: 0 }); };
    const zoomIn = () => setZoom(prev => Math.min(prev + 0.2, 3));
    const zoomOut = () => setZoom(prev => Math.max(prev - 0.2, 0.1));
    const expandAll = () => setCollapsed(new Set());
    const collapseAll = () => {
        const allReferencedBlocks = new Set<string>();
        const findReferencedBlocks = (logs: LogEntry[]) => {
            logs.forEach(log => {
                if (log.referencedBlock) allReferencedBlocks.add(log.id);
                if (log.children) findReferencedBlocks(log.children);
            });
        };
        findReferencedBlocks(logs);
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
                    <LoadingState message="Loading execution logs..." />
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
                            {sidebarOpen ? '⮌' : 'ℹ️'}
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
                    transition: 'margin-left 0.3s ease'
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
                        minHeight: '100%'
                    }}
                >
                    <div className="container">
                        {logs.length === 0
                            ? <div className="text-center muted">No logs found for this block.</div>
                            : renderLogStructure(logs)
                        }
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
                        <span>Referenced Block</span>
                        <span>Parallel Execution</span>
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