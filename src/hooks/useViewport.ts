import { useState, useCallback } from 'react';
import { ViewState, InputMode } from '../types';
import { CONFIG } from '../config/constants';

export const useViewport = () => {
    const [viewState, setViewState] = useState<ViewState>({
        zoom: 1,
        pan: { x: 0, y: 0 },
        isDragging: false,
        dragStart: { x: 0, y: 0 }
    });
    const [inputMode, setInputMode] = useState<InputMode>("mouse");

    const updateZoom = useCallback((delta: number) => {
        setViewState(prev => ({
            ...prev,
            zoom: Math.min(Math.max(prev.zoom + delta, CONFIG.MIN_ZOOM), CONFIG.MAX_ZOOM)
        }));
    }, []);

    const updatePan = useCallback((deltaX: number, deltaY: number) => {
        setViewState(prev => ({
            ...prev,
            pan: { x: prev.pan.x + deltaX, y: prev.pan.y + deltaY }
        }));
    }, []);

    const startDrag = useCallback((clientX: number, clientY: number) => {
        setViewState(prev => ({
            ...prev,
            isDragging: true,
            dragStart: { x: clientX - prev.pan.x, y: clientY - prev.pan.y }
        }));
    }, []);

    const updateDrag = useCallback((clientX: number, clientY: number) => {
        setViewState(prev => {
            if (!prev.isDragging) return prev;
            return {
                ...prev,
                pan: { x: clientX - prev.dragStart.x, y: clientY - prev.dragStart.y }
            };
        });
    }, []);

    const endDrag = useCallback(() => {
        setViewState(prev => ({ ...prev, isDragging: false }));
    }, []);

    const resetView = useCallback(() => {
        setViewState(prev => ({ ...prev, zoom: 1, pan: { x: 0, y: 0 } }));
    }, []);

    const zoomIn = useCallback(() => updateZoom(CONFIG.ZOOM_STEP), [updateZoom]);
    const zoomOut = useCallback(() => updateZoom(-CONFIG.ZOOM_STEP), [updateZoom]);

    return {
        viewState,
        inputMode,
        setInputMode,
        updateZoom,
        updatePan,
        startDrag,
        updateDrag,
        endDrag,
        resetView,
        zoomIn,
        zoomOut
    };
};