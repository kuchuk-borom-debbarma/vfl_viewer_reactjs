import React from 'react';

interface LoadingButtonProps {
    onClick: () => void;
    loading: boolean;
    hasMore: boolean;
    label?: string;
    icon?: string;
    variant?: 'primary' | 'outline';
    size?: 'sm' | 'md' | 'lg';
}

export const LoadingButton: React.FC<LoadingButtonProps> = ({
                                                                onClick,
                                                                loading,
                                                                hasMore,
                                                                label = 'Load More',
                                                                icon = '+',
                                                                variant = 'outline',
                                                                size = 'sm'
                                                            }) => {
    if (!hasMore) return null;

    const sizeClasses = {
        sm: 'px-3 py-1.5 text-xs',
        md: 'px-4 py-2 text-sm',
        lg: 'px-6 py-3 text-base'
    };

    return (
        <div className="flex justify-center my-4">
            <button
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onClick();
                }}
                disabled={loading}
                className={`${sizeClasses[size]} bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-all duration-200 flex items-center gap-2`}
            >
                <span>{loading ? '⋯' : icon}</span>
                <span>{loading ? 'Loading...' : label}</span>
            </button>
        </div>
    );
};
