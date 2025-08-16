import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';

const LandingPage: React.FC = () => {
    const navigate = useNavigate();

    const FeatureCard = ({ icon, title, description }: { icon: string, title: string, description: string }) => (
        <div className="p-8 rounded-xl bg-gray-50 text-center">
            <div className="text-5xl mb-4">{icon}</div>
            <h3 className="text-xl font-semibold mb-3">{title}</h3>
            <p className="text-gray-600 leading-relaxed">{description}</p>
        </div>
    );

    return (

        <div className="font-sans text-gray-800 bg-white">
            {/* Add this at the very top of your LandingPage return statement */}
            <div className="bg-red-500 text-white p-4 text-center font-bold">
                🚨 TAILWIND TEST - If this is red with white text, Tailwind works!
            </div>
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur border-b border-gray-200 z-50">
                <div className="max-w-6xl mx-auto px-8 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-2 text-xl font-bold">
                        <span className="text-2xl">📊</span>
                        <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">VFL</span>
                    </div>
                    <Button onClick={() => navigate('/blocks')}>View Blocks</Button>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20 bg-gradient-to-br from-blue-50 to-indigo-100 text-center">
                <div className="max-w-4xl mx-auto px-8">
                    <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Visual Flow Logger
                    </h1>
                    <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                        A hierarchical logging framework with distributed tracing support.
                        Transform flat, disconnected log entries into structured visualizations.
                    </p>
                    <div className="flex gap-4 justify-center flex-wrap">
                        <Button onClick={() => navigate('/blocks')}>View Blocks</Button>
                        <Button variant="secondary">Documentation</Button>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-white">
                <div className="max-w-5xl mx-auto px-8 text-center">
                    <h2 className="text-4xl font-bold mb-12">Key Features</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon="🌳"
                            title="Hierarchical Structure"
                            description="Organize logs in tree-like structures showing clear parent-child relationships."
                        />
                        <FeatureCard
                            icon="🌐"
                            title="Distributed Tracing"
                            description="Track operations across multiple services maintaining context and relationships."
                        />
                        <FeatureCard
                            icon="⚡"
                            title="Multiple Flow Patterns"
                            description="Support for sequential, parallel, and event-driven execution patterns."
                        />
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center">
                <div className="max-w-3xl mx-auto px-8">
                    <h2 className="text-4xl font-bold mb-4">Ready to See Your Application Flow?</h2>
                    <p className="text-xl mb-8 opacity-90">
                        Transform your logging from flat entries into meaningful visual structures.
                    </p>
                    <Button onClick={() => navigate('/blocks')} variant="outline">
                        View Flow Blocks
                    </Button>
                </div>
            </section>
        </div>
    );
};

export default LandingPage;