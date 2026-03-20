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

interface Knapsack1DStep {
    dp: number[];
    highlightW: number;
    compareW: number;
    description: string;
    pseudocodeLine: number;
}

function generateKnapsack1DSteps(items: KnapsackItem[], W: number): Knapsack1DStep[] {
    const dp = new Array(W + 1).fill(0);
    const steps: Knapsack1DStep[] = [];
    steps.push({ dp: [...dp], highlightW: 0, compareW: -1, description: '初始化：一維 dp 陣列全部為 0', pseudocodeLine: 0 });

    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        steps.push({ dp: [...dp], highlightW: -1, compareW: -1, description: `🎒 考慮第 ${i + 1} 個物品: ${item.name} (重 ${item.weight}, 值 ${item.value})。\n⚠️ 注意：一維陣列必須從大容量往小容量倒著更新！`, pseudocodeLine: 1 });
        
        for (let w = W; w >= item.weight; w--) {
            const takeIt = item.value + dp[w - item.weight];
            const leaveIt = dp[w];
            const choice = takeIt > leaveIt ? '拿' : '不拿';
            const prevVal = dp[w-item.weight];

            dp[w] = Math.max(takeIt, leaveIt);
            
            steps.push({
                dp: [...dp], highlightW: w, compareW: w - item.weight,
                description: `容量 ${w}，前一個狀態為 ${w - item.weight} 的價值 ${prevVal}。\n${choice}它 → dp[${w}] 變成 ${dp[w]}`,
                pseudocodeLine: 3
            });
        }
    }
    steps.push({ dp: [...dp], highlightW: W, compareW: -1, description: `最佳答案 dp[${W}] = ${dp[W]} (一維無法直接回溯選的物品)`, pseudocodeLine: 4 });
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

const knapsack1DPseudocode = [
    'dp[0..W] = 0',
    'for i = 1 to n:',
    '  for w = W down to weight[i]:',
    '    dp[w] = max(dp[w], value[i] + dp[w - weight[i]])',
    'return dp[W]',
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

    const [knapsackMode, setKnapsackMode] = useState<'2d' | '1d'>('2d');
    const [knapsackW, setKnapsackW] = useState(7);
    const [knapsackItems, setKnapsackItems] = useState<KnapsackItem[]>(defaultItems);
    
    const [knapsackSteps, setKnapsackSteps] = useState<KnapsackStep[]>([]);
    const [knapsack1DSteps, setKnapsack1DSteps] = useState<Knapsack1DStep[]>([]);
    const [knapsackStep, setKnapsackStep] = useState(0); // For 2D
    const [knapsack1DStep, setKnapsack1DStep] = useState(0); // For 1D
    
    const [knapsackPlaying, setKnapsackPlaying] = useState(false);
    const [knapsackSpeed, setKnapsackSpeed] = useState(1);
    const knapsackInterval = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => { setStairSteps(generateStairSteps(stairsN)); setStairStep(0); }, [stairsN]);
    useEffect(() => { 
        setKnapsackSteps(generateKnapsackSteps(knapsackItems, knapsackW)); setKnapsackStep(0); 
        setKnapsack1DSteps(generateKnapsack1DSteps(knapsackItems, knapsackW)); setKnapsack1DStep(0); 
    }, [knapsackW, knapsackItems]);

    useEffect(() => {
        if (stairPlaying && stairStep < stairSteps.length - 1) {
            stairInterval.current = setInterval(() => {
                setStairStep(p => { if (p >= stairSteps.length - 1) { setStairPlaying(false); return p; } return p + 1; });
            }, 800 / stairSpeed);
        }
        return () => { if (stairInterval.current) clearInterval(stairInterval.current); };
    }, [stairPlaying, stairSpeed, stairSteps.length, stairStep]);

    useEffect(() => {
        if (knapsackPlaying) {
            const currentLen = knapsackMode === '2d' ? knapsackSteps.length : knapsack1DSteps.length;
            const currentStep = knapsackMode === '2d' ? knapsackStep : knapsack1DStep;
            
            if (currentStep < currentLen - 1) {
                knapsackInterval.current = setInterval(() => {
                    if (knapsackMode === '2d') {
                        setKnapsackStep(p => { if (p >= knapsackSteps.length - 1) { setKnapsackPlaying(false); return p; } return p + 1; });
                    } else {
                        setKnapsack1DStep(p => { if (p >= knapsack1DSteps.length - 1) { setKnapsackPlaying(false); return p; } return p + 1; });
                    }
                }, 1000 / knapsackSpeed);
            } else {
                setKnapsackPlaying(false);
            }
        }
        return () => { if (knapsackInterval.current) clearInterval(knapsackInterval.current); };
    }, [knapsackPlaying, knapsackSpeed, knapsackMode, knapsackSteps.length, knapsack1DSteps.length, knapsackStep, knapsack1DStep]);

    const curStair = stairSteps[stairStep];
    const curKnapsack = knapsackSteps[knapsackStep];
    const curKnapsack1D = knapsack1DSteps[knapsack1DStep];
    const activeKnapsackDesc = knapsackMode === '2d' ? curKnapsack?.description : curKnapsack1D?.description;

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
                    <div className="bg-algo-surface border border-algo-border rounded-xl p-4">
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-algo-muted">階數 n =</span>
                            <input type="range" min="2" max="10" value={stairsN} onChange={e => setStairsN(parseInt(e.target.value))} className="flex-1 accent-algo-accent" />
                            <span className="font-mono text-algo-accent text-xl font-bold w-8 text-right">{stairsN}</span>
                        </div>
                        <div className="slider-ticks ml-[72px] mr-[40px]">
                            {Array.from({ length: 9 }, (_, i) => <span key={i}>{i + 2}</span>)}
                        </div>
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
                    <div className="bg-algo-surface border border-algo-border rounded-xl p-4">
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-algo-muted">背包容量 W =</span>
                            <input type="range" min="3" max="12" value={knapsackW} onChange={e => setKnapsackW(parseInt(e.target.value))} className="flex-1 accent-algo-accent" />
                            <span className="font-mono text-algo-accent text-xl font-bold w-8 text-right">{knapsackW}</span>
                        </div>
                        <div className="slider-ticks ml-[100px] mr-[40px]">
                            {Array.from({ length: 10 }, (_, i) => <span key={i}>{i + 3}</span>)}
                        </div>
                    </div>

                    <div className="flex gap-2 flex-wrap mb-4">
                        <button onClick={() => { setKnapsackMode('2d'); setKnapsackPlaying(false); }} className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all border ${knapsackMode === '2d' ? 'bg-algo-processing/20 text-algo-processing border-algo-processing/50' : 'bg-algo-card text-algo-muted border-algo-border hover:bg-algo-surface'}`}>
                            🔲 二維 dp 表格 (空間 O(n×W))
                        </button>
                        <button onClick={() => { setKnapsackMode('1d'); setKnapsackPlaying(false); }} className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all border ${knapsackMode === '1d' ? 'bg-algo-processing/20 text-algo-processing border-algo-processing/50' : 'bg-algo-card text-algo-muted border-algo-border hover:bg-algo-surface'}`}>
                            📏 一維 dp 陣列 (優化空間 O(W))
                        </button>
                    </div>

                    {/* Items list (Editable) */}
                    <div className="flex flex-wrap gap-4">
                        {knapsackItems.map((item, i) => {
                            const isSelected = knapsackMode === '2d' && curKnapsack?.selectedItems.includes(i);
                            return (
                                <div key={i} className={`bg-algo-surface border rounded-2xl p-4 transition-all w-32 md:w-36 flex flex-col gap-3 relative ${
                                    isSelected ? 'border-algo-done bg-algo-done/10 shadow-[0_0_15px_rgba(34,197,94,0.3)] scale-[1.03]' : 'border-algo-border shadow-sm'
                                }`}>
                                    <div className="text-lg font-bold text-center border-b border-algo-border pb-2 text-algo-text flex items-center justify-center">
                                        {item.name}
                                    </div>
                                    <div className="flex flex-col gap-2 text-sm text-algo-muted">
                                        <label className="flex items-center justify-between bg-algo-card px-2 py-1.5 rounded-lg border border-algo-border/60 hover:border-algo-processing transition-colors">
                                            <span className="font-semibold select-none text-xs">重量</span>
                                            <input type="number" min="1" max="15" value={item.weight} 
                                                onChange={e => {
                                                    const newItems = [...knapsackItems];
                                                    newItems[i] = { ...item, weight: Math.max(1, parseInt(e.target.value) || 1) };
                                                    setKnapsackItems(newItems);
                                                }}
                                                className="w-12 bg-transparent text-right font-mono text-algo-text outline-none focus:text-algo-accent font-bold" />
                                        </label>
                                        <label className="flex items-center justify-between bg-algo-card px-2 py-1.5 rounded-lg border border-algo-border/60 hover:border-algo-processing transition-colors">
                                            <span className="font-semibold select-none text-xs">價值</span>
                                            <input type="number" min="1" max="25" value={item.value} 
                                                onChange={e => {
                                                    const newItems = [...knapsackItems];
                                                    newItems[i] = { ...item, value: Math.max(1, parseInt(e.target.value) || 1) };
                                                    setKnapsackItems(newItems);
                                                }}
                                                className="w-12 bg-transparent text-right font-mono text-algo-text outline-none focus:text-algo-accent font-bold" />
                                        </label>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <ControlBar isPlaying={knapsackPlaying} onPlay={() => setKnapsackPlaying(true)} onPause={() => setKnapsackPlaying(false)}
                        onNextStep={() => knapsackMode === '2d' ? setKnapsackStep(s => Math.min(s + 1, knapsackSteps.length - 1)) : setKnapsack1DStep(s => Math.min(s + 1, knapsack1DSteps.length - 1))}
                        onPrevStep={() => knapsackMode === '2d' ? setKnapsackStep(s => Math.max(s - 1, 0)) : setKnapsack1DStep(s => Math.max(s - 1, 0))}
                        onReset={() => { 
                            if (knapsackMode === '2d') { setKnapsackSteps(generateKnapsackSteps(knapsackItems, knapsackW)); setKnapsackStep(0); }
                            else { setKnapsack1DSteps(generateKnapsack1DSteps(knapsackItems, knapsackW)); setKnapsack1DStep(0); }
                        }}
                        speed={knapsackSpeed} onSpeedChange={setKnapsackSpeed} 
                        currentStep={knapsackMode === '2d' ? knapsackStep : knapsack1DStep} 
                        totalSteps={knapsackMode === '2d' ? knapsackSteps.length - 1 : knapsack1DSteps.length - 1} />

                    {isTeachingMode && activeKnapsackDesc && (
                        <motion.div key={`${knapsackMode}-${knapsackMode === '2d' ? knapsackStep : knapsack1DStep}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="bg-algo-pivot/10 border border-algo-pivot/30 rounded-lg p-3 text-sm text-algo-text whitespace-pre-wrap">
                            🎓 {activeKnapsackDesc}
                        </motion.div>
                    )}

                    {/* DP visualization */}
                    {knapsackMode === '2d' ? (
                        <div className="bg-algo-surface border border-algo-border rounded-2xl p-6 flex flex-col items-center overflow-x-auto w-full">
                            <h3 className="font-bold text-algo-accent mb-4 text-center text-lg">二維 dp 表格</h3>
                            <div className="w-full justify-center flex overflow-x-auto pb-4 custom-scrollbar max-w-full">
                                <table className="text-sm md:text-base font-mono border-collapse" style={{ minWidth: 'max-content' }}>
                                    <thead>
                                        <tr>
                                            <th className="px-4 py-2 text-algo-muted border border-algo-border/70 bg-algo-card/80 font-semibold sticky left-0 z-10 min-w-24 text-center shadow-[2px_0_5px_-2px_rgba(0,0,0,0.3)]">i ＼ w</th>
                                            {Array.from({ length: knapsackW + 1 }, (_, w) => (
                                                <th key={w} className="px-3 py-2 text-algo-muted border border-algo-border/70 bg-algo-card/80 font-semibold min-w-[3.5rem] text-center">{w}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {curKnapsack?.dp.map((row, i) => (
                                            <tr key={i}>
                                                <td className="px-4 py-3 text-algo-text font-semibold border border-algo-border/70 bg-algo-card/80 sticky left-0 z-10 text-center whitespace-nowrap shadow-[2px_0_5px_-2px_rgba(0,0,0,0.3)]">
                                                    {i === 0 ? '0' : knapsackItems[i - 1]?.name}
                                                </td>
                                                {row.map((val, w) => {
                                                    const isHighlight = curKnapsack.highlightCell[0] === i && curKnapsack.highlightCell[1] === w;
                                                    const isFinal = i === curKnapsack.dp.length - 1 && w === knapsackW && knapsackStep === knapsackSteps.length - 1;
                                                    
                                                    let cellClasses = "w-full h-full flex items-center justify-center transition-all duration-300 font-medium ";
                                                    let wrapperClasses = "p-0 border border-algo-border/40 min-w-[3.5rem] h-12 relative ";
                                                    
                                                    if (isHighlight) {
                                                        cellClasses += "bg-algo-processing text-white font-bold rounded-md shadow-[0_0_15px_rgba(59,130,246,0.6)] scale-[1.15] z-20 absolute inset-0";
                                                    } else if (isFinal) {
                                                        cellClasses += "bg-algo-done/30 text-algo-done font-bold border border-algo-done shadow-[inset_0_0_10px_rgba(34,197,94,0.3)] absolute inset-0";
                                                    } else if (val > 0) {
                                                        cellClasses += "text-algo-text bg-algo-card/40 hover:bg-algo-card/60 absolute inset-0";
                                                    } else {
                                                        cellClasses += "text-algo-muted/30 absolute inset-0";
                                                    }

                                                    return (
                                                        <td key={w} className={wrapperClasses}>
                                                            <div className={cellClasses}>
                                                                {val}
                                                            </div>
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="mt-5 text-base font-medium text-algo-text text-center bg-algo-card/60 px-6 py-3 rounded-xl border border-algo-border/60 w-full max-w-3xl shadow-sm whitespace-pre-wrap">
                                {activeKnapsackDesc}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-algo-surface border border-algo-border rounded-2xl p-6 flex flex-col items-center overflow-x-auto w-full">
                            <h3 className="font-bold text-algo-accent mb-4 text-center text-lg">一維 dp 陣列</h3>
                            <div className="w-full justify-center flex overflow-x-auto pb-4 custom-scrollbar max-w-full">
                                <div className="flex gap-2">
                                    {curKnapsack1D?.dp.map((val, w) => {
                                        const isHighlight = curKnapsack1D.highlightW === w;
                                        const isCompare = curKnapsack1D.compareW === w;
                                        const isFinal = w === knapsackW && knapsack1DStep === knapsack1DSteps.length - 1;
                                        
                                        let bg = val > 0 ? '#22c55e' : '#334155';
                                        let border = '#475569';
                                        
                                        if (isHighlight) { bg = '#3b82f6'; border = '#60a5fa'; }
                                        else if (isCompare) { bg = '#a855f7'; border = '#c084fc'; }
                                        else if (isFinal) { bg = '#22c55e'; border = '#4ade80'; }
                                        
                                        return (
                                            <motion.div key={w}
                                                animate={{ backgroundColor: bg, borderColor: border, scale: isHighlight || isCompare ? 1.05 : 1 }}
                                                className="w-16 h-16 rounded-xl flex flex-col items-center justify-center border-2 border-algo-border shadow-sm text-white relative transition-all"
                                            >
                                                <span className="text-[10px] text-white/70 absolute top-1 font-mono">w={w}</span>
                                                <span className="text-xl font-bold mt-1">{val}</span>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </div>
                            <div className="flex gap-4 mb-4 text-xs font-mono text-algo-text">
                                <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-[#3b82f6]"></span> 當前更新格子</div>
                                <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-[#a855f7]"></span> 給定價值的來源格子</div>
                                <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-[#22c55e]"></span> 記錄過價值的格子</div>
                            </div>
                            <div className="mt-2 text-base font-medium text-algo-text text-center bg-algo-card/60 px-6 py-3 rounded-xl border border-algo-border/60 w-full max-w-3xl shadow-sm whitespace-pre-wrap">
                                {activeKnapsackDesc}
                            </div>
                        </div>
                    )}

                    <PseudocodeDisplay code={knapsackMode === '2d' ? knapsackPseudocode : knapsack1DPseudocode} highlightLine={knapsackMode === '2d' ? curKnapsack?.pseudocodeLine ?? -1 : curKnapsack1D?.pseudocodeLine ?? -1} title={knapsackMode === '2d' ? "0/1 背包 — 二維表格法" : "0/1 背包 — 一維空間優化"} />

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
