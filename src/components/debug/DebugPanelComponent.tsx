import React, { useState } from 'react';
import { Button } from '../UI/Button';
import { CONFIG } from '../../config/constants';
import { purgeData } from '../../api/vfl';

interface DebugPanelProps {
    onDataPurged?: () => void;
}

export const DebugPanel: React.FC<DebugPanelProps> = ({ onDataPurged }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isPurging, setIsPurging] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);

    // Only show in development mode
    if (!CONFIG.IS_DEV) {
        return null;
    }

    const handlePurgeClick = () => {
        setShowConfirmation(true);
    };

    const handleConfirmPurge = async () => {
        setIsPurging(true);
        setShowConfirmation(false);

        try {
            await purgeData();
            onDataPurged?.();

            // Show success feedback
            const successTimeout = setTimeout(() => {
                setIsPurging(false);
            }, 1000);

            return () => clearTimeout(successTimeout);
        } catch (error) {
            console.error('Failed to purge data:', error);
            setIsPurging(false);
            alert('Failed to purge data. Check console for details.');
        }
    };

    const handleCancelPurge = () => {
        setShowConfirmation(false);
    };

    return (
        <div className="fixed bottom-4 right-4 z-50">
            <div className="bg-orange-500 text-white rounded-lg shadow-lg border-2 border-orange-600">
                {!isExpanded ? (
                    <button
                        onClick={() => setIsExpanded(true)}
                        className="px-3 py-2 text-sm font-medium hover:bg-orange-600 rounded-lg transition-colors flex items-center gap-2"
                        title="Development Debug Panel"
                    >
                        🔧 DEV
                    </button>
                ) : (
                    <div className="p-4 min-w-[250px]">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <span className="text-lg">🔧</span>
                                <span className="font-bold text-sm">Debug Panel</span>
                            </div>
                            <button
                                onClick={() => setIsExpanded(false)}
                                className="text-white hover:bg-orange-600 rounded px-2 py-1 text-sm"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-3">
                            <div className="text-xs bg-orange-600 rounded px-2 py-1">
                                Development Mode Only
                            </div>

                            {showConfirmation ? (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                    <div className="text-red-800 font-medium text-sm mb-2">
                                        ⚠️ Confirm Data Purge
                                    </div>
                                    <div className="text-red-700 text-xs mb-3">
                                        This will permanently delete all blocks and logs from the database. This action cannot be undone.
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleConfirmPurge}
                                            disabled={isPurging}
                                            className="flex-1 bg-red-600 text-white text-xs px-3 py-1.5 rounded hover:bg-red-700 disabled:opacity-50 font-medium"
                                        >
                                            {isPurging ? 'Purging...' : 'YES, PURGE'}
                                        </button>
                                        <button
                                            onClick={handleCancelPurge}
                                            disabled={isPurging}
                                            className="flex-1 bg-gray-300 text-gray-700 text-xs px-3 py-1.5 rounded hover:bg-gray-400 disabled:opacity-50"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handlePurgeClick}
                                    disabled={isPurging}
                                    className="w-full bg-white text-orange-700 border-orange-300 hover:bg-orange-50 text-xs"
                                >
                                    {isPurging ? (
                                        <>
                                            <span className="animate-spin mr-2">⭕</span>
                                            {isPurging && !showConfirmation ? 'Purged!' : 'Purging...'}
                                        </>
                                    ) : (
                                        <>
                                            🗑️ Purge All Data
                                        </>
                                    )}
                                </Button>
                            )}

                            <div className="text-xs text-orange-100 space-y-1">
                                <div>Environment: {CONFIG.IS_DEV ? 'Development' : 'Production'}</div>
                                <div>API Host: {CONFIG.API_HOST}</div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};