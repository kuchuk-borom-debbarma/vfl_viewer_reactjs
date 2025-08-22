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

const MinimalLogCard = memo<{
    log: LogEntry;
    collapsed: boolean;
    loadingReferenced: boolean;
    onToggleExpand?: () => void;
    onNavigateToBlock?: (block: Block) => void;
    parentTimestamp?: number;
}>(({ log, collapsed, loadingReferenced, onToggleExpand, onNavigateToBlock, parentTimestamp }) => {
    const [showDetails, setShowDetails] = useState(false);
    const { referencedBlock: ref } = log;

    const getLogTypeTheme = (logType: string) => {
        const themes = {
            'SUB_BLOCK_START_PRIMARY': {
                bg: 'bg-slate-50',
                border: 'border-slate-200 hover:border-slate-300',
                accent: 'text-slate-700',
                icon: '▶'
            },
            'SUB_BLOCK_START_SECONDARY_NO_JOIN': {
                bg: 'bg-blue-50',
                border: 'border-blue-200 hover:border-blue-300',
                accent: 'text-blue-700',
                icon: '↗'
            },
            'SUB_BLOCK_START_SECONDARY_JOIN': {
                bg: 'bg-purple-50',
                border: 'border-purple-200 hover:border-purple-300',
                accent: 'text-purple-700',
                icon: '⤴'
            },
            'PUBLISH_EVENT': {
                bg: 'bg-amber-50',
                border: 'border-amber-200 hover:border-amber-300',
                accent: 'text-amber-700',
                icon: '→'
            },
            'SUB_BLOCK_CONTINUE': {
                bg: 'bg-indigo-50',
                border: 'border-indigo-200 hover:border-indigo-300',
                accent: 'text-indigo-700',
                icon: '↓'
            },
            'SUB_BLOCK_CONTINUE_COMPLETE': {
                bg: 'bg-emerald-50',
                border: 'border-emerald-200 hover:border-emerald-300',
                accent: 'text-emerald-700',
                icon: '✓'
            },
            'EVENT_LISTENER': {
                bg: 'bg-rose-50',
                border: 'border-rose-200 hover:border-rose-300',
                accent: 'text-rose-700',
                icon: '◉'
            },
            'MESSAGE': {
                bg: 'bg-gray-50',
                border: 'border-gray-200 hover:border-gray-300',
                accent: 'text-gray-700',
                icon: '·'
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
            }
        };
        return themes[logType] || themes['MESSAGE'];
    };

    const theme = getLogTypeTheme(log.logType);

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
                className={`${theme.bg} ${theme.border} border rounded-lg p-4 hover:shadow-sm transition-all duration-200 cursor-pointer group`}
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
                        {theme.icon}
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
                        <div className={`font-medium ${theme.accent} truncate`}>
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
                        </div>
                        {log.message && log.message.length > 100 && (
                            <div className="mt-3 p-3 bg-gray-50 rounded text-xs text-gray-600">
                                {log.message}
                            </div>
                        )}
                    </div>
                )}

                {ref && (
                    <MinimalReferencedBlockCard
                        block={ref}
                        onClick={handleBlockCardClick}
                        className="mt-4"
                    />
                )}
            </div>
        </div>
    );
});

const MinimalReferencedBlockCard: React.FC<{
    block: Block;
    onClick: (e: React.MouseEvent) => void;
    className?: string;
}> = ({ block, onClick, className = '' }) => (
    <div
        onClick={onClick}
        className={`bg-blue-50 border border-blue-200 hover:border-blue-300 rounded-lg p-3 cursor-pointer hover:shadow-sm transition-all duration-200 ${className}`}
    >
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <div className="w-6 h-6 flex items-center justify-center bg-blue-100 rounded text-blue-600 text-sm">
                    ↗
                </div>
                <div>
                    <div className="font-medium text-gray-800 text-sm">{block.name}</div>
                    <div className="text-xs text-gray-500">
                        {getTrimmedId(block.id)} • {formatDuration(block.startTime, block.endTime)}
                    </div>
                </div>
            </div>
            <div className="text-blue-400 group-hover:text-blue-600">→</div>
        </div>
    </div>
);

MinimalLogCard.displayName = 'MinimalLogCard';

// FIXED: Properly implementing side-by-side siblings
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

    // Build child map following the flat-list algorithm
    const childMap = new Map<string | null, LogEntry[]>();

    logs.forEach(log => {
        if (!childMap.has(log.parentLogId)) {
            childMap.set(log.parentLogId, []);
        }
        childMap.get(log.parentLogId)!.push(log);
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
            />
        );

        // 2. Handle referenced block (nested content)
        if (log.referencedBlock && !isCollapsed && referencedBlockData[log.id]) {
            result.push(
                <div key={`${containerKey}-ref-${log.id}`} className="ml-8 mt-2 mb-4 relative">
                    <div className="absolute -left-4 top-0 w-4 h-6 border-l border-b border-gray-200 rounded-bl"></div>

                    <div className="mb-3 text-xs text-gray-500 flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-200 rounded-full"></div>
                        <span>{log.referencedBlock.name}</span>
                        <span className="text-gray-400">({referencedBlockData[log.id].length} logs)</span>
                    </div>

                    <div className="pl-4 border-l border-gray-100">
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
                    </div>

                    <div className="pl-4 mt-2">
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

        // FIXED: Handle multiple siblings - render them side by side
        if (siblings.length > 1) {
            return [
                <div key={`${containerKey}-parallel-wrapper`} className="mb-6">
                    <div className="flex items-center mb-4 text-xs text-gray-500">
                        <div className="w-4 h-px bg-gray-200"></div>
                        <div className="mx-3 bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
                            {siblings.length} parallel operations
                        </div>
                        <div className="flex-1 h-px bg-gray-200"></div>
                    </div>

                    {/* FIXED: Use horizontal flex layout for true side-by-side rendering */}
                    <div className="flex gap-6 overflow-x-auto pb-4">
                        {siblings.map((siblingLog, idx) => (
                            <div
                                key={`${containerKey}-parallel-${idx}`}
                                className="flex-shrink-0 min-w-[400px] bg-gray-50 border border-gray-200 rounded-lg p-4"
                            >
                                <div className="text-xs text-gray-500 mb-3 font-medium">
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
