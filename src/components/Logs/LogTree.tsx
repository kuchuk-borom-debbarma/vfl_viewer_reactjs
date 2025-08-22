import React, { useState, memo } from 'react';
import { LogEntry, Block } from '../../types';
import { Card } from '../UI/Card';
import { Badge } from '../UI/Badge';
import { LoadingButton } from '../UI/LoadingButton';
import {
    getTrimmedId,
    truncate,
    calculateDuration,
    getLogSymbol,
    getLogTypeColor,
    getLogTypeBadge,
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

// Keep your existing LogCard component
const EnhancedLogCard = memo<{
    log: LogEntry;
    collapsed: boolean;
    loadingReferenced: boolean;
    onToggleExpand?: () => void;
    onNavigateToBlock?: (block: Block) => void;
    parentTimestamp?: number;
}>(({ log, collapsed, loadingReferenced, onToggleExpand, onNavigateToBlock, parentTimestamp }) => {
    const [showDetails, setShowDetails] = useState(false);
    const { referencedBlock: ref } = log;
    const logTypeBadge = getLogTypeBadge(log.logType);
    const logTypeColor = getLogTypeColor(log.logType);

    // Enhanced color scheme based on log type
    const getLogTypeTheme = (logType: string) => {
        const themes = {
            'SUB_BLOCK_START_PRIMARY': {
                bg: 'bg-gradient-to-r from-emerald-50 to-green-50',
                border: 'border-emerald-300 hover:border-emerald-400',
                accent: 'text-emerald-700'
            },
            'SUB_BLOCK_START_SECONDARY_NO_JOIN': {
                bg: 'bg-gradient-to-r from-blue-50 to-cyan-50',
                border: 'border-blue-300 hover:border-blue-400',
                accent: 'text-blue-700'
            },
            'SUB_BLOCK_START_SECONDARY_JOIN': {
                bg: 'bg-gradient-to-r from-indigo-50 to-purple-50',
                border: 'border-indigo-300 hover:border-indigo-400',
                accent: 'text-indigo-700'
            },
            'PUBLISH_EVENT': {
                bg: 'bg-gradient-to-r from-amber-50 to-yellow-50',
                border: 'border-amber-300 hover:border-amber-400',
                accent: 'text-amber-700'
            },
            'SUB_BLOCK_CONTINUE': {
                bg: 'bg-gradient-to-r from-violet-50 to-purple-50',
                border: 'border-violet-300 hover:border-violet-400',
                accent: 'text-violet-700'
            },
            'SUB_BLOCK_CONTINUE_COMPLETE': {
                bg: 'bg-gradient-to-r from-teal-50 to-emerald-50',
                border: 'border-teal-300 hover:border-teal-400',
                accent: 'text-teal-700'
            },
            'EVENT_LISTENER': {
                bg: 'bg-gradient-to-r from-pink-50 to-rose-50',
                border: 'border-pink-300 hover:border-pink-400',
                accent: 'text-pink-700'
            },
            'MESSAGE': {
                bg: 'bg-gradient-to-r from-gray-50 to-slate-50',
                border: 'border-gray-300 hover:border-gray-400',
                accent: 'text-gray-700'
            },
            'WARN': {
                bg: 'bg-gradient-to-r from-orange-50 to-red-50',
                border: 'border-orange-300 hover:border-orange-400',
                accent: 'text-orange-700'
            },
            'ERROR': {
                bg: 'bg-gradient-to-r from-red-50 to-pink-50',
                border: 'border-red-300 hover:border-red-400',
                accent: 'text-red-700'
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
        <div className="mb-3">
            <div
                className={`${theme.bg} ${theme.border} border-2 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group`}
                onClick={toggleDetails}
            >
                <div className="flex items-center gap-3">
                    {ref && (
                        <button
                            onClick={handleExpandClick}
                            className={`p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-all duration-200 ${
                                loadingReferenced ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                            style={{ transform: collapsed ? 'rotate(0deg)' : 'rotate(90deg)' }}
                            disabled={loadingReferenced}
                        >
                            {loadingReferenced ? "⏳" : (collapsed ? "▶" : "▼")}
                        </button>
                    )}

                    <div className={`text-2xl p-2 rounded-lg ${theme.bg.replace('50', '100')}`}>
                        {getLogSymbol(log.logType)}
                    </div>

                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <Badge text={logTypeBadge.text} color={logTypeBadge.color} />
                            <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                {getTrimmedId(log.id)}
                            </span>
                            {parentTimestamp && (
                                <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded font-semibold">
                                    {calculateDuration(log, parentTimestamp)}
                                </span>
                            )}
                        </div>
                        <div className={`font-medium ${theme.accent} group-hover:text-gray-800 transition-colors`}>
                            {truncate(log.message || "(no message)", showDetails ? 150 : 80)}
                        </div>
                    </div>

                    <div className="text-right">
                        <div className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded mb-1">
                            {log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : ""}
                        </div>
                        <button
                            onClick={toggleDetails}
                            className="text-gray-400 hover:text-blue-600 hover:bg-blue-50 text-xs p-1 rounded transition-colors duration-200"
                            title={showDetails ? "Hide details" : "Show details"}
                        >
                            {showDetails ? "🔼" : "🔽"}
                        </button>
                    </div>
                </div>

                {showDetails && (
                    <div className="mt-4 pt-4 border-t border-gray-200 text-sm" onClick={e => e.stopPropagation()}>
                        <div className="grid grid-cols-[auto_1fr_auto_1fr] gap-x-4 gap-y-3 items-center">
                            <span className="text-gray-500 font-medium">🆔 Full ID:</span>
                            <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded break-all">{log.id}</span>

                            <span className="text-gray-500 font-medium">🏃 Type:</span>
                            <span
                                className="font-semibold text-xs px-2 py-1 rounded"
                                style={{
                                    color: logTypeColor,
                                    backgroundColor: `${logTypeColor}15`
                                }}
                            >
                                {log.logType.replace(/_/g, ' ')}
                            </span>

                            <span className="text-gray-500 font-medium">🕕 Timestamp:</span>
                            <span className="text-xs bg-gray-50 px-2 py-1 rounded">
                                {log.timestamp ? new Date(log.timestamp).toLocaleString() : "N/A"}
                            </span>

                            <span className="text-gray-500 font-medium">📋 Block ID:</span>
                            <span className="font-mono text-xs bg-blue-50 px-2 py-1 rounded">{log.blockId}</span>
                        </div>

                        {log.message && log.message.length > 80 && (
                            <div className="mt-4 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg text-xs">
                                <div className="font-semibold mb-2 text-blue-700">💬 Full Message:</div>
                                <div className="italic text-blue-800 leading-relaxed">{log.message}</div>
                            </div>
                        )}
                    </div>
                )}

                {ref && (
                    <ReferencedBlockCard
                        block={ref}
                        onClick={handleBlockCardClick}
                        className="mt-4"
                    />
                )}
            </div>
        </div>
    );
});

const ReferencedBlockCard: React.FC<{
    block: Block;
    onClick: (e: React.MouseEvent) => void;
    className?: string;
}> = ({ block, onClick, className = '' }) => (
    <div
        onClick={onClick}
        className={`bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 hover:border-blue-500 rounded-xl p-4 cursor-pointer hover:shadow-md transition-all duration-200 group ${className}`}
    >
        <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3 font-bold text-blue-700">
                <span className="text-lg">🔗</span>
                <span>Referenced Block</span>
                <Badge text="Click to explore" color="#2563eb" size="sm" />
            </div>
            <span className="text-blue-400 text-xl group-hover:text-blue-600 transition-colors">→</span>
        </div>

        <div className="font-bold mb-3 text-gray-800 text-lg">{block.name}</div>

        <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-2 text-sm mb-4">
            <span className="text-gray-500 font-medium">🆔 ID:</span>
            <span className="font-mono text-xs bg-white px-2 py-1 rounded border">{getTrimmedId(block.id)}</span>

            <span className="text-gray-500 font-medium">📅 Created:</span>
            <span className="text-gray-700">{block.createdAt ? new Date(block.createdAt).toLocaleString() : "(unknown)"}</span>

            <span className="text-gray-500 font-medium">⏱️ Duration:</span>
            <span className="text-gray-700 font-semibold">{formatDuration(block.startTime, block.endTime)}</span>

            <span className="text-gray-500 font-medium">📊 Status:</span>
            <span
                className={`font-bold text-sm px-2 py-1 rounded ${
                    block.endTime
                        ? 'bg-green-100 text-green-800 border border-green-200'
                        : 'bg-orange-100 text-orange-800 border border-orange-200'
                }`}
            >
                {block.endTime ? '✅ Completed' : '⏳ Running'}
            </span>
        </div>

        {block.endMessage && (
            <div className="p-3 bg-white border border-blue-200 rounded-lg">
                <div className="text-blue-700 font-semibold text-xs mb-1">💬 End Message:</div>
                <div className="text-blue-800 italic text-xs leading-relaxed">
                    {truncate(block.endMessage, 100)}
                </div>
            </div>
        )}
    </div>
);

EnhancedLogCard.displayName = 'EnhancedLogCard';

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

    const renderLogWithFlow = (log: LogEntry, index: number) => {
        const isCollapsed = collapsed.has(log.id);
        const isLoadingReferenced = loadingReferenced.has(log.id);
        const hasReferencedBlock = !!log.referencedBlock;
        const currentParentTimestamp = index > 0 ? logs[index - 1].timestamp : parentTimestamp;

        const result = [];

        // 1. Render the main log entry
        result.push(
            <EnhancedLogCard
                key={`${keyPrefix}-${log.id}`}
                log={log}
                collapsed={isCollapsed}
                loadingReferenced={isLoadingReferenced}
                onToggleExpand={() => hasReferencedBlock && onToggleExpand(log)}
                onNavigateToBlock={onNavigateToBlock}
                parentTimestamp={currentParentTimestamp}
            />
        );

        // 2. If this log has a referenced block and it's expanded, show the referenced logs nested underneath
        if (hasReferencedBlock && !isCollapsed && referencedBlockData[log.id]) {
            result.push(
                <div key={`${keyPrefix}-ref-${log.id}`} className="ml-8 mt-3 mb-4 relative">
                    {/* Connection line */}
                    <div className="absolute -left-4 top-0 w-4 h-6 border-l-2 border-b-2 border-blue-300 rounded-bl-lg"></div>

                    {/* Referenced block header */}
                    <div className="mb-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-r-lg shadow-sm">
                        <div className="flex items-center gap-2 text-sm font-semibold text-blue-700">
                            <span className="text-lg">🔗</span>
                            <span>Referenced Block: {log.referencedBlock.name}</span>
                            <div className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                                {referencedBlockData[log.id].length} logs
                            </div>
                        </div>
                    </div>

                    {/* Referenced block logs */}
                    <div className="pl-4 border-l-2 border-blue-200">
                        <LogTree
                            logs={referencedBlockData[log.id]}
                            depth={depth + 1}
                            keyPrefix={`${keyPrefix}-ref-${log.id}`}
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

                    {/* Load more button for referenced logs */}
                    <div className="pl-4 mt-2">
                        <LoadingButton
                            onClick={() => onLoadMoreReferenced(log.id, log.referencedBlock!.id)}
                            loading={loadingMoreReferenced.has(log.id)}
                            hasMore={hasMoreReferencedLogs[log.id] !== false}
                            label="Load More Referenced Logs"
                            icon="📋"
                            variant="outline"
                            size="sm"
                        />
                    </div>
                </div>
            );
        }

        // 3. Handle children
        if (log.children && log.children.length > 0) {
            if (log.children.length === 1) {
                // Sequential flow - continue at same level
                result.push(
                    <div key={`${keyPrefix}-seq-${log.id}`} className="mt-2">
                        <div className="flex items-center mb-2">
                            <div className="w-6 h-px bg-gray-300"></div>
                            <div className="mx-2 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                ⬇️ Sequential
                            </div>
                            <div className="flex-1 h-px bg-gray-300"></div>
                        </div>
                        <LogTree
                            logs={log.children}
                            depth={depth}
                            keyPrefix={`${keyPrefix}-seq-${log.id}`}
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
                );
            } else {
                // Multiple children = siblings - show horizontally
                result.push(
                    <div key={`${keyPrefix}-sib-${log.id}`} className="mt-4 mb-4">
                        <div className="flex items-center mb-4 text-orange-600 text-sm font-semibold">
                            <div className="w-6 h-px bg-orange-300"></div>
                            <div className="mx-3 bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-xs">
                                👥 SIBLING OPERATIONS ({log.children.length} branches)
                            </div>
                            <div className="flex-1 h-px bg-orange-300"></div>
                        </div>

                        <div className="flex gap-6 overflow-x-auto pb-4">
                            {log.children.map((siblingLog, idx) => (
                                <div
                                    key={`${keyPrefix}-sib-${log.id}-${idx}`}
                                    className="flex-shrink-0 min-w-[380px] relative"
                                >
                                    <div className="absolute -top-3 left-4 bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md z-10">
                                        SIBLING {idx + 1}
                                    </div>

                                    <div className="p-4 pt-6 bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-300 rounded-xl shadow-md">
                                        <LogTree
                                            logs={[siblingLog]}
                                            depth={depth}
                                            keyPrefix={`${keyPrefix}-sib-${log.id}-${idx}`}
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
                                </div>
                            ))}
                        </div>
                    </div>
                );
            }
        }

        return result;
    };

    // FIXED: Apply sibling logic at ANY level - multiple logs sharing same parentLogId = siblings
    if (logs.length > 1) {
        return (
            <div className="mb-6">
                <div className="flex items-center mb-6 text-purple-600 text-sm font-semibold">
                    <div className="w-6 h-px bg-purple-300"></div>
                    <div className="mx-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-4 py-2 rounded-full text-sm shadow-lg">
                        👥 {depth === 0 ? 'ROOT SIBLINGS' : 'SIBLING OPERATIONS'} ({logs.length} concurrent flows)
                    </div>
                    <div className="flex-1 h-px bg-purple-300"></div>
                </div>

                <div className="flex gap-8 overflow-x-auto pb-6">
                    {logs.map((log, idx) => (
                        <div
                            key={`${keyPrefix}-sibling-${idx}`}
                            className="flex-shrink-0 min-w-[420px] relative"
                        >
                            <div className="absolute -top-4 left-4 bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-4 py-1 rounded-full text-xs font-bold shadow-lg z-10">
                                SIBLING {idx + 1}
                            </div>

                            <div className="p-5 pt-8 bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-300 rounded-xl shadow-lg">
                                {renderLogWithFlow(log, idx).flat()}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // For single logs, render normally
    return (
        <div className="space-y-3">
            {logs.map((log, index) => renderLogWithFlow(log, index)).flat()}
        </div>
    );
};
//asd