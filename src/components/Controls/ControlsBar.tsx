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
        <div className="flex gap-2 items-center flex-wrap">
            <Button variant="outline" size="sm" onClick={onExpandAll}>
                🗂 Expand All
            </Button>

            <Button variant="outline" size="sm" onClick={onCollapseAll}>
                📁 Collapse All
            </Button>

            <div className="w-px h-5 bg-gray-300" />

            <Button variant="outline" size="sm" onClick={onZoomOut}>
                🔍➖
            </Button>

            <Button variant="outline" size="sm" onClick={onZoomIn}>
                🔍➕
            </Button>

            <span className="text-sm text-gray-500 min-w-[50px] text-center">
        {(zoom * 100).toFixed(0)}%
      </span>

            <Button variant="primary" size="sm" onClick={onResetView}>
                🎯 Reset
            </Button>

            <div className="w-px h-5 bg-gray-300" />

            <div className="flex items-center gap-2">
                <span className="text-sm font-medium">🖱️ Input:</span>
                <select
                    value={inputMode}
                    onChange={(e) => {
                        e.stopPropagation();
                        onInputModeChange(e.target.value as InputMode);
                    }}
                    className="px-2 py-1 border border-gray-300 rounded text-xs bg-white"
                >
                    <option value="mouse">🖱️ Mouse</option>
                    <option value="trackpad">👆 Trackpad</option>
                </select>
            </div>
        </div>
    );
};