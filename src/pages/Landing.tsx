import React from "react";

function FeatureCard({ title, icon, desc }: { title: string; icon: string; desc: string }) {
  return (
      <div className="card">
        <div className="card-icon">{icon}</div>
        <div className="card-title">{title}</div>
        <div className="card-desc">{desc}</div>
      </div>
  );
}

export default function Landing({
                                  onShowOperations,
                                }: {
  onShowOperations: () => void;
}) {
  return (
      <div className="page">
        {/* Header */}
        <header className="header">
          <div className="logo">VFL</div>
          <nav className="nav">
            <button>About</button>
            <button>Documentation</button>
          </nav>
        </header>

        {/* Hero Section */}
        <section className="hero flex-center">
          <div className="hero-content">
            <h1 className="hero-title">Hierarchical Logging Reinvented</h1>
            <p className="hero-subtitle">
              <span className="highlight">VFL</span> is a minimal, blazing-fast
              logging framework built for modern distributed systems.
            </p>
            <div className="hero-actions">
              <button className="btn btn-primary" onClick={onShowOperations}>
                Show Operations
              </button>
              <button className="btn btn-outline">Documentation</button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="container features">
          <h2 className="section-title">Features</h2>
          <div className="features-grid">
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

        {/* Footer */}
        <footer className="footer">
          © {new Date().getFullYear()} VFL — Hierarchical Logging Framework
        </footer>
      </div>
  );
}
