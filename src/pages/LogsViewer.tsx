// FILE: src/pages/LogsViewer.tsx
import React, { useState, useEffect, useRef } from "react";
import { Button } from "../components/UI";
import { getLogsByBlockId, LogEntry } from "../api/vfl";

interface LogsViewerProps {
    blockId: string;
    blockName: string;
    goBack: () => void;
}

export default function LogsViewer({ blockId, blockName, goBack }: LogsViewerProps) {
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

    useEffect(() => {
        loadLogs();
    }, [blockId]);

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

    const toggleCollapse = (logId: string) => {
        const newCollapsed = new Set(collapsed);
        if (newCollapsed.has(logId)) {
            newCollapsed.delete(logId);
        } else {
            newCollapsed.add(logId);
        }
        setCollapsed(newCollapsed);
    };

    const loadReferencedBlock = async (log: LogEntry) => {
        if (!log.referencedBlock) return;

        setLoadingReferencedBlocks(prev => {
            const newSet = new Set(prev);
            newSet.add(log.id);
            return newSet;
        });

        try {
            const referencedLogs = await getLogsByBlockId(log.referencedBlock.id, 10, 50);

            // Update the logs with the referenced block data
            setLogs(prev => {
                const updateLogWithChildren = (logEntry: LogEntry): LogEntry => {
                    if (logEntry.id === log.id) {
                        return {
                            ...logEntry,
                            children: referencedLogs
                        };
                    }

                    if (logEntry.children && logEntry.children.length > 0) {
                        return {
                            ...logEntry,
                            children: logEntry.children.map(updateLogWithChildren)
                        };
                    }

                    return logEntry;
                };

                return prev.map(updateLogWithChildren);
            });

            // Expand the log to show the referenced content
            toggleCollapse(log.id);
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

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging) {
            setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const resetView = () => {
        setZoom(1);
        setPan({ x: 0, y: 0 });
    };

    const expandAll = () => {
        setCollapsed(new Set());
    };

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

    const renderSingleLogEntry = (log: LogEntry, depth = 0, keyPrefix = "") => {
        const hasReferencedBlock = !!log.referencedBlock;
        const isCollapsed = collapsed.has(log.id);
        const isLoadingReferenced = loadingReferencedBlocks.has(log.id);
        const hasChildren = log.children && log.children.length > 0;
        const hasReferencedLogs = hasReferencedBlock && log.children;

        return (
            <div key={`${keyPrefix}-${log.id}`} style={{ marginLeft: `${depth * 24}px` }}>
                <div
                    className={`log-entry ${hasReferencedBlock ? 'referenced' : ''} ${hasReferencedBlock || hasChildren ? 'clickable' : ''}`}
                    onClick={() => {
                        if (hasReferencedBlock && !hasChildren) {
                            loadReferencedBlock(log);
                        } else if (hasReferencedBlock || hasChildren) {
                            toggleCollapse(log.id);
                        }
                    }}
                >
                    <div className="log-content">
                        {(hasReferencedBlock || hasChildren) && (
                            <span className={`arrow ${!isCollapsed ? 'rotated' : ''}`}>
                {isLoadingReferenced ? '⏳' : '▶'}
              </span>
                        )}
                        <span className="message">{log.message}</span>
                        {hasReferencedBlock && (
                            <span className="block-id">[References: {log.referencedBlock.id}]</span>
                        )}
                    </div>
                </div>

                {hasReferencedLogs && !isCollapsed && (
                    <div className="referenced-content">
                        {log.children!.map((childLog, index) =>
                            renderSingleLogEntry(childLog, depth + 1, `${keyPrefix}-${log.id}-${index}`)
                        )}
                    </div>
                )}
            </div>
        );
    };

    const renderParallelLogs = (logs: LogEntry[], depth: number, keyPrefix: string) => {
        return (
            <div key={`${keyPrefix}-parallel`} style={{ marginTop: '12px', marginBottom: '12px' }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${logs.length}, 1fr)`,
                    gap: '16px',
                    minHeight: '100px'
                }}>
                    {logs.map((log, index) => (
                        <div key={`${keyPrefix}-parallel-${index}`} className="parallel-item">
                            <div className="parallel-label">PARALLEL {index + 1}</div>
                            <div style={{ marginTop: '8px' }}>
                                {renderLogStructure([log], depth + 1, `${keyPrefix}-parallel-${index}`)}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const renderLogStructure = (logs: LogEntry[], depth = 0, keyPrefix = "root") => {
        const result: JSX.Element[] = [];

        const processLog = (log: LogEntry, currentDepth: number, prefix: string) => {
            result.push(renderSingleLogEntry(log, currentDepth, prefix));

            if (log.children && log.children.length === 1 && !collapsed.has(log.id)) {
                processLog(log.children[0], currentDepth, `${prefix}-child`);
            } else if (log.children && log.children.length > 1 && !collapsed.has(log.id)) {
                result.push(renderParallelLogs(log.children, currentDepth, `${prefix}-children`));
            }
        };

        logs.forEach((log, index) => processLog(log, depth, `${keyPrefix}-${index}`));
        return <>{result}</>;
    };

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
                    <div className="text-center muted">Loading logs...</div>
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