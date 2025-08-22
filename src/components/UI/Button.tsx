import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
                                                  variant = 'primary',
                                                  size = 'md',
                                                  className = '',
                                                  children,
                                                  ...props
                                              }) => {
    const baseStyles = 'btn transition-all duration-200 font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-primary';
    const variants = {
        primary: 'bg-primary text-white hover:bg-primary-dark',
        outline: 'bg-transparent border border-primary text-primary hover:bg-blue-50',
        ghost: 'bg-transparent text-gray-600 hover:text-primary hover:bg-gray-50'
    };
    const sizes = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2',
        lg: 'px-6 py-3 text-lg'
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
    {...props}
>
    {children}
    </button>
);
};