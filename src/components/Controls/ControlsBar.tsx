import React from 'react';
import { Button } from '../UI/Button';
import { InputMode } from '../../types';

interface ControlsBarProps {
    zoom: number;
    onZoomIn: () => void;
    onZoomOut: () => void;
    onResetView: () => void;
    onExpandAll: () => void;
    onCollapseAll: () => void;
    inputMode: InputMode;
    onInputModeChange: (mode: InputMode) => void;
}

export const ControlsBar: React.FC<ControlsBarProps> = ({
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
        <div className="flex gap-2 items-center flex-wrap bg-white rounded-xl p-2 shadow-lg border border-gray-200">
            <Button variant="outline" size="sm" onClick={onExpandAll} className="flex items-center gap-1">
                🗂️ <span className="hidden sm:inline">Expand All</span>
            </Button>

            <Button variant="outline" size="sm" onClick={onCollapseAll} className="flex items-center gap-1">
                📁 <span className="hidden sm:inline">Collapse All</span>
            </Button>

            <div className="w-px h-6 bg-gray-300 mx-1" />

            <Button variant="outline" size="sm" onClick={onZoomOut} className="flex items-center gap-1">
                🔍➖
            </Button>

            <Button variant="outline" size="sm" onClick={onZoomIn} className="flex items-center gap-1">
                🔍➕
            </Button>

            <div className="bg-gray-100 px-3 py-1 rounded-lg border text-sm font-semibold text-gray-700 min-w-[60px] text-center">
                {(zoom * 100).toFixed(0)}%
            </div>

            <Button variant="primary" size="sm" onClick={onResetView} className="flex items-center gap-1">
                🎯 <span className="hidden sm:inline">Reset</span>
            </Button>

            <div className="w-px h-6 bg-gray-300 mx-1" />

            <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-2 border">
                <span className="text-sm font-medium text-gray-700">🖱️ Input:</span>
                <select
                    value={inputMode}
                    onChange={(e) => {
                        e.stopPropagation();
                        onInputModeChange(e.target.value as InputMode);
                    }}
                    className="px-2 py-1 border border-gray-300 rounded-md text-xs bg-white hover:border-blue-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
                >
                    <option value="mouse">🖱️ Mouse</option>
                    <option value="trackpad">👆 Trackpad</option>
                </select>
            </div>
        </div>
    );
};