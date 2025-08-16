import React from 'react';

interface EmptyStateProps {
    icon: string;
    title: string;
    message: string;
    action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, message, action }) => (
    <div className="flex flex-col items-center justify-center min-h-96 text-center">
        <div className="text-6xl mb-4">{icon}</div>
        <h3 className="text-xl font-semibold mb-2 text-gray-800">{title}</h3>
        <p className="text-gray-600 max-w-md leading-relaxed mb-6">{message}</p>
        {action}
    </div>
);