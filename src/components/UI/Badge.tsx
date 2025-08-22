import React from 'react';

interface BadgeProps {
    text: string;
    color: string;
    size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ text, color, size = 'sm' }) => {
    const sizeStyles = {
        sm: 'px-2 py-1 text-xs',
        md: 'px-3 py-1.5 text-sm'
    };

    return (
        <span
            className={`inline-flex items-center font-semibold rounded-md uppercase tracking-wide ${sizeStyles[size]}`}
            style={{ backgroundColor: color, color: 'white' }}
        >
      {text}
    </span>
    );
};