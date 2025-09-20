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
    const getLifecycleStage = () => {
        if (!block.enteredAt) return {
            stage: 'Created',
            color: 'bg-blue-100 text-blue-800 border-blue-200',
            description: 'Block has been created but not yet entered'
        };
        if (!block.exitedAt) return {
            stage: 'Executing',
            color: 'bg-amber-100 text-amber-800 border-amber-200',
            description: 'Block is currently executing'
        };
        if (!block.returnedAt) return {
            stage: 'Finished',
            color: 'bg-purple-100 text-purple-800 border-purple-200',
            description: 'Block execution completed but not yet returned'
        };
        return {
            stage: 'Returned',
            color: 'bg-green-100 text-green-800 border-green-200',
            description: 'Block has completed and returned to caller'
        };
    };

    const lifecycle = getLifecycleStage();

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
                        {/* Block Header */}
                        <div>
                            <h3 className="font-semibold text-gray-800 mb-2">{block.name}</h3>
                            <div className="text-xs font-mono text-gray-500 bg-gray-50 px-2 py-1 rounded">
                                {getTrimmedId(block.id)}
                            </div>
                            <div className={`mt-2 px-3 py-1 rounded-lg text-sm font-medium border ${lifecycle.color}`}>
                                {lifecycle.stage}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                                {lifecycle.description}
                            </div>
                        </div>

                        {/* Block Lifecycle Timeline */}
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <div className="text-sm font-semibold text-gray-700 mb-3">Block Lifecycle</div>
                            <div className="space-y-3">
                                {/* Created */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                                        <span className="text-sm font-medium text-gray-700">Created</span>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm text-gray-800">
                                            {new Date(block.createdAt).toLocaleTimeString()}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {new Date(block.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>

                                {/* Entered */}
                                {block.enteredAt ? (
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                                            <span className="text-sm font-medium text-gray-700">Entered</span>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm text-gray-800">
                                                {new Date(block.enteredAt).toLocaleTimeString()}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                +{formatDuration(block.createdAt, block.enteredAt)}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between opacity-50">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 bg-gray-300 rounded-full border-2 border-gray-400"></div>
                                            <span className="text-sm text-gray-500">Entered</span>
                                        </div>
                                        <div className="text-xs text-gray-400">Pending</div>
                                    </div>
                                )}

                                {/* Exited */}
                                {block.exitedAt ? (
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 bg-orange-400 rounded-full"></div>
                                            <span className="text-sm font-medium text-gray-700">Exited</span>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm text-gray-800">
                                                {new Date(block.exitedAt).toLocaleTimeString()}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                +{formatDuration(block.enteredAt || block.createdAt, block.exitedAt)}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between opacity-50">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 bg-gray-300 rounded-full border-2 border-gray-400"></div>
                                            <span className="text-sm text-gray-500">Exited</span>
                                        </div>
                                        <div className="text-xs text-gray-400">
                                            {block.enteredAt ? 'In Progress' : 'Pending'}
                                        </div>
                                    </div>
                                )}

                                {/* Returned */}
                                {block.returnedAt ? (
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
                                            <span className="text-sm font-medium text-gray-700">Returned</span>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm text-gray-800">
                                                {new Date(block.returnedAt).toLocaleTimeString()}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                +{formatDuration(block.exitedAt || block.enteredAt || block.createdAt, block.returnedAt)}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between opacity-50">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 bg-gray-300 rounded-full border-2 border-gray-400"></div>
                                            <span className="text-sm text-gray-500">Returned</span>
                                        </div>
                                        <div className="text-xs text-gray-400">
                                            {block.exitedAt ? 'Pending Return' : block.enteredAt ? 'In Progress' : 'Pending'}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Duration Summary */}
                        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                            <div className="text-sm font-semibold text-blue-800 mb-2">Duration Summary</div>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-blue-700">Total Duration</span>
                                    <span className="font-mono text-blue-900 font-semibold">
                                        {formatDuration(block.createdAt, block.returnedAt || block.exitedAt || Date.now())}
                                    </span>
                                </div>

                                {block.enteredAt && (
                                    <div className="flex justify-between">
                                        <span className="text-blue-600">Setup Time</span>
                                        <span className="font-mono text-blue-800">
                                            {formatDuration(block.createdAt, block.enteredAt)}
                                        </span>
                                    </div>
                                )}

                                {block.enteredAt && block.exitedAt && (
                                    <div className="flex justify-between">
                                        <span className="text-blue-600">Execution Time</span>
                                        <span className="font-mono text-blue-800 font-semibold">
                                            {formatDuration(block.enteredAt, block.exitedAt)}
                                        </span>
                                    </div>
                                )}

                                {block.exitedAt && block.returnedAt && (
                                    <div className="flex justify-between">
                                        <span className="text-blue-600">Cleanup Time</span>
                                        <span className="font-mono text-blue-800">
                                            {formatDuration(block.exitedAt, block.returnedAt)}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Exit Message */}
                        {block.exitMessage && (
                            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                <div className="text-sm font-medium text-gray-700 mb-2">Exit Message</div>
                                <div className="text-sm text-gray-600 leading-relaxed">
                                    {block.exitMessage}
                                </div>
                            </div>
                        )}

                        {/* Tips */}
                        <div className="pt-4 border-t border-gray-200">
                            <div className="text-xs font-semibold text-gray-700 mb-2">Navigation Tips</div>
                            <div className="text-xs text-gray-500 space-y-1">
                                <div>• Click logs to expand details</div>
                                <div>• Drag to pan, scroll to zoom</div>
                                <div>• Referenced blocks are clickable</div>
                                <div>• Color coding shows nesting levels</div>
                                <div>• TRACE_REMOTE = service calls</div>
                            </div>
                        </div>

                        {/* Debug Info */}
                        <div className="pt-4 border-t border-gray-200">
                            <div className="text-xs font-semibold text-gray-700 mb-2">Technical Details</div>
                            <div className="text-xs text-gray-500 space-y-1 font-mono">
                                <div>ID: {block.id}</div>
                                <div>Cursor: {block.cursor}</div>
                                <div>Created: {block.createdAt}</div>
                                {block.enteredAt && <div>Entered: {block.enteredAt}</div>}
                                {block.exitedAt && <div>Exited: {block.exitedAt}</div>}
                                {block.returnedAt && <div>Returned: {block.returnedAt}</div>}
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