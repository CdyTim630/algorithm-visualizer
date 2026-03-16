import React from 'react';

interface PseudocodeDisplayProps {
    code: string[];
    highlightLine: number;
    title?: string;
}

const PseudocodeDisplay: React.FC<PseudocodeDisplayProps> = ({ code, highlightLine, title }) => {
    return (
        <div className="glass-card rounded-xl overflow-hidden">
            {title && (
                <div className="px-4 py-2 bg-algo-card/80 text-sm font-semibold text-algo-gold/80 border-b border-algo-border/40 flex items-center gap-2">
                    <span className="text-algo-pivot/60 text-xs font-cinzel">◈</span>
                    {title}
                </div>
            )}
            <div className="p-4 font-mono text-sm leading-6 overflow-x-auto">
                {code.map((line, i) => (
                    <div key={i}
                        className={`flex transition-colors duration-200 rounded px-2 -mx-2 ${i === highlightLine
                            ? 'bg-algo-gold/15 text-algo-text border-l-2 border-algo-gold'
                            : 'text-algo-muted border-l-2 border-transparent'
                            }`}>
                        <span className="w-8 text-right mr-4 select-none opacity-40 text-xs">{i + 1}</span>
                        <span className="whitespace-pre">{line}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PseudocodeDisplay;
