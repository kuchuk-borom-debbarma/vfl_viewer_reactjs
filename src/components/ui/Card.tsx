import React from 'react';

interface CardProps {
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
    hover?: boolean;
}

export default function Card({ children, onClick, className = '', hover = true }: CardProps) {
    return (
        <div
            className={`card ${hover ? 'card-hover' : ''} ${onClick ? 'card-clickable' : ''} ${className}`.trim()}
            onClick={onClick}
        >
            {children}
        </div>
    );
}