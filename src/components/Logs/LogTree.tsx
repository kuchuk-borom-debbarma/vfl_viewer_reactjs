import React, { useState, memo, useMemo } from 'react';
import { LogEntry, Block, LogType } from '../../types';
import { LoadingButton } from '../UI/LoadingButton';
import {
    getTrimmedId,
    truncate,
    calculateDuration,
    formatDuration
} from '../../utils';

export type ViewMode = 'tree' | 'timeline' | 'performance';

interface LogTreeProps {
    logs: LogEntry[];
    block?: Block;
    depth?: number;
    keyPrefix?: string;
    parentTimestamp?: number;
    collapsed: Set<string>;
    loadingReferenced: Set<string>;
    referencedBlockData: Record<string, LogEntry[]>;
    loadingMoreReferenced: Set<string>;
    hasMoreReferencedLogs: Record<string, boolean>;
    viewMode?: ViewMode;
    onToggleExpand: (log: LogEntry) => void;
    onNavigateToBlock?: (block: Block) => void;
    onLoadMoreReferenced: (logId: string, blockId: string) => void;
}

// Enhanced color scheme
const LOG_TYPE_STYLES = {
    [LogType.TRACE_PRIMARY]: {
        bg: 'bg-green-50',
        border: 'border-green-300',
        badge: 'bg-green-500',
        text: 'text-green-700',
        icon: '▶'
    },
    [LogType.TRACE_PARALLEL]: {
        bg: 'bg-blue-50',
        border: 'border-blue-300',
        badge: 'bg-blue-500',
        text: 'text-blue-700',
        icon: '⇄'
    },
    [LogType.TRACE_REMOTE]: {
        bg: 'bg-cyan-50',
        border: 'border-cyan-300',
        badge: 'bg-cyan-500',
        text: 'text-cyan-700',
        icon: '🌐'
    },
    [LogType.INFO]: {
        bg: 'bg-gray-50',
        border: 'border-gray-300',
        badge: 'bg-gray-500',
        text: 'text-gray-700',
        icon: 'ℹ'
    },
    [LogType.WARN]: {
        bg: 'bg-yellow-50',
        border: 'border-yellow-300',
        badge: 'bg-yellow-500',
        text: 'text-yellow-700',
        icon: '⚠'
    },
    [LogType.ERROR]: {
        bg: 'bg-red-50',
        border: 'border-red-300',
        badge: 'bg-red-500',
        text: 'text-red-700',
        icon: '✕'
    },
    [LogType.PUBLISH_EVENT]: {
        bg: 'bg-orange-50',
        border: 'border-orange-300',
        badge: 'bg-orange-500',
        text: 'text-orange-700',
        icon: '📢'
    },
    [LogType.LISTEN_EVENT]: {
        bg: 'bg-pink-50',
        border: 'border-pink-300',
        badge: 'bg-pink-500',
        text: 'text-pink-700',
        icon: '🎧'
    },
    [LogType.TRACE_PARALLEL_JOIN]: {
        bg: 'bg-purple-50',
        border: 'border-purple-300',
        badge: 'bg-purple-500',
        text: 'text-purple-700',
        icon: '↤'
    }
};

const EnhancedLogCard = memo<{
    log: LogEntry;
    collapsed: boolean;
    loadingReferenced: boolean;
    onToggleExpand?: () => void;
    onNavigateToBlock?: (block: Block) => void;
    parentTimestamp?: number;
    depth: number;
}>(({ log, collapsed, loadingReferenced, onToggleExpand, onNavigateToBlock, parentTimestamp, depth }) => {
    const [showDetails, setShowDetails] = useState(false);
    const { referencedBlock: ref } = log;

    const style = LOG_TYPE_STYLES[log.logType] || LOG_TYPE_STYLES[LogType.INFO];
    const duration = ref ? (ref.exitedAt || Date.now()) - (ref.enteredAt || ref.createdAt) : 0;

    const handleExpandClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        ref && onToggleExpand?.();
    };

    const handleBlockCardClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        ref && onNavigateToBlock?.(ref);
    };

    const toggleDetails = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowDetails(!showDetails);
    };

    return (
        <div className="mb-3">
            <div
                className={`relative flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${style.bg} ${style.border} hover:shadow-md cursor-pointer`}
                onClick={toggleDetails}
            >
                {/* Collapse Toggle */}
                {ref && (
                    <button
                        onClick={handleExpandClick}
                        className={`flex-shrink-0 p-1 hover:bg-white rounded transition-all ${
                            loadingReferenced ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        disabled={loadingReferenced}
                    >
                        {loadingReferenced ? (
                            <span className="text-gray-400">⋯</span>
                        ) : collapsed ? (
                            <span className="text-gray-600">▶</span>
                        ) : (
                            <span className="text-gray-600">▼</span>
                        )}
                    </button>
                )}

                {/* Icon */}
                <div className={`flex-shrink-0 w-10 h-10 rounded-lg ${style.badge} flex items-center justify-center text-white text-lg`}>
                    {style.icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={`px-2 py-0.5 text-xs font-semibold rounded ${style.badge} text-white`}>
                            {log.logType.replace(/_/g, ' ')}
                        </span>
                        {ref && (
                            <span className="text-xs text-gray-600 font-mono bg-white px-2 py-1 rounded border">
                                {ref.name}
                            </span>
                        )}
                        <span className="text-xs text-gray-500 font-mono">
                            {getTrimmedId(log.id)}
                        </span>
                        {parentTimestamp && (
                            <span className="text-xs text-gray-500">
                                {calculateDuration(log, parentTimestamp)}
                            </span>
                        )}
                    </div>
                    <div className={`text-sm font-medium ${style.text}`}>
                        {truncate(log.message || "(no message)", 100)}
                    </div>
                </div>

                {/* Duration Badge */}
                {duration > 0 && (
                    <div className="flex-shrink-0 flex items-center gap-2 px-3 py-2 bg-white rounded-lg border-2 border-gray-200">
                        <span className="text-xs text-gray-500">⏱️</span>
                        <span className="text-sm font-bold text-gray-800">
                            {formatDuration(ref!.enteredAt || ref!.createdAt, ref!.exitedAt)}
                        </span>
                    </div>
                )}

                {/* Timestamp */}
                <div className="flex-shrink-0 text-xs text-gray-500">
                    {new Date(log.timestamp).toLocaleTimeString()}
                </div>

                {/* Expand Details Button */}
                <button
                    onClick={toggleDetails}
                    className="flex-shrink-0 w-6 h-6 flex items-center justify-center hover:bg-white rounded transition-colors text-gray-400 hover:text-gray-600"
                >
                    {showDetails ? "−" : "+"}
                </button>
            </div>

            {/* Expanded Details */}
            {showDetails && (
                <div className="mt-2 p-4 bg-white border-2 border-gray-200 rounded-lg text-sm" onClick={e => e.stopPropagation()}>
                    <div className="grid grid-cols-2 gap-4 mb-3">
                        <div>
                            <span className="text-gray-500 font-medium">Type:</span>
                            <span className="ml-2 font-mono text-xs">{log.logType.replace(/_/g, ' ')}</span>
                        </div>
                        <div>
                            <span className="text-gray-500 font-medium">Block ID:</span>
                            <span className="ml-2 font-mono text-xs">{getTrimmedId(log.blockId)}</span>
                        </div>
                        {log.parentLogId && (
                            <div className="col-span-2">
                                <span className="text-gray-500 font-medium">Parent Log:</span>
                                <span className="ml-2 font-mono text-xs">{getTrimmedId(log.parentLogId)}</span>
                            </div>
                        )}
                    </div>
                    {log.message && log.message.length > 100 && (
                        <div className="mt-3 p-3 bg-gray-50 rounded text-xs text-gray-700 leading-relaxed">
                            {log.message}
                        </div>
                    )}
                </div>
            )}

            {/* Referenced Block Card */}
            {ref && (
                <DetailedReferencedBlockCard
                    block={ref}
                    onClick={handleBlockCardClick}
                    className="mt-3"
                />
            )}
        </div>
    );
});

const DetailedReferencedBlockCard: React.FC<{
    block: Block;
    onClick: (e: React.MouseEvent) => void;
    className?: string;
}> = ({ block, onClick, className = '' }) => {
    const [expanded, setExpanded] = useState(false);

    const getLifecycleStage = () => {
        if (!block.enteredAt) return { stage: 'Created', color: 'bg-blue-100 text-blue-700 border-blue-200' };
        if (!block.exitedAt) return { stage: 'Executing', color: 'bg-amber-100 text-amber-700 border-amber-200' };
        if (!block.returnedAt) return { stage: 'Finished', color: 'bg-purple-100 text-purple-700 border-purple-200' };
        return { stage: 'Returned', color: 'bg-green-100 text-green-700 border-green-200' };
    };

    const lifecycle = getLifecycleStage();

    return (
        <div
            className={`bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-lg p-4 hover:shadow-md transition-all ${className}`}
        >
            {/* Header */}
            <div
                onClick={onClick}
                className="flex items-center justify-between mb-3 hover:bg-white hover:bg-opacity-50 rounded-lg p-2 -m-2 cursor-pointer"
            >
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 flex items-center justify-center bg-blue-500 text-white rounded-lg text-sm font-bold">
                        🔗
                    </div>
                    <div>
                        <div className="font-semibold text-blue-800 text-sm">{block.name}</div>
                        <div className="text-xs text-gray-600 font-mono">
                            {getTrimmedId(block.id)} • {formatDuration(block.createdAt, block.returnedAt || block.exitedAt || Date.now())}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className={`px-2 py-1 rounded-lg text-xs font-medium border ${lifecycle.color}`}>
                        {lifecycle.stage}
                    </div>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setExpanded(!expanded);
                        }}
                        className="w-6 h-6 flex items-center justify-center hover:bg-white rounded transition-colors text-gray-500 hover:text-gray-700"
                    >
                        {expanded ? "−" : "+"}
                    </button>
                </div>
            </div>

            {/* Expanded Timeline */}
            {expanded && (
                <div className="mt-3 pt-3 border-t border-blue-200">
                    <div className="space-y-2 text-xs">
                        <div className="flex justify-between items-center p-2 bg-white rounded">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                                <span className="text-gray-600 font-medium">Created</span>
                            </div>
                            <span className="text-gray-800 font-mono">
                                {new Date(block.createdAt).toLocaleTimeString()}
                            </span>
                        </div>

                        {block.enteredAt && (
                            <div className="flex justify-between items-center p-2 bg-white rounded">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                    <span className="text-gray-600 font-medium">Entered</span>
                                </div>
                                <div className="text-right">
                                    <div className="text-gray-800 font-mono">
                                        {new Date(block.enteredAt).toLocaleTimeString()}
                                    </div>
                                    <div className="text-gray-500 text-xs">
                                        +{formatDuration(block.createdAt, block.enteredAt)}
                                    </div>
                                </div>
                            </div>
                        )}

                        {block.exitedAt && (
                            <div className="flex justify-between items-center p-2 bg-white rounded">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                                    <span className="text-gray-600 font-medium">Exited</span>
                                </div>
                                <div className="text-right">
                                    <div className="text-gray-800 font-mono">
                                        {new Date(block.exitedAt).toLocaleTimeString()}
                                    </div>
                                    <div className="text-gray-500 text-xs">
                                        +{formatDuration(block.enteredAt || block.createdAt, block.exitedAt)}
                                    </div>
                                </div>
                            </div>
                        )}

                        {block.returnedAt && (
                            <div className="flex justify-between items-center p-2 bg-white rounded">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                                    <span className="text-gray-600 font-medium">Returned</span>
                                </div>
                                <div className="text-right">
                                    <div className="text-gray-800 font-mono">
                                        {new Date(block.returnedAt).toLocaleTimeString()}
                                    </div>
                                    <div className="text-gray-500 text-xs">
                                        +{formatDuration(block.exitedAt || block.enteredAt || block.createdAt, block.returnedAt)}
                                    </div>
                                </div>
                            </div>
                        )}

                        {block.exitMessage && (
                            <div className="mt-2 p-2 bg-white rounded border border-blue-200">
                                <div className="text-gray-500 font-medium mb-1">Exit Message</div>
                                <div className="text-gray-700">
                                    {block.exitMessage.length > 80
                                        ? `${block.exitMessage.slice(0, 80)}...`
                                        : block.exitMessage}
                                </div>
                            </div>
                        )}

                        {block.enteredAt && block.exitedAt && (
                            <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
                                <div className="flex justify-between items-center">
                                    <span className="text-blue-700 font-medium">Execution Time</span>
                                    <span className="text-blue-800 font-mono font-semibold">
                                        {formatDuration(block.enteredAt, block.exitedAt)}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Navigation hint */}
            <div
                onClick={onClick}
                className="mt-2 text-xs text-center text-blue-600 hover:text-blue-700 transition-colors cursor-pointer py-1 hover:bg-white hover:bg-opacity-50 rounded"
            >
                Click to navigate to block →
            </div>
        </div>
    );
};

EnhancedLogCard.displayName = 'EnhancedLogCard';

export const LogTree: React.FC<LogTreeProps> = ({
                                                    logs,
                                                    block,
                                                    depth = 0,
                                                    keyPrefix = "root",
                                                    parentTimestamp,
                                                    collapsed,
                                                    loadingReferenced,
                                                    referencedBlockData,
                                                    loadingMoreReferenced,
                                                    hasMoreReferencedLogs,
                                                    viewMode = 'tree',
                                                    onToggleExpand,
                                                    onNavigateToBlock,
                                                    onLoadMoreReferenced
                                                }) => {
    if (!logs || logs.length === 0) return null;

    // Build child map using parentLogId
    const childMap = useMemo(() => {
        const map = new Map<string | null, LogEntry[]>();
        logs.forEach(log => {
            const parentId = log.parentLogId || null;
            if (!map.has(parentId)) {
                map.set(parentId, []);
            }
            map.get(parentId)!.push(log);
        });
        return map;
    }, [logs]);

    const renderSingleLog = (log: LogEntry, containerKey: string, currentParentTimestamp?: number): React.ReactNode[] => {
        const result: React.ReactNode[] = [];
        const isCollapsed = collapsed.has(log.id);
        const isLoadingReferenced = loadingReferenced.has(log.id);

        // Main log card
        result.push(
            <EnhancedLogCard
                key={`${containerKey}-${log.id}`}
                log={log}
                collapsed={isCollapsed}
                loadingReferenced={isLoadingReferenced}
                onToggleExpand={() => log.referencedBlock && onToggleExpand(log)}
                onNavigateToBlock={onNavigateToBlock}
                parentTimestamp={currentParentTimestamp}
                depth={depth}
            />
        );

        // Referenced block content
        if (log.referencedBlock && !isCollapsed && referencedBlockData[log.id]) {
            result.push(
                <div key={`${containerKey}-ref-${log.id}`} className="ml-8 mt-2 mb-4 relative border-l-4 border-blue-300 pl-6">
                    <div className="absolute -left-8 top-0 w-6 h-8 border-b-4 border-blue-300 rounded-bl-lg"></div>

                    <div className="mb-3 flex items-center gap-2 bg-blue-100 text-blue-800 rounded-lg px-3 py-2 text-sm font-semibold">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span>{log.referencedBlock.name}</span>
                        <span className="text-blue-600">({referencedBlockData[log.id].length} logs)</span>
                    </div>

                    <LogTree
                        logs={referencedBlockData[log.id]}
                        block={block}
                        depth={depth + 1}
                        keyPrefix={`${containerKey}-ref-${log.id}`}
                        parentTimestamp={log.timestamp}
                        collapsed={collapsed}
                        loadingReferenced={loadingReferenced}
                        referencedBlockData={referencedBlockData}
                        loadingMoreReferenced={loadingMoreReferenced}
                        hasMoreReferencedLogs={hasMoreReferencedLogs}
                        viewMode={viewMode}
                        onToggleExpand={onToggleExpand}
                        onNavigateToBlock={onNavigateToBlock}
                        onLoadMoreReferenced={onLoadMoreReferenced}
                    />

                    <div className="mt-2">
                        <LoadingButton
                            onClick={() => onLoadMoreReferenced(log.id, log.referencedBlock!.id)}
                            loading={loadingMoreReferenced.has(log.id)}
                            hasMore={hasMoreReferencedLogs[log.id] !== false}
                            label="Load more"
                            icon="+"
                            variant="outline"
                            size="sm"
                        />
                    </div>
                </div>
            );
        }

        // Sequential children
        const children = childMap.get(log.id) || [];
        result.push(...renderFlatList(log.id, `${containerKey}-seq`));

        return result;
    };

    const renderFlatList = (parentId: string | null, containerKey: string): React.ReactNode[] => {
        const siblings = (childMap.get(parentId) || []).sort((a, b) => a.timestamp - b.timestamp);

        if (siblings.length === 0) return [];

        // Multiple siblings = parallel operations
        if (siblings.length > 1) {
            return [
                <div key={`${containerKey}-parallel-wrapper`} className="mb-6">
                    <div className="flex items-center mb-4 text-sm">
                        <div className="w-8 h-px bg-purple-300"></div>
                        <div className="mx-3 bg-purple-100 text-purple-700 px-4 py-2 rounded-full border-2 border-purple-300 font-semibold">
                            ⇄ {siblings.length} PARALLEL OPERATIONS
                        </div>
                        <div className="flex-1 h-px bg-purple-300"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {siblings.map((siblingLog, idx) => (
                            <div
                                key={`${containerKey}-parallel-${idx}`}
                                className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4"
                            >
                                <div className="text-xs text-purple-700 font-semibold mb-3 text-center">
                                    Branch {idx + 1}
                                </div>

                                <div className="space-y-2">
                                    {renderSingleLog(
                                        siblingLog,
                                        `${containerKey}-parallel-${idx}`,
                                        parentTimestamp
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ];
        }

        // Single child = sequential
        const result: React.ReactNode[] = [];
        siblings.forEach((log, index) => {
            const currentParentTimestamp = index > 0 ? siblings[index - 1].timestamp : parentTimestamp;
            result.push(...renderSingleLog(log, `${containerKey}-seq-${index}`, currentParentTimestamp));
        });

        return result;
    };

    return <div className="space-y-2">{renderFlatList(null, keyPrefix)}</div>;
};

// Timeline View Component
export const TimelineView: React.FC<{ logs: LogEntry[]; block: Block }> = ({ logs, block }) => {
    const startTime = block.enteredAt || block.createdAt;
    const endTime = block.exitedAt || Date.now();
    const totalDuration = endTime - startTime;

    const referencedLogs = logs.filter(l => l.referencedBlock);

    return (
        <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <span className="text-xl">⏱️</span>
                    Timeline Visualization
                </h3>
                <span className="text-sm text-gray-600">
                    Total: {formatDuration(startTime, endTime)}
                </span>
            </div>

            <div className="space-y-4">
                {referencedLogs.map(log => {
                    const logStart = (log.referencedBlock!.enteredAt || log.referencedBlock!.createdAt) - startTime;
                    const logEnd = (log.referencedBlock!.exitedAt || Date.now()) - startTime;
                    const duration = logEnd - logStart;
                    const startPercent = (logStart / totalDuration) * 100;
                    const widthPercent = (duration / totalDuration) * 100;
                    const style = LOG_TYPE_STYLES[log.logType] || LOG_TYPE_STYLES[LogType.INFO];

                    return (
                        <div key={log.id} className="relative">
                            <div className="flex items-center gap-3 mb-2">
                                <div className={`w-8 h-8 rounded-lg ${style.badge} flex items-center justify-center text-white text-sm`}>
                                    {style.icon}
                                </div>
                                <span className="text-sm font-medium text-gray-700 flex-1 truncate">
                                    {log.referencedBlock!.name}
                                </span>
                                <span className="text-xs text-gray-500 font-mono">
                                    {formatDuration(log.referencedBlock!.enteredAt || log.referencedBlock!.createdAt, log.referencedBlock!.exitedAt)}
                                </span>
                            </div>
                            <div className="h-10 bg-gray-100 rounded-lg relative overflow-hidden">
                                <div
                                    className={`absolute h-full ${style.badge} opacity-80 hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center`}
                                    style={{
                                        left: `${startPercent}%`,
                                        width: `${widthPercent}%`
                                    }}
                                    title={`${log.referencedBlock!.name}: ${formatDuration(log.referencedBlock!.enteredAt || log.referencedBlock!.createdAt, log.referencedBlock!.exitedAt)}`}
                                >
                                    <span className="text-xs font-semibold text-white">
                                        {widthPercent > 10 ? formatDuration(log.referencedBlock!.enteredAt || log.referencedBlock!.createdAt, log.referencedBlock!.exitedAt) : ''}
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {referencedLogs.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                    <div className="text-2xl mb-2">📊</div>
                    <div className="text-sm">No timed operations to display in timeline</div>
                </div>
            )}
        </div>
    );
};

// Performance View Component
export const PerformanceView: React.FC<{ logs: LogEntry[]; block: Block }> = ({ logs, block }) => {
    const totalDuration = (block.exitedAt || Date.now()) - (block.enteredAt || block.createdAt);

    const operations = logs
        .filter(l => l.referencedBlock)
        .map(log => ({
            name: log.referencedBlock!.name,
            duration: (log.referencedBlock!.exitedAt || Date.now()) - (log.referencedBlock!.enteredAt || log.referencedBlock!.createdAt),
            percentage: (((log.referencedBlock!.exitedAt || Date.now()) - (log.referencedBlock!.enteredAt || log.referencedBlock!.createdAt)) / totalDuration * 100).toFixed(1),
            logType: log.logType
        }))
        .sort((a, b) => b.duration - a.duration);

    const slowest = operations[0];

    return (
        <div className="space-y-4">
            {/* Bottleneck Detection */}
            {slowest && (
                <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="text-2xl">⚠️</span>
                        <span className="font-semibold text-red-800 text-lg">Slowest Operation Detected</span>
                    </div>
                    <div className="text-sm text-red-700">
                        <div className="font-medium text-base mb-1">{slowest.name}</div>
                        <div>Takes {formatDuration(0, slowest.duration)} ({slowest.percentage}% of total time)</div>
                    </div>
                </div>
            )}

            {/* Operation Breakdown */}
            <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <span className="text-xl">📊</span>
                    Performance Insights
                </h3>

                <div className="space-y-4">
                    <h4 className="font-semibold text-gray-700">Execution Time Breakdown</h4>
                    {operations.map((op, idx) => {
                        const style = LOG_TYPE_STYLES[op.logType] || LOG_TYPE_STYLES[LogType.INFO];
                        return (
                            <div key={idx} className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-lg ${style.badge} flex items-center justify-center text-white text-xs flex-shrink-0`}>
                                    {style.icon}
                                </div>
                                <div className="w-40 text-sm font-medium text-gray-700 truncate flex-shrink-0">
                                    {op.name}
                                </div>
                                <div className="flex-1 h-10 bg-gray-100 rounded-lg relative overflow-hidden">
                                    <div
                                        className={`absolute h-full ${style.badge} transition-all`}
                                        style={{ width: `${op.percentage}%` }}
                                    />
                                    <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-gray-800">
                                        {op.percentage}%
                                    </span>
                                </div>
                                <div className="w-24 text-sm text-gray-600 text-right font-mono flex-shrink-0">
                                    {formatDuration(0, op.duration)}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {operations.length === 0 && (
                    <div className="text-center text-gray-500 py-8">
                        <div className="text-2xl mb-2">📈</div>
                        <div className="text-sm">No operations to analyze</div>
                    </div>
                )}
            </div>

            {/* Detailed Metrics */}
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
                <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                    <span className="text-xl">✓</span>
                    Detailed Metrics
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                        <div className="text-green-700">✓ Duration per block with millisecond precision</div>
                        <div className="text-green-700">✓ Percentage breakdown of total execution time</div>
                        <div className="text-green-700">✓ Parent-child time relationship analysis</div>
                    </div>
                    <div className="flex items-center justify-center">
                        <div className="text-center p-4 bg-white rounded-lg border-2 border-green-300">
                            <div className="text-3xl font-bold text-green-600 mb-1">
                                {formatDuration(block.enteredAt || block.createdAt, block.exitedAt)}
                            </div>
                            <div className="text-xs text-green-700 font-medium">Total Execution Time</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};