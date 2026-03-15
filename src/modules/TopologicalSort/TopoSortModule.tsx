import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useTeachingMode } from '../../context/TeachingModeContext';
import ControlBar from '../../components/ControlBar';
import PseudocodeDisplay from '../../components/PseudocodeDisplay';
import AlgorithmInfoCard from '../../components/AlgorithmInfoCard';

interface TopoNode { id: string; x: number; y: number; label: string; }
interface TopoEdge { from: string; to: string; }

interface TopoStep {
    indegree: Record<string, number>;
    queue: string[];
    result: string[];
    removedEdges: Set<string>;
    current: string | null;
    description: string;
    pseudocodeLine: number;
    hasCycle: boolean;
}

const presetGraphs = [
    {
        name: '課程先修',
        nodes: [
            { id: 'prog', x: 80, y: 80, label: '程式設計' },
            { id: 'disc', x: 80, y: 220, label: '離散數學' },
            { id: 'ds', x: 250, y: 80, label: '資料結構' },
            { id: 'net', x: 250, y: 220, label: '網路概論' },
            { id: 'algo', x: 420, y: 80, label: '演算法' },
            { id: 'os', x: 420, y: 220, label: '作業系統' },
        ],
        edges: [
            { from: 'prog', to: 'ds' }, { from: 'disc', to: 'ds' },
            { from: 'ds', to: 'algo' }, { from: 'disc', to: 'algo' },
            { from: 'prog', to: 'net' }, { from: 'ds', to: 'os' },
            { from: 'net', to: 'os' },
        ],
    },
    {
        name: '專案工作流',
        nodes: [
            { id: 'req', x: 80, y: 150, label: '需求分析' },
            { id: 'design', x: 200, y: 60, label: '系統設計' },
            { id: 'db', x: 200, y: 240, label: '資料庫設計' },
            { id: 'impl', x: 340, y: 60, label: '實作開發' },
            { id: 'test', x: 340, y: 240, label: '測試' },
            { id: 'deploy', x: 460, y: 150, label: '部署' },
        ],
        edges: [
            { from: 'req', to: 'design' }, { from: 'req', to: 'db' },
            { from: 'design', to: 'impl' }, { from: 'db', to: 'impl' },
            { from: 'impl', to: 'test' }, { from: 'db', to: 'test' },
            { from: 'test', to: 'deploy' },
        ],
    },
    {
        name: '有環 ❌',
        nodes: [
            { id: 'A', x: 100, y: 150, label: 'A' },
            { id: 'B', x: 250, y: 60, label: 'B' },
            { id: 'C', x: 250, y: 240, label: 'C' },
            { id: 'D', x: 400, y: 150, label: 'D' },
        ],
        edges: [
            { from: 'A', to: 'B' }, { from: 'B', to: 'C' },
            { from: 'C', to: 'D' }, { from: 'D', to: 'B' },
        ],
    },
];

function generateTopoSteps(nodes: TopoNode[], edges: TopoEdge[]): TopoStep[] {
    const steps: TopoStep[] = [];
    const indegree: Record<string, number> = {};
    for (const n of nodes) indegree[n.id] = 0;
    for (const e of edges) indegree[e.to]++;

    const queue: string[] = [];
    for (const n of nodes) {
        if (indegree[n.id] === 0) queue.push(n.id);
    }
    const result: string[] = [];
    const removedEdges = new Set<string>();

    steps.push({
        indegree: { ...indegree }, queue: [...queue], result: [], removedEdges: new Set(),
        current: null, description: `初始化：計算所有節點入度，入度為 0 的節點加入 queue：[${queue.join(', ')}]`,
        pseudocodeLine: 0, hasCycle: false,
    });

    while (queue.length > 0) {
        const node = queue.shift()!;
        result.push(node);
        const nodeLabel = nodes.find(n => n.id === node)?.label || node;
        steps.push({
            indegree: { ...indegree }, queue: [...queue], result: [...result],
            removedEdges: new Set(removedEdges), current: node,
            description: `取出 ${nodeLabel}（入度 0），加入結果序列`,
            pseudocodeLine: 1, hasCycle: false,
        });

        for (const e of edges) {
            if (e.from === node && !removedEdges.has(`${e.from}-${e.to}`)) {
                removedEdges.add(`${e.from}-${e.to}`);
                indegree[e.to]--;
                const toLabel = nodes.find(n => n.id === e.to)?.label || e.to;
                steps.push({
                    indegree: { ...indegree }, queue: [...queue], result: [...result],
                    removedEdges: new Set(removedEdges), current: node,
                    description: `移除邊 ${nodeLabel} → ${toLabel}，${toLabel} 的入度降為 ${indegree[e.to]}`,
                    pseudocodeLine: 2, hasCycle: false,
                });
                if (indegree[e.to] === 0) {
                    queue.push(e.to);
                    steps.push({
                        indegree: { ...indegree }, queue: [...queue], result: [...result],
                        removedEdges: new Set(removedEdges), current: node,
                        description: `${toLabel} 入度變 0，加入 queue`,
                        pseudocodeLine: 3, hasCycle: false,
                    });
                }
            }
        }
    }

    const hasCycle = result.length !== nodes.length;
    if (hasCycle) {
        steps.push({
            indegree: { ...indegree }, queue: [], result: [...result],
            removedEdges: new Set(removedEdges), current: null,
            description: `⚠️ 圖中有環！無法完成拓樸排序（只排了 ${result.length}/${nodes.length} 個節點）`,
            pseudocodeLine: 4, hasCycle: true,
        });
    } else {
        const labels = result.map(id => nodes.find(n => n.id === id)?.label || id);
        steps.push({
            indegree: { ...indegree }, queue: [], result: [...result],
            removedEdges: new Set(removedEdges), current: null,
            description: `✅ 拓樸排序完成：${labels.join(' → ')}`,
            pseudocodeLine: 4, hasCycle: false,
        });
    }

    return steps;
}

const pseudocode = [
    '計算所有節點入度',
    '將入度 0 的節點放入 queue',
    'while queue 不為空:',
    '  node = queue.dequeue()',
    '  result.append(node)',
    '  for edge from node:',
    '    target.indegree -= 1',
    '    if target.indegree == 0:',
    '      queue.enqueue(target)',
];

const TopoSortModule: React.FC = () => {
    const { isTeachingMode } = useTeachingMode();
    const [graphIdx, setGraphIdx] = useState(0);
    const graph = presetGraphs[graphIdx];
    const [steps, setSteps] = useState<TopoStep[]>([]);
    const [currentStep, setCurrentStep] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [speed, setSpeed] = useState(1);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        setSteps(generateTopoSteps(graph.nodes, graph.edges));
        setCurrentStep(0);
        setIsPlaying(false);
    }, [graphIdx]);

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
                <h2 className="text-3xl font-bold mb-2">📐 拓樸排序 Topological Sort</h2>
                <p className="text-algo-muted">用 Kahn's Algorithm 處理有先後依賴關係的任務排序。</p>
            </div>

            <div className="flex gap-2 flex-wrap">
                {presetGraphs.map((g, i) => (
                    <button key={i} onClick={() => setGraphIdx(i)}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all border ${graphIdx === i ? 'bg-algo-processing/20 text-algo-processing border-algo-processing/50' : 'bg-algo-card text-algo-muted border-algo-border'
                            }`}>{g.name}</button>
                ))}
            </div>

            <ControlBar isPlaying={isPlaying} onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)}
                onNextStep={() => setCurrentStep(s => Math.min(s + 1, steps.length - 1))}
                onPrevStep={() => setCurrentStep(s => Math.max(s - 1, 0))}
                onReset={() => { setSteps(generateTopoSteps(graph.nodes, graph.edges)); setCurrentStep(0); }}
                speed={speed} onSpeedChange={setSpeed} currentStep={currentStep} totalSteps={steps.length - 1} />

            {isTeachingMode && step && (
                <motion.div key={currentStep} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="bg-algo-pivot/10 border border-algo-pivot/30 rounded-lg p-3 text-sm text-algo-text">
                    🎓 {step.description}
                </motion.div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* DAG */}
                <div className="bg-algo-surface border border-algo-border rounded-2xl p-4">
                    <svg viewBox="0 0 520 300" className="w-full">
                        {/* Edges */}
                        {graph.edges.map((e, i) => {
                            const from = graph.nodes.find(n => n.id === e.from)!;
                            const to = graph.nodes.find(n => n.id === e.to)!;
                            const isRemoved = step?.removedEdges.has(`${e.from}-${e.to}`);
                            const dx = to.x - from.x, dy = to.y - from.y;
                            const len = Math.sqrt(dx * dx + dy * dy);
                            const ux = dx / len, uy = dy / len;
                            const ax = to.x - ux * 28, ay = to.y - uy * 28;
                            return (
                                <g key={i}>
                                    <line x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                                        stroke={isRemoved ? '#475569' : '#64748b'} strokeWidth="2"
                                        strokeDasharray={isRemoved ? '4,4' : ''} opacity={isRemoved ? 0.3 : 1} />
                                    {!isRemoved && (
                                        <polygon points={`${ax},${ay} ${ax - uy * 6 - ux * 8},${ay + ux * 6 - uy * 8} ${ax + uy * 6 - ux * 8},${ay - ux * 6 - uy * 8}`}
                                            fill="#64748b" />
                                    )}
                                </g>
                            );
                        })}
                        {/* Nodes */}
                        {graph.nodes.map(n => {
                            const inResult = step?.result.includes(n.id);
                            const isCurrent = step?.current === n.id;
                            const inQueue = step?.queue.includes(n.id);
                            const fill = isCurrent ? '#3b82f6' : inResult ? '#22c55e' : inQueue ? '#f97316' : '#334155';
                            return (
                                <g key={n.id}>
                                    <circle cx={n.x} cy={n.y} r="26" fill={fill} stroke={isCurrent ? '#93c5fd' : '#64748b'} strokeWidth="2.5" />
                                    <text x={n.x} y={n.y - 4} textAnchor="middle" fill="white" fontSize="10" fontWeight="600">{n.label}</text>
                                    <text x={n.x} y={n.y + 10} textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize="9">
                                        in:{step?.indegree[n.id] ?? '?'}
                                    </text>
                                </g>
                            );
                        })}
                    </svg>
                    <div className="flex flex-wrap gap-3 text-xs justify-center mt-2">
                        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-algo-processing" /> 目前處理</span>
                        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-algo-comparing" /> 在 Queue 中</span>
                        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-algo-done" /> 已排序</span>
                    </div>
                </div>

                {/* Info panels */}
                <div className="space-y-3">
                    <div className="bg-algo-surface border border-algo-border rounded-xl p-4">
                        <h4 className="text-algo-comparing font-bold mb-2">Queue（入度為 0）</h4>
                        <div className="flex flex-wrap gap-1">
                            {step?.queue.length ? step.queue.map((id, i) => {
                                const label = graph.nodes.find(n => n.id === id)?.label || id;
                                return <span key={i} className="px-3 py-1 rounded-lg bg-algo-comparing/20 text-algo-comparing text-sm">{label}</span>;
                            }) : <span className="text-algo-muted text-sm">（空）</span>}
                        </div>
                    </div>

                    <div className="bg-algo-surface border border-algo-border rounded-xl p-4">
                        <h4 className="text-algo-done font-bold mb-2">拓樸順序（結果）</h4>
                        <div className="flex flex-wrap gap-1">
                            {step?.result.length ? step.result.map((id, i) => {
                                const label = graph.nodes.find(n => n.id === id)?.label || id;
                                return (
                                    <React.Fragment key={id}>
                                        {i > 0 && <span className="text-algo-muted">→</span>}
                                        <span className="px-3 py-1 rounded-lg bg-algo-done/20 text-algo-done text-sm">{label}</span>
                                    </React.Fragment>
                                );
                            }) : <span className="text-algo-muted text-sm">（尚未開始）</span>}
                        </div>
                    </div>

                    <div className="bg-algo-surface border border-algo-border rounded-xl p-4">
                        <h4 className="text-algo-accent font-bold mb-2">入度表</h4>
                        <div className="flex flex-wrap gap-2">
                            {graph.nodes.map(n => (
                                <div key={n.id} className={`px-2 py-1 rounded text-xs font-mono border ${(step?.indegree[n.id] ?? 0) === 0 ? 'bg-algo-done/20 text-algo-done border-algo-done/30' : 'bg-algo-card text-algo-text border-algo-border'
                                    }`}>
                                    {n.label}: {step?.indegree[n.id] ?? '?'}
                                </div>
                            ))}
                        </div>
                    </div>

                    {step?.hasCycle && (
                        <div className="bg-algo-error/10 border border-algo-error/30 rounded-xl p-4 text-algo-error font-bold">
                            ⚠️ 圖中有環，無法完成拓樸排序！
                        </div>
                    )}

                    <div className="bg-algo-card rounded-xl p-3 text-sm text-algo-text">{step?.description}</div>
                </div>
            </div>

            <PseudocodeDisplay code={pseudocode} highlightLine={step?.pseudocodeLine ?? -1} title="Kahn's Algorithm 虛擬碼" />

            <AlgorithmInfoCard
                coreIdea="不斷取出入度為 0 的節點（無前置依賴），移除其邊，更新入度，直到所有節點排完或發現環。"
                steps={['計算所有節點入度', '入度 0 的節點放入 queue', '取出一個節點，加入結果', '移除其出邊，更新鄰居入度', '重複直到 queue 為空']}
                timeComplexity="O(V + E)"
                spaceComplexity="O(V)"
                useCases={['課程排課（先修衝突偵測）', '專案工作排程', '編譯順序', 'Excel 公式計算順序']}
                commonMistakes={['忘了檢查是否有環（結果數量 < 節點數量）', '搞混入度和出度', '以為拓樸序只有一種（通常有多種合法排序）']}
                classroomQuestion="一個 DAG 的拓樸排序是唯一的嗎？什麼時候會有多種合法排序？"
            />
        </div>
    );
};

export default TopoSortModule;
