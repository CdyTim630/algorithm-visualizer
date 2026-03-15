import React from 'react';

interface AlgorithmInfoCardProps {
    coreIdea: string;
    steps: string[];
    timeComplexity: string;
    spaceComplexity: string;
    useCases: string[];
    commonMistakes: string[];
    classroomQuestion: string;
}

const AlgorithmInfoCard: React.FC<AlgorithmInfoCardProps> = ({
    coreIdea, steps, timeComplexity, spaceComplexity, useCases, commonMistakes, classroomQuestion
}) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            <div className="bg-algo-surface border border-algo-border rounded-xl p-5">
                <h4 className="text-algo-accent font-semibold mb-2 flex items-center gap-2">
                    <span className="text-lg">💡</span> 核心想法
                </h4>
                <p className="text-algo-text text-sm leading-relaxed">{coreIdea}</p>
            </div>

            <div className="bg-algo-surface border border-algo-border rounded-xl p-5">
                <h4 className="text-algo-accent font-semibold mb-2 flex items-center gap-2">
                    <span className="text-lg">📋</span> 步驟摘要
                </h4>
                <ol className="text-sm text-algo-text space-y-1 list-decimal list-inside">
                    {steps.map((s, i) => <li key={i}>{s}</li>)}
                </ol>
            </div>

            <div className="bg-algo-surface border border-algo-border rounded-xl p-5">
                <h4 className="text-algo-accent font-semibold mb-2 flex items-center gap-2">
                    <span className="text-lg">⏱️</span> 複雜度
                </h4>
                <p className="text-sm text-algo-text">時間：<span className="font-mono text-algo-comparing">{timeComplexity}</span></p>
                <p className="text-sm text-algo-text mt-1">空間：<span className="font-mono text-algo-comparing">{spaceComplexity}</span></p>
            </div>

            <div className="bg-algo-surface border border-algo-border rounded-xl p-5">
                <h4 className="text-algo-accent font-semibold mb-2 flex items-center gap-2">
                    <span className="text-lg">🎯</span> 適用情境
                </h4>
                <ul className="text-sm text-algo-text space-y-1">
                    {useCases.map((u, i) => <li key={i} className="flex items-start gap-1"><span className="text-algo-done">✓</span> {u}</li>)}
                </ul>
            </div>

            <div className="bg-algo-surface border border-algo-border rounded-xl p-5">
                <h4 className="text-algo-accent font-semibold mb-2 flex items-center gap-2">
                    <span className="text-lg">⚠️</span> 常見錯誤
                </h4>
                <ul className="text-sm text-algo-text space-y-1">
                    {commonMistakes.map((m, i) => <li key={i} className="flex items-start gap-1"><span className="text-algo-error">✗</span> {m}</li>)}
                </ul>
            </div>

            <div className="bg-gradient-to-br from-algo-pivot/20 to-algo-accent/20 border border-algo-pivot/40 rounded-xl p-5">
                <h4 className="text-algo-pivot font-semibold mb-2 flex items-center gap-2">
                    <span className="text-lg">🤔</span> 課堂提問
                </h4>
                <p className="text-sm text-algo-text italic leading-relaxed">{classroomQuestion}</p>
            </div>
        </div>
    );
};

export default AlgorithmInfoCard;
