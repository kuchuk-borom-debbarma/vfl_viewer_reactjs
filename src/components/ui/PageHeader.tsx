import React from 'react';
import { Button } from './Button';

interface PageHeaderProps {
    title: string;
    backTo?: { path: string; label: string };
    actions?: React.ReactNode;
    subtitle?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, backTo, actions, subtitle }) => (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
            {backTo && (
                <Button variant="secondary" onClick={() => window.location.href = backTo.path} className="mb-4 text-sm">
                    ← {backTo.label}
                </Button>
            )}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        {title}
                    </h1>
                    {subtitle && <p className="text-sm text-gray-600 font-mono mt-1">{subtitle}</p>}
                </div>
                <div className="flex items-center gap-4">{actions}</div>
            </div>
        </div>
    </div>
);