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
                className="fixed top-0 left-0 h-full bg-white border-r border-gray-200 z-50 transition-transform duration-300 overflow-y-auto shadow-lg"
                style={{
                    width: SIDEBAR_WIDTH,
                    transform: isOpen ? 'translateX(0)' : 'translateX(-100%)'
                }}
            >
                <div className="p-6">
                    <div className="text-lg font-semibold mb-4 pb-2 border-b-2 border-primary text-primary flex items-center gap-2">
                        📦 Block Information
                    </div>

                    <Card>
                        <div className="text-base font-semibold mb-3 text-primary">
                            {block.name}
                        </div>

                        <div className="space-y-2 text-sm">
                            <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-2">
                                <span className="text-gray-500">🆔 ID:</span>
                                <span className="font-mono text-xs break-all">
                  {getTrimmedId(block.id)}
                </span>

                                <span className="text-gray-500">🚀 Started:</span>
                                <span>{new Date(block.startTime).toLocaleString()}</span>

                                <span className="text-gray-500">🏁 Ended:</span>
                                <span>{isOngoing ? "⏳ Ongoing" : new Date(block.endTime!).toLocaleString()}</span>

                                <span className="text-gray-500">⏱️ Duration:</span>
                                <span>{formatDuration(block.startTime, block.endTime)}</span>

                                <span className="text-gray-500">📅 Created:</span>
                                <span>{new Date(block.createdAt).toLocaleString()}</span>
                            </div>

                            {block.endMessage && (
                                <div className="mt-3 p-3 bg-gray-50 border-l-3 border-primary rounded-md">
                                    <div className="font-semibold mb-1 text-primary text-xs">
                                        💬 End Message:
                                    </div>
                                    <div className="italic text-xs">"{block.endMessage}"</div>
                                </div>
                            )}

                            <div
                                className={`mt-3 p-3 rounded-lg border text-center font-medium ${
                                    isOngoing
                                        ? 'bg-orange-50 border-orange-200 text-orange-800'
                                        : 'bg-blue-50 border-blue-200 text-blue-800'
                                }`}
                            >
                                {isOngoing ? '🔄 Currently Running' : '✅ Completed'}
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-10 z-40"
                    onClick={onToggle}
                />
            )}
        </>
    );
};