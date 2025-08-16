
import React from 'react';
import { useNavigate, Link } from 'react-router-dom';

const LandingPage: React.FC = () => {
    const navigate = useNavigate();

    const Logo = () => (
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem',
            fontSize: '1.5rem', fontWeight: 'bold', textDecoration: 'none', color: 'inherit' }}>
            <span style={{ fontSize: '1.8rem' }}>📊</span>
            <span style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>VFL</span>
        </Link>
    );

    const Button = ({ children, onClick, variant = 'primary', ...props }: any) => {
        const baseStyle = { border: 'none', padding: '1rem 2rem', borderRadius: '8px',
            fontSize: '1.1rem', fontWeight: '600', cursor: 'pointer',
            transition: 'all 0.2s ease' };

        const variants = {
            primary: { backgroundColor: '#667eea', color: 'white',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)' },
            secondary: { backgroundColor: 'transparent', color: '#667eea', border: '2px solid #667eea' },
            outline: { backgroundColor: 'transparent', color: 'white', border: '2px solid white' }
        };

        return <button style={{ ...baseStyle, ...variants[variant] }} onClick={onClick} {...props}>{children}</button>;
    };

    const FeatureCard = ({ icon, title, description }: { icon: string, title: string, description: string }) => (
        <div style={{ padding: '2rem', borderRadius: '12px', backgroundColor: '#f8f9fa', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{icon}</div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '600', marginBottom: '1rem' }}>{title}</h3>
            <p style={{ color: '#666', lineHeight: '1.6' }}>{description}</p>
        </div>
    );

    return (
        <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', lineHeight: '1.6',
            color: '#333', backgroundColor: '#ffffff', margin: 0, padding: 0 }}>

            {/* Navigation */}
            <nav style={{ position: 'fixed', top: 0, left: 0, right: 0,
                backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)',
                borderBottom: '1px solid #e1e5e9', zIndex: 1000 }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1rem 2rem',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Logo />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                        {['Features', 'Documentation'].map(link => (
                            <a key={link} href={`#${link.toLowerCase()}`}
                               style={{ textDecoration: 'none', color: '#555', fontSize: '0.95rem', fontWeight: '500' }}>
                                {link}
                            </a>
                        ))}
                        <Button onClick={() => navigate('/blocks')} variant="primary"
                                style={{ padding: '0.6rem 1.2rem', fontSize: '0.95rem' }}>
                            View Blocks
                        </Button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section style={{ paddingTop: '120px', paddingBottom: '80px',
                background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <div style={{ maxWidth: '800px', marginBottom: '60px', padding: '0 2rem' }}>
                    <h1 style={{ fontSize: '3.5rem', fontWeight: '700', marginBottom: '1.5rem',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Visual Flow Logger
                    </h1>
                    <p style={{ fontSize: '1.2rem', color: '#555', marginBottom: '2rem', lineHeight: '1.7' }}>
                        A hierarchical logging framework with distributed tracing support.
                        Transform flat, disconnected log entries into structured visualizations
                        that show how your applications actually execute across services and systems.
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Button onClick={() => navigate('/blocks')}>View Blocks</Button>
                        <Button variant="secondary">Documentation</Button>
                    </div>
                </div>

                {/* Flow Example */}
                <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '2rem',
                    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)', maxWidth: '500px', margin: '0 2rem' }}>
                    <div style={{ textAlign: 'left', fontFamily: 'Monaco, Consolas, monospace', fontSize: '0.9rem' }}>
                        {[
                            { text: 'User Authentication', level: 0, icon: '🔍' },
                            { text: 'Validating credentials', level: 1, icon: '🔍' },
                            { text: 'Token Service Call', level: 1, icon: '🔍', badge: 'cross-service' },
                            { text: 'JWT token generated', level: 2, icon: '🔍' },
                            { text: 'Authentication completed', level: 1, icon: '✅' }
                        ].map((item, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem',
                                padding: '0.4rem 0', paddingLeft: `${item.level * 1.5}rem`,
                                borderLeft: item.level > 0 ? '2px solid #e1e5e9' : 'none' }}>
                                <span>{item.icon}</span>
                                <span>{item.text}</span>
                                {item.badge && (
                                    <span style={{ backgroundColor: '#e8f5e8', color: '#2e7d32',
                                        padding: '2px 6px', borderRadius: '4px',
                                        fontSize: '0.7rem', fontWeight: '500', marginLeft: 'auto' }}>
                                        {item.badge}
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section style={{ padding: '80px 0', backgroundColor: '#fff' }} id="features">
                <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 2rem', textAlign: 'center' }}>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '3rem' }}>Key Features</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
                        <FeatureCard
                            icon="🌳"
                            title="Hierarchical Structure"
                            description="Organize logs in tree-like structures that mirror your application's execution flow, showing clear parent-child relationships between operations."
                        />
                        <FeatureCard
                            icon="🌐"
                            title="Distributed Tracing"
                            description="Track operations seamlessly across multiple services and systems, maintaining context and relationships in distributed architectures."
                        />
                        <FeatureCard
                            icon="⚡"
                            title="Multiple Flow Patterns"
                            description="Support for sequential, parallel, fire-and-forget, and event-driven patterns. Visualize how modern applications actually execute."
                        />
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section style={{ padding: '80px 0', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white', textAlign: 'center' }}>
                <div style={{ maxWidth: '700px', margin: '0 auto', padding: '0 2rem' }}>
                    <h2 style={{ fontSize: '2.3rem', fontWeight: '700', marginBottom: '1rem' }}>
                        Ready to See Your Application Flow?
                    </h2>
                    <p style={{ fontSize: '1.1rem', marginBottom: '2rem', opacity: 0.9, lineHeight: '1.6' }}>
                        Transform your logging from flat entries into meaningful visual structures.
                        Start exploring your flow blocks now.
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Button onClick={() => navigate('/blocks')}>View Flow Blocks</Button>
                        <Button variant="outline">View Documentation</Button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer style={{ padding: '60px 0 40px 0', backgroundColor: '#333', color: 'white' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
                    <Logo />
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '2rem', margin: '2rem 0' }}>
                        {[
                            { title: 'Product', links: ['Features', 'Pricing', 'API'] },
                            { title: 'Resources', links: ['Documentation', 'Examples', 'GitHub'] },
                            { title: 'Support', links: ['Help Center', 'Contact', 'Status'] }
                        ].map(section => (
                            <div key={section.title} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem' }}>{section.title}</h4>
                                {section.links.map(link => (
                                    <a key={link} href="#" style={{ color: '#ccc', textDecoration: 'none', fontSize: '0.9rem' }}>
                                        {link}
                                    </a>
                                ))}
                            </div>
                        ))}
                    </div>
                    <div style={{ borderTop: '1px solid #555', paddingTop: '2rem', textAlign: 'center' }}>
                        <div style={{ color: '#ccc', fontSize: '0.9rem' }}>
                            © 2025 Visual Flow Logger. All rights reserved.
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;