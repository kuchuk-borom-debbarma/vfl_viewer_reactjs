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
    const baseStyles = 'card rounded-xl transition-all duration-200';
    const variants = {
        default: 'bg-white border border-gray-200',
        outlined: 'bg-white border-2 border-primary',
        elevated: 'bg-white shadow-lg border-0'
    };
    const interactiveStyles = interactive ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5 active:translate-y-0' : '';

    return (
        <div
            className={`${baseStyles} ${variants[variant]} ${interactiveStyles} ${className}`}
            {...props}
        >
            {children}
        </div>
    );
};