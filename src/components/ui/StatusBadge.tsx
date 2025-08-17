import React from 'react';

interface StatusBadgeProps {
    type: 'message' | 'error' | 'warning' | 'debug' | 'info';
    children: React.ReactNode;
    className?: string;
}

export default function StatusBadge({ type, children, className = '' }: StatusBadgeProps) {
    return (
        <span className={`status-badge status-badge-${type} ${className}`.trim()}>
      {children}
    </span>
    );
}