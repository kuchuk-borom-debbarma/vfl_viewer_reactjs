import React from 'react';
import { Block } from '../../types';
import { Card } from '../UI/Card';
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
                className="fixed top-0 left-0 h-full bg-white border-r border-gray-200 z-50 transition-transform duration-300 overflow-y-auto shadow-xl"
                style={{
                    width: SIDEBAR_WIDTH,
                    transform: isOpen ? 'translateX(0)' : 'translateX(-100%)'
                }}
            >
                <div className="p-6">
                    <div className="text-xl font-bold mb-6 pb-3 border-b-2 border-blue-500 text-blue-600 flex items-center gap-2">
                        📦 Block Information
                    </div>

                    <Card className="border-blue-200">
                        <div className="text-lg font-bold mb-4 text-blue-700">
                            {block.name}
                        </div>

                        <div className="space-y-4 text-sm">
                            <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-3">
                                <span className="text-gray-500 font-medium">🆔 ID:</span>
                                <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded break-all">
                                    {getTrimmedId(block.id)}
                                </span>

                                <span className="text-gray-500 font-medium">🚀 Started:</span>
                                <span className="text-gray-700">{new Date(block.startTime).toLocaleString()}</span>

                                <span className="text-gray-500 font-medium">🏁 Ended:</span>
                                <span className={isOngoing ? 'text-orange-600 font-semibold' : 'text-gray-700'}>
                                    {isOngoing ? "⏳ Ongoing" : new Date(block.endTime!).toLocaleString()}
                                </span>

                                <span className="text-gray-500 font-medium">⏱️ Duration:</span>
                                <span className="text-blue-600 font-bold">{formatDuration(block.startTime, block.endTime)}</span>

                                <span className="text-gray-500 font-medium">📅 Created:</span>
                                <span className="text-gray-700">{new Date(block.createdAt).toLocaleString()}</span>
                            </div>

                            {block.endMessage && (
                                <div className="mt-4 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
                                    <div className="font-semibold mb-2 text-blue-700 text-sm">
                                        💬 End Message:
                                    </div>
                                    <div className="italic text-sm text-blue-800 leading-relaxed">"{block.endMessage}"</div>
                                </div>
                            )}

                            <div
                                className={`mt-4 p-4 rounded-xl border text-center font-bold text-sm ${
                                    isOngoing
                                        ? 'bg-orange-50 border-orange-200 text-orange-800'
                                        : 'bg-green-50 border-green-200 text-green-800'
                                }`}
                            >
                                {isOngoing ? '🔄 Currently Running' : '✅ Completed'}
                            </div>
                        </div>
                    </Card>

                    {/* Additional Info Section */}
                    <div className="mt-6">
                        <div className="text-lg font-semibold mb-3 text-gray-700 flex items-center gap-2">
                            📊 Quick Stats
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                                <div className="text-2xl font-bold text-blue-600">
                                    {formatDuration(block.startTime, block.endTime)}
                                </div>
                                <div className="text-xs text-blue-700 font-medium">Total Duration</div>
                            </div>
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
                                <div className="text-lg font-bold text-gray-700">
                                    {new Date(block.startTime).toLocaleDateString()}
                                </div>
                                <div className="text-xs text-gray-600 font-medium">Execution Date</div>
                            </div>
                        </div>
                    </div>

                    {/* Help Section */}
                    <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-xl">
                        <div className="text-sm font-semibold text-gray-700 mb-2">💡 Navigation Tips</div>
                        <ul className="text-xs text-gray-600 space-y-1">
                            <li>• Click logs to expand details</li>
                            <li>• Use controls to zoom & pan</li>
                            <li>• Referenced blocks are clickable</li>
                            <li>• Scroll horizontally for siblings</li>
                        </ul>
                    </div>
                </div>
            </div>

            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-20 z-40 backdrop-blur-sm"
                    onClick={onToggle}
                />
            )}
        </>
    );
};