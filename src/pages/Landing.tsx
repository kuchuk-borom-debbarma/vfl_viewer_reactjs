import React from "react";

interface LandingProps {
    onShowOperations: () => void;
}

export const Landing: React.FC<LandingProps> = ({ onShowOperations }) => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
            {/* Header */}
            <header className="flex justify-between items-center p-6 bg-white/70 backdrop-blur-sm border-b border-gray-200/50">
                <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    VFL
                </div>
                <nav className="flex gap-8">
                    <button className="text-gray-600 hover:text-blue-600 transition-colors font-medium">About</button>
                    <button className="text-gray-600 hover:text-blue-600 transition-colors font-medium">Documentation</button>
                </nav>
            </header>

            {/* Hero Section */}
            <section className="text-center py-20 px-6">
                <div className="max-w-5xl mx-auto">
                    <h1 className="text-6xl md:text-7xl font-bold mb-8 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent leading-tight">
                        Visual Flow Logger
                    </h1>
                    <p className="text-2xl mb-6 text-gray-700 max-w-4xl mx-auto leading-relaxed">
                        <span className="font-semibold text-blue-600">Hierarchical Logging Framework</span> that captures and visualizes
                        how your applications <span className="font-semibold">actually execute</span>
                    </p>
                    <p className="text-lg mb-12 text-gray-600 max-w-3xl mx-auto">
                        Unlike traditional flat logging, VFL creates hierarchical representations of your program's flow,
                        showing relationships between operations across distributed systems.
                    </p>
                    <div className="flex gap-6 justify-center flex-wrap">
                        <button
                            onClick={onShowOperations}
                            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
                        >
                            🚀 Explore Operations
                        </button>
                        <button className="px-8 py-4 border-2 border-blue-600 text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-all duration-300">
                            📚 Documentation
                        </button>
                    </div>
                </div>
            </section>

            {/* Comparison Section - Updated with better examples */}
            <section className="py-20 px-6 bg-white/50">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-4xl font-bold text-center mb-16 text-gray-800">
                        Traditional vs VFL Logging
                    </h2>

                    <div className="grid md:grid-cols-2 gap-12">
                        {/* Traditional Logging */}
                        <div className="bg-red-50 border border-red-200 rounded-2xl p-8">
                            <div className="text-2xl font-bold text-red-700 mb-6 flex items-center gap-3">
                                ❌ Traditional Flat Logging
                            </div>
                            <div className="space-y-3 font-mono text-sm">
                                <div className="p-3 bg-gray-100 rounded border-l-4 border-gray-400">
                                    [INFO] 14:23:10 Processing order ORD-2025-8847
                                </div>
                                <div className="p-3 bg-gray-100 rounded border-l-4 border-blue-400">
                                    [INFO] 14:23:11 Authenticating customer
                                </div>
                                <div className="p-3 bg-gray-100 rounded border-l-4 border-gray-400">
                                    [INFO] 14:23:11 Validating email credentials
                                </div>
                                <div className="p-3 bg-gray-100 rounded border-l-4 border-gray-400">
                                    [INFO] 14:23:11 Creating customer session
                                </div>
                                <div className="p-3 bg-gray-100 rounded border-l-4 border-yellow-400">
                                    [INFO] 14:23:12 Processing payment
                                </div>
                                <div className="p-3 bg-gray-100 rounded border-l-4 border-gray-400">
                                    [INFO] 14:23:13 Warehouse picking process
                                </div>
                                <div className="p-3 bg-gray-100 rounded border-l-4 border-gray-400">
                                    [INFO] 14:23:13 Generating shipping label
                                </div>
                                <div className="p-3 bg-gray-100 rounded border-l-4 border-red-400">
                                    [ERROR] 14:23:15 Email service timeout
                                </div>
                                <div className="p-3 bg-gray-100 rounded border-l-4 border-green-400">
                                    [INFO] 14:23:16 Order completed
                                </div>
                            </div>
                            <div className="mt-6 text-red-600 text-sm">
                                <p><strong>❓ Questions:</strong></p>
                                <ul className="list-disc ml-6 space-y-1">
                                    <li>Which operations ran in parallel?</li>
                                    <li>What's the execution hierarchy?</li>
                                    <li>How do distributed services relate?</li>
                                    <li>What's the actual flow timeline?</li>
                                </ul>
                            </div>
                        </div>

                        {/* VFL Logging */}
                        <div className="bg-green-50 border border-green-200 rounded-2xl p-8">
                            <div className="text-2xl font-bold text-green-700 mb-6 flex items-center gap-3">
                                ✅ VFL Hierarchical Logging
                            </div>

                            {/* Simulated VFL UI */}
                            <div className="bg-white rounded-lg border border-green-300 p-4 space-y-3 text-sm">
                                {/* Main Order Log */}
                                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-300 rounded-xl p-3 cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        <span className="text-lg">🛒</span>
                                        <div className="flex items-center gap-2">
                                            <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded font-semibold">Start</span>
                                            <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">8847</span>
                                            <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded font-semibold">+0ms</span>
                                        </div>
                                        <span className="flex-1 font-medium text-blue-700">New order received: ORD-2025-8847</span>
                                        <span className="text-xs text-gray-500">14:23:10</span>
                                    </div>
                                </div>

                                {/* Authentication Block - Expandable */}
                                <div className="ml-4 space-y-2">
                                    <div className="bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-300 rounded-xl p-3">
                                        <div className="flex items-center gap-3">
                                            <button className="p-1 text-blue-600 hover:bg-blue-100 rounded">▼</button>
                                            <span className="text-lg">🔐</span>
                                            <div className="flex items-center gap-2">
                                                <span className="bg-emerald-600 text-white text-xs px-2 py-1 rounded font-semibold">Start</span>
                                                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">auth-block-001</span>
                                            </div>
                                            <span className="flex-1 font-medium text-emerald-700">Authenticating customer</span>
                                            <span className="text-xs text-gray-500">+150ms</span>
                                        </div>
                                    </div>

                                    {/* Nested Authentication Steps */}
                                    <div className="ml-8 pl-4 border-l-2 border-blue-200 space-y-2">
                                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-2">
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm">🔍</span>
                                                <span className="bg-gray-600 text-white text-xs px-2 py-1 rounded">Info</span>
                                                <span className="text-sm text-gray-700">Validating email credentials</span>
                                                <span className="text-xs text-gray-500">+10ms</span>
                                            </div>
                                        </div>
                                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-2">
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm">🎫</span>
                                                <span className="bg-gray-600 text-white text-xs px-2 py-1 rounded">Info</span>
                                                <span className="text-sm text-gray-700">Creating customer session</span>
                                                <span className="text-xs text-gray-500">+20ms</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Parallel Operations */}
                                <div className="ml-4">
                                    <div className="flex items-center mb-3 text-purple-600 text-sm font-semibold">
                                        <div className="w-4 h-px bg-purple-300"></div>
                                        <div className="mx-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-3 py-1 rounded-full text-xs">
                                            👥 PARALLEL OPERATIONS (2 concurrent flows)
                                        </div>
                                        <div className="flex-1 h-px bg-purple-300"></div>
                                    </div>

                                    <div className="flex gap-4 overflow-x-auto pb-4">
                                        {/* Warehouse Operation */}
                                        <div className="flex-shrink-0 min-w-[280px] bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-300 rounded-xl p-3">
                                            <div className="absolute -top-2 left-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                                                SIBLING 1
                                            </div>
                                            <div className="pt-2">
                                                <div className="bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-300 rounded-xl p-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm">🏭</span>
                                                        <span className="bg-emerald-600 text-white text-xs px-1 py-0.5 rounded">Start</span>
                                                        <span className="text-xs font-medium text-emerald-700">Warehouse picking</span>
                                                        <span className="text-xs text-gray-500">+2.1s</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Shipping Operation */}
                                        <div className="flex-shrink-0 min-w-[280px] bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-300 rounded-xl p-3">
                                            <div className="absolute -top-2 left-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                                                SIBLING 2
                                            </div>
                                            <div className="pt-2">
                                                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-300 rounded-xl p-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm">🏷️</span>
                                                        <span className="bg-indigo-600 text-white text-xs px-1 py-0.5 rounded">Join</span>
                                                        <span className="text-xs font-medium text-indigo-700">Shipping label</span>
                                                        <span className="text-xs text-gray-500">+2.3s</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Completion */}
                                <div className="ml-4">
                                    <div className="bg-gradient-to-r from-teal-50 to-emerald-50 border-2 border-teal-300 rounded-xl p-3">
                                        <div className="flex items-center gap-3">
                                            <span className="text-lg">✅</span>
                                            <span className="bg-teal-600 text-white text-xs px-2 py-1 rounded font-semibold">Complete</span>
                                            <span className="flex-1 font-medium text-teal-700">Order processing completed</span>
                                            <span className="text-xs text-teal-600 bg-teal-100 px-2 py-1 rounded font-semibold">+5.2s total</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 text-green-700 text-sm">
                                <p><strong>✨ Clear Insights:</strong></p>
                                <ul className="list-disc ml-6 space-y-1">
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

            {/* Features Section - Updated to remove real-time */}
            <section className="py-20 px-6">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-4xl font-bold text-center mb-16 text-gray-800">
                        Why Choose VFL?
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <FeatureCard
                            title="Hierarchical Structure"
                            icon="🗂️"
                            desc="Organize logs in nested blocks that mirror your actual execution flow, making complex operations easy to understand."
                            color="from-blue-500 to-blue-600"
                        />
                        <FeatureCard
                            title="Distributed Tracing"
                            icon="🌐"
                            desc="Seamlessly track operations across multiple services and systems with built-in distributed continuation."
                            color="from-purple-500 to-purple-600"
                        />
                        <FeatureCard
                            title="Execution Pattern Recognition"
                            icon="⚡"
                            desc="Automatically identify and visualize different program flow patterns: sequential, parallel, pub/sub, fire-and-forget, and nested operations."
                            color="from-green-500 to-green-600"
                        />
                        <FeatureCard
                            title="Interactive Visualization"
                            icon="📊"
                            desc="Zoomable, collapsible flow diagrams with detailed timing analysis and cross-references between related operations."
                            color="from-orange-500 to-orange-600"
                        />
                        <FeatureCard
                            title="Performance Insights"
                            icon="🚀"
                            desc="Built-in timing analysis showing bottlenecks, parallel efficiency, and execution relationships with precise metrics."
                            color="from-red-500 to-red-600"
                        />
                        <FeatureCard
                            title="Developer Experience"
                            icon="💻"
                            desc="Minimal API, zero configuration overhead, and intuitive visual debugging for modern development workflows."
                            color="from-indigo-500 to-indigo-600"
                        />
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-4xl font-bold mb-6">
                        Ready to Visualize Your Application Flow?
                    </h2>
                    <p className="text-xl mb-8 opacity-90">
                        Stop guessing how your code executes. Start seeing the complete picture.
                    </p>
                    <button
                        onClick={onShowOperations}
                        className="px-10 py-4 bg-white text-blue-600 font-bold rounded-xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 text-lg"
                    >
                        🔍 Explore VFL Operations
                    </button>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 px-6 bg-white border-t border-gray-200">
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-6">
                            <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                VFL
                            </div>
                            <span className="text-gray-500">Visual Flow Logger</span>
                        </div>
                        <div className="flex gap-8">
                            <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">GitHub</a>
                            <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">Documentation</a>
                            <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">Community</a>
                        </div>
                    </div>
                    <div className="mt-8 pt-8 border-t border-gray-200 text-center text-gray-500">
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
    color: string;
}> = ({ title, icon, desc, color }) => (
    <div className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:-translate-y-1">
        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${color} flex items-center justify-center text-2xl text-white mb-6 group-hover:scale-110 transition-transform duration-300`}>
            {icon}
        </div>
        <h3 className="text-xl font-bold mb-4 text-gray-800">{title}</h3>
        <p className="text-gray-600 leading-relaxed">{desc}</p>
    </div>
);
