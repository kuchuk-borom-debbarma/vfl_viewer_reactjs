import React, { useState, memo } from 'react';
import { LogEntry, Block } from '../../types';
import { Card } from '../UI/Card';
import { Badge } from '../UI/Badge';
import {
    getTrimmedId,
    truncate,
    calculateDuration,
    getLogSymbol,
    getLogTypeColor,
    getLogTypeBadge,
    formatDuration
} from '../../utils';

interface LogCardProps {
    log: LogEntry;
    collapsed: boolean;
    loadingReferenced: boolean;
    onToggleExpand?: () => void;
    onNavigateToBlock?: (block: Block) => void;
    parentTimestamp?: number;
}

export const LogCard = memo<LogCardProps>(({
                                               log,
                                               collapsed,
                                               loadingReferenced,
                                               onToggleExpand,
                                               onNavigateToBlock,
                                               parentTimestamp
                                           }) => {
    const [showDetails, setShowDetails] = useState(false);
    const { referencedBlock: ref } = log;
    const logTypeBadge = getLogTypeBadge(log.logType);

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
            <Card interactive onClick={toggleDetails} className="hover:shadow-md hover:border-blue-200 transition-all duration-200">
                <div className="flex items-center gap-3">
                    {ref && (
                        <button
                            onClick={handleExpandClick}
                            className={`p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 ${
                                loadingReferenced ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                            style={{
                                transform: collapsed ? 'rotate(0deg)' : 'rotate(90deg)'
                            }}
                            disabled={loadingReferenced}
                        >
                            {loadingReferenced ? "⏳" : (collapsed ? "▶" : "▼")}
                        </button>
                    )}

                    <span className="text-lg">{getLogSymbol(log.logType)}</span>

                    <Badge text={logTypeBadge.text} color={logTypeBadge.color} />

                    <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {getTrimmedId(log.id)}
                    </span>

                    <span className="flex-1 font-medium text-gray-800">
                        {truncate(log.message || "(no message)", showDetails ? 120 : 60)}
                    </span>

                    <span className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
                        {log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : ""}
                    </span>

                    <button
                        onClick={toggleDetails}
                        className="text-gray-400 hover:text-blue-600 hover:bg-blue-50 text-xs p-2 rounded transition-colors duration-200"
                        title={showDetails ? "Hide details" : "Show details"}
                    >
                        {showDetails ? "🔼" : "🔽"}
                    </button>
                </div>

                {showDetails && (
                    <div className="mt-4 pt-4 border-t border-gray-200 text-sm" onClick={e => e.stopPropagation()}>
                        <div className="grid grid-cols-[auto_1fr_auto_1fr] gap-x-4 gap-y-3 items-center">
                            <span className="text-gray-500 font-medium">🆔 ID:</span>
                            <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{getTrimmedId(log.id)}</span>

                            <span className="text-gray-500 font-medium">🏃 Type:</span>
                            <span
                                className="font-semibold text-xs px-2 py-1 rounded"
                                style={{
                                    color: getLogTypeColor(log.logType),
                                    backgroundColor: `${getLogTypeColor(log.logType)}15`
                                }}
                            >
                                {log.logType.replace(/_/g, ' ')}
                            </span>

                            <span className="text-gray-500 font-medium">🕐 Time:</span>
                            <span className="text-xs bg-gray-50 px-2 py-1 rounded">
                                {log.timestamp ? new Date(log.timestamp).toLocaleString() : "N/A"}
                            </span>

                            <span className="text-gray-500 font-medium">⏱️ Duration:</span>
                            <span className="text-blue-600 font-bold text-xs bg-blue-50 px-2 py-1 rounded">
                                {calculateDuration(log, parentTimestamp)}
                            </span>
                        </div>

                        {log.message && log.message.length > 60 && (
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
            </Card>
        </div>
    );
});

const ReferencedBlockCard: React.FC<{
    block: Block;
    onClick: (e: React.MouseEvent) => void;
    className?: string;
}> = ({ block, onClick, className = '' }) => (
    <Card
        variant="outlined"
        interactive
        onClick={onClick}
        className={`bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-300 hover:border-blue-500 hover:shadow-md transition-all duration-200 ${className}`}
    >
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3 font-bold text-blue-700">
                <span className="text-lg">🔗</span>
                <span>Referenced Block</span>
                <Badge text="Click to explore" color="#2563eb" size="sm" />
            </div>
            <span className="text-blue-400 text-xl hover:text-blue-600 transition-colors">→</span>
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
                    {truncate(block.endMessage, 80)}
                </div>
            </div>
        )}
    </Card>
);

LogCard.displayName = 'LogCard';