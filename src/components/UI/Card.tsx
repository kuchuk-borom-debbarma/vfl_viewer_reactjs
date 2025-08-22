import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'outlined' | 'elevated';
    interactive?: boolean;
    children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
                                              variant = 'default',
                                              interactive = false,
                                              className = '',
                                              children,
                                              ...props
                                          }) => {
    const baseStyles = 'bg-white rounded-xl p-4 transition-all duration-200';

    const variants = {
        default: 'border border-gray-200 shadow-sm',
        outlined: 'border-2 border-blue-600',
        elevated: 'shadow-lg border-0'
    };

    const interactiveStyles = interactive
        ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5 active:translate-y-0'
        : '';

    return (
        <div
            className={`${baseStyles} ${variants[variant]} ${interactiveStyles} ${className}`}
            {...props}
        >
            {children}
        </div>
    );
};