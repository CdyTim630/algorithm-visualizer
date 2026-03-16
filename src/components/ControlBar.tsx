import React from 'react';
import { motion } from 'framer-motion';

interface ControlBarProps {
    isPlaying: boolean;
    onPlay: () => void;
    onPause: () => void;
    onNextStep: () => void;
    onPrevStep: () => void;
    onReset: () => void;
    speed: number;
    onSpeedChange: (speed: number) => void;
    currentStep: number;
    totalSteps: number;
    children?: React.ReactNode;
}

const ControlBar: React.FC<ControlBarProps> = ({
    isPlaying, onPlay, onPause, onNextStep, onPrevStep, onReset,
    speed, onSpeedChange, currentStep, totalSteps, children
}) => {
    return (
        <div className="flex flex-wrap items-center gap-3 glass-card rounded-xl px-5 py-3">
            <div className="flex items-center gap-2">
                <button onClick={onPrevStep} disabled={currentStep <= 0}
                    className="w-9 h-9 rounded-lg bg-algo-card hover:bg-algo-border disabled:opacity-30 flex items-center justify-center transition-colors hover:shadow-rune" title="上一步">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
                </button>

                {isPlaying ? (
                    <button onClick={onPause}
                        className="w-10 h-10 rounded-lg bg-algo-comparing hover:bg-amber-600 flex items-center justify-center transition-colors shadow-[0_0_12px_rgba(245,158,11,0.2)]" title="暫停">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>
                    </button>
                ) : (
                    <button onClick={onPlay} disabled={currentStep >= totalSteps}
                        className="w-10 h-10 rounded-lg bg-gradient-to-br from-algo-gold to-algo-warm hover:from-algo-warm hover:to-algo-gold disabled:opacity-30 flex items-center justify-center transition-all text-algo-bg shadow-[0_0_12px_rgba(212,168,83,0.2)]" title="播放">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                    </button>
                )}

                <button onClick={onNextStep} disabled={currentStep >= totalSteps}
                    className="w-9 h-9 rounded-lg bg-algo-card hover:bg-algo-border disabled:opacity-30 flex items-center justify-center transition-colors hover:shadow-rune" title="下一步">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
                </button>

                <button onClick={onReset}
                    className="w-9 h-9 rounded-lg bg-algo-card hover:bg-algo-border flex items-center justify-center transition-colors hover:shadow-rune" title="重置">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" /></svg>
                </button>
            </div>

            <div className="h-6 w-px bg-algo-border/50 mx-1" />

            <div className="flex items-center gap-2 text-sm">
                <span className="text-algo-muted">速度</span>
                <input type="range" min="0.25" max="3" step="0.25" value={speed}
                    onChange={e => onSpeedChange(parseFloat(e.target.value))}
                    className="w-20" />
                <span className="text-algo-gold font-mono w-10">{speed}x</span>
            </div>

            <div className="h-6 w-px bg-algo-border/50 mx-1" />

            <div className="text-sm text-algo-muted font-mono">
                步驟 <span className="text-algo-text font-semibold">{currentStep}</span>
                <span className="text-algo-border mx-1">/</span>
                {totalSteps}
            </div>

            {children && (
                <>
                    <div className="h-6 w-px bg-algo-border/50 mx-1" />
                    {children}
                </>
            )}
        </div>
    );
};

export default ControlBar;
