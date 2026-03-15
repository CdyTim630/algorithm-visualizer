import React from 'react';

interface PseudocodeDisplayProps {
    code: string[];
    highlightLine: number;
    title?: string;
}

const PseudocodeDisplay: React.FC<PseudocodeDisplayProps> = ({ code, highlightLine, title }) => {
    return (
        <div className="bg-gray-900 border border-algo-border rounded-xl overflow-hidden">
            {title && (
                <div className="px-4 py-2 bg-algo-card text-sm font-semibold text-algo-muted border-b border-algo-border">
                    {title}
                </div>
            )}
            <div className="p-4 font-mono text-sm leading-6 overflow-x-auto">
                {code.map((line, i) => (
                    <div key={i}
                        className={`flex transition-colors duration-200 rounded px-2 -mx-2 ${i === highlightLine ? 'bg-algo-processing/30 text-algo-text' : 'text-algo-muted'
                            }`}>
                        <span className="w-8 text-right mr-4 select-none opacity-50">{i + 1}</span>
                        <span className="whitespace-pre">{line}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PseudocodeDisplay;
