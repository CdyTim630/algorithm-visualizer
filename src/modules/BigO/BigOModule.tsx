import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTeachingMode } from '../../context/TeachingModeContext';
import AlgorithmInfoCard from '../../components/AlgorithmInfoCard';

const complexities = [
    { label: 'O(1)', fn: (_n: number) => 1, color: '#22c55e', desc: '常數時間：不管資料多大，都一樣快。例如：查陣列的第 k 個元素。' },
    { label: 'O(log n)', fn: (n: number) => Math.log2(n), color: '#06b6d4', desc: '對數時間：每次砍半，所以非常快。例如：二分搜尋。' },
    { label: 'O(n)', fn: (n: number) => n, color: '#3b82f6', desc: '線性時間：看一次全部資料。例如：找最大值。' },
    { label: 'O(n log n)', fn: (n: number) => n * Math.log2(n), color: '#f97316', desc: '線性乘對數：好的排序法。例如：Merge Sort。' },
    { label: 'O(n²)', fn: (n: number) => n * n, color: '#ef4444', desc: '平方時間：雙層迴圈。例如：Bubble Sort。' },
    { label: 'O(2ⁿ)', fn: (n: number) => Math.pow(2, n), color: '#a855f7', desc: '指數時間：非常慢！例如：暴力列舉所有子集。' },
    { label: 'O(n!)', fn: (n: number) => { let r = 1; for (let i = 2; i <= n; i++) r *= i; return r; }, color: '#ec4899', desc: '階乘時間：超級慢。例如：暴力排列所有順序（旅行推銷員）。' },
];

const quizItems = [
    { q: '在字典裡查一個字（每次翻一半）', a: 'O(log n)' },
    { q: '數教室裡有幾個人', a: 'O(n)' },
    { q: '排撲克牌（好的方法）', a: 'O(n log n)' },
    { q: '兩兩比較所有同學的身高', a: 'O(n²)' },
    { q: '直接打電話給某人（知道號碼）', a: 'O(1)' },
];

const BigOModule: React.FC = () => {
    const { isTeachingMode } = useTeachingMode();
    const [selectedComplexities, setSelectedComplexities] = useState<Set<number>>(new Set([0, 1, 2, 3, 4]));
    const [nRange, setNRange] = useState(20);
    const [hoveredCurve, setHoveredCurve] = useState<number | null>(null);
    const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
    const [showQuizResults, setShowQuizResults] = useState(false);

    const toggleComplexity = (i: number) => {
        const next = new Set(selectedComplexities);
        if (next.has(i)) next.delete(i); else next.add(i);
        setSelectedComplexities(next);
    };

    // Chart dimensions
    const W = 700, H = 400, PAD = 50;
    const chartW = W - PAD * 2, chartH = H - PAD * 2;

    const maxY = useMemo(() => {
        let m = 0;
        selectedComplexities.forEach(i => {
            const v = complexities[i].fn(nRange);
            if (isFinite(v) && v > m) m = v;
        });
        return Math.max(m, 1);
    }, [selectedComplexities, nRange]);

    const getPath = (fn: (n: number) => number) => {
        const points: string[] = [];
        const steps = 80;
        for (let s = 0; s <= steps; s++) {
            const n = 1 + (nRange - 1) * (s / steps);
            let y = fn(n);
            if (!isFinite(y)) y = maxY * 2;
            const px = PAD + (s / steps) * chartW;
            const py = PAD + chartH - Math.min(y / maxY, 1.1) * chartH;
            points.push(`${s === 0 ? 'M' : 'L'}${px},${py}`);
        }
        return points.join(' ');
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold mb-2">📈 演算法複雜度與 Big-O</h2>
                <p className="text-algo-muted">理解時間複雜度如何影響效能，是學演算法的第一步。</p>
                {isTeachingMode && (
                    <div className="mt-3 bg-algo-processing/10 border border-algo-processing/30 rounded-lg p-3 text-sm text-algo-text">
                        🎓 教學提示：先解釋「為什麼要關心效率？」想像你要在 10 億筆資料裡找一個東西，如果用 O(n) 要跑 10 億次，但 O(log n) 只要 30 次！
                    </div>
                )}
            </div>

            {/* Complexity toggle buttons */}
            <div className="flex flex-wrap gap-2">
                {complexities.map((c, i) => (
                    <button key={i} onClick={() => toggleComplexity(i)}
                        className={`px-4 py-2 rounded-lg text-sm font-mono font-semibold transition-all border ${selectedComplexities.has(i)
                                ? 'border-current bg-current/10'
                                : 'border-algo-border text-algo-muted opacity-40 hover:opacity-70'
                            }`}
                        style={selectedComplexities.has(i) ? { color: c.color, borderColor: c.color } : {}}>
                        {c.label}
                    </button>
                ))}
            </div>

            {/* N range slider */}
            <div className="flex items-center gap-4 bg-algo-surface border border-algo-border rounded-xl p-4">
                <span className="text-sm text-algo-muted">n 的範圍：</span>
                <input type="range" min="5" max="50" value={nRange} onChange={e => setNRange(parseInt(e.target.value))}
                    className="flex-1 accent-algo-accent" />
                <span className="font-mono text-algo-accent text-lg font-bold w-12 text-right">{nRange}</span>
            </div>

            {/* SVG Chart */}
            <div className="bg-algo-surface border border-algo-border rounded-2xl p-4 overflow-x-auto">
                <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-[700px] mx-auto">
                    {/* Grid lines */}
                    {[0, 0.25, 0.5, 0.75, 1].map(f => (
                        <line key={f} x1={PAD} y1={PAD + chartH * (1 - f)} x2={PAD + chartW} y2={PAD + chartH * (1 - f)}
                            stroke="#334155" strokeWidth="1" strokeDasharray={f === 0 ? '' : '4,4'} />
                    ))}
                    <line x1={PAD} y1={PAD} x2={PAD} y2={PAD + chartH} stroke="#475569" strokeWidth="1.5" />
                    <line x1={PAD} y1={PAD + chartH} x2={PAD + chartW} y2={PAD + chartH} stroke="#475569" strokeWidth="1.5" />

                    {/* Axis labels */}
                    <text x={PAD + chartW / 2} y={H - 8} textAnchor="middle" fill="#94a3b8" fontSize="13" fontFamily="Inter">n（問題規模）</text>
                    <text x={12} y={PAD + chartH / 2} textAnchor="middle" fill="#94a3b8" fontSize="13" fontFamily="Inter"
                        transform={`rotate(-90, 12, ${PAD + chartH / 2})`}>運算次數</text>

                    {/* Curves */}
                    {complexities.map((c, i) => selectedComplexities.has(i) && (
                        <g key={i} onMouseEnter={() => setHoveredCurve(i)} onMouseLeave={() => setHoveredCurve(null)}>
                            <path d={getPath(c.fn)} fill="none" stroke={c.color}
                                strokeWidth={hoveredCurve === i ? 4 : 2.5}
                                strokeLinecap="round" opacity={hoveredCurve !== null && hoveredCurve !== i ? 0.3 : 1}
                                style={{ transition: 'opacity 0.2s, stroke-width 0.2s' }} />
                            <text x={PAD + chartW + 5} y={PAD + chartH - Math.min(c.fn(nRange) / maxY, 1) * chartH}
                                fill={c.color} fontSize="12" fontFamily="JetBrains Mono" fontWeight="600" dominantBaseline="middle">
                                {c.label}
                            </text>
                        </g>
                    ))}
                </svg>

                {/* Hovered description */}
                {hoveredCurve !== null && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="mt-3 p-3 rounded-lg text-sm" style={{ backgroundColor: complexities[hoveredCurve].color + '15', borderLeft: `3px solid ${complexities[hoveredCurve].color}` }}>
                        <span className="font-mono font-bold" style={{ color: complexities[hoveredCurve].color }}>{complexities[hoveredCurve].label}</span>
                        {' — '}{complexities[hoveredCurve].desc}
                    </motion.div>
                )}
            </div>

            {/* Complexity concepts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-algo-surface border border-algo-border rounded-xl p-5">
                    <h3 className="font-bold text-algo-accent mb-2">⏱️ 時間複雜度</h3>
                    <p className="text-sm text-algo-text leading-relaxed">衡量演算法「需要多少步」才能完成。我們通常用 Big-O 表示最壞情況下的成長速度。n 越大，差距越明顯！</p>
                </div>
                <div className="bg-algo-surface border border-algo-border rounded-xl p-5">
                    <h3 className="font-bold text-algo-accent mb-2">💾 空間複雜度</h3>
                    <p className="text-sm text-algo-text leading-relaxed">衡量演算法「需要多少額外記憶體空間」。有些演算法速度快但很吃空間，有些很省空間但比較慢——這就是取捨！</p>
                </div>
            </div>

            {/* Quiz section */}
            <div className="bg-algo-surface border border-algo-border rounded-2xl p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">🎮 猜猜看：這些情境是什麼複雜度？</h3>
                <div className="space-y-4">
                    {quizItems.map((item, i) => (
                        <div key={i} className="flex flex-wrap items-center gap-3">
                            <p className="text-sm text-algo-text flex-1 min-w-[200px]">「{item.q}」</p>
                            <select value={quizAnswers[i] || ''}
                                onChange={e => setQuizAnswers({ ...quizAnswers, [i]: e.target.value })}
                                className="bg-algo-card border border-algo-border rounded-lg px-3 py-2 text-sm text-algo-text">
                                <option value="">選擇答案...</option>
                                {complexities.map(c => <option key={c.label} value={c.label}>{c.label}</option>)}
                            </select>
                            {showQuizResults && (
                                <span className={`text-sm font-semibold ${quizAnswers[i] === item.a ? 'text-algo-done' : 'text-algo-error'}`}>
                                    {quizAnswers[i] === item.a ? '✓ 正確！' : `✗ 答案是 ${item.a}`}
                                </span>
                            )}
                        </div>
                    ))}
                </div>
                <button onClick={() => setShowQuizResults(true)}
                    className="mt-4 px-6 py-2 bg-algo-accent/20 text-algo-accent rounded-lg text-sm font-semibold hover:bg-algo-accent/30 transition-colors">
                    看答案
                </button>
            </div>

            <AlgorithmInfoCard
                coreIdea="Big-O 描述的是演算法在最壞情況下，運算次數隨資料規模 n 成長的速度上界。"
                steps={['找出影響執行時間的主要變數 n', '計算最內層迴圈的執行次數', '取最高次項、忽略常數']}
                timeComplexity="依演算法而異"
                spaceComplexity="依演算法而異"
                useCases={['比較不同演算法的效率', '預估程式是否能在時限內跑完', '面試與競程中常見考題']}
                commonMistakes={['混淆 O(n) 與 Θ(n) 的差別', '忽略常數因子在小 n 下的影響', '以為 O(n²) 一定不能用（小 n 時其實可以）']}
                classroomQuestion="如果你有 100 萬筆資料要排序，O(n²) 和 O(n log n) 分別大概要跑幾次？差距有多大？"
            />
        </div>
    );
};

export default BigOModule;
