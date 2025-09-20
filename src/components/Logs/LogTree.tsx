import React, { useState, memo } from 'react';
import { LogEntry, Block } from '../../types';
import { LoadingButton } from '../UI/LoadingButton';
import {
    getTrimmedId,
    truncate,
    calculateDuration,
    formatDuration
} from '../../utils';

interface LogTreeProps {
    logs: LogEntry[];
    depth?: number;
    keyPrefix?: string;
    parentTimestamp?: number;
    collapsed: Set<string>;
    loadingReferenced: Set<string>;
    referencedBlockData: Record<string, LogEntry[]>;
    loadingMoreReferenced: Set<string>;
    hasMoreReferencedLogs: Record<string, boolean>;
    onToggleExpand: (log: LogEntry) => void;
    onNavigateToBlock?: (block: Block) => void;
    onLoadMoreReferenced: (logId: string, blockId: string) => void;
}

// Color scheme for different nesting depths
const DEPTH_THEMES = [
    {
        bg: 'bg-gray-50',
        border: 'border-gray-200 hover:border-gray-300',
        accent: 'text-gray-700',
        refBg: 'bg-blue-50',
        refBorder: 'border-blue-200',
        refAccent: 'text-blue-700',
        divider: 'border-gray-200'
    },
    {
        bg: 'bg-blue-50',
        border: 'border-blue-200 hover:border-blue-300',
        accent: 'text-blue-700',
        refBg: 'bg-indigo-50',
        refBorder: 'border-indigo-200',
        refAccent: 'text-indigo-700',
        divider: 'border-blue-200'
    },
    {
        bg: 'bg-indigo-50',
        border: 'border-indigo-200 hover:border-indigo-300',
        accent: 'text-indigo-700',
        refBg: 'bg-purple-50',
        refBorder: 'border-purple-200',
        refAccent: 'text-purple-700',
        divider: 'border-indigo-200'
    },
    {
        bg: 'bg-purple-50',
        border: 'border-purple-200 hover:border-purple-300',
        accent: 'text-purple-700',
        refBg: 'bg-pink-50',
        refBorder: 'border-pink-200',
        refAccent: 'text-pink-700',
        divider: 'border-purple-200'
    },
    {
        bg: 'bg-pink-50',
        border: 'border-pink-200 hover:border-pink-300',
        accent: 'text-pink-700',
        refBg: 'bg-rose-50',
        refBorder: 'border-rose-200',
        refAccent: 'text-rose-700',
        divider: 'border-pink-200'
    }
];

const MinimalLogCard = memo<{
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

    const theme = DEPTH_THEMES[Math.min(depth, DEPTH_THEMES.length - 1)];

    const getLogTypeTheme = (logType: string) => {
        const themes = {
            'INFO': {
                bg: theme.bg,
                border: theme.border,
                accent: theme.accent,
                icon: 'ℹ'
            },
            'WARN': {
                bg: 'bg-orange-50',
                border: 'border-orange-200 hover:border-orange-300',
                accent: 'text-orange-700',
                icon: '⚠'
            },
            'ERROR': {
                bg: 'bg-red-50',
                border: 'border-red-200 hover:border-red-300',
                accent: 'text-red-700',
                icon: '✕'
            },
            'TRACE_PRIMARY': {
                bg: theme.bg,
                border: theme.border,
                accent: theme.accent,
                icon: '▶'
            },
            'TRACE_PARALLEL_JOIN': {
                bg: 'bg-purple-50',
                border: 'border-purple-200 hover:border-purple-300',
                accent: 'text-purple-700',
                icon: '↤'
            },
            'TRACE_PARALLEL': {
                bg: 'bg-blue-50',
                border: 'border-blue-200 hover:border-blue-300',
                accent: 'text-blue-700',
                icon: '↗'
            },
            'TRACE_REMOTE': {
                bg: 'bg-cyan-50',
                border: 'border-cyan-200 hover:border-cyan-300',
                accent: 'text-cyan-700',
                icon: '🌐'
            },
            'PUBLISH_EVENT': {
                bg: 'bg-amber-50',
                border: 'border-amber-200 hover:border-amber-300',
                accent: 'text-amber-700',
                icon: '📢'
            },
            'LISTEN_EVENT': {
                bg: 'bg-rose-50',
                border: 'border-rose-200 hover:border-rose-300',
                accent: 'text-rose-700',
                icon: '🎧'
            }
        };
        return themes[logType] || themes['INFO'];
    };

    const logTheme = getLogTypeTheme(log.logType);

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
        <div className="mb-2">
            <div
                className={`${logTheme.bg} ${logTheme.border} border rounded-lg p-4 hover:shadow-sm transition-all duration-200 cursor-pointer group`}
                onClick={toggleDetails}
            >
                <div className="flex items-center gap-3">
                    {ref && (
                        <button
                            onClick={handleExpandClick}
                            className={`w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-white rounded transition-all duration-200 ${
                                loadingReferenced ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                            disabled={loadingReferenced}
                        >
                            {loadingReferenced ? "⋯" : (collapsed ? "▶" : "▼")}
                        </button>
                    )}

                    <div className="w-8 h-8 flex items-center justify-center bg-white rounded border text-sm">
                        {logTheme.icon}
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs text-gray-500 font-mono">
                                {getTrimmedId(log.id)}
                            </span>
                            {parentTimestamp && (
                                <span className="text-xs text-gray-400">
                                    {calculateDuration(log, parentTimestamp)}
                                </span>
                            )}
                        </div>
                        <div className={`font-medium ${logTheme.accent} truncate`}>
                            {truncate(log.message || "(no message)", 100)}
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-gray-400">
                        <span>{log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : ""}</span>
                        <button
                            onClick={toggleDetails}
                            className="w-6 h-6 flex items-center justify-center hover:bg-white rounded transition-colors"
                        >
                            {showDetails ? "−" : "+"}
                        </button>
                    </div>
                </div>

                {showDetails && (
                    <div className="mt-4 pt-4 border-t border-gray-100 text-sm text-gray-600" onClick={e => e.stopPropagation()}>
                        <div className="grid grid-cols-2 gap-4 text-xs">
                            <div>
                                <span className="text-gray-400">Type:</span>
                                <span className="ml-2 font-mono">{log.logType.replace(/_/g, ' ').toLowerCase()}</span>
                            </div>
                            <div>
                                <span className="text-gray-400">Block:</span>
                                <span className="ml-2 font-mono">{getTrimmedId(log.blockId)}</span>
                            </div>
                            {log.parentLogId && (
                                <>
                                    <div>
                                        <span className="text-gray-400">Parent:</span>
                                        <span className="ml-2 font-mono">{getTrimmedId(log.parentLogId)}</span>
                                    </div>
                                    <div></div>
                                </>
                            )}
                        </div>
                        {log.message && log.message.length > 100 && (
                            <div className="mt-3 p-3 bg-gray-50 rounded text-xs text-gray-600">
                                {log.message}
                            </div>
                        )}
                    </div>
                )}

                {ref && (
                    <DetailedReferencedBlockCard
                        block={ref}
                        onClick={handleBlockCardClick}
                        className="mt-4"
                        theme={theme}
                    />
                )}
            </div>
        </div>
    );
});

const DetailedReferencedBlockCard: React.FC<{
    block: Block;
    onClick: (e: React.MouseEvent) => void;
    className?: string;
    theme: typeof DEPTH_THEMES[0];
}> = ({ block, onClick, className = '', theme }) => {
    const [expanded, setExpanded] = useState(false);

    const getLifecycleStage = () => {
        if (!block.enteredAt) return { stage: 'Created', color: 'bg-blue-100 text-blue-700' };
        if (!block.exitedAt) return { stage: 'Executing', color: 'bg-amber-100 text-amber-700' };
        if (!block.returnedAt) return { stage: 'Finished', color: 'bg-purple-100 text-purple-700' };
        return { stage: 'Returned', color: 'bg-green-100 text-green-700' };
    };

    const lifecycle = getLifecycleStage();

    return (
        <div
            className={`${theme.refBg} border ${theme.refBorder} hover:border-opacity-80 rounded-lg p-4 cursor-pointer hover:shadow-sm transition-all duration-200 ${className}`}
        >
            {/* Header */}
            <div
                onClick={onClick}
                className="flex items-center justify-between mb-3 hover:bg-white hover:bg-opacity-50 rounded p-2 -m-2"
            >
                <div className="flex items-center gap-3">
                    <div className="w-6 h-6 flex items-center justify-center bg-white rounded text-sm">
                        ↗
                    </div>
                    <div>
                        <div className={`font-semibold ${theme.refAccent} text-sm`}>{block.name}</div>
                        <div className="text-xs text-gray-500 font-mono">
                            {getTrimmedId(block.id)} • {formatDuration(block.createdAt, block.returnedAt || block.exitedAt || Date.now())}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className={`px-2 py-1 rounded text-xs font-medium ${lifecycle.color}`}>
                        {lifecycle.stage}
                    </div>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setExpanded(!expanded);
                        }}
                        className="w-6 h-6 flex items-center justify-center hover:bg-white rounded transition-colors text-gray-400 hover:text-gray-600"
                    >
                        {expanded ? "−" : "+"}
                    </button>
                </div>
            </div>

            {/* Expanded Details */}
            {expanded && (
                <div className="mt-3 pt-3 border-t border-opacity-30" style={{ borderColor: theme.refBorder.split('-')[1] }}>
                    <div className="grid grid-cols-1 gap-2 text-xs">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                                <span className="text-gray-600">Created</span>
                            </div>
                            <span className="text-gray-800 font-mono">
                                {new Date(block.createdAt).toLocaleTimeString()}
                            </span>
                        </div>

                        {block.enteredAt && (
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                    <span className="text-gray-600">Entered</span>
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
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                                    <span className="text-gray-600">Exited</span>
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
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                                    <span className="text-gray-600">Returned</span>
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
                            <div className="mt-2 p-2 bg-white bg-opacity-60 rounded border text-xs">
                                <div className="text-gray-500 font-medium mb-1">Exit Message</div>
                                <div className="text-gray-700">
                                    {block.exitMessage.length > 80
                                        ? `${block.exitMessage.slice(0, 80)}...`
                                        : block.exitMessage}
                                </div>
                            </div>
                        )}

                        {/* Special indicator for TRACE_REMOTE */}
                        {block.enteredAt && block.exitedAt && (
                            <div className="mt-2 p-2 bg-white bg-opacity-60 rounded border">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-gray-500 font-medium">Execution Time</span>
                                    <span className="text-gray-800 font-mono font-semibold">
                                        {formatDuration(block.enteredAt, block.exitedAt)}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Click indicator */}
            <div
                onClick={onClick}
                className="mt-2 text-xs text-center text-gray-500 hover:text-gray-700 transition-colors cursor-pointer py-1 hover:bg-white hover:bg-opacity-50 rounded"
            >
                Click to navigate to block →
            </div>
        </div>
    );
};

MinimalLogCard.displayName = 'MinimalLogCard';

// Updated to properly use parentLogId from backend
export const LogTree: React.FC<LogTreeProps> = ({
                                                    logs,
                                                    depth = 0,
                                                    keyPrefix = "root",
                                                    parentTimestamp,
                                                    collapsed,
                                                    loadingReferenced,
                                                    referencedBlockData,
                                                    loadingMoreReferenced,
                                                    hasMoreReferencedLogs,
                                                    onToggleExpand,
                                                    onNavigateToBlock,
                                                    onLoadMoreReferenced
                                                }) => {
    if (!logs || logs.length === 0) return null;

    const theme = DEPTH_THEMES[Math.min(depth, DEPTH_THEMES.length - 1)];

    // Build child map using the parentLogId provided by backend
    const childMap = new Map<string | null, LogEntry[]>();

    logs.forEach(log => {
        const parentId = log.parentLogId || null; // Use null for root-level logs
        if (!childMap.has(parentId)) {
            childMap.set(parentId, []);
        }
        childMap.get(parentId)!.push(log);
    });

    // Render a single log with its referenced content and sequential children
    const renderSingleLog = (log: LogEntry, containerKey: string, currentParentTimestamp?: number): React.ReactNode[] => {
        const result: React.ReactNode[] = [];
        const isCollapsed = collapsed.has(log.id);
        const isLoadingReferenced = loadingReferenced.has(log.id);

        // 1. Render the main log card
        result.push(
            <MinimalLogCard
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

        // 2. Handle referenced block (nested content)
        if (log.referencedBlock && !isCollapsed && referencedBlockData[log.id]) {
            result.push(
                <div key={`${containerKey}-ref-${log.id}`} className={`ml-8 mt-2 mb-4 relative border-l-2 ${theme.divider} pl-4`}>
                    <div className="absolute -left-6 top-0 w-4 h-6 border-b-2 border-gray-200 rounded-bl"></div>

                    <div className={`mb-3 text-xs ${theme.refAccent} flex items-center gap-2 bg-white bg-opacity-60 rounded px-2 py-1`}>
                        <div className={`w-2 h-2 ${theme.refBg.replace('bg-', 'bg-')} rounded-full`} style={{
                            backgroundColor: theme.refBorder.includes('blue') ? '#3b82f6' :
                                theme.refBorder.includes('indigo') ? '#6366f1' :
                                    theme.refBorder.includes('purple') ? '#8b5cf6' :
                                        theme.refBorder.includes('pink') ? '#ec4899' : '#3b82f6'
                        }}></div>
                        <span className="font-medium">{log.referencedBlock.name}</span>
                        <span className="text-gray-400">({referencedBlockData[log.id].length} logs)</span>
                    </div>

                    <LogTree
                        logs={referencedBlockData[log.id]}
                        depth={depth + 1}
                        keyPrefix={`${containerKey}-ref-${log.id}`}
                        parentTimestamp={log.timestamp}
                        collapsed={collapsed}
                        loadingReferenced={loadingReferenced}
                        referencedBlockData={referencedBlockData}
                        loadingMoreReferenced={loadingMoreReferenced}
                        hasMoreReferencedLogs={hasMoreReferencedLogs}
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

        // 3. Handle sequential children (they continue at the SAME level)
        const children = childMap.get(log.id) || [];
        result.push(...renderFlatList(log.id, `${containerKey}-seq`));

        return result;
    };

    // Recursive render function following flat-list rules
    const renderFlatList = (parentId: string | null, containerKey: string): React.ReactNode[] => {
        const siblings = (childMap.get(parentId) || []).sort((a, b) => a.timestamp - b.timestamp);

        if (siblings.length === 0) return [];

        // Handle multiple siblings - render them side by side
        if (siblings.length > 1) {
            return [
                <div key={`${containerKey}-parallel-wrapper`} className="mb-6">
                    <div className={`flex items-center mb-4 text-xs ${theme.accent}`}>
                        <div className={`w-4 h-px ${theme.divider.replace('border-', 'bg-')}`}></div>
                        <div className={`mx-3 ${theme.bg} ${theme.refAccent} px-3 py-1 rounded-full border ${theme.border}`}>
                            {siblings.length} parallel operations
                        </div>
                        <div className={`flex-1 h-px ${theme.divider.replace('border-', 'bg-')}`}></div>
                    </div>

                    {/* Use horizontal flex layout for true side-by-side rendering */}
                    <div className="flex gap-6 overflow-x-auto pb-4">
                        {siblings.map((siblingLog, idx) => (
                            <div
                                key={`${containerKey}-parallel-${idx}`}
                                className={`flex-shrink-0 min-w-[400px] ${theme.bg} border ${theme.border} rounded-lg p-4`}
                            >
                                <div className={`text-xs ${theme.refAccent} mb-3 font-medium`}>
                                    Branch {idx + 1}
                                </div>

                                {/* Render this sibling and all its sequential descendants */}
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

        // Handle single child (sequential flow)
        const result: React.ReactNode[] = [];
        siblings.forEach((log, index) => {
            const currentParentTimestamp = index > 0 ? siblings[index - 1].timestamp : parentTimestamp;
            result.push(...renderSingleLog(log, `${containerKey}-seq-${index}`, currentParentTimestamp));
        });

        return result;
    };

    // Start rendering from root level (parentLogId = null)
    return <div className="space-y-2">{renderFlatList(null, keyPrefix)}</div>;
};