import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'danger';
    children: React.ReactNode;
}

const variants = {
    primary: 'bg-blue-600 text-white shadow-blue-400/40',
    secondary: 'bg-transparent text-blue-600 border-blue-600',
    outline: 'bg-transparent text-white border-white',
    danger: 'bg-red-600 text-white'
};

export const Button: React.FC<ButtonProps> = ({variant = 'primary', children, className = '', ...props}) => (
    <button
        className={`px-4 py-2 rounded-lg font-semibold cursor-pointer transition-all border-2 ${variants[variant]} ${className}`}
        {...props}
    >
        {children}
    </button>
);