import React from "react";

interface LandingProps {
    onShowOperations: () => void;
}

export const Landing: React.FC<LandingProps> = ({ onShowOperations }) => {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-6xl mx-auto px-6 py-4">
                    <div className="flex justify-between items-center">
                        <div className="text-2xl font-bold text-gray-800">
                            VFL
                        </div>
                        <nav className="flex gap-6">
                            <button className="text-gray-600 hover:text-gray-800 transition-colors text-sm font-medium">
                                About
                            </button>
                            <button className="text-gray-600 hover:text-gray-800 transition-colors text-sm font-medium">
                                Documentation
                            </button>
                        </nav>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="py-20 px-6 bg-white">
                <div className="max-w-5xl mx-auto text-center">
                    <h1 className="text-5xl md:text-6xl font-bold mb-8 text-gray-800 leading-tight">
                        Visual Flow Logger
                    </h1>
                    <p className="text-xl mb-6 text-gray-600 max-w-4xl mx-auto leading-relaxed">
                        <span className="font-semibold text-gray-800">Hierarchical Logging Framework</span> that captures and visualizes
                        how your applications <span className="font-semibold">actually execute</span>
                    </p>
                    <p className="text-base mb-12 text-gray-500 max-w-3xl mx-auto">
                        Unlike traditional flat logging, VFL creates hierarchical representations of your program's flow,
                        showing relationships between operations across distributed systems.
                    </p>
                    <div className="flex gap-4 justify-center flex-wrap">
                        <button
                            onClick={onShowOperations}
                            className="px-6 py-3 bg-gray-800 text-white font-medium rounded-lg hover:bg-gray-900 transition-all duration-200 shadow-sm hover:shadow-md"
                        >
                            Explore Operations
                        </button>
                        <button className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-all duration-200">
                            Documentation
                        </button>
                    </div>
                </div>
            </section>

            {/* Comparison Section */}
            <section className="py-20 px-6 bg-gray-50">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-3xl font-bold text-center mb-16 text-gray-800">
                        Traditional vs VFL Logging
                    </h2>

                    <div className="grid lg:grid-cols-2 gap-8">
                        {/* Traditional Logging */}
                        <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
                            <div className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                                <span className="w-8 h-8 bg-red-100 text-red-600 rounded-lg flex items-center justify-center text-sm">✕</span>
                                Traditional Flat Logging
                            </div>
                            <div className="space-y-2 font-mono text-xs mb-6">
                                <div className="p-2 bg-gray-50 rounded border-l-2 border-gray-300">
                                    [INFO] 14:23:10 Processing order ORD-2025-8847
                                </div>
                                <div className="p-2 bg-gray-50 rounded border-l-2 border-blue-300">
                                    [INFO] 14:23:11 Authenticating customer
                                </div>
                                <div className="p-2 bg-gray-50 rounded border-l-2 border-gray-300">
                                    [INFO] 14:23:11 Validating email credentials
                                </div>
                                <div className="p-2 bg-gray-50 rounded border-l-2 border-gray-300">
                                    [INFO] 14:23:11 Creating customer session
                                </div>
                                <div className="p-2 bg-gray-50 rounded border-l-2 border-yellow-300">
                                    [INFO] 14:23:12 Processing payment
                                </div>
                                <div className="p-2 bg-gray-50 rounded border-l-2 border-gray-300">
                                    [INFO] 14:23:13 Warehouse picking process
                                </div>
                                <div className="p-2 bg-gray-50 rounded border-l-2 border-red-300">
                                    [ERROR] 14:23:15 Email service timeout
                                </div>
                                <div className="p-2 bg-gray-50 rounded border-l-2 border-green-300">
                                    [INFO] 14:23:16 Order completed
                                </div>
                            </div>
                            <div className="text-gray-600 text-sm">
                                <p className="font-semibold mb-2">Questions remain:</p>
                                <ul className="list-disc ml-5 space-y-1">
                                    <li>Which operations ran in parallel?</li>
                                    <li>What's the execution hierarchy?</li>
                                    <li>How do distributed services relate?</li>
                                    <li>What's the actual flow timeline?</li>
                                </ul>
                            </div>
                        </div>

                        {/* VFL Logging */}
                        <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
                            <div className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                                <span className="w-8 h-8 bg-green-100 text-green-600 rounded-lg flex items-center justify-center text-sm">✓</span>
                                VFL Hierarchical Logging
                            </div>

                            {/* Simulated VFL UI */}
                            <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 space-y-2 text-sm mb-6">
                                {/* Main Order Log */}
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                    <div className="flex items-center gap-2">
                                        <span className="w-6 h-6 bg-white rounded border text-xs flex items-center justify-center">🛒</span>
                                        <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded font-medium">Start</span>
                                        <span className="flex-1 font-medium text-blue-700">New order: ORD-2025-8847</span>
                                        <span className="text-xs text-gray-500">14:23:10</span>
                                    </div>
                                </div>

                                {/* Authentication Block */}
                                <div className="ml-4 space-y-2">
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                        <div className="flex items-center gap-2">
                                            <button className="text-gray-400 hover:text-gray-600">▼</button>
                                            <span className="w-6 h-6 bg-white rounded border text-xs flex items-center justify-center">🔐</span>
                                            <span className="bg-green-600 text-white text-xs px-2 py-1 rounded font-medium">Auth</span>
                                            <span className="flex-1 font-medium text-green-700">Customer authentication</span>
                                            <span className="text-xs text-gray-500">+150ms</span>
                                        </div>
                                    </div>

                                    {/* Parallel Operations Indicator */}
                                    <div className="ml-8 p-2 bg-purple-50 border border-purple-200 rounded-lg">
                                        <div className="text-xs text-purple-700 font-medium mb-2 text-center">
                                            2 parallel operations
                                        </div>
                                        <div className="flex gap-2">
                                            <div className="flex-1 bg-white border border-gray-200 rounded p-2 text-xs">
                                                <div className="flex items-center gap-1">
                                                    <span>🏭</span>
                                                    <span className="font-medium">Warehouse</span>
                                                </div>
                                            </div>
                                            <div className="flex-1 bg-white border border-gray-200 rounded p-2 text-xs">
                                                <div className="flex items-center gap-1">
                                                    <span>🏷️</span>
                                                    <span className="font-medium">Shipping</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Completion */}
                                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                                        <div className="flex items-center gap-2">
                                            <span className="w-6 h-6 bg-white rounded border text-xs flex items-center justify-center">✓</span>
                                            <span className="bg-gray-600 text-white text-xs px-2 py-1 rounded font-medium">Complete</span>
                                            <span className="flex-1 font-medium text-gray-700">Order completed</span>
                                            <span className="text-xs text-gray-500">+5.2s</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="text-gray-600 text-sm">
                                <p className="font-semibold mb-2">Clear insights:</p>
                                <ul className="list-disc ml-5 space-y-1">
                                    <li>Visual execution hierarchy & nesting</li>
                                    <li>Parallel vs sequential operations</li>
                                    <li>Cross-service flow tracing</li>
                                    <li>Precise timing relationships</li>
                                    <li>Interactive exploration of nested blocks</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 px-6 bg-white">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-3xl font-bold text-center mb-16 text-gray-800">
                        Why Choose VFL?
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <FeatureCard
                            title="Hierarchical Structure"
                            icon="🗂️"
                            desc="Organize logs in nested blocks that mirror your actual execution flow, making complex operations easy to understand."
                        />
                        <FeatureCard
                            title="Distributed Tracing"
                            icon="🌐"
                            desc="Seamlessly track operations across multiple services and systems with built-in distributed continuation."
                        />
                        <FeatureCard
                            title="Execution Pattern Recognition"
                            icon="⚡"
                            desc="Automatically identify and visualize different program flow patterns: sequential, parallel, pub/sub, and nested operations."
                        />
                        <FeatureCard
                            title="Interactive Visualization"
                            icon="📊"
                            desc="Zoomable, collapsible flow diagrams with detailed timing analysis and cross-references between related operations."
                        />
                        <FeatureCard
                            title="Performance Insights"
                            icon="🚀"
                            desc="Built-in timing analysis showing bottlenecks, parallel efficiency, and execution relationships with precise metrics."
                        />
                        <FeatureCard
                            title="Developer Experience"
                            icon="💻"
                            desc="Minimal API, zero configuration overhead, and intuitive visual debugging for modern development workflows."
                        />
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-6 bg-gray-800 text-white">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl font-bold mb-6">
                        Ready to Visualize Your Application Flow?
                    </h2>
                    <p className="text-lg mb-8 text-gray-300">
                        Stop guessing how your code executes. Start seeing the complete picture.
                    </p>
                    <button
                        onClick={onShowOperations}
                        className="px-8 py-4 bg-white text-gray-800 font-semibold rounded-lg shadow-lg hover:shadow-xl hover:bg-gray-50 transition-all duration-300"
                    >
                        Explore VFL Operations
                    </button>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 px-6 bg-white border-t border-gray-200">
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-6">
                            <div className="text-xl font-bold text-gray-800">VFL</div>
                            <span className="text-gray-500 text-sm">Visual Flow Logger</span>
                        </div>
                        <div className="flex gap-6">
                            <a href="#" className="text-gray-600 hover:text-gray-800 transition-colors text-sm">GitHub</a>
                            <a href="#" className="text-gray-600 hover:text-gray-800 transition-colors text-sm">Documentation</a>
                            <a href="#" className="text-gray-600 hover:text-gray-800 transition-colors text-sm">Community</a>
                        </div>
                    </div>
                    <div className="mt-8 pt-8 border-t border-gray-200 text-center text-gray-500 text-sm">
                        © {new Date().getFullYear()} VFL - Hierarchical Logging Framework for Modern Applications
                    </div>
                </div>
            </footer>
        </div>
    );
};

const FeatureCard: React.FC<{
    title: string;
    icon: string;
    desc: string;
}> = ({ title, icon, desc }) => (
    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 hover:border-gray-300">
        <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-xl mb-4">
            {icon}
        </div>
        <h3 className="text-lg font-semibold mb-3 text-gray-800">{title}</h3>
        <p className="text-gray-600 text-sm leading-relaxed">{desc}</p>
    </div>
);
