import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Block } from '../types';
import { useLogs } from '../hooks/useLogs';
import { Sidebar } from '../components/Layout/Sidebar';
import { LogTree, TimelineView, PerformanceView, ViewMode } from '../components/Logs/LogTree';
import { LoadingButton } from '../components/UI/LoadingButton';
import { formatDuration } from '../utils';
import { SIDEBAR_WIDTH } from '../config/constants';

export const LogsViewer: React.FC = () => {
    const { blockId } = useParams<{ blockId: string }>();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [viewMode, setViewMode] = useState<ViewMode>('tree');

    const {
        block,
        allLogs,
        loading,
        loadingMore,
        error,
        hasMore,
        collapsed,
        loadingReferenced,
        referencedBlockData,
        loadingMoreReferenced,
        hasMoreReferenced,
        loadMore,
        loadReferencedBlock,
        expandAll,
        collapseAll,
        loadMoreReferencedLogs
    } = useLogs(blockId!);

    const handleNavigateToBlock = (block: Block) => {
        navigate(`/logs/${block.id}`);
    };

    const handleGoBack = () => {
        navigate(-1);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-4xl mb-4 animate-pulse">⋯</div>
                    <div className="text-lg font-medium text-gray-800 mb-2">Loading execution logs</div>
                    <div className="text-sm text-gray-600 font-mono">{blockId}</div>
                </div>
            </div>
        );
    }

    if (error || !block) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center max-w-md">
                    <div className="text-4xl mb-4 text-red-500">✕</div>
                    <div className="text-lg font-medium text-gray-800 mb-2">Failed to load logs</div>
                    <div className="text-sm text-gray-600 mb-4">{error}</div>
                    <button
                        onClick={handleGoBack}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                        ← Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Sidebar
                block={block}
                isOpen={sidebarOpen}
                onToggle={() => setSidebarOpen(!sidebarOpen)}
            />

            {/* Enhanced Header with Block Info */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-b border-blue-700">
                <div
                    className="max-w-6xl mx-auto px-6 py-5 transition-all duration-300"
                    style={{ marginLeft: sidebarOpen ? `${SIDEBAR_WIDTH}px` : '0' }}
                >
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleGoBack}
                                className="px-3 py-1.5 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-all text-sm font-medium"
                            >
                                ← Back
                            </button>

                            <button
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="w-9 h-9 rounded-lg bg-white bg-opacity-20 hover:bg-opacity-30 flex items-center justify-center transition-all"
                                title={sidebarOpen ? "Hide info" : "Show info"}
                            >
                                {sidebarOpen ? '◀' : 'ℹ'}
                            </button>
                        </div>

                        {/* View Mode Selector */}
                        <div className="flex gap-2 bg-white bg-opacity-10 rounded-lg p-1">
                            <button
                                onClick={() => setViewMode('tree')}
                                className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${
                                    viewMode === 'tree'
                                        ? 'bg-white text-blue-600 shadow-sm'
                                        : 'text-white hover:bg-white hover:bg-opacity-20'
                                }`}
                            >
                                🌲 Tree
                            </button>
                            <button
                                onClick={() => setViewMode('timeline')}
                                className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${
                                    viewMode === 'timeline'
                                        ? 'bg-white text-blue-600 shadow-sm'
                                        : 'text-white hover:bg-white hover:bg-opacity-20'
                                }`}
                            >
                                ⏱️ Timeline
                            </button>
                            <button
                                onClick={() => setViewMode('performance')}
                                className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${
                                    viewMode === 'performance'
                                        ? 'bg-white text-blue-600 shadow-sm'
                                        : 'text-white hover:bg-white hover:bg-opacity-20'
                                }`}
                            >
                                📊 Performance
                            </button>
                        </div>
                    </div>

                    {/* Block Info */}
                    <div className="flex justify-between items-end">
                        <div>
                            <h1 className="text-2xl font-bold mb-1">{block.name}</h1>
                            <div className="text-blue-100 text-sm flex items-center gap-3">
                                <span className="font-mono">{block.id.slice(-8)}</span>
                                <span>•</span>
                                <span>Started: {new Date(block.createdAt).toLocaleTimeString()}</span>
                                <span>•</span>
                                <span>Status: {block.exitMessage || 'COMPLETED'}</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-3xl font-bold">
                                {formatDuration(block.createdAt, block.returnedAt || block.exitedAt || Date.now())}
                            </div>
                            <div className="text-blue-100 text-sm">total duration</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Controls Bar (only for tree view) */}
            {viewMode === 'tree' && (
                <div
                    className="bg-white border-b border-gray-200 py-3 transition-all duration-300"
                    style={{ marginLeft: sidebarOpen ? `${SIDEBAR_WIDTH}px` : '0' }}
                >
                    <div className="max-w-6xl mx-auto px-6">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={expandAll}
                                className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-all"
                                title="Expand all"
                            >
                                ↕ Expand All
                            </button>

                            <button
                                onClick={collapseAll}
                                className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-all"
                                title="Collapse all"
                            >
                                ↕ Collapse All
                            </button>

                            <div className="flex-1"></div>

                            <div className="text-xs text-gray-500">
                                Drag to pan • Scroll to zoom • Click logs for details
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Content Area */}
            <div
                className="flex-1 overflow-auto transition-all duration-300 p-8"
                style={{ marginLeft: sidebarOpen ? `${SIDEBAR_WIDTH}px` : '0' }}
            >
                <div className="max-w-6xl mx-auto">
                    {allLogs.length === 0 ? (
                        <div className="text-center text-gray-500 py-20">
                            <div className="text-4xl mb-4">📋</div>
                            <div className="text-lg font-medium mb-2">No logs found</div>
                            <div className="text-sm">This block doesn't contain any execution logs yet.</div>
                        </div>
                    ) : viewMode === 'tree' ? (
                        <>
                            <LogTree
                                logs={allLogs}
                                block={block}
                                collapsed={collapsed}
                                loadingReferenced={loadingReferenced}
                                referencedBlockData={referencedBlockData}
                                loadingMoreReferenced={loadingMoreReferenced}
                                hasMoreReferencedLogs={hasMoreReferenced}
                                viewMode={viewMode}
                                onToggleExpand={loadReferencedBlock}
                                onNavigateToBlock={handleNavigateToBlock}
                                onLoadMoreReferenced={loadMoreReferencedLogs}
                            />

                            <LoadingButton
                                onClick={loadMore}
                                loading={loadingMore}
                                hasMore={hasMore}
                                label="Load More Logs"
                                icon="+"
                            />
                        </>
                    ) : viewMode === 'timeline' ? (
                        <TimelineView logs={allLogs} block={block} />
                    ) : (
                        <PerformanceView logs={allLogs} block={block} />
                    )}
                </div>
            </div>

            {/* Benefits Footer */}
            <div
                className="bg-green-50 border-t-2 border-green-200 py-4 transition-all duration-300"
                style={{ marginLeft: sidebarOpen ? `${SIDEBAR_WIDTH}px` : '0' }}
            >
                <div className="max-w-6xl mx-auto px-6">
                    <div className="text-sm font-semibold text-green-800 mb-2">
                        Benefits of VFL Hierarchical Structure
                    </div>
                    <div className="grid md:grid-cols-3 gap-4 text-xs text-green-700">
                        <div>
                            <span className="font-semibold">• Clear Hierarchy:</span> Instantly see parent-child relationships - operations are clearly nested
                        </div>
                        <div>
                            <span className="font-semibold">• Parallel Execution Visible:</span> Operations running concurrently shown at same level with timing overlap
                        </div>
                        <div>
                            <span className="font-semibold">• Error Context:</span> Errors clearly within their operation flow | Performance bottlenecks identified
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div
                className="border-t border-gray-200 py-3 bg-white text-xs text-gray-500 transition-all duration-300"
                style={{ marginLeft: sidebarOpen ? `${SIDEBAR_WIDTH}px` : '0' }}
            >
                <div className="max-w-6xl mx-auto px-6 flex justify-between items-center">
                    <div className="flex items-center gap-6">
                        <span className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-blue-200 rounded-full"></div>
                            Referenced Block
                        </span>
                        <span className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-purple-200 rounded-full"></div>
                            Parallel Operations
                        </span>
                        <span className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-green-200 rounded-full"></div>
                            Sequential Flow
                        </span>
                    </div>
                    <div className="hidden sm:block italic">
                        Interactive: Click ▼ to collapse/expand blocks | Color-coded by operation type
                    </div>
                </div>
            </div>
        </div>
    );
};