import React, {useState, useEffect, useRef} from "react";
import {Button, LoadingState} from "../components/UI";
import {getLogsByBlockId, LogEntry} from "../api/vfl";
import {LogCard} from "../components/LogCard";

export default function LogsViewer({blockId, blockName, goBack}) {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
    const [loadingReferencedBlocks, setLoadingReferencedBlocks] = useState<Set<string>>(new Set());
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({x: 0, y: 0});
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({x: 0, y: 0});

    const canvasRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        loadLogs();
    }, [blockId]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const handleWheel = (e: WheelEvent) => {
            e.preventDefault();
            const isTrackpad = Math.abs(e.deltaY) < 50;
            if (e.ctrlKey || e.metaKey) {
                const zoomFactor = isTrackpad ? 0.02 : 0.1;
                const delta = e.deltaY > 0 ? -zoomFactor : zoomFactor;
                setZoom(prev => Math.min(Math.max(prev + delta, 0.1), 3));
            } else {
                if (isTrackpad) {
                    setPan(prev => ({
                        x: prev.x - e.deltaX,
                        y: prev.y - e.deltaY
                    }));
                } else {
                    setPan(prev => ({...prev, y: prev.y - e.deltaY}));
                }
            }
        };
        canvas.addEventListener('wheel', handleWheel, {passive: false});
        return () => canvas.removeEventListener('wheel', handleWheel);
    }, []);

    const loadLogs = async () => {
        setLoading(true);
        setError(null);
        try {
            const logsData = await getLogsByBlockId(blockId, 10, 50);
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
                    if (logEntry.id === log.id) {
                        return {...logEntry, children: referencedLogs};
                    }
                    if (logEntry.children?.length) {
                        return {...logEntry, children: logEntry.children.map(updateLogWithChildren)};
                    }
                    return logEntry;
                };
                return prev.map(updateLogWithChildren);
            });

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

            // Render log card (sibling/sequence always same indent)
            result.push(
                <LogCard
                    key={`${keyPrefix}-${i}`}
                    log={log}
                    collapsed={isCollapsed}
                    loadingReferenced={isLoadingReferenced}
                    onToggle={() => {
                        if (log.referencedBlock) handleExpandReferencedBlock(log);
                    }}
                />
            );

            // === NESTING ONLY FOR REFERENCED BLOCKS ===
            if (log.referencedBlock && log.children?.length > 0 && !isCollapsed) {
                result.push(
                    <div
                        key={`${log.id}-referenced`}
                        className="referenced-content"
                        style={{marginLeft: 24}}
                    >
                        {renderLogStructure(log.children, depth + 1, `${keyPrefix}-ref-${log.id}`)}
                    </div>
                );
            }

            // === PARALLEL: render children as grid/sibling columns (no nesting) ===
            // If children array > 1, display sibling columns
            if (!log.referencedBlock && Array.isArray(log.children) && log.children.length > 1) {
                result.push(
                    <div
                        key={`${log.id}-parallels`}
                        style={{
                            marginTop: 12,
                            marginBottom: 12,
                            display: 'grid',
                            gridTemplateColumns: `repeat(${log.children.length}, 1fr)`,
                            gap: 16,
                            minHeight: 100
                        }}
                    >
                        {log.children.map((parallelLog, idx) => (
                            <div key={parallelLog.id} className="parallel-item">
                                {/* Optionally, show branch number or icon */}
                                {renderLogStructure([parallelLog], depth, `${keyPrefix}-${log.id}-parallel-${idx}`)}
                            </div>
                        ))}
                    </div>
                );
            } else if (!log.referencedBlock && Array.isArray(log.children) && log.children.length === 1) {
                // For single sequential child, render just as another element (no extra indent)
                result.push(
                    renderLogStructure(log.children, depth, `${keyPrefix}-${log.id}-seq`)
                );
            }
        });

        return <>{result}</>;
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if (e.button !== 0) return;
        setIsDragging(true);
        setDragStart({x: e.clientX - pan.x, y: e.clientY - pan.y});
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

    const resetView = () => {
        setZoom(1);
        setPan({x: 0, y: 0});
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
                    <LoadingState message="Loading logs..."/>
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
                style={{cursor: isDragging ? 'grabbing' : 'grab'}}
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
                    <div style={{maxWidth: '1200px', padding: '32px'}}>
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
                <div style={{marginLeft: 'auto', fontSize: '12px', opacity: 0.7}}>
                    <span>💡 Ctrl/Cmd + scroll to zoom • Two-finger drag to pan on trackpad</span>
                </div>
            </div>
        </div>
    );
}
