import React, { useState, useEffect, useRef } from "react";
import { Button, LoadingState } from "../components/UI";
import { getLogsByBlockId, LogEntry } from "../api/vfl";

// Modular log row component
function LogEntryRow({
                         log,
                         collapsed,
                         loadingReferenced,
                         onToggle,
                     }) {
    const hasReferencedBlock = !!log.referencedBlock;
    return (
        <div
            className={`log-entry ${hasReferencedBlock ? 'referenced' : ''} ${hasReferencedBlock ? 'clickable' : ''}`}
            onClick={() => hasReferencedBlock && onToggle()}
            style={{ userSelect: "none" }}
        >
            <div className="log-content">
                {hasReferencedBlock && (
                    <span className={`arrow ${!collapsed ? 'rotated' : ''}`}>
                        {loadingReferenced ? (
                            <span style={{fontSize: 13}}>⏳</span>
                        ) : '▶'}
                    </span>
                )}
                <span className="message">{log.message}</span>
                {hasReferencedBlock && <span className="block-id">{`[References: ${log.referencedBlock.id}]`}</span>}
            </div>
        </div>
    );
}

export default function LogsViewer({ blockId, blockName, goBack }) {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
    const [loadingReferencedBlocks, setLoadingReferencedBlocks] = useState<Set<string>>(new Set());
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    const canvasRef = useRef<HTMLDivElement>(null);

    useEffect(() => { loadLogs(); }, [blockId]);

    // Enhanced zoom and pan controls
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const handleWheel = (e: WheelEvent) => {
            e.preventDefault();

            // Check if it's a trackpad (more precise deltaY values)
            const isTrackpad = Math.abs(e.deltaY) < 50;

            if (e.ctrlKey || e.metaKey) {
                // Zoom functionality
                const zoomFactor = isTrackpad ? 0.02 : 0.1;
                const delta = e.deltaY > 0 ? -zoomFactor : zoomFactor;
                setZoom(prev => Math.min(Math.max(prev + delta, 0.1), 3));
            } else {
                // Pan functionality for trackpad
                if (isTrackpad) {
                    setPan(prev => ({
                        x: prev.x - e.deltaX,
                        y: prev.y - e.deltaY
                    }));
                } else {
                    // Mouse wheel vertical scrolling
                    setPan(prev => ({
                        ...prev,
                        y: prev.y - e.deltaY
                    }));
                }
            }
        };

        canvas.addEventListener('wheel', handleWheel, { passive: false });
        return () => canvas.removeEventListener('wheel', handleWheel);
    }, []);

    const loadLogs = async () => {
        setLoading(true);
        setError(null);
        try {
            const logsData = await getLogsByBlockId(blockId, 10, 50);
            setLogs(logsData);
            // Initialize collapsed state for all referenced blocks
            initializeCollapsedState(logsData);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Initialize collapsed state for all referenced blocks (they start collapsed)
    const initializeCollapsedState = (logs: LogEntry[]) => {
        const referencedBlocks = new Set<string>();
        const findReferencedBlocks = (entries: LogEntry[]) => {
            entries.forEach(log => {
                if (log.referencedBlock) {
                    referencedBlocks.add(log.id);
                }
                if (log.children?.length) {
                    findReferencedBlocks(log.children);
                }
            });
        };
        findReferencedBlocks(logs);
        setCollapsed(referencedBlocks);
    };

    const toggleCollapse = (logId: string) => {
        setCollapsed(prev => {
            const newCollapsed = new Set(prev);
            if (newCollapsed.has(logId)) {
                newCollapsed.delete(logId);
            } else {
                newCollapsed.add(logId);
            }
            return newCollapsed;
        });
    };

    // Load referenced block logs only when explicitly clicked
    const handleExpandReferencedBlock = async (log: LogEntry) => {
        if (!log.referencedBlock) return;

        // If already expanded and loaded, just toggle collapse
        if (!collapsed.has(log.id) && log.children?.length > 0) {
            toggleCollapse(log.id);
            return;
        }

        setLoadingReferencedBlocks(prev => new Set([...prev, log.id]));

        try {
            const referencedLogs = await getLogsByBlockId(log.referencedBlock.id, 10, 50);

            // Insert referenced logs as children
            setLogs(prev => {
                const updateLogWithChildren = (logEntry: LogEntry): LogEntry => {
                    if (logEntry.id === log.id) {
                        return { ...logEntry, children: referencedLogs };
                    }
                    if (logEntry.children?.length) {
                        return { ...logEntry, children: logEntry.children.map(updateLogWithChildren) };
                    }
                    return logEntry;
                };
                return prev.map(updateLogWithChildren);
            });

            // Initialize collapsed state for newly loaded referenced blocks
            const newReferencedBlocks = new Set<string>();
            const findNewReferencedBlocks = (entries: LogEntry[]) => {
                entries.forEach(entry => {
                    if (entry.referencedBlock) {
                        newReferencedBlocks.add(entry.id);
                    }
                    if (entry.children?.length) {
                        findNewReferencedBlocks(entry.children);
                    }
                });
            };
            findNewReferencedBlocks(referencedLogs);

            // Add new referenced blocks to collapsed state and expand the current one
            setCollapsed(prev => {
                const updated = new Set([...prev, ...newReferencedBlocks]);
                updated.delete(log.id); // Expand the clicked block
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

    // Modular log rendering function
    const renderLogStructure = (logs: LogEntry[], depth = 0, keyPrefix = "root") => {
        if (!logs?.length) return null;
        const result: JSX.Element[] = [];

        for (let i = 0; i < logs.length; i++) {
            const log = logs[i];
            const isCollapsed = collapsed.has(log.id);
            const isLoadingReferenced = loadingReferencedBlocks.has(log.id);

            // Render log row
            result.push(
                <LogEntryRow
                    key={`${keyPrefix}-${i}`}
                    log={log}
                    collapsed={isCollapsed}
                    loadingReferenced={isLoadingReferenced}
                    onToggle={() => {
                        if (log.referencedBlock) {
                            handleExpandReferencedBlock(log);
                        }
                    }}
                />
            );

            // Render referenced block content (only if expanded and loaded)
            if (log.referencedBlock && log.children?.length > 0 && !isCollapsed) {
                result.push(
                    <div key={`${log.id}-referenced`} className="referenced-content" style={{ marginLeft: 24 }}>
                        {renderLogStructure(log.children, depth + 1, `${keyPrefix}-ref-${log.id}`)}
                    </div>
                );
            }

            // Render non-referenced children (parallel/sequential)
            if (!log.referencedBlock && log.children?.length) {
                if (log.children.length > 1) {
                    result.push(
                        <div key={`${log.id}-parallels`} style={{ marginTop: 12, marginBottom: 12 }}>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: `repeat(${log.children.length}, 1fr)`,
                                gap: 16,
                                minHeight: 100
                            }}>
                                {log.children.map((parallelLog, idx) => (
                                    <div key={parallelLog.id} className="parallel-item">
                                        <div className="parallel-label">{`PARALLEL ${idx + 1}`}</div>
                                        <div style={{ marginTop: 8 }}>
                                            {renderLogStructure([parallelLog], depth, `${keyPrefix}-${log.id}-parallel-${idx}`)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                } else {
                    result.push(renderLogStructure(log.children, depth, `${keyPrefix}-${log.id}-seq`));
                }
            }
        }
        return <>{result}</>;
    };

    // Enhanced pan/drag functionality
    const handleMouseDown = (e: React.MouseEvent) => {
        if (e.button !== 0) return; // Only left mouse button
        setIsDragging(true);
        setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging) {
            setPan({
                x: e.clientX - dragStart.x,
                y: e.clientY - dragStart.y
            });
        }
    };

    const handleMouseUp = () => setIsDragging(false);

    // Control functions
    const resetView = () => {
        setZoom(1);
        setPan({ x: 0, y: 0 });
    };

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

    // Loading state
    if (loading) {
        return (
            <div className="app">
                <div className="header">
                    <Button variant="outline" onClick={goBack}>← Back</Button>
                    <h1>Loading logs for: {blockName}</h1>
                    <div className="controls">
                        <span className="zoom-indicator">{(zoom * 100).toFixed(0)}%</span>
                    </div>
                </div>
                <div className="canvas">
                    <LoadingState message="Loading logs..." />
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="app">
                <div className="header">
                    <Button variant="outline" onClick={goBack}>← Back</Button>
                    <h1>Logs for: {blockName}</h1>
                    <div className="controls">
                        <span className="zoom-indicator">{(zoom * 100).toFixed(0)}%</span>
                    </div>
                </div>
                <div className="canvas">
                    <div className="text-center error">{error}</div>
                </div>
            </div>
        );
    }

    return (
        <div className="app">
            <div className="header">
                <Button variant="outline" onClick={goBack}>← Back</Button>
                <h1>Execution Flow: {blockName}</h1>
                <div className="controls">
                    <button className="control-btn" onClick={expandAll}>Expand All</button>
                    <button className="control-btn" onClick={collapseAll}>Collapse All</button>
                    <button className="control-btn" onClick={zoomOut}>Zoom Out</button>
                    <button className="control-btn" onClick={zoomIn}>Zoom In</button>
                    <span className="zoom-indicator">{(zoom * 100).toFixed(0)}%</span>
                    <button className="reset-btn" onClick={resetView}>Reset View</button>
                </div>
            </div>

            <div
                ref={canvasRef}
                className="canvas"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
            >
                <div
                    className="viewport"
                    style={{
                        transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                        transformOrigin: '0 0',
                        position: 'relative',
                        zIndex: 1
                    }}
                >
                    <div style={{ maxWidth: '1200px', padding: '32px' }}>
                        {logs.length === 0 ? (
                            <div className="text-center muted">No logs found for this block.</div>
                        ) : (
                            renderLogStructure(logs)
                        )}
                    </div>
                </div>
            </div>

            <div className="footer">
                <div className="legend-item">
                    <div className="legend-box legend-referenced"></div>
                    <span>Referenced Block</span>
                </div>
                <div className="legend-item">
                    <div className="legend-box legend-parallel"></div>
                    <span>Parallel Execution</span>
                </div>
                <div style={{ marginLeft: 'auto', fontSize: '12px', opacity: 0.7 }}>
                    <span>💡 Ctrl/Cmd + scroll to zoom • Two-finger drag to pan on trackpad</span>
                </div>
            </div>
        </div>
    );
}
