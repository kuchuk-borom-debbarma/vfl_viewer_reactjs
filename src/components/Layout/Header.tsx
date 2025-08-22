import React from 'react';
import { Button } from '../UI/Button';
import { Block } from '../../types';
import { ControlsBar } from '../Controls/ControlsBar';
import { InputMode } from '../../types';

interface HeaderProps {
    block: Block;
    sidebarOpen: boolean;
    onBack: () => void;
    onToggleSidebar: () => void;
    // Controls props
    zoom: number;
    onZoomIn: () => void;
    onZoomOut: () => void;
    onResetView: () => void;
    onExpandAll: () => void;
    onCollapseAll: () => void;
    inputMode: InputMode;
    onInputModeChange: (mode: InputMode) => void;
}

export const Header: React.FC<HeaderProps> = ({
                                                  block,
                                                  sidebarOpen,
                                                  onBack,
                                                  onToggleSidebar,
                                                  zoom,
                                                  onZoomIn,
                                                  onZoomOut,
                                                  onResetView,
                                                  onExpandAll,
                                                  onCollapseAll,
                                                  inputMode,
                                                  onInputModeChange
                                              }) => {
    return (
        <div
            className="container mx-auto px-6 py-4 transition-all duration-300"
            style={{ marginLeft: sidebarOpen ? '300px' : '0' }}
        >
            <div className="flex justify-between items-center gap-4">
                <div className="flex items-center gap-3">
                    <Button variant="outline" onClick={onBack}>
                        ← Back
                    </Button>

                    <button
                        onClick={onToggleSidebar}
                        className="w-10 h-10 rounded-lg border border-gray-300 bg-white text-primary text-lg flex items-center justify-center shadow-sm hover:shadow-md transition-all duration-300 z-50"
                        title={sidebarOpen ? "Hide block info" : "Show block info"}
                    >
                        {sidebarOpen ? '◀' : 'ℹ️'}
                    </button>

                    <h2 className="text-2xl font-semibold text-gray-800">
                        Execution Flow: <span className="text-primary">{block.name}</span>
                    </h2>
                </div>

                <ControlsBar
                    zoom={zoom}
                    onZoomIn={onZoomIn}
                    onZoomOut={onZoomOut}
                    onResetView={onResetView}
                    onExpandAll={onExpandAll}
                    onCollapseAll={onCollapseAll}
                    inputMode={inputMode}
                    onInputModeChange={onInputModeChange}
                />
            </div>
        </div>
    );
};