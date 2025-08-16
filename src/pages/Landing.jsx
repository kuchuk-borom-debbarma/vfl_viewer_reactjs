// src/pages/Landing.jsx
import React from "react";
import "../styles/variable.css";
import "../styles/base.css";
import "../styles/layout.css";
import "../styles/components.css";
import "../styles/typography.css";

export default function Landing() {
  return (
      <div className="page">
        {/* Header */}
        <header className="header">
          <div className="logo">VFL</div>
          <nav className="nav">
            <button>About Kuchuk Boram Debbarma</button>
            <button>Documentation</button>
          </nav>
        </header>

        {/* Hero Section */}
        <section className="hero flex-center">
          <div className="hero-content">
            <h1 className="hero-title">Hierarchical Logging Reinvented</h1>
            <p className="hero-subtitle">
              <span className="highlight">VFL</span> is a minimal, blazing-fast
              logging framework built for modern distributed systems developed by Kuchuk Boram Debbarma.
            </p>
            <div className="hero-actions">
              <button className="btn btn-primary">Show Operations</button>
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
          &copy; {new Date().getFullYear()} VFL — Hierarchical Logging Framework
        </footer>
      </div>
  );
}

// FeatureCard Component
function FeatureCard({ title, icon, desc }) {
  return (
      <div className="card">
        <div className="card-icon">{icon}</div>
        <div className="card-title">{title}</div>
        <div className="card-desc">{desc}</div>
      </div>
  );
}
