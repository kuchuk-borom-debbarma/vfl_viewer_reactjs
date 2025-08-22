import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Block } from '../types';
import { useLogs } from '../hooks/useLogs';
import { useViewport } from '../hooks/useViewport';
import { Sidebar } from '../components/Layout/Sidebar';
import { Header } from '../components/Layout/Header';
import { Viewport } from '../components/Layout/Viewport';
import { LogTree } from '../components/Logs/LogTree';
import { LoadingButton } from '../components/UI/LoadingButton';
import { SIDEBAR_WIDTH } from '../config/constants';

export const LogsViewer: React.FC = () => {
    const { blockId } = useParams<{ blockId: string }>();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);

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

    const {
        viewState,
        inputMode,
        setInputMode,
        updateZoom,
        updatePan,
        startDrag,
        updateDrag,
        endDrag,
        resetView,
        zoomIn,
        zoomOut
    } = useViewport();

    const handleNavigateToBlock = (block: Block) => {
        navigate(`/logs/${block.id}`);
    };

    const handleGoBack = () => {
        navigate('/operations');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-2xl mb-4">⋯</div>
                    <div className="text-lg font-medium text-gray-800 mb-2">Loading execution logs</div>
                    <div className="text-sm text-gray-600">{blockId}</div>
                </div>
            </div>
        );
    }

    if (error || !block) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center max-w-md">
                    <div className="text-2xl mb-4 text-red-500">✕</div>
                    <div className="text-lg font-medium text-gray-800 mb-2">Failed to load logs</div>
                    <div className="text-sm text-gray-600 mb-4">{error}</div>
                    <button
                        onClick={handleGoBack}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                        ← Go Back
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

            <Header
                block={block}
                sidebarOpen={sidebarOpen}
                onBack={handleGoBack}
                onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
                zoom={viewState.zoom}
                onZoomIn={zoomIn}
                onZoomOut={zoomOut}
                onResetView={resetView}
                onExpandAll={expandAll}
                onCollapseAll={collapseAll}
                inputMode={inputMode}
                onInputModeChange={setInputMode}
            />

            <Viewport
                viewState={viewState}
                inputMode={inputMode}
                sidebarOpen={sidebarOpen}
                onUpdateZoom={updateZoom}
                onUpdatePan={updatePan}
                onStartDrag={startDrag}
                onUpdateDrag={updateDrag}
                onEndDrag={endDrag}
            >
                {allLogs.length === 0 ? (
                    <div className="text-center text-gray-500 py-20">
                        <div className="text-2xl mb-4">📋</div>
                        <div className="text-lg font-medium mb-2">No logs found</div>
                        <div className="text-sm">This block doesn't contain any execution logs yet.</div>
                    </div>
                ) : (
                    <>
                        {/* Pass flat logs directly - LogTree handles the hierarchical rendering */}
                        <LogTree
                            logs={allLogs}
                            collapsed={collapsed}
                            loadingReferenced={loadingReferenced}
                            referencedBlockData={referencedBlockData}
                            loadingMoreReferenced={loadingMoreReferenced}
                            hasMoreReferencedLogs={hasMoreReferenced}
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
                )}
            </Viewport>

            {/* Minimal Footer */}
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
                            <div className="w-2 h-2 bg-gray-200 rounded-full"></div>
                            Parallel Operations
                        </span>
                        <span className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-green-200 rounded-full"></div>
                            Sequential Flow
                        </span>
                    </div>
                    <div className="hidden sm:block">
                        Drag to pan • Scroll to zoom • Click logs for details
                    </div>
                </div>
            </div>
        </div>
    );
};
