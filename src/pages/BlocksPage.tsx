import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RootBlock } from '../models/block';
import { BlockService } from '../services/blockService';

// Add spinner animation
const style = document.createElement('style');
style.textContent = '@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }';
document.head.appendChild(style);

const BlocksPage: React.FC = () => {
    const navigate = useNavigate();
    const [state, setState] = useState({
        blocks: [] as RootBlock[],
        loading: true,
        error: null as string | null,
        cursor: null as string | null,
        hasMore: true,
        loadingMore: false
    });

    const updateState = (updates: Partial<typeof state>) => setState(prev => ({ ...prev, ...updates }));

    const fetchBlocks = async (nextCursor?: string, append = false) => {
        try {
            updateState(append ? { loadingMore: true } : { loading: true, error: null });

            const fetchedBlocks = await BlockService.getRootBlocks({
                cursor: nextCursor,
                limit: 10
            });

            updateState({
                blocks: append ? [...state.blocks, ...fetchedBlocks] : fetchedBlocks,
                cursor: fetchedBlocks.length > 0 ? fetchedBlocks[fetchedBlocks.length - 1].cursor : null,
                hasMore: fetchedBlocks.length === 10,
                loading: false,
                loadingMore: false
            });
        } catch (err) {
            updateState({
                error: err instanceof Error ? err.message : 'An error occurred',
                loading: false,
                loadingMore: false
            });
        }
    };

    useEffect(() => { fetchBlocks(); }, []);

    const Spinner = () => (
        <div style={{
            width: '40px', height: '40px', border: '4px solid #f3f3f3',
            borderTop: '4px solid #667eea', borderRadius: '50%',
            animation: 'spin 1s linear infinite', marginBottom: '1rem'
        }} />
    );

    const EmptyState = ({ icon, title, message }: { icon: string, title: string, message: string }) => (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', minHeight: '400px', textAlign: 'center' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>{icon}</div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.5rem', color: title.includes('Failed') ? '#dc3545' : '#333' }}>{title}</h3>
            <p style={{ color: '#666', maxWidth: '400px', lineHeight: '1.6' }}>{message}</p>
        </div>
    );

    const Header = () => (
        <div style={{ backgroundColor: 'white', borderBottom: '1px solid #e1e5e9',
            padding: '1rem 2rem', position: 'sticky', top: 0, zIndex: 100,
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <button onClick={() => navigate('/')}
                    style={{ backgroundColor: 'transparent', border: '1px solid #667eea',
                        color: '#667eea', padding: '0.5rem 1rem', borderRadius: '6px',
                        cursor: 'pointer', marginBottom: '1rem' }}>
                ← Back to Home
            </button>
            <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex',
                justifyContent: 'space-between', alignItems: 'center' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: '700', margin: 0,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Visual Flow Blocks
                </h1>
                <button onClick={() => fetchBlocks()} disabled={state.loading}
                        style={{ backgroundColor: '#667eea', color: 'white', border: 'none',
                            padding: '0.6rem 1.2rem', borderRadius: '6px', cursor: 'pointer' }}>
                    🔄 Refresh
                </button>
            </div>
        </div>
    );

    const BlockCard = ({ block }: { block: RootBlock }) => (
        <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '1.5rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)', border: '1px solid #e1e5e9' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '600', margin: 0, flex: 1 }}>{block.name}</h3>
                <span style={{ fontSize: '0.8rem', color: '#666', backgroundColor: '#f1f3f4',
                    padding: '0.2rem 0.5rem', borderRadius: '4px', fontFamily: 'Monaco, Consolas, monospace' }}>
                    #{block.id.slice(0, 8)}
                </span>
            </div>

            {[
                ['Duration', BlockService.formatDuration(block.startTime, block.endTime)],
                ['Started', BlockService.formatDateTime(block.startTime)],
                ['Created', BlockService.formatDateTime(block.createdAt)]
            ].map(([label, value]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.9rem', color: '#666', fontWeight: '500' }}>{label}:</span>
                    <span style={{ fontSize: '0.9rem', fontFamily: 'Monaco, Consolas, monospace' }}>{value}</span>
                </div>
            ))}

            {block.endMessage && (
                <div style={{ backgroundColor: '#f8f9fa', padding: '1rem', borderRadius: '6px',
                    marginBottom: '1rem', border: '1px solid #e9ecef' }}>
                    <span style={{ fontSize: '0.8rem', color: '#666', fontWeight: '600',
                        textTransform: 'uppercase', letterSpacing: '0.5px' }}>End Message:</span>
                    <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem', lineHeight: '1.4' }}>{block.endMessage}</p>
                </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button style={{ backgroundColor: '#667eea', color: 'white', border: 'none',
                    padding: '0.6rem 1.2rem', borderRadius: '6px', cursor: 'pointer' }}>
                    View Details →
                </button>
            </div>
        </div>
    );

    const containerStyle = {
        fontFamily: 'system-ui, -apple-system, sans-serif',
        lineHeight: '1.6', color: '#333', backgroundColor: '#f8f9fa',
        minHeight: '100vh', padding: '0 0 2rem 0'
    };

    if (state.loading && state.blocks.length === 0) {
        return (
            <div style={containerStyle}>
                <Header />
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center',
                    justifyContent: 'center', minHeight: '400px' }}>
                    <Spinner />
                    <p style={{ color: '#666', fontSize: '0.9rem' }}>Loading blocks...</p>
                </div>
            </div>
        );
    }

    if (state.error && state.blocks.length === 0) {
        return (
            <div style={containerStyle}>
                <Header />
                <EmptyState
                    icon="⚠️"
                    title="Failed to Load Blocks"
                    message={state.error}
                />
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
                    <button onClick={() => fetchBlocks()}
                            style={{ backgroundColor: '#dc3545', color: 'white', border: 'none',
                                padding: '0.8rem 2rem', borderRadius: '8px', cursor: 'pointer' }}>
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={containerStyle}>
            <Header />

            {state.blocks.length === 0 ? (
                <EmptyState
                    icon="📭"
                    title="No Blocks Found"
                    message="No flow blocks have been created yet. Start logging with VFL to see them here."
                />
            ) : (
                <>
                    <div style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 2rem',
                        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
                        {state.blocks.map(block => <BlockCard key={block.id} block={block} />)}
                    </div>

                    {state.hasMore && (
                        <div style={{ display: 'flex', justifyContent: 'center', margin: '2rem 0' }}>
                            <button onClick={() => state.cursor && fetchBlocks(state.cursor, true)}
                                    disabled={state.loadingMore}
                                    style={{ backgroundColor: '#667eea', color: 'white', border: 'none',
                                        padding: '0.8rem 2rem', borderRadius: '8px', cursor: 'pointer' }}>
                                {state.loadingMore ? 'Loading...' : 'Load More Blocks'}
                            </button>
                        </div>
                    )}

                    {state.loadingMore && (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem' }}>
                            <Spinner />
                            <p style={{ color: '#666', fontSize: '0.9rem' }}>Loading more blocks...</p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default BlocksPage;