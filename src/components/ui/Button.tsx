import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
    children: React.ReactNode;
}

export default function Button({
                                   variant = 'primary',
                                   size = 'md',
                                   loading = false,
                                   children,
                                   disabled,
                                   className = '',
                                   ...props
                               }: ButtonProps) {
    const baseClass = 'btn';
    const variantClass = `btn-${variant}`;
    const sizeClass = `btn-${size}`;

    return (
        <button
            className={`${baseClass} ${variantClass} ${sizeClass} ${className}`.trim()}
            disabled={disabled || loading}
            {...props}
        >
            {loading ? '⏳' : children}
        </button>
    );
}