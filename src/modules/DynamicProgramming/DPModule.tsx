import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useTeachingMode } from '../../context/TeachingModeContext';
import ControlBar from '../../components/ControlBar';
import PseudocodeDisplay from '../../components/PseudocodeDisplay';
import AlgorithmInfoCard from '../../components/AlgorithmInfoCard';

// ==================== Climbing Stairs ====================
interface StairStep {
    dp: number[];
    highlightIdx: number;
    description: string;
    pseudocodeLine: number;
    method: 'recursion' | 'memo' | 'tabulation';
}

function generateStairSteps(n: number): StairStep[] {
    const steps: StairStep[] = [];
    const dp = new Array(n + 1).fill(0);
    dp[0] = 1; dp[1] = 1;
    steps.push({ dp: [...dp], highlightIdx: 0, description: `初始化 dp[0] = 1（站在地面有 1 種方法）`, pseudocodeLine: 0, method: 'tabulation' });
    steps.push({ dp: [...dp], highlightIdx: 1, description: `初始化 dp[1] = 1（到第 1 階有 1 種方法）`, pseudocodeLine: 1, method: 'tabulation' });
    for (let i = 2; i <= n; i++) {
        dp[i] = dp[i - 1] + dp[i - 2];
        steps.push({ dp: [...dp], highlightIdx: i, description: `dp[${i}] = dp[${i - 1}] + dp[${i - 2}] = ${dp[i - 1]} + ${dp[i - 2]} = ${dp[i]}`, pseudocodeLine: 2, method: 'tabulation' });
    }
    steps.push({ dp: [...dp], highlightIdx: n, description: `完成！到第 ${n} 階共有 ${dp[n]} 種走法`, pseudocodeLine: 3, method: 'tabulation' });
    return steps;
}

// ==================== 0/1 Knapsack ====================
interface KnapsackItem { weight: number; value: number; name: string; }
interface KnapsackStep {
    dp: number[][];
    highlightCell: [number, number];
    description: string;
    pseudocodeLine: number;
    selectedItems: number[];
}

function generateKnapsackSteps(items: KnapsackItem[], W: number): KnapsackStep[] {
    const n = items.length;
    const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(W + 1).fill(0));
    const steps: KnapsackStep[] = [];
    steps.push({ dp: dp.map(r => [...r]), highlightCell: [0, 0], description: '初始化：dp 表格全部為 0', pseudocodeLine: 0, selectedItems: [] });

    for (let i = 1; i <= n; i++) {
        for (let w = 1; w <= W; w++) {
            const item = items[i - 1];
            if (item.weight <= w) {
                const takeIt = item.value + dp[i - 1][w - item.weight];
                const leaveIt = dp[i - 1][w];
                dp[i][w] = Math.max(takeIt, leaveIt);
                const choice = takeIt > leaveIt ? '拿' : '不拿';
                steps.push({
                    dp: dp.map(r => [...r]), highlightCell: [i, w],
                    description: `物品 ${item.name}(重${item.weight},值${item.value}), 容量${w}: ${choice}它 → dp[${i}][${w}] = ${dp[i][w]}`,
                    pseudocodeLine: 2, selectedItems: []
                });
            } else {
                dp[i][w] = dp[i - 1][w];
                steps.push({
                    dp: dp.map(r => [...r]), highlightCell: [i, w],
                    description: `物品 ${item.name} 太重(${item.weight} > ${w})，不拿 → dp[${i}][${w}] = ${dp[i][w]}`,
                    pseudocodeLine: 3, selectedItems: []
                });
            }
        }
    }

    // Backtrack
    const selected: number[] = [];
    let w = W;
    for (let i = n; i >= 1; i--) {
        if (dp[i][w] !== dp[i - 1][w]) { selected.push(i - 1); w -= items[i - 1].weight; }
    }
    steps.push({ dp: dp.map(r => [...r]), highlightCell: [n, W], description: `最佳答案 dp[${n}][${W}] = ${dp[n][W]}，選了：${selected.map(i => items[i].name).join(', ')}`, pseudocodeLine: 4, selectedItems: selected });
    return steps;
}

const defaultItems: KnapsackItem[] = [
    { weight: 2, value: 3, name: '📱手機' },
    { weight: 3, value: 4, name: '💻平板' },
    { weight: 4, value: 5, name: '📷相機' },
    { weight: 5, value: 8, name: '🎮遊戲機' },
];

const stairsPseudocode = [
    'dp[0] = 1  // 地面',
    'dp[1] = 1  // 只有一階',
    'for i = 2 to n:',
    '  dp[i] = dp[i-1] + dp[i-2]',
    'return dp[n]',
];

const knapsackPseudocode = [
    'dp[0..n][0..W] = 0',
    'for i = 1 to n:',
    '  for w = 1 to W:',
    '    if items[i].weight <= w:',
    '      dp[i][w] = max(dp[i-1][w], items[i].value + dp[i-1][w - items[i].weight])',
    '    else:',
    '      dp[i][w] = dp[i-1][w]',
];

type DPTab = 'stairs' | 'knapsack';

const DPModule: React.FC = () => {
    const { isTeachingMode } = useTeachingMode();
    const [tab, setTab] = useState<DPTab>('stairs');

    // Stairs state
    const [stairsN, setStairsN] = useState(6);
    const [stairSteps, setStairSteps] = useState<StairStep[]>([]);
    const [stairStep, setStairStep] = useState(0);
    const [stairPlaying, setStairPlaying] = useState(false);
    const [stairSpeed, setStairSpeed] = useState(1);
    const stairInterval = useRef<ReturnType<typeof setInterval> | null>(null);

    // Knapsack state
    const [knapsackW, setKnapsackW] = useState(7);
    const [knapsackSteps, setKnapsackSteps] = useState<KnapsackStep[]>([]);
    const [knapsackStep, setKnapsackStep] = useState(0);
    const [knapsackPlaying, setKnapsackPlaying] = useState(false);
    const [knapsackSpeed, setKnapsackSpeed] = useState(1);
    const knapsackInterval = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => { setStairSteps(generateStairSteps(stairsN)); setStairStep(0); }, [stairsN]);
    useEffect(() => { setKnapsackSteps(generateKnapsackSteps(defaultItems, knapsackW)); setKnapsackStep(0); }, [knapsackW]);

    useEffect(() => {
        if (stairPlaying && stairStep < stairSteps.length - 1) {
            stairInterval.current = setInterval(() => {
                setStairStep(p => { if (p >= stairSteps.length - 1) { setStairPlaying(false); return p; } return p + 1; });
            }, 800 / stairSpeed);
        }
        return () => { if (stairInterval.current) clearInterval(stairInterval.current); };
    }, [stairPlaying, stairSpeed, stairSteps.length, stairStep]);

    useEffect(() => {
        if (knapsackPlaying && knapsackStep < knapsackSteps.length - 1) {
            knapsackInterval.current = setInterval(() => {
                setKnapsackStep(p => { if (p >= knapsackSteps.length - 1) { setKnapsackPlaying(false); return p; } return p + 1; });
            }, 500 / knapsackSpeed);
        }
        return () => { if (knapsackInterval.current) clearInterval(knapsackInterval.current); };
    }, [knapsackPlaying, knapsackSpeed, knapsackSteps.length, knapsackStep]);

    const curStair = stairSteps[stairStep];
    const curKnapsack = knapsackSteps[knapsackStep];

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold mb-2">🧩 動態規劃 Dynamic Programming</h2>
                <p className="text-algo-muted">把大問題拆成小問題，把算過的答案存起來重複利用。</p>
            </div>

            {/* Tab switch */}
            <div className="flex gap-2">
                <button onClick={() => setTab('stairs')}
                    className={`px-5 py-2 rounded-lg font-semibold text-sm transition-all ${tab === 'stairs' ? 'bg-algo-processing/20 text-algo-processing border border-algo-processing/50' : 'bg-algo-card text-algo-muted border border-algo-border'}`}>
                    🪜 上樓梯問題
                </button>
                <button onClick={() => setTab('knapsack')}
                    className={`px-5 py-2 rounded-lg font-semibold text-sm transition-all ${tab === 'knapsack' ? 'bg-algo-processing/20 text-algo-processing border border-algo-processing/50' : 'bg-algo-card text-algo-muted border border-algo-border'}`}>
                    🎒 0/1 背包問題
                </button>
            </div>

            {/* ===== Stairs ===== */}
            {tab === 'stairs' && (
                <div className="space-y-4">
                    <div className="flex items-center gap-4 bg-algo-surface border border-algo-border rounded-xl p-4">
                        <span className="text-sm text-algo-muted">階數 n =</span>
                        <input type="range" min="2" max="10" value={stairsN} onChange={e => setStairsN(parseInt(e.target.value))} className="flex-1 accent-algo-accent" />
                        <span className="font-mono text-algo-accent text-xl font-bold w-8 text-right">{stairsN}</span>
                    </div>

                    <ControlBar isPlaying={stairPlaying} onPlay={() => setStairPlaying(true)} onPause={() => setStairPlaying(false)}
                        onNextStep={() => setStairStep(s => Math.min(s + 1, stairSteps.length - 1))}
                        onPrevStep={() => setStairStep(s => Math.max(s - 1, 0))}
                        onReset={() => { setStairSteps(generateStairSteps(stairsN)); setStairStep(0); }}
                        speed={stairSpeed} onSpeedChange={setStairSpeed} currentStep={stairStep} totalSteps={stairSteps.length - 1} />

                    {isTeachingMode && curStair && (
                        <motion.div key={stairStep} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="bg-algo-pivot/10 border border-algo-pivot/30 rounded-lg p-3 text-sm text-algo-text">
                            🎓 {curStair.description}
                        </motion.div>
                    )}

                    {/* DP array visualization */}
                    <div className="bg-algo-surface border border-algo-border rounded-2xl p-6">
                        <h3 className="font-bold text-algo-accent mb-4">dp 陣列填表過程</h3>
                        <div className="flex gap-2 flex-wrap justify-center">
                            {curStair?.dp.map((val, i) => (
                                <motion.div key={i}
                                    animate={{
                                        backgroundColor: i === curStair.highlightIdx ? '#3b82f6' : val > 0 ? '#22c55e' : '#334155',
                                        scale: i === curStair.highlightIdx ? 1.1 : 1,
                                    }}
                                    className="w-16 h-16 rounded-xl flex flex-col items-center justify-center border border-algo-border"
                                >
                                    <span className="text-[10px] text-algo-muted">dp[{i}]</span>
                                    <span className="text-lg font-bold">{val}</span>
                                </motion.div>
                            ))}
                        </div>

                        <div className="mt-4 text-center text-sm text-algo-muted">
                            轉移方程式：<span className="font-mono text-algo-comparing">dp[i] = dp[i-1] + dp[i-2]</span>
                        </div>
                        <div className="mt-2 text-center text-sm text-algo-text">{curStair?.description}</div>
                    </div>

                    {/* Teaching concepts */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-algo-surface border border-algo-border rounded-xl p-4">
                            <h4 className="text-algo-accent font-semibold mb-2">🔄 重複子問題</h4>
                            <p className="text-xs text-algo-text">爬到第 n 階，可以從第 n-1 階跨一步，或從第 n-2 階跨兩步。</p>
                        </div>
                        <div className="bg-algo-surface border border-algo-border rounded-xl p-4">
                            <h4 className="text-algo-accent font-semibold mb-2">📝 狀態定義</h4>
                            <p className="text-xs text-algo-text">dp[i] = 到第 i 階的方法數</p>
                        </div>
                        <div className="bg-algo-surface border border-algo-border rounded-xl p-4">
                            <h4 className="text-algo-accent font-semibold mb-2">⬆️ Top-down vs Bottom-up</h4>
                            <p className="text-xs text-algo-text">Top-down 從大問題往下拆（記憶化遞迴）；Bottom-up 從小問題往上建（表格法）。</p>
                        </div>
                    </div>

                    <PseudocodeDisplay code={stairsPseudocode} highlightLine={curStair?.pseudocodeLine ?? -1} title="上樓梯 — 表格法" />
                </div>
            )}

            {/* ===== Knapsack ===== */}
            {tab === 'knapsack' && (
                <div className="space-y-4">
                    <div className="flex items-center gap-4 bg-algo-surface border border-algo-border rounded-xl p-4">
                        <span className="text-sm text-algo-muted">背包容量 W =</span>
                        <input type="range" min="3" max="12" value={knapsackW} onChange={e => setKnapsackW(parseInt(e.target.value))} className="flex-1 accent-algo-accent" />
                        <span className="font-mono text-algo-accent text-xl font-bold w-8 text-right">{knapsackW}</span>
                    </div>

                    {/* Items list */}
                    <div className="flex flex-wrap gap-3">
                        {defaultItems.map((item, i) => (
                            <div key={i} className={`bg-algo-surface border rounded-xl p-3 text-sm ${curKnapsack?.selectedItems.includes(i) ? 'border-algo-done bg-algo-done/10' : 'border-algo-border'
                                }`}>
                                <div className="text-base">{item.name}</div>
                                <div className="text-algo-muted text-xs">重量：{item.weight}　價值：{item.value}</div>
                            </div>
                        ))}
                    </div>

                    <ControlBar isPlaying={knapsackPlaying} onPlay={() => setKnapsackPlaying(true)} onPause={() => setKnapsackPlaying(false)}
                        onNextStep={() => setKnapsackStep(s => Math.min(s + 1, knapsackSteps.length - 1))}
                        onPrevStep={() => setKnapsackStep(s => Math.max(s - 1, 0))}
                        onReset={() => { setKnapsackSteps(generateKnapsackSteps(defaultItems, knapsackW)); setKnapsackStep(0); }}
                        speed={knapsackSpeed} onSpeedChange={setKnapsackSpeed} currentStep={knapsackStep} totalSteps={knapsackSteps.length - 1} />

                    {isTeachingMode && curKnapsack && (
                        <motion.div key={knapsackStep} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="bg-algo-pivot/10 border border-algo-pivot/30 rounded-lg p-3 text-sm text-algo-text">
                            🎓 {curKnapsack.description}
                        </motion.div>
                    )}

                    {/* DP table */}
                    <div className="bg-algo-surface border border-algo-border rounded-2xl p-4 overflow-x-auto">
                        <h3 className="font-bold text-algo-accent mb-3">dp 二維表格</h3>
                        <table className="text-xs font-mono">
                            <thead>
                                <tr>
                                    <th className="px-2 py-1 text-algo-muted">i＼w</th>
                                    {Array.from({ length: knapsackW + 1 }, (_, w) => (
                                        <th key={w} className="px-2 py-1 text-algo-muted">{w}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {curKnapsack?.dp.map((row, i) => (
                                    <tr key={i}>
                                        <td className="px-2 py-1 text-algo-muted font-semibold">{i === 0 ? '0' : defaultItems[i - 1]?.name}</td>
                                        {row.map((val, w) => {
                                            const isHighlight = curKnapsack.highlightCell[0] === i && curKnapsack.highlightCell[1] === w;
                                            const isFinal = i === curKnapsack.dp.length - 1 && w === knapsackW && knapsackStep === knapsackSteps.length - 1;
                                            return (
                                                <td key={w} className={`px-2 py-1 text-center rounded ${isHighlight ? 'bg-algo-processing text-white font-bold' :
                                                        isFinal ? 'bg-algo-done/30 text-algo-done font-bold' :
                                                            val > 0 ? 'text-algo-text' : 'text-algo-muted/40'
                                                    }`}>
                                                    {val}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="mt-3 text-sm text-algo-text">{curKnapsack?.description}</div>
                    </div>

                    <PseudocodeDisplay code={knapsackPseudocode} highlightLine={curKnapsack?.pseudocodeLine ?? -1} title="0/1 背包 — 表格法" />

                    <AlgorithmInfoCard
                        coreIdea="對每個物品做「拿或不拿」的決策，利用表格記錄子問題的最佳解。"
                        steps={['定義 dp[i][w] = 考慮前 i 個物品、容量 w 時的最大價值', '若物品 i 放得下：dp[i][w] = max(不拿, 拿)', '若放不下：dp[i][w] = dp[i-1][w]', '答案在 dp[n][W]']}
                        timeComplexity="O(n × W)"
                        spaceComplexity="O(n × W)"
                        useCases={['資源分配最佳化', '投資組合選擇', '課程選修（有上限學分）']}
                        commonMistakes={['混淆 0/1 背包與無限背包', '忘記初始化第 0 行/列為 0', '以為 greedy 可以解（反例：重量比例不同的情況）']}
                        classroomQuestion="為什麼 0/1 背包不能用 Greedy（每次選 CP 值最高的）？能舉反例嗎？"
                    />
                </div>
            )}
        </div>
    );
};

export default DPModule;
