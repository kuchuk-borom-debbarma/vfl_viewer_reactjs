import React from "react";
import { Button, FeatureCard } from "../components/UI";

export default function Landing({ onShowOperations }: { onShowOperations: () => void }) {
    return (
        <div>
            <header className="header">
                <div className="logo">VFL</div>
                <nav className="nav">
                    <button>About</button>
                    <button>Documentation</button>
                </nav>
            </header>

            <section className="hero flex-center">
                <div>
                    <h1>Hierarchical Logging Reinvented</h1>
                    <p>
                        <span className="highlight">VFL</span> is a minimal, blazing-fast
                        logging framework built for modern distributed systems.
                    </p>
                    <div className="hero-actions">
                        <Button onClick={onShowOperations}>Show Operations</Button>
                        <Button variant="outline">Documentation</Button>
                    </div>
                </div>
            </section>

            <section className="container section">
                <h2 className="section-title">Features</h2>
                <div className="grid">
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

            <footer className="footer">
                © {new Date().getFullYear()} VFL — Hierarchical Logging Framework
            </footer>
        </div>
    );
}