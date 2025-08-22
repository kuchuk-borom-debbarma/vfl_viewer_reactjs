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
        <div className="bg-white border-b border-gray-200">
            <div
                className="max-w-6xl mx-auto px-6 py-4 transition-all duration-300"
                style={{ marginLeft: sidebarOpen ? '300px' : '0' }}
            >
                <div className="flex justify-between items-center gap-4">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" onClick={onBack} className="text-gray-600">
                            ← Back
                        </Button>

                        <button
                            onClick={onToggleSidebar}
                            className="w-9 h-9 rounded-lg border border-gray-200 bg-white text-gray-600 flex items-center justify-center hover:bg-gray-50 transition-all duration-200"
                            title={sidebarOpen ? "Hide info" : "Show info"}
                        >
                            {sidebarOpen ? '◀' : 'ℹ'}
                        </button>

                        <div>
                            <h2 className="text-lg font-semibold text-gray-800">{block.name}</h2>
                            <div className="text-xs text-gray-500">{block.id.slice(-8)}</div>
                        </div>
                    </div>

                    <MinimalControlsBar
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
        </div>
    );
};

const MinimalControlsBar: React.FC<{
    zoom: number;
    onZoomIn: () => void;
    onZoomOut: () => void;
    onResetView: () => void;
    onExpandAll: () => void;
    onCollapseAll: () => void;
    inputMode: InputMode;
    onInputModeChange: (mode: InputMode) => void;
}> = ({
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
        <div className="flex items-center gap-1 bg-gray-50 rounded-lg p-1">
            <button
                onClick={onExpandAll}
                className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-800 hover:bg-white rounded transition-all"
                title="Expand all"
            >
                ↕
            </button>

            <button
                onClick={onCollapseAll}
                className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-800 hover:bg-white rounded transition-all"
                title="Collapse all"
            >
                ↔
            </button>

            <div className="w-px h-4 bg-gray-300 mx-1" />

            <button
                onClick={onZoomOut}
                className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-800 hover:bg-white rounded transition-all"
                title="Zoom out"
            >
                −
            </button>

            <div className="px-2 py-1 text-xs font-mono text-gray-600 min-w-[50px] text-center">
                {(zoom * 100).toFixed(0)}%
            </div>

            <button
                onClick={onZoomIn}
                className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-800 hover:bg-white rounded transition-all"
                title="Zoom in"
            >
                +
            </button>

            <button
                onClick={onResetView}
                className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-800 hover:bg-white rounded transition-all"
                title="Reset view"
            >
                ⌂
            </button>

            <div className="w-px h-4 bg-gray-300 mx-1" />

            <select
                value={inputMode}
                onChange={(e) => onInputModeChange(e.target.value as InputMode)}
                className="px-2 py-1 text-xs bg-transparent border-none text-gray-600 focus:outline-none cursor-pointer"
            >
                <option value="mouse">Mouse</option>
                <option value="trackpad">Trackpad</option>
            </select>
        </div>
    );
};
