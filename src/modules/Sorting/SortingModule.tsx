import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTeachingMode } from '../../context/TeachingModeContext';
import ControlBar from '../../components/ControlBar';
import PseudocodeDisplay from '../../components/PseudocodeDisplay';
import AlgorithmInfoCard from '../../components/AlgorithmInfoCard';

// ======== Types ========
interface SortStep {
    array: number[];
    comparing: number[];
    swapping: number[];
    sorted: number[];
    pivot?: number;
    partitionRange?: [number, number];
    mergeRange?: [number, number];
    description: string;
    pseudocodeLine: number;
    comparisons: number;
    swaps: number;
    round: number;
}

type SortAlgorithm = 'bubble' | 'selection' | 'merge' | 'quick';

// ======== Step generators ========
function generateBubbleSortSteps(inputArr: number[]): SortStep[] {
    const arr = [...inputArr];
    const steps: SortStep[] = [];
    const sorted: number[] = [];
    let comparisons = 0, swapCount = 0;
    steps.push({ array: [...arr], comparing: [], swapping: [], sorted: [], description: '開始 Bubble Sort', pseudocodeLine: 0, comparisons: 0, swaps: 0, round: 0 });
    for (let i = 0; i < arr.length - 1; i++) {
        for (let j = 0; j < arr.length - 1 - i; j++) {
            comparisons++;
            steps.push({ array: [...arr], comparing: [j, j + 1], swapping: [], sorted: [...sorted], description: `比較 arr[${j}]=${arr[j]} 和 arr[${j + 1}]=${arr[j + 1]}`, pseudocodeLine: 2, comparisons, swaps: swapCount, round: i + 1 });
            if (arr[j] > arr[j + 1]) {
                [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
                swapCount++;
                steps.push({ array: [...arr], comparing: [], swapping: [j, j + 1], sorted: [...sorted], description: `交換！${arr[j + 1]} > ${arr[j]}，把大的往右推`, pseudocodeLine: 3, comparisons, swaps: swapCount, round: i + 1 });
            }
        }
        sorted.push(arr.length - 1 - i);
        steps.push({ array: [...arr], comparing: [], swapping: [], sorted: [...sorted], description: `第 ${i + 1} 輪完成，最大值已浮到位置 ${arr.length - 1 - i}`, pseudocodeLine: 4, comparisons, swaps: swapCount, round: i + 1 });
    }
    sorted.push(0);
    steps.push({ array: [...arr], comparing: [], swapping: [], sorted: arr.map((_, i) => i), description: '排序完成！', pseudocodeLine: 5, comparisons, swaps: swapCount, round: arr.length - 1 });
    return steps;
}

function generateSelectionSortSteps(inputArr: number[]): SortStep[] {
    const arr = [...inputArr];
    const steps: SortStep[] = [];
    const sorted: number[] = [];
    let comparisons = 0, swapCount = 0;
    steps.push({ array: [...arr], comparing: [], swapping: [], sorted: [], description: '開始 Selection Sort', pseudocodeLine: 0, comparisons: 0, swaps: 0, round: 0 });
    for (let i = 0; i < arr.length - 1; i++) {
        let minIdx = i;
        steps.push({ array: [...arr], comparing: [i], swapping: [], sorted: [...sorted], description: `第 ${i + 1} 輪：從位置 ${i} 開始找最小值`, pseudocodeLine: 1, comparisons, swaps: swapCount, round: i + 1 });
        for (let j = i + 1; j < arr.length; j++) {
            comparisons++;
            steps.push({ array: [...arr], comparing: [minIdx, j], swapping: [], sorted: [...sorted], description: `比較 arr[${minIdx}]=${arr[minIdx]} 和 arr[${j}]=${arr[j]}`, pseudocodeLine: 2, comparisons, swaps: swapCount, round: i + 1 });
            if (arr[j] < arr[minIdx]) minIdx = j;
        }
        if (minIdx !== i) {
            [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
            swapCount++;
            steps.push({ array: [...arr], comparing: [], swapping: [i, minIdx], sorted: [...sorted], description: `找到最小值 ${arr[i]}，和位置 ${i} 交換`, pseudocodeLine: 3, comparisons, swaps: swapCount, round: i + 1 });
        }
        sorted.push(i);
    }
    sorted.push(arr.length - 1);
    steps.push({ array: [...arr], comparing: [], swapping: [], sorted: arr.map((_, i) => i), description: '排序完成！', pseudocodeLine: 4, comparisons, swaps: swapCount, round: arr.length - 1 });
    return steps;
}

function generateMergeSortSteps(inputArr: number[]): SortStep[] {
    const arr = [...inputArr];
    const steps: SortStep[] = [];
    let comparisons = 0, swapCount = 0;
    steps.push({ array: [...arr], comparing: [], swapping: [], sorted: [], description: '開始 Merge Sort', pseudocodeLine: 0, comparisons: 0, swaps: 0, round: 0 });

    function mergeSort(a: number[], l: number, r: number, depth: number) {
        if (l >= r) return;
        const mid = Math.floor((l + r) / 2);
        steps.push({ array: [...arr], comparing: [], swapping: [], sorted: [], mergeRange: [l, r], description: `分割 [${l}..${r}]，中點 = ${mid}`, pseudocodeLine: 1, comparisons, swaps: swapCount, round: depth });
        mergeSort(a, l, mid, depth + 1);
        mergeSort(a, mid + 1, r, depth + 1);
        // Merge
        const left = a.slice(l, mid + 1);
        const right = a.slice(mid + 1, r + 1);
        let i = 0, j = 0, k = l;
        while (i < left.length && j < right.length) {
            comparisons++;
            if (left[i] <= right[j]) { a[k] = left[i]; i++; }
            else { a[k] = right[j]; j++; }
            arr[k] = a[k]; k++;
            swapCount++;
            steps.push({ array: [...arr], comparing: [], swapping: [], sorted: [], mergeRange: [l, r], description: `合併 [${l}..${r}]：放入 ${a[k - 1]}`, pseudocodeLine: 3, comparisons, swaps: swapCount, round: depth });
        }
        while (i < left.length) { a[k] = left[i]; arr[k] = a[k]; i++; k++; }
        while (j < right.length) { a[k] = right[j]; arr[k] = a[k]; j++; k++; }
        steps.push({ array: [...arr], comparing: [], swapping: [], sorted: [], mergeRange: [l, r], description: `合併完成 [${l}..${r}]`, pseudocodeLine: 4, comparisons, swaps: swapCount, round: depth });
    }
    mergeSort(arr, 0, arr.length - 1, 1);
    steps.push({ array: [...arr], comparing: [], swapping: [], sorted: arr.map((_, i) => i), description: '排序完成！', pseudocodeLine: 5, comparisons, swaps: swapCount, round: 0 });
    return steps;
}

function generateQuickSortSteps(inputArr: number[]): SortStep[] {
    const arr = [...inputArr];
    const steps: SortStep[] = [];
    let comparisons = 0, swapCount = 0;
    steps.push({ array: [...arr], comparing: [], swapping: [], sorted: [], description: '開始 Quick Sort', pseudocodeLine: 0, comparisons: 0, swaps: 0, round: 0 });
    const finalSorted: Set<number> = new Set();

    function quickSort(l: number, r: number, depth: number) {
        if (l >= r) { if (l === r) finalSorted.add(l); return; }
        const pivotVal = arr[r];
        steps.push({ array: [...arr], comparing: [], swapping: [], sorted: [...finalSorted], pivot: r, partitionRange: [l, r], description: `選 pivot = arr[${r}] = ${pivotVal}`, pseudocodeLine: 1, comparisons, swaps: swapCount, round: depth });
        let i = l;
        for (let j = l; j < r; j++) {
            comparisons++;
            steps.push({ array: [...arr], comparing: [j, r], swapping: [], sorted: [...finalSorted], pivot: r, partitionRange: [l, r], description: `比較 arr[${j}]=${arr[j]} 和 pivot=${pivotVal}`, pseudocodeLine: 2, comparisons, swaps: swapCount, round: depth });
            if (arr[j] < pivotVal) {
                if (i !== j) {
                    [arr[i], arr[j]] = [arr[j], arr[i]]; swapCount++;
                    steps.push({ array: [...arr], comparing: [], swapping: [i, j], sorted: [...finalSorted], pivot: r, partitionRange: [l, r], description: `arr[${j}] < pivot，交換到位置 ${i}`, pseudocodeLine: 3, comparisons, swaps: swapCount, round: depth });
                }
                i++;
            }
        }
        [arr[i], arr[r]] = [arr[r], arr[i]]; swapCount++;
        finalSorted.add(i);
        steps.push({ array: [...arr], comparing: [], swapping: [i, r], sorted: [...finalSorted], description: `pivot 歸位到位置 ${i}`, pseudocodeLine: 4, comparisons, swaps: swapCount, round: depth });
        quickSort(l, i - 1, depth + 1);
        quickSort(i + 1, r, depth + 1);
    }
    quickSort(0, arr.length - 1, 1);
    steps.push({ array: [...arr], comparing: [], swapping: [], sorted: arr.map((_, i) => i), description: '排序完成！', pseudocodeLine: 5, comparisons, swaps: swapCount, round: 0 });
    return steps;
}

// ======== Pseudocode ========
const pseudocodes: Record<SortAlgorithm, string[]> = {
    bubble: [
        'function bubbleSort(arr):',
        '  for i = 0 to n-2:',
        '    for j = 0 to n-2-i:',
        '      if arr[j] > arr[j+1]:',
        '        swap(arr[j], arr[j+1])',
        '  return arr',
    ],
    selection: [
        'function selectionSort(arr):',
        '  for i = 0 to n-2:',
        '    minIdx = i',
        '    for j = i+1 to n-1:',
        '      if arr[j] < arr[minIdx]: minIdx = j',
        '    swap(arr[i], arr[minIdx])',
    ],
    merge: [
        'function mergeSort(arr, l, r):',
        '  if l >= r: return',
        '  mid = (l + r) / 2',
        '  mergeSort(arr, l, mid)',
        '  mergeSort(arr, mid+1, r)',
        '  merge(arr, l, mid, r)',
    ],
    quick: [
        'function quickSort(arr, l, r):',
        '  if l >= r: return',
        '  pivot = arr[r]',
        '  i = partition(arr, l, r, pivot)',
        '  quickSort(arr, l, i-1)',
        '  quickSort(arr, i+1, r)',
    ],
};

const algoNames: Record<SortAlgorithm, string> = { bubble: 'Bubble Sort', selection: 'Selection Sort', merge: 'Merge Sort', quick: 'Quick Sort' };

const algoDescriptions: Record<SortAlgorithm, string> = {
    bubble: '相鄰比較，最大值慢慢「浮」到右邊',
    selection: '每輪找最小值，放到最前面',
    merge: '分治法：切半 → 排序 → 合併',
    quick: '選 pivot → 分區 → 遞迴',
};

const comparisonTable = [
    { algo: 'Bubble Sort', best: 'O(n)', avg: 'O(n²)', worst: 'O(n²)', space: 'O(1)', stable: '是', idea: '相鄰比較交換' },
    { algo: 'Selection Sort', best: 'O(n²)', avg: 'O(n²)', worst: 'O(n²)', space: 'O(1)', stable: '否', idea: '每輪找最小' },
    { algo: 'Merge Sort', best: 'O(n log n)', avg: 'O(n log n)', worst: 'O(n log n)', space: 'O(n)', stable: '是', idea: '分治合併' },
    { algo: 'Quick Sort', best: 'O(n log n)', avg: 'O(n log n)', worst: 'O(n²)', space: 'O(log n)', stable: '否', idea: 'Pivot 分區' },
];

const presets = [
    { name: '預設', data: [5, 2, 8, 1, 3, 9, 4, 7, 6] },
    { name: '幾乎排好', data: [1, 2, 4, 3, 5, 6, 7, 8, 9] },
    { name: '反向', data: [9, 8, 7, 6, 5, 4, 3, 2, 1] },
    { name: '重複值', data: [3, 1, 4, 1, 5, 9, 2, 6, 5] },
];

const SortingModule: React.FC = () => {
    const { isTeachingMode } = useTeachingMode();
    const [algorithm, setAlgorithm] = useState<SortAlgorithm>('bubble');
    const [inputArray, setInputArray] = useState<number[]>([5, 2, 8, 1, 3, 9, 4, 7, 6]);
    const [customInput, setCustomInput] = useState('');
    const [steps, setSteps] = useState<SortStep[]>([]);
    const [currentStep, setCurrentStep] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [speed, setSpeed] = useState(1);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const generateSteps = useCallback((algo: SortAlgorithm, arr: number[]) => {
        const generators: Record<SortAlgorithm, (a: number[]) => SortStep[]> = {
            bubble: generateBubbleSortSteps, selection: generateSelectionSortSteps,
            merge: generateMergeSortSteps, quick: generateQuickSortSteps,
        };
        const s = generators[algo](arr);
        setSteps(s);
        setCurrentStep(0);
        setIsPlaying(false);
    }, []);

    useEffect(() => { generateSteps(algorithm, inputArray); }, [algorithm, inputArray, generateSteps]);

    useEffect(() => {
        if (isPlaying && currentStep < steps.length - 1) {
            intervalRef.current = setInterval(() => {
                setCurrentStep(prev => {
                    if (prev >= steps.length - 1) { setIsPlaying(false); return prev; }
                    return prev + 1;
                });
            }, 600 / speed);
        }
        return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    }, [isPlaying, speed, steps.length, currentStep]);

    const step = steps[currentStep] || steps[0];
    const maxVal = Math.max(...inputArray, 1);

    const handleCustomInput = () => {
        const nums = customInput.split(/[,，\s]+/).map(Number).filter(n => !isNaN(n) && n > 0 && n <= 99);
        if (nums.length >= 2) setInputArray(nums);
    };

    const handleRandom = () => {
        const len = 8 + Math.floor(Math.random() * 5);
        setInputArray(Array.from({ length: len }, () => Math.floor(Math.random() * 50) + 1));
    };

    const getBarColor = (i: number) => {
        if (step?.swapping?.includes(i)) return '#ef4444';
        if (step?.pivot === i) return '#a855f7';
        if (step?.comparing?.includes(i)) return '#f97316';
        if (step?.sorted?.includes(i)) return '#22c55e';
        return '#3b82f6';
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold mb-2">📊 排序演算法 Sorting</h2>
                <p className="text-algo-muted">觀察不同排序法如何一步步把陣列從混亂排成順序。</p>
            </div>

            {/* Algorithm selector */}
            <div className="flex flex-wrap gap-2">
                {(Object.keys(algoNames) as SortAlgorithm[]).map(a => (
                    <button key={a} onClick={() => setAlgorithm(a)}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all border ${algorithm === a ? 'bg-algo-processing/20 text-algo-processing border-algo-processing/50' : 'bg-algo-card text-algo-muted border-algo-border hover:text-algo-text'
                            }`}>
                        {algoNames[a]}
                    </button>
                ))}
            </div>

            {/* Description */}
            <div className="bg-algo-surface border border-algo-border rounded-xl p-4 flex items-start gap-3">
                <span className="text-2xl">💡</span>
                <div>
                    <h3 className="font-bold text-algo-accent">{algoNames[algorithm]}</h3>
                    <p className="text-sm text-algo-text">{algoDescriptions[algorithm]}</p>
                </div>
            </div>

            {/* Data controls */}
            <div className="flex flex-wrap gap-2 items-center">
                <span className="text-sm text-algo-muted">範例：</span>
                {presets.map(p => (
                    <button key={p.name} onClick={() => setInputArray(p.data)}
                        className="px-3 py-1.5 rounded-lg text-xs bg-algo-card border border-algo-border text-algo-muted hover:text-algo-text transition-colors">
                        {p.name}
                    </button>
                ))}
                <button onClick={handleRandom} className="px-3 py-1.5 rounded-lg text-xs bg-algo-accent/20 text-algo-accent border border-algo-accent/30 hover:bg-algo-accent/30">
                    🎲 隨機
                </button>
                <div className="flex items-center gap-1">
                    <input value={customInput} onChange={e => setCustomInput(e.target.value)} placeholder="輸入數字用逗號分隔"
                        className="px-3 py-1.5 rounded-lg text-xs bg-algo-card border border-algo-border text-algo-text w-48" />
                    <button onClick={handleCustomInput} className="px-3 py-1.5 rounded-lg text-xs bg-algo-done/20 text-algo-done border border-algo-done/30">確定</button>
                </div>
            </div>

            {/* Control bar */}
            <ControlBar
                isPlaying={isPlaying}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onNextStep={() => setCurrentStep(s => Math.min(s + 1, steps.length - 1))}
                onPrevStep={() => setCurrentStep(s => Math.max(s - 1, 0))}
                onReset={() => generateSteps(algorithm, inputArray)}
                speed={speed} onSpeedChange={setSpeed}
                currentStep={currentStep} totalSteps={steps.length - 1}
            />

            {/* Main visualization */}
            <div className="bg-algo-surface border border-algo-border rounded-2xl p-6">
                {/* Teaching mode narration */}
                {isTeachingMode && step && (
                    <motion.div key={currentStep} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                        className="mb-4 bg-algo-pivot/10 border border-algo-pivot/30 rounded-lg p-3 text-sm text-algo-text">
                        🎓 {step.description}
                    </motion.div>
                )}

                {/* Bar chart */}
                <div className="flex items-end justify-center gap-1.5 h-64 mb-4">
                    {step?.array.map((val, i) => (
                        <motion.div key={`${i}-${val}`}
                            layout
                            className="relative flex flex-col items-center"
                            style={{ width: `${Math.max(600 / step.array.length, 20)}px` }}
                        >
                            <span className="text-xs font-mono text-algo-muted mb-1">{val}</span>
                            <motion.div
                                animate={{ height: `${(val / maxVal) * 200}px`, backgroundColor: getBarColor(i) }}
                                transition={{ duration: 0.3 }}
                                className="w-full rounded-t-md"
                            />
                            <span className="text-[10px] text-algo-muted mt-1 font-mono">{i}</span>
                        </motion.div>
                    ))}
                </div>

                {/* Color legend */}
                <div className="flex flex-wrap gap-4 text-xs justify-center mb-4">
                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-algo-processing" /> 預設</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-algo-comparing" /> 比較中</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-algo-error" /> 交換</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-algo-done" /> 已完成</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-algo-pivot" /> Pivot</span>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-algo-card rounded-lg p-3 text-center">
                        <div className="text-algo-muted text-xs">比較次數</div>
                        <div className="text-xl font-bold text-algo-comparing">{step?.comparisons || 0}</div>
                    </div>
                    <div className="bg-algo-card rounded-lg p-3 text-center">
                        <div className="text-algo-muted text-xs">交換次數</div>
                        <div className="text-xl font-bold text-algo-error">{step?.swaps || 0}</div>
                    </div>
                    <div className="bg-algo-card rounded-lg p-3 text-center">
                        <div className="text-algo-muted text-xs">當前輪/層</div>
                        <div className="text-xl font-bold text-algo-accent">{step?.round || 0}</div>
                    </div>
                    <div className="bg-algo-card rounded-lg p-3 text-center">
                        <div className="text-algo-muted text-xs">描述</div>
                        <div className="text-xs font-medium text-algo-text mt-1 leading-snug">{step?.description}</div>
                    </div>
                </div>
            </div>

            {/* Pseudocode */}
            <PseudocodeDisplay code={pseudocodes[algorithm]} highlightLine={step?.pseudocodeLine ?? -1} title={`${algoNames[algorithm]} 虛擬碼`} />

            {/* Comparison table */}
            <div className="bg-algo-surface border border-algo-border rounded-2xl p-5 overflow-x-auto">
                <h3 className="font-bold text-algo-accent mb-3">📋 排序法比較表</h3>
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-algo-border text-algo-muted">
                            <th className="text-left py-2 pr-4">演算法</th>
                            <th className="text-left py-2 pr-4">核心想法</th>
                            <th className="text-left py-2 pr-4">最好</th>
                            <th className="text-left py-2 pr-4">平均</th>
                            <th className="text-left py-2 pr-4">最壞</th>
                            <th className="text-left py-2 pr-4">空間</th>
                            <th className="text-left py-2">穩定</th>
                        </tr>
                    </thead>
                    <tbody>
                        {comparisonTable.map(row => (
                            <tr key={row.algo} className="border-b border-algo-border/50">
                                <td className="py-2 pr-4 font-semibold text-algo-text">{row.algo}</td>
                                <td className="py-2 pr-4 text-algo-muted">{row.idea}</td>
                                <td className="py-2 pr-4 font-mono text-algo-done">{row.best}</td>
                                <td className="py-2 pr-4 font-mono text-algo-comparing">{row.avg}</td>
                                <td className="py-2 pr-4 font-mono text-algo-error">{row.worst}</td>
                                <td className="py-2 pr-4 font-mono text-algo-accent">{row.space}</td>
                                <td className="py-2">{row.stable}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <AlgorithmInfoCard
                coreIdea={algoDescriptions[algorithm]}
                steps={algorithm === 'bubble' ? ['外層迴圈控制輪數', '內層迴圈相鄰比較', '若左大於右則交換', '每輪最大值浮到底端'] :
                    algorithm === 'selection' ? ['每輪掃描未排序區間', '找到最小值', '與未排序首位交換', '已排序區域擴大'] :
                        algorithm === 'merge' ? ['將陣列不斷對半切', '遞迴排序左右半邊', '合併兩個已排序子陣列'] :
                            ['選擇 pivot', '比 pivot 小的放左邊', '比 pivot 大的放右邊', 'pivot 歸位，遞迴左右']}
                timeComplexity={algorithm === 'bubble' ? 'O(n²)' : algorithm === 'selection' ? 'O(n²)' : algorithm === 'merge' ? 'O(n log n)' : 'O(n log n) 平均'}
                spaceComplexity={algorithm === 'merge' ? 'O(n)' : 'O(1)'}
                useCases={['教學用途', '小資料量排序', algorithm === 'merge' ? '需要穩定排序時' : '一般場景']}
                commonMistakes={['忘記邊界條件', algorithm === 'quick' ? 'pivot 選到最大/最小值導致最壞情況' : '多寫一輪迴圈']}
                classroomQuestion={algorithm === 'bubble' ? '為什麼 Bubble Sort 叫「泡泡」排序？最大值像什麼東西？' :
                    algorithm === 'selection' ? '如果陣列已經排好了，Selection Sort 還是需要 O(n²) 次比較嗎？' :
                        algorithm === 'merge' ? 'Merge Sort 為什麼一定是 O(n log n)？它的缺點是什麼？' :
                            '什麼時候 Quick Sort 會退化成 O(n²)？怎麼避免？'}
            />
        </div>
    );
};

export default SortingModule;
