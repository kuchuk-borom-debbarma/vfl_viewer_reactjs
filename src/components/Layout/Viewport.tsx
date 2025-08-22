import React, { useRef, useEffect } from 'react';
import { ViewState, InputMode } from '../../types';
import { SIDEBAR_WIDTH } from '../../config/constants';

interface ViewportProps {
    viewState: ViewState;
    inputMode: InputMode;
    sidebarOpen: boolean;
    onUpdateZoom: (delta: number) => void;
    onUpdatePan: (deltaX: number, deltaY: number) => void;
    onStartDrag: (clientX: number, clientY: number) => void;
    onUpdateDrag: (clientX: number, clientY: number) => void;
    onEndDrag: () => void;
    children: React.ReactNode;
}

export const Viewport: React.FC<ViewportProps> = ({
                                                      viewState,
                                                      inputMode,
                                                      sidebarOpen,
                                                      onUpdateZoom,
                                                      onUpdatePan,
                                                      onStartDrag,
                                                      onUpdateDrag,
                                                      onEndDrag,
                                                      children
                                                  }) => {
    const canvasRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const handleWheel = (e: WheelEvent) => {
            e.preventDefault();
            e.stopPropagation();

            if (inputMode === "mouse") {
                if (e.ctrlKey || e.metaKey) {
                    const delta = e.deltaY > 0 ? -0.1 : 0.1;
                    onUpdateZoom(delta);
                } else {
                    onUpdatePan(0, -e.deltaY);
                }
            } else if (inputMode === "trackpad") {
                if (e.ctrlKey || e.metaKey) {
                    const delta = e.deltaY > 0 ? -0.04 : 0.04;
                    onUpdateZoom(delta);
                } else {
                    onUpdatePan(-e.deltaX, -e.deltaY);
                }
            }
        };

        canvas.addEventListener('wheel', handleWheel, { passive: false });
        return () => canvas.removeEventListener('wheel', handleWheel);
    }, [inputMode, onUpdateZoom, onUpdatePan]);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (e.button !== 0) return;
        const target = e.target as HTMLElement;

        if (target.closest('button') || target.closest('.card') || target.closest('[data-interactive]')) {
            return;
        }

        e.stopPropagation();
        onStartDrag(e.clientX, e.clientY);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (viewState.isDragging) {
            e.stopPropagation();
            onUpdateDrag(e.clientX, e.clientY);
        }
    };

    const handleMouseUp = (e: React.MouseEvent) => {
        e.stopPropagation();
        onEndDrag();
    };

    return (
        <div
            ref={canvasRef}
            className="flex-1 overflow-hidden relative transition-all duration-300"
            style={{
                cursor: viewState.isDragging ? 'grabbing' : 'grab',
                marginLeft: sidebarOpen ? `${SIDEBAR_WIDTH}px` : '0'
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        >
            <div
                className="p-10 min-w-max"
                style={{
                    transform: `translate(${viewState.pan.x}px, ${viewState.pan.y}px) scale(${viewState.zoom})`,
                    transformOrigin: '0 0',
                    pointerEvents: 'auto'
                }}
            >
                {children}
            </div>
        </div>
    );
};