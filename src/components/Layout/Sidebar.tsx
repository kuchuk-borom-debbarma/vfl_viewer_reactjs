import React from 'react';
import { Block } from '../../types';
import { getTrimmedId, formatDuration } from '../../utils';
import { SIDEBAR_WIDTH } from '../../config/constants';

interface SidebarProps {
    block: Block;
    isOpen: boolean;
    onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ block, isOpen, onToggle }) => {
    const isOngoing = !block.endTime;

    return (
        <>
            <div
                className="fixed top-0 left-0 h-full bg-white border-r border-gray-200 z-50 transition-transform duration-300 overflow-y-auto"
                style={{
                    width: SIDEBAR_WIDTH,
                    transform: isOpen ? 'translateX(0)' : 'translateX(-100%)'
                }}
            >
                <div className="p-6">
                    <div className="text-lg font-semibold mb-6 text-gray-800 pb-3 border-b border-gray-200">
                        Block Details
                    </div>

                    <div className="space-y-6">
                        <div>
                            <h3 className="font-semibold text-gray-800 mb-2">{block.name}</h3>
                            <div className="text-xs font-mono text-gray-500 bg-gray-50 px-2 py-1 rounded">
                                {getTrimmedId(block.id)}
                            </div>
                        </div>

                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Started</span>
                                <span className="text-gray-800">
                                    {new Date(block.startTime).toLocaleTimeString()}
                                </span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-gray-500">Status</span>
                                <span
                                    className={`px-2 py-1 rounded text-xs font-medium ${
                                        isOngoing
                                            ? 'bg-amber-100 text-amber-800'
                                            : 'bg-green-100 text-green-800'
                                    }`}
                                >
                                    {isOngoing ? 'Running' : 'Complete'}
                                </span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-gray-500">Duration</span>
                                <span className="font-mono text-gray-800">
                                    {formatDuration(block.startTime, block.endTime)}
                                </span>
                            </div>

                            {block.endTime && (
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Ended</span>
                                    <span className="text-gray-800">
                                        {new Date(block.endTime).toLocaleTimeString()}
                                    </span>
                                </div>
                            )}
                        </div>

                        {block.endMessage && (
                            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                <div className="text-xs text-gray-500 mb-1">End message</div>
                                <div className="text-sm text-gray-700">{block.endMessage}</div>
                            </div>
                        )}

                        <div className="pt-4 border-t border-gray-200">
                            <div className="text-xs text-gray-500 space-y-1">
                                <div>• Click logs to expand details</div>
                                <div>• Drag to pan, scroll to zoom</div>
                                <div>• Referenced blocks are clickable</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {isOpen && (
                <div
                    className="fixed inset-0 bg-gray-900 bg-opacity-25 z-40"
                    onClick={onToggle}
                />
            )}
        </>
    );
};
