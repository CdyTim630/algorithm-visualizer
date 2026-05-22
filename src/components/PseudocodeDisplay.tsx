import React from 'react';

interface PseudocodeDisplayProps {
    code: string[];
    highlightLine: number;
    title?: string;
}

const PseudocodeDisplay: React.FC<PseudocodeDisplayProps> = ({ code, highlightLine, title }) => {
    return (
        <div className="rounded-lg overflow-hidden border border-algo-border/30 bg-algo-surface/60">
            {title && (
                <div className="px-4 py-2 bg-algo-card/40 text-xs font-semibold uppercase tracking-wider text-algo-muted border-b border-algo-border/30">
                    {title}
                </div>
            )}
            <div className="p-3 font-mono text-sm leading-6 overflow-x-auto">
                {code.map((line, i) => (
                    <div key={i}
                        className={`flex transition-colors duration-150 rounded px-2 -mx-1 ${i === highlightLine
                            ? 'bg-algo-gold/12 text-algo-text border-l-2 border-algo-gold'
                            : 'text-algo-muted border-l-2 border-transparent'
                            }`}>
                        <span className="w-7 text-right mr-3 select-none opacity-40 text-xs">{i + 1}</span>
                        <span className="whitespace-pre">{line}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PseudocodeDisplay;
