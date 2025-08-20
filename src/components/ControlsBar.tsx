import React from "react";

interface ControlsBarProps {
    zoom: number;
    onZoomIn: () => void;
    onZoomOut: () => void;
    onResetView: () => void;
    onExpandAll: () => void;
    onCollapseAll: () => void;
    inputMode: "mouse" | "trackpad";
    onInputModeChange: (mode: "mouse" | "trackpad") => void;
}

export default function ControlsBar({
                                        zoom,
                                        onZoomIn,
                                        onZoomOut,
                                        onResetView,
                                        onExpandAll,
                                        onCollapseAll,
                                        inputMode,
                                        onInputModeChange
                                    }: ControlsBarProps) {
    const ControlButton = ({
                               onClick,
                               title,
                               children,
                               variant = "outline"
                           }: {
        onClick: () => void;
        title: string;
        children: React.ReactNode;
        variant?: "primary" | "outline";
    }) => (
        <button
            onClick={(e) => {
                e.stopPropagation();
                onClick();
            }}
            title={title}
            style={{
                padding: '8px 12px',
                border: variant === "outline" ? '1px solid var(--primary)' : 'none',
                borderRadius: 8,
                background: variant === "outline" ? 'transparent' : 'var(--primary)',
                color: variant === "outline" ? 'var(--primary)' : 'white',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 500,
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                minWidth: '40px',
                justifyContent: 'center'
            }}
            onMouseEnter={(e) => {
                if (variant === "outline") {
                    e.currentTarget.style.background = '#eff6ff';
                } else {
                    e.currentTarget.style.background = 'var(--primary-dark)';
                }
            }}
            onMouseLeave={(e) => {
                if (variant === "outline") {
                    e.currentTarget.style.background = 'transparent';
                } else {
                    e.currentTarget.style.background = 'var(--primary)';
                }
            }}
        >
            {children}
        </button>
    );

    return (
        <div style={{
            display: 'flex',
            gap: 'var(--space)',
            alignItems: 'center',
            flexWrap: 'wrap'
        }}>
            <ControlButton onClick={onExpandAll} title="Expand all referenced blocks">
                📂 Expand All
            </ControlButton>

            <ControlButton onClick={onCollapseAll} title="Collapse all referenced blocks">
                📁 Collapse All
            </ControlButton>

            <div style={{ width: '1px', height: '20px', background: 'var(--border)' }} />

            <ControlButton onClick={onZoomOut} title="Zoom out">
                🔍➖
            </ControlButton>

            <ControlButton onClick={onZoomIn} title="Zoom in">
                🔍➕
            </ControlButton>

            <span style={{
                fontSize: '14px',
                color: 'var(--text-light)',
                minWidth: '50px',
                textAlign: 'center'
            }}>
                {(zoom * 100).toFixed(0)}%
            </span>

            <ControlButton onClick={onResetView} title="Reset zoom and position" variant="primary">
                🎯 Reset
            </ControlButton>

            <div style={{ width: '1px', height: '20px', background: 'var(--border)' }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '14px', fontWeight: 500 }}>🖱️ Input:</span>
                <select
                    value={inputMode}
                    onChange={(e) => {
                        e.stopPropagation();
                        onInputModeChange(e.target.value as "mouse" | "trackpad");
                    }}
                    style={{
                        padding: '4px 8px',
                        border: '1px solid var(--border)',
                        borderRadius: 4,
                        background: 'var(--surface)',
                        fontSize: '12px'
                    }}
                >
                    <option value="mouse">🖱️ Mouse</option>
                    <option value="trackpad">👆 Trackpad</option>
                </select>
            </div>
        </div>
    );
}
