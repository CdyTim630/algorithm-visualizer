import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useTeachingMode } from '../../context/TeachingModeContext';
import ControlBar from '../../components/ControlBar';
import PseudocodeDisplay from '../../components/PseudocodeDisplay';
import AlgorithmInfoCard from '../../components/AlgorithmInfoCard';

interface BSStep {
    array: number[];
    left: number;
    right: number;
    mid: number;
    target: number;
    found: boolean | null;
    description: string;
    pseudocodeLine: number;
    eliminated: Set<number>;
}

function generateBSSteps(arr: number[], target: number): BSStep[] {
    const steps: BSStep[] = [];
    let l = 0, r = arr.length - 1;
    const eliminated = new Set<number>();
    steps.push({ array: arr, left: l, right: r, mid: -1, target, found: null, description: `搜尋目標：${target}，範圍 [${l}, ${r}]`, pseudocodeLine: 0, eliminated: new Set() });

    while (l <= r) {
        const mid = l + Math.floor((r - l) / 2);
        steps.push({ array: arr, left: l, right: r, mid, target, found: null, description: `mid = ${l} + ⌊(${r}-${l})/2⌋ = ${mid}，arr[${mid}] = ${arr[mid]}`, pseudocodeLine: 1, eliminated: new Set(eliminated) });

        if (arr[mid] === target) {
            steps.push({ array: arr, left: l, right: r, mid, target, found: true, description: `找到了！arr[${mid}] = ${target} ✓`, pseudocodeLine: 2, eliminated: new Set(eliminated) });
            return steps;
        } else if (arr[mid] < target) {
            for (let i = l; i <= mid; i++) eliminated.add(i);
            steps.push({ array: arr, left: mid + 1, right: r, mid, target, found: null, description: `arr[${mid}] = ${arr[mid]} < ${target}，往右找 → L = ${mid + 1}`, pseudocodeLine: 3, eliminated: new Set(eliminated) });
            l = mid + 1;
        } else {
            for (let i = mid; i <= r; i++) eliminated.add(i);
            steps.push({ array: arr, left: l, right: mid - 1, mid, target, found: null, description: `arr[${mid}] = ${arr[mid]} > ${target}，往左找 → R = ${mid - 1}`, pseudocodeLine: 4, eliminated: new Set(eliminated) });
            r = mid - 1;
        }
    }
    steps.push({ array: arr, left: l, right: r, mid: -1, target, found: false, description: `搜尋範圍為空，找不到 ${target} ✗`, pseudocodeLine: 5, eliminated: new Set(eliminated) });
    return steps;
}

const defaultArray = [2, 5, 8, 12, 16, 23, 38, 45, 56, 72, 91];
const pseudocode = [
    'function binarySearch(arr, target):',
    '  L = 0, R = n - 1',
    '  while L <= R:',
    '    mid = L + floor((R - L) / 2)',
    '    if arr[mid] == target: return mid',
    '    if arr[mid] < target: L = mid + 1',
    '    else: R = mid - 1',
    '  return -1  // 找不到',
];

const BinarySearchModule: React.FC = () => {
    const { isTeachingMode } = useTeachingMode();
    const [array] = useState(defaultArray);
    const [target, setTarget] = useState(23);
    const [steps, setSteps] = useState<BSStep[]>([]);
    const [currentStep, setCurrentStep] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [speed, setSpeed] = useState(1);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        setSteps(generateBSSteps(array, target));
        setCurrentStep(0);
        setIsPlaying(false);
    }, [array, target]);

    useEffect(() => {
        if (isPlaying && currentStep < steps.length - 1) {
            intervalRef.current = setInterval(() => {
                setCurrentStep(prev => { if (prev >= steps.length - 1) { setIsPlaying(false); return prev; } return prev + 1; });
            }, 800 / speed);
        }
        return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    }, [isPlaying, speed, steps.length, currentStep]);

    const step = steps[currentStep];

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold mb-2">🔍 二分搜尋 Binary Search</h2>
                <p className="text-algo-muted">在已排序的資料中，每次把搜尋範圍砍半，快速找到目標。</p>
            </div>

            <div className="flex flex-wrap items-center gap-3 bg-algo-surface border border-algo-border rounded-xl p-4">
                <span className="text-sm text-algo-muted">搜尋目標：</span>
                <div className="flex flex-wrap gap-2">
                    {[5, 16, 23, 45, 72, 99].map(t => (
                        <button key={t} onClick={() => setTarget(t)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-mono transition-all border ${target === t ? 'bg-algo-processing/20 text-algo-processing border-algo-processing/50' : 'bg-algo-card text-algo-muted border-algo-border'
                                }`}>{t}</button>
                    ))}
                </div>
                <input type="number" value={target} onChange={e => setTarget(parseInt(e.target.value) || 0)} min={0} max={100}
                    className="w-20 px-3 py-1.5 rounded-lg text-sm bg-algo-card border border-algo-border text-algo-text font-mono" />
            </div>

            <ControlBar isPlaying={isPlaying} onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)}
                onNextStep={() => setCurrentStep(s => Math.min(s + 1, steps.length - 1))}
                onPrevStep={() => setCurrentStep(s => Math.max(s - 1, 0))}
                onReset={() => { setSteps(generateBSSteps(array, target)); setCurrentStep(0); }}
                speed={speed} onSpeedChange={setSpeed} currentStep={currentStep} totalSteps={steps.length - 1} />

            {isTeachingMode && step && (
                <motion.div key={currentStep} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="bg-algo-pivot/10 border border-algo-pivot/30 rounded-lg p-3 text-sm text-algo-text">
                    🎓 {step.description}
                </motion.div>
            )}

            {/* Array visualization */}
            <div className="bg-algo-surface border border-algo-border rounded-2xl p-6">
                <div className="flex gap-1 justify-center flex-wrap mb-6">
                    {step?.array.map((val, i) => {
                        const isMid = i === step.mid;
                        const isInRange = i >= step.left && i <= step.right && !step.eliminated.has(i);
                        const isFound = step.found === true && i === step.mid;
                        let bg = 'bg-algo-card';
                        let border = 'border-algo-border';
                        let textColor = 'text-algo-muted';
                        if (isFound) { bg = 'bg-algo-done'; border = 'border-algo-done'; textColor = 'text-white'; }
                        else if (isMid) { bg = 'bg-algo-processing'; border = 'border-algo-processing'; textColor = 'text-white'; }
                        else if (step.eliminated.has(i)) { bg = 'bg-algo-card/30'; textColor = 'text-algo-muted/30'; border = 'border-algo-border/30'; }
                        else if (isInRange) { bg = 'bg-algo-card'; textColor = 'text-algo-text'; }

                        return (
                            <motion.div key={i}
                                animate={{ scale: isMid ? 1.1 : 1, opacity: step.eliminated.has(i) ? 0.3 : 1 }}
                                className={`w-14 h-14 ${bg} border ${border} rounded-xl flex flex-col items-center justify-center transition-colors`}
                            >
                                <span className={`text-lg font-bold ${textColor}`}>{val}</span>
                                <span className="text-[9px] text-algo-muted font-mono">[{i}]</span>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Pointer labels */}
                {step && step.mid >= 0 && (
                    <div className="flex justify-center gap-6 text-sm font-mono">
                        <span className="text-algo-done">L={step.left}</span>
                        <span className="text-algo-processing font-bold">mid={step.mid}</span>
                        <span className="text-algo-error">R={step.right}</span>
                    </div>
                )}

                <div className="mt-4 text-center text-sm text-algo-text">{step?.description}</div>

                {step?.found === true && (
                    <div className="mt-3 text-center text-algo-done font-bold text-lg">✅ 找到目標 {target} 在索引 {step.mid}！</div>
                )}
                {step?.found === false && (
                    <div className="mt-3 text-center text-algo-error font-bold text-lg">❌ 找不到 {target}</div>
                )}
            </div>

            <PseudocodeDisplay code={pseudocode} highlightLine={step?.pseudocodeLine ?? -1} title="Binary Search 虛擬碼" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-algo-surface border border-algo-border rounded-xl p-4">
                    <h4 className="text-algo-accent font-bold mb-2">⚠️ 邊界更新容易寫錯</h4>
                    <p className="text-sm text-algo-text">mid 的計算用 <code className="text-algo-comparing font-mono">L + ⌊(R-L)/2⌋</code> 而不是 <code className="font-mono">(L+R)/2</code> 來避免整數溢位。</p>
                </div>
                <div className="bg-algo-surface border border-algo-border rounded-xl p-4">
                    <h4 className="text-algo-accent font-bold mb-2">📊 O(log n) 意味著什麼？</h4>
                    <p className="text-sm text-algo-text">100 萬筆資料只要約 20 次比較就能找到！每次砍半 → 2²⁰ = 1,048,576。</p>
                </div>
            </div>

            <AlgorithmInfoCard
                coreIdea="資料必須已排序，每次比較中間值，把搜尋範圍砍半。"
                steps={['設定 L=0, R=n-1', '計算 mid', '比較 arr[mid] 與 target', '更新 L 或 R 縮小範圍', '重複直到找到或範圍為空']}
                timeComplexity="O(log n)"
                spaceComplexity="O(1)"
                useCases={['在排序資料中快速查找', '猜數字遊戲', '搜尋引擎的索引查詢', '演算法中常作為子程序']}
                commonMistakes={['忘了資料要先排序', 'mid 計算時整數溢位', '邊界 L/R 更新寫成 mid 而非 mid±1', '迴圈條件 L<=R 寫成 L<R']}
                classroomQuestion="如果有 10 億筆排序好的資料，二分搜尋最多需要幾次比較？"
            />
        </div>
    );
};

export default BinarySearchModule;
