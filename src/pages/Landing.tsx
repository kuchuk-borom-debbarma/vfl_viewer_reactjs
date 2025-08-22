import React from "react";
import { Button } from "../components/UI/Button";
import { Card } from "../components/UI/Card";

interface LandingProps {
    onShowOperations: () => void;
}

export const Landing: React.FC<LandingProps> = ({ onShowOperations }) => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <header className="flex justify-between items-center p-6">
                <div className="text-2xl font-bold text-primary">VFL</div>
                <nav className="flex gap-4">
                    <button className="text-gray-600 hover:text-primary transition-colors">About</button>
                    <button className="text-gray-600 hover:text-primary transition-colors">Documentation</button>
                </nav>
            </header>

            <section className="text-center py-24">
                <h1 className="text-5xl font-bold mb-6 text-gray-900">
                    Hierarchical Logging Reinvented
                </h1>
                <p className="text-xl mb-8 max-w-2xl mx-auto text-gray-600">
                    <span className="text-primary font-semibold">VFL</span> is a minimal, blazing-fast
                    logging framework built for modern distributed systems.
                </p>
                <div className="flex gap-4 justify-center">
                    <Button onClick={onShowOperations}>Show Operations</Button>
                    <Button variant="outline">Documentation</Button>
                </div>
            </section>

            <section className="container py-16">
                <h2 className="text-3xl font-semibold text-center mb-12">Features</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <FeatureCard
                        title="Hierarchical Logs"
                        icon="🗂️"
                        desc="Group logs in nested blocks—reflecting real execution context for superior traceability."
                    />
                    <FeatureCard
                        title="Distributed Tracing"
                        icon="🌐"
                        desc="Seamlessly track requests across services with built-in tracing."
                    />
                    <FeatureCard
                        title="Minimal & Modern"
                        icon="⚡"
                        desc="Clean API, blazing-fast performance, and zero unnecessary baggage."
                    />
                </div>
            </section>

            <footer className="text-center py-8 text-gray-500 border-t border-gray-200">
                © {new Date().getFullYear()} VFL — Hierarchical Logging Framework
            </footer>
        </div>
    );
};

const FeatureCard: React.FC<{ title: string; icon: string; desc: string }> = ({
                                                                                  title,
                                                                                  icon,
                                                                                  desc
                                                                              }) => (
    <Card className="text-center">
        <div className="text-4xl mb-4">{icon}</div>
        <div className="font-semibold mb-3 text-lg">{title}</div>
        <div className="text-gray-600 text-sm leading-relaxed">{desc}</div>
    </Card>
);