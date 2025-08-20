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
                        {loadingReferenced ? (<span style={{fontSize: 13}}><LoadingState message="Loading..." /></span>) : '▶'}
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

    // --- PAN/ZOOM ---
    const canvasRef = useRef<HTMLDivElement>(null);

    useEffect(() => { loadLogs(); }, [blockId]);
    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            const handleWheel = (e: WheelEvent) => {
                e.preventDefault();
                setZoom(prev => Math.min(Math.max(prev * (e.deltaY > 0 ? 0.9 : 1.1), 0.1), 3));
            };
            canvas.addEventListener('wheel', handleWheel, { passive: false });
            return () => canvas.removeEventListener('wheel', handleWheel);
        }
    }, []);

    const loadLogs = async () => {
        setLoading(true);
        setError(null);
        try {
            const logsData = await getLogsByBlockId(blockId, 10, 50);
            setLogs(logsData);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // --- Collapse logic: only referencedBlock logs can be collapsed/expanded ---
    const toggleCollapse = (logId: string) => {
        const newCollapsed = new Set(collapsed);
        if (newCollapsed.has(logId)) {
            newCollapsed.delete(logId);
        } else {
            newCollapsed.add(logId);
        }
        setCollapsed(newCollapsed);
    };

    // --- Load referenced block logs only when expanded ---
    const handleExpandReferencedBlock = async (log: LogEntry) => {
        if (!log.referencedBlock) return;

        if (!collapsed.has(log.id) && log.children?.length > 0) {
            // already expanded and loaded
            toggleCollapse(log.id);
            return;
        }

        setLoadingReferencedBlocks(prev => {
            const newSet = new Set(prev);
            newSet.add(log.id);
            return newSet;
        });

        try {
            const referencedLogs = await getLogsByBlockId(log.referencedBlock.id, 10, 50);

            // Insert referenced logs as .children (for session only)
            setLogs(prev => {
                const updateLogWithChildren = (logEntry: LogEntry): LogEntry => {
                    if (logEntry.id === log.id) {
                        return { ...logEntry, children: referencedLogs };
                    }
                    if (logEntry.children && logEntry.children.length > 0) {
                        return { ...logEntry, children: logEntry.children.map(updateLogWithChildren) };
                    }
                    return logEntry;
                };
                return prev.map(updateLogWithChildren);
            });

            // After loading, open the block
            const newCollapsed = new Set(collapsed);
            newCollapsed.delete(log.id); // ensure it is open
            setCollapsed(newCollapsed);

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

    // --- Modular log rendering function ---
    const renderLogStructure = (logs: LogEntry[], depth = 0, keyPrefix = "root") => {
        if (!logs?.length) return null;
        const result: JSX.Element[] = [];

        for (let i = 0; i < logs.length; i++) {
            const log = logs[i];
            const isCollapsed = collapsed.has(log.id);
            const isLoadingReferenced = loadingReferencedBlocks.has(log.id);

            // log row
            result.push(
                <LogEntryRow
                    key={`${keyPrefix}-${i}`}
                    log={log}
                    collapsed={isCollapsed}
                    loadingReferenced={isLoadingReferenced}
                    onToggle={() => {
                        if (log.referencedBlock) {
                            if (isCollapsed || !log.children?.length) handleExpandReferencedBlock(log);
                            else toggleCollapse(log.id);
                        }
                    }}
                />
            );
            // Only referenced block logs can be collapsed/expanded and render children
            if (log.referencedBlock && log.children?.length > 0 && !isCollapsed) {
                if (isLoadingReferenced) {
                    result.push(
                        <div key={`${log.id}-rb-loading`} className="referenced-content" style={{ marginLeft: 24 }}>
                            <LoadingState message="Loading referenced block..." />
                        </div>
                    );
                } else {
                    result.push(
                        <div key={`${log.id}-referenced`} className="referenced-content" style={{ marginLeft: 24 }}>
                            {renderLogStructure(log.children, depth + 1, `${keyPrefix}-ref-${log.id}`)}
                        </div>
                    );
                }
            }
            // Otherwise, process children (non-referenced blocks: always rendered as siblings)
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
                } else if (log.children.length === 1) {
                    result.push(renderLogStructure(log.children, depth, `${keyPrefix}-${log.id}-seq`));
                }
            }
        }
        return <>{result}</>;
    };

    // --- Pan/zoom events ---
    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    };
    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging) setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    };
    const handleMouseUp = () => setIsDragging(false);

    const resetView = () => {
        setZoom(1);
        setPan({ x: 0, y: 0 });
    };
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

    // --- Main render ---
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
                <canvas
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        pointerEvents: 'none',
                        zIndex: 0
                    }}
                />
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
            </div>
        </div>
    );
}
