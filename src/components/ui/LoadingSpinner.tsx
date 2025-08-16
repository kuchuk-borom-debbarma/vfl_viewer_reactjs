import React from 'react';

interface SpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    text?: string;
}

export const LoadingSpinner: React.FC<SpinnerProps> = ({ size = 'md', text }) => (
    <div className="flex flex-col items-center justify-center p-12">
        <div className={`border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mb-4 ${
            size === 'sm' ? 'w-6 h-6' : size === 'lg' ? 'w-12 h-12' : 'w-8 h-8'
        }`} />
        {text && <p className="text-gray-600 font-medium">{text}</p>}
    </div>
);