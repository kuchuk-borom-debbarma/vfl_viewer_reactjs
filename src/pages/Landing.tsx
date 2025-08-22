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
                        <span className="font-semibold text-blue-600">Structured Logging Framework</span> that captures and visualizes
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

            {/* Comparison Section */}
            <section className="py-20 px-6 bg-white/50">
                <div className="max-w-6xl mx-auto">
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
                                    [INFO] Processing user order #12345
                                </div>
                                <div className="p-3 bg-gray-100 rounded border-l-4 border-yellow-400">
                                    [WARN] Inventory service slow response
                                </div>
                                <div className="p-3 bg-gray-100 rounded border-l-4 border-gray-400">
                                    [INFO] Payment processed successfully
                                </div>
                                <div className="p-3 bg-gray-100 rounded border-l-4 border-red-400">
                                    [ERROR] Email service timeout
                                </div>
                                <div className="p-3 bg-gray-100 rounded border-l-4 border-gray-400">
                                    [INFO] Order completed
                                </div>
                            </div>
                            <div className="mt-6 text-red-600 text-sm">
                                <p>❓ <strong>Questions:</strong></p>
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
                            <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2">
                                    <span className="text-lg">▶️</span>
                                    <div className="p-2 bg-blue-100 rounded border-l-4 border-blue-500 flex-1">
                                        <strong>ORDER_PROCESSING</strong> - Processing user order #12345
                                    </div>
                                </div>
                                <div className="ml-6 space-y-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm">⚡</span>
                                        <div className="text-xs text-gray-600 bg-orange-100 px-2 py-1 rounded">
                                            PARALLEL EXECUTION (3 services)
                                        </div>
                                    </div>
                                    <div className="ml-4 grid grid-cols-1 gap-2">
                                        <div className="p-2 bg-yellow-100 rounded border-l-4 border-yellow-500 text-xs">
                                            🔗 <strong>INVENTORY_CHECK</strong> - Checking stock levels (+250ms)
                                        </div>
                                        <div className="p-2 bg-green-100 rounded border-l-4 border-green-500 text-xs">
                                            🔗 <strong>PAYMENT_SERVICE</strong> - Processing payment (+180ms)
                                        </div>
                                        <div className="p-2 bg-red-100 rounded border-l-4 border-red-500 text-xs">
                                            🔗 <strong>EMAIL_SERVICE</strong> - Send confirmation (timeout +5s)
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 ml-4">
                                        <span className="text-sm">✅</span>
                                        <div className="p-2 bg-green-200 rounded border-l-4 border-green-600 flex-1 text-xs">
                                            <strong>ORDER_COMPLETION</strong> - Order finalized (+5.2s total)
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-6 text-green-700 text-sm">
                                <p>✨ <strong>Clear Insights:</strong></p>
                                <ul className="list-disc ml-6 space-y-1">
                                    <li>Visual execution hierarchy</li>
                                    <li>Parallel vs sequential operations</li>
                                    <li>Cross-service flow tracing</li>
                                    <li>Precise timing relationships</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
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
                            title="Pattern Recognition"
                            icon="⚡"
                            desc="Automatically identify and visualize execution patterns: sequential, parallel, pub/sub, fire-and-forget."
                            color="from-green-500 to-green-600"
                        />
                        <FeatureCard
                            title="Real-time Visualization"
                            icon="📊"
                            desc="Interactive, zoomable flow diagrams that update in real-time as your applications execute."
                            color="from-orange-500 to-orange-600"
                        />
                        <FeatureCard
                            title="Performance Insights"
                            icon="🚀"
                            desc="Built-in timing analysis showing bottlenecks, parallel efficiency, and execution relationships."
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

            {/* Execution Patterns Section */}
            <section className="py-20 px-6 bg-gradient-to-r from-gray-50 to-blue-50">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-4xl font-bold text-center mb-16 text-gray-800">
                        Supported Execution Patterns
                    </h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <PatternCard
                            title="Sequential Flow"
                            icon="➡️"
                            desc="Step-by-step execution with clear dependency chains"
                            example="A → B → C → D"
                        />
                        <PatternCard
                            title="Parallel Operations"
                            icon="⚡"
                            desc="Concurrent execution with synchronization points"
                            example="A → [B,C,D] → E"
                        />
                        <PatternCard
                            title="Pub/Sub Events"
                            icon="📢"
                            desc="Event-driven architecture with publisher-subscriber patterns"
                            example="A → Event → [B,C,D]"
                        />
                        <PatternCard
                            title="Fire & Forget"
                            icon="🚀"
                            desc="Asynchronous operations that don't block the main flow"
                            example="A → B (async) + C"
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

const PatternCard: React.FC<{
    title: string;
    icon: string;
    desc: string;
    example: string;
}> = ({ title, icon, desc, example }) => (
    <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">
        <div className="text-3xl mb-4">{icon}</div>
        <h3 className="text-lg font-bold mb-2 text-gray-800">{title}</h3>
        <p className="text-gray-600 text-sm mb-4">{desc}</p>
        <div className="bg-gray-100 rounded-lg p-3">
            <code className="text-xs font-mono text-gray-700">{example}</code>
        </div>
    </div>
);