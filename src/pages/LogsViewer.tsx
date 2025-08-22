import React, { useState } from 'react';
import { Block } from '../types';
import { useLogs } from '../hooks/useLogs';
import { useViewport } from '../hooks/useViewport';
import { buildLogTree } from '../utils';
import { Sidebar } from '../components/Layout/Sidebar';
import { Header } from '../components/Layout/Header';
import { Viewport } from '../components/Layout/Viewport';
import { LogTree } from '../components/Logs/LogTree';
import { LoadingButton } from '../components/UI/LoadingButton';
import { SIDEBAR_WIDTH } from '../config/constants';

interface LogsViewerProps {
    block: Block;
    goBack: () => void;
    onNavigateToBlock?: (block: Block) => void;
}

export const LogsViewer: React.FC<LogsViewerProps> = ({
                                                          block,
                                                          goBack,
                                                          onNavigateToBlock
                                                      }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const {
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
        loadMoreReferencedLogs  // NEW: Use the actual function from the hook
    } = useLogs(block);

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

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-24">
                <div className="container mx-auto px-6">
                    <button onClick={goBack} className="btn btn-outline mb-6">← Back</button>
                    <h2 className="text-2xl font-semibold text-center mb-8">Loading logs for {block.name}</h2>
                    <div className="text-center text-gray-500">Loading execution logs...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-24">
                <div className="container mx-auto px-6">
                    <button onClick={goBack} className="btn btn-outline mb-6">← Back</button>
                    <h2 className="text-2xl font-semibold text-center mb-8">Execution Logs</h2>
                    <div className="text-center text-red-500">{error}</div>
                </div>
            </div>
        );
    }

    const treeStructure = buildLogTree(allLogs);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
            <Sidebar
                block={block}
                isOpen={sidebarOpen}
                onToggle={() => setSidebarOpen(!sidebarOpen)}
            />

            <Header
                block={block}
                sidebarOpen={sidebarOpen}
                onBack={goBack}
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
                {treeStructure.length === 0 ? (
                    <div className="text-center text-gray-500 py-20">
                        No logs found for this block.
                    </div>
                ) : (
                    <LogTree
                        logs={treeStructure}
                        collapsed={collapsed}
                        loadingReferenced={loadingReferenced}
                        referencedBlockData={referencedBlockData}
                        loadingMoreReferenced={loadingMoreReferenced}
                        hasMoreReferencedLogs={hasMoreReferenced}
                        onToggleExpand={loadReferencedBlock}
                        onNavigateToBlock={onNavigateToBlock}
                        onLoadMoreReferenced={loadMoreReferencedLogs}  // FIXED: Using actual function now
                    />
                )}

                <LoadingButton
                    onClick={loadMore}
                    loading={loadingMore}
                    hasMore={hasMore}
                    label="Load More Main Logs"
                    icon="🔥"
                />
            </Viewport>

            {/* Footer */}
            <div
                className="border-t border-gray-200 py-3 bg-white text-xs text-gray-500 transition-all duration-300"
                style={{ marginLeft: sidebarOpen ? `${SIDEBAR_WIDTH}px` : '0' }}
            >
                <div className="container mx-auto px-6 flex justify-between items-center flex-wrap gap-4">
                    <div className="flex gap-6">
                        <span>🔗 Referenced Block</span>
                        <span>📋 Referenced Block Logs</span>
                        <span>👥 Sibling Operations</span>
                        <span>⚡ Parallel Execution</span>
                        <span>⬇️ Sequential Flow</span>
                    </div>
                    <div>Ctrl/Cmd + scroll to zoom • Drag to pan • Horizontal scroll for siblings</div>
                </div>
            </div>
        </div>
    );
};
