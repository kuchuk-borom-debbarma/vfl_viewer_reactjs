import React from 'react';

interface LoadingSpinnerProps {
    message?: string;
    size?: 'sm' | 'md' | 'lg';
}

export default function LoadingSpinner({ message, size = 'md' }: LoadingSpinnerProps) {
    const sizeClasses = {
        sm: 'spinner-sm',
        md: 'spinner-md',
        lg: 'spinner-lg'
    };

    return (
        <div className="loading-container">
            <div className={`loading-spinner ${sizeClasses[size]}`}></div>
            {message && <span className="loading-message">{message}</span>}
        </div>
    );
}