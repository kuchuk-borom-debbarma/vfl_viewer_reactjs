import React from 'react';
import { Button } from './Button';

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
                                                                icon = '🔥',
                                                                variant = 'primary',
                                                                size = 'md'
                                                            }) => {
    if (!hasMore) return null;

    return (
        <div className="flex justify-center my-4">
            <Button
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onClick();
                }}
                disabled={loading}
                variant={variant}
                size={size}
                className="flex items-center gap-2"
            >
        <span className="text-sm">
          {loading ? '⏳' : icon}
        </span>
                <span>{loading ? 'Loading...' : label}</span>
            </Button>
        </div>
    );
};