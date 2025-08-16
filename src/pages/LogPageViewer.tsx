import React, { useEffect, useState } from 'react';
import { LogEntry } from '../models/log';
import { LogService } from '../services/logService';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import {  PageHeader } from '../components/ui/PageHeader';
import {  EmptyState} from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';

const LogViewerPage: React.FC = () => {
    const [state, setState] = useState({
        logs: [] as LogEntry[],
        loading: true,
        error: null as string | null,
        expandedNodes: new Set<string>(),
        maxDepth: 5,
        maxChildren: 50,
        blockId: new URLSearchParams(window.location.search).get('blockId') || ''
    });

    const updateState = (updates: Partial<typeof state>) => setState(prev => ({ ...prev, ...updates }));

    const fetchLogs = async () => {
        if (!state.blockId) return;
        try {
            updateState({ loading: true, error: null });
            const logs = await LogService.getLogsByBlockId({
                blockId: state.blockId,
                maxDepth: state.maxDepth,
                maxChildren: state.maxChildren
            });
            updateState({ logs, loading: false });
        } catch (err) {
            updateState({ error: err instanceof Error ? err.message : 'Failed to load logs', loading: false });
        }
    };

    useEffect(() => { fetchLogs(); }, [state.blockId, state.maxDepth, state.maxChildren]);

    const toggleExpanded = (logId: string) => {
        const newExpanded = new Set(state.expandedNodes);
        newExpanded.has(logId) ? newExpanded.delete(logId) : newExpanded.add(logId);
        updateState({ expandedNodes: newExpanded });
    };

    const LogEntryComponent: React.FC<{ log: LogEntry; depth?: number }> = ({ log, depth = 0 }) => {
        const isExpanded = state.expandedNodes.has(log.id);
        const hasChildren = log.children.length > 0;

        return (
            <div style={{ marginLeft: `${depth * 24}px` }}>
                <div className="bg-white border border-gray-200 rounded-lg p-4 mb-2 shadow-sm">
                    <div className="flex items-start gap-3">
                        {hasChildren && (
                            <button onClick={() => toggleExpanded(log.id)} className="text-gray-400 hover:text-gray-600 p-1">
                                {isExpanded ? '▼' : '▶'}
                            </button>
                        )}

                        <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm"
                            style={{ backgroundColor: LogService.getLogTypeColor(log.logType) }}
                        >
                            {LogService.getLogTypeIcon(log.logType)}
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                <span className="text-xs bg-gray-100 px-2 py-1 rounded font-mono font-semibold">
                  {log.logType}
                </span>
                                <span className="text-xs text-gray-500">
                  {LogService.formatTimestamp(log.timestamp)}
                </span>
                            </div>

                            {log.message && (
                                <p className="text-sm font-medium mb-2 break-words">{log.message}</p>
                            )}

                            {log.referencedBlock && (
                                <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-2">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-semibold text-blue-800">Referenced Block</span>
                                        <Button
                                            variant="primary"
                                            onClick={() => window.open(`${window.location.pathname}?blockId=${log.referencedBlock!.id}`, '_blank')}
                                            className="text-xs px-2 py-1"
                                        >
                                            Open →
                                        </Button>
                                    </div>
                                    <div className="text-xs space-y-1">
                                        <div><strong>Name:</strong> {log.referencedBlock.name}</div>
                                        <div>
                                            <strong>Duration:</strong> {LogService.formatDuration(log.referencedBlock.startTime, log.referencedBlock.endTime)}
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center gap-4 text-xs text-gray-500">
                                <span>ID: <code className="bg-gray-100 px-1 rounded">{log.id.slice(0, 8)}...</code></span>
                                {hasChildren && <span>{log.children.length} children</span>}
                            </div>
                        </div>
                    </div>
                </div>

                {hasChildren && isExpanded && (
                    <div className="ml-6">
                        {log.children.map(child => (
                            <LogEntryComponent key={child.id} log={child} depth={depth + 1} />
                        ))}
                    </div>
                )}
            </div>
        );
    };

    if (!state.blockId) {
        return (
            <div className="min-h-screen bg-gray-50">
                <EmptyState icon="⚠️" title="Block ID Required" message="Block ID parameter is required" />
            </div>
        );
    }

    const controls = (
        <>
            <select value={state.maxDepth} onChange={(e) => updateState({ maxDepth: parseInt(e.target.value) })}
                    className="border border-gray-300 rounded px-2 py-1 text-sm">
                {[1, 2, 3, 5, 10].map(depth => <option key={depth} value={depth}>Depth: {depth}</option>)}
            </select>
            <select value={state.maxChildren} onChange={(e) => updateState({ maxChildren: parseInt(e.target.value) })}
                    className="border border-gray-300 rounded px-2 py-1 text-sm">
                {[10, 25, 50, 100].map(count => <option key={count} value={count}>Children: {count}</option>)}
            </select>
            <Button onClick={fetchLogs} disabled={state.loading}>🔄 Refresh</Button>
        </>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            <PageHeader
                title="Log Viewer"
                backTo={{ path: '/blocks', label: 'Back to Blocks' }}
                subtitle={`Block ID: ${state.blockId}`}
                actions={controls}
            />

            {state.loading && !state.logs.length && <LoadingSpinner text="Loading logs..." />}
            {state.error && !state.logs.length && (
                <EmptyState
                    icon="⚠️"
                    title="Error Loading Logs"
                    message={state.error}
                    action={<Button variant="danger" onClick={fetchLogs}>Try Again</Button>}
                />
            )}
            {!state.loading && !state.error && !state.logs.length && (
                <EmptyState icon="📝" title="No Logs Found" message="No logs found for this block." />
            )}

            {state.logs.length > 0 && (
                <>
                    <div className="bg-gray-50 border-b border-gray-200 p-3">
                        <div className="max-w-7xl mx-auto flex items-center gap-4 text-sm">
                            <span className="text-gray-600">Quick Actions:</span>
                            <button onClick={() => {
                                const allIds = new Set<string>();
                                const collectIds = (logs: LogEntry[]) => {
                                    logs.forEach(log => {
                                        if (log.children.length > 0) {
                                            allIds.add(log.id);
                                            collectIds(log.children);
                                        }
                                    });
                                };
                                collectIds(state.logs);
                                updateState({ expandedNodes: allIds });
                            }} className="text-blue-600 hover:underline">Expand All</button>
                            <button onClick={() => updateState({ expandedNodes: new Set() })}
                                    className="text-blue-600 hover:underline">Collapse All</button>
                        </div>
                    </div>

                    <div className="max-w-7xl mx-auto p-6">
                        {state.logs.map(log => <LogEntryComponent key={log.id} log={log} />)}
                    </div>
                </>
            )}
        </div>
    );
};

export default LogViewerPage;