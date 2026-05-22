import React from 'react';

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
    const btn = "w-9 h-9 rounded-md bg-algo-card/60 border border-algo-border/30 hover:bg-algo-card hover:border-algo-border flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed";

    return (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-algo-border/30 bg-algo-surface/60 px-4 py-2.5">
            <div className="flex items-center gap-1.5">
                <button onClick={onPrevStep} disabled={currentStep <= 0} className={btn} title="上一步">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
                </button>

                {isPlaying ? (
                    <button onClick={onPause}
                        className="w-10 h-10 rounded-md bg-algo-comparing hover:bg-amber-500 text-algo-bg flex items-center justify-center transition-colors" title="暫停">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>
                    </button>
                ) : (
                    <button onClick={onPlay} disabled={currentStep >= totalSteps}
                        className="w-10 h-10 rounded-md bg-algo-gold hover:bg-algo-warm disabled:opacity-30 disabled:cursor-not-allowed text-algo-bg flex items-center justify-center transition-colors" title="播放">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                    </button>
                )}

                <button onClick={onNextStep} disabled={currentStep >= totalSteps} className={btn} title="下一步">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
                </button>

                <button onClick={onReset} className={btn} title="重置">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" /></svg>
                </button>
            </div>

            <div className="h-5 w-px bg-algo-border/40" />

            <div className="flex items-center gap-2 text-xs">
                <span className="text-algo-muted">速度</span>
                <input type="range" min="0.25" max="3" step="0.25" value={speed}
                    onChange={e => onSpeedChange(parseFloat(e.target.value))}
                    className="w-20" />
                <span className="text-algo-text font-mono w-10 tabular-nums">{speed}x</span>
            </div>

            <div className="h-5 w-px bg-algo-border/40" />

            <div className="text-xs text-algo-muted font-mono tabular-nums">
                步驟 <span className="text-algo-text font-semibold">{currentStep}</span>
                <span className="text-algo-border mx-1">/</span>
                {totalSteps}
            </div>

            {children && (
                <>
                    <div className="h-5 w-px bg-algo-border/40" />
                    {children}
                </>
            )}
        </div>
    );
};

export default ControlBar;
