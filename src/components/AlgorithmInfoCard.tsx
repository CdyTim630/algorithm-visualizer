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

interface SectionProps {
    label: string;
    accent?: string;
    children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ label, accent = 'text-algo-gold', children }) => (
    <div className="rounded-lg p-4 bg-algo-surface/50 border border-algo-border/30 hover:border-algo-border/60 transition-colors">
        <h4 className={`text-xs font-semibold uppercase tracking-wider mb-2 ${accent}`}>
            {label}
        </h4>
        <div className="text-sm text-algo-text leading-relaxed">{children}</div>
    </div>
);

const AlgorithmInfoCard: React.FC<AlgorithmInfoCardProps> = ({
    coreIdea, steps, timeComplexity, spaceComplexity, useCases, commonMistakes, classroomQuestion
}) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-6">
            <Section label="核心想法">
                <p>{coreIdea}</p>
            </Section>

            <Section label="步驟摘要">
                <ol className="space-y-1 list-decimal list-inside marker:text-algo-muted">
                    {steps.map((s, i) => <li key={i}>{s}</li>)}
                </ol>
            </Section>

            <Section label="複雜度">
                <div className="space-y-1">
                    <p className="flex justify-between"><span className="text-algo-muted">時間</span><span className="font-mono text-algo-comparing">{timeComplexity}</span></p>
                    <p className="flex justify-between"><span className="text-algo-muted">空間</span><span className="font-mono text-algo-comparing">{spaceComplexity}</span></p>
                </div>
            </Section>

            <Section label="適用情境" accent="text-algo-done">
                <ul className="space-y-1">
                    {useCases.map((u, i) => (
                        <li key={i} className="flex items-start gap-2">
                            <span className="text-algo-done mt-0.5">✓</span><span>{u}</span>
                        </li>
                    ))}
                </ul>
            </Section>

            <Section label="常見錯誤" accent="text-algo-error">
                <ul className="space-y-1">
                    {commonMistakes.map((m, i) => (
                        <li key={i} className="flex items-start gap-2">
                            <span className="text-algo-error mt-0.5">✗</span><span>{m}</span>
                        </li>
                    ))}
                </ul>
            </Section>

            <Section label="課堂提問" accent="text-algo-pivot">
                <p className="italic">{classroomQuestion}</p>
            </Section>
        </div>
    );
};

export default AlgorithmInfoCard;
