import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useTeachingMode } from '../../context/TeachingModeContext';
import ControlBar from '../../components/ControlBar';
import PseudocodeDisplay from '../../components/PseudocodeDisplay';
import AlgorithmInfoCard from '../../components/AlgorithmInfoCard';

interface DNode { id: string; x: number; y: number; }
interface DEdge { from: string; to: string; weight: number; }

interface DijkstraStep {
    dist: Record<string, number>;
    prev: Record<string, string | null>;
    visited: Set<string>;
    current: string | null;
    relaxing: string | null;
    description: string;
    pseudocodeLine: number;
    shortestPath: string[];
}

const presetGraphs = [
    {
        name: '範例圖 1',
        nodes: [
            { id: 'A', x: 80, y: 150 }, { id: 'B', x: 200, y: 60 },
            { id: 'C', x: 200, y: 240 }, { id: 'D', x: 340, y: 60 },
            { id: 'E', x: 340, y: 240 }, { id: 'F', x: 460, y: 150 },
        ],
        edges: [
            { from: 'A', to: 'B', weight: 4 }, { from: 'A', to: 'C', weight: 2 },
            { from: 'B', to: 'D', weight: 3 }, { from: 'B', to: 'C', weight: 1 },
            { from: 'C', to: 'E', weight: 5 }, { from: 'D', to: 'F', weight: 2 },
            { from: 'E', to: 'F', weight: 1 }, { from: 'C', to: 'D', weight: 4 },
        ],
    },
    {
        name: '範例圖 2',
        nodes: [
            { id: 'S', x: 80, y: 150 }, { id: 'A', x: 220, y: 60 },
            { id: 'B', x: 220, y: 240 }, { id: 'C', x: 360, y: 150 },
            { id: 'T', x: 480, y: 150 },
        ],
        edges: [
            { from: 'S', to: 'A', weight: 7 }, { from: 'S', to: 'B', weight: 2 },
            { from: 'A', to: 'C', weight: 3 }, { from: 'B', to: 'A', weight: 3 },
            { from: 'B', to: 'C', weight: 6 }, { from: 'C', to: 'T', weight: 1 },
            { from: 'A', to: 'T', weight: 8 },
        ],
    },
];

function generateDijkstraSteps(nodes: DNode[], edges: DEdge[], start: string): DijkstraStep[] {
    const steps: DijkstraStep[] = [];
    const dist: Record<string, number> = {};
    const prev: Record<string, string | null> = {};
    const visited = new Set<string>();
    const adj: Record<string, { to: string; w: number }[]> = {};

    for (const n of nodes) { dist[n.id] = Infinity; prev[n.id] = null; adj[n.id] = []; }
    dist[start] = 0;
    for (const e of edges) {
        adj[e.from].push({ to: e.to, w: e.weight });
        adj[e.to].push({ to: e.from, w: e.weight });
    }

    steps.push({ dist: { ...dist }, prev: { ...prev }, visited: new Set(), current: null, relaxing: null, description: `初始化：dist[${start}] = 0，其餘皆 ∞`, pseudocodeLine: 0, shortestPath: [] });

    for (let iter = 0; iter < nodes.length; iter++) {
        // Find unvisited with min dist
        let minDist = Infinity, minNode = '';
        for (const n of nodes) {
            if (!visited.has(n.id) && dist[n.id] < minDist) { minDist = dist[n.id]; minNode = n.id; }
        }
        if (!minNode) break;

        visited.add(minNode);
        steps.push({ dist: { ...dist }, prev: { ...prev }, visited: new Set(visited), current: minNode, relaxing: null, description: `選擇距離最短且未確定的節點：${minNode}（dist = ${dist[minNode]}）`, pseudocodeLine: 1, shortestPath: [] });

        for (const { to, w } of adj[minNode]) {
            if (!visited.has(to)) {
                const newDist = dist[minNode] + w;
                if (newDist < dist[to]) {
                    dist[to] = newDist;
                    prev[to] = minNode;
                    steps.push({ dist: { ...dist }, prev: { ...prev }, visited: new Set(visited), current: minNode, relaxing: to, description: `鬆弛 ${minNode}→${to}：${dist[minNode]} + ${w} = ${newDist} < ${dist[to] === Infinity ? '∞' : dist[to] + w}，更新 dist[${to}] = ${newDist}`, pseudocodeLine: 2, shortestPath: [] });
                } else {
                    steps.push({ dist: { ...dist }, prev: { ...prev }, visited: new Set(visited), current: minNode, relaxing: to, description: `檢查 ${minNode}→${to}：${dist[minNode]} + ${w} = ${newDist} ≥ ${dist[to]}，不更新`, pseudocodeLine: 3, shortestPath: [] });
                }
            }
        }
    }

    // Find shortest path to last node
    const endNode = nodes[nodes.length - 1].id;
    const path: string[] = [];
    let cur: string | null = endNode;
    while (cur) { path.unshift(cur); cur = prev[cur]; }

    steps.push({ dist: { ...dist }, prev: { ...prev }, visited: new Set(visited), current: null, relaxing: null, description: `完成！最短路徑到 ${endNode}：${path.join(' → ')}，總距離 = ${dist[endNode]}`, pseudocodeLine: 4, shortestPath: path });
    return steps;
}

const pseudocode = [
    'dist[start] = 0, others = ∞',
    'while unvisited nodes remain:',
    '  u = unvisited node with min dist',
    '  mark u as visited',
    '  for each neighbor v of u:',
    '    if dist[u] + w(u,v) < dist[v]:',
    '      dist[v] = dist[u] + w(u,v)',
    '      prev[v] = u',
];

const DijkstraModule: React.FC = () => {
    const { isTeachingMode } = useTeachingMode();
    const [graphIdx, setGraphIdx] = useState(0);
    const graph = presetGraphs[graphIdx];
    const [startNode, setStartNode] = useState(graph.nodes[0].id);
    const [steps, setSteps] = useState<DijkstraStep[]>([]);
    const [currentStep, setCurrentStep] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [speed, setSpeed] = useState(1);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        const g = presetGraphs[graphIdx];
        setStartNode(g.nodes[0].id);
        setSteps(generateDijkstraSteps(g.nodes, g.edges, g.nodes[0].id));
        setCurrentStep(0);
    }, [graphIdx]);

    useEffect(() => {
        setSteps(generateDijkstraSteps(graph.nodes, graph.edges, startNode));
        setCurrentStep(0);
        setIsPlaying(false);
    }, [startNode]);

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
                <h2 className="text-3xl font-bold mb-2">🛤️ 最短路徑 Dijkstra</h2>
                <p className="text-algo-muted">在非負加權圖中，找從起點到所有節點的最短距離。</p>
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
                onReset={() => { setSteps(generateDijkstraSteps(graph.nodes, graph.edges, startNode)); setCurrentStep(0); }}
                speed={speed} onSpeedChange={setSpeed} currentStep={currentStep} totalSteps={steps.length - 1} />

            {isTeachingMode && step && (
                <motion.div key={currentStep} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="bg-algo-pivot/10 border border-algo-pivot/30 rounded-lg p-3 text-sm text-algo-text">
                    🎓 {step.description}
                </motion.div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Graph SVG */}
                <div className="bg-algo-surface border border-algo-border rounded-2xl p-4">
                    <svg viewBox="0 0 540 300" className="w-full">
                        {/* Edges with weights */}
                        {graph.edges.map((e, i) => {
                            const from = graph.nodes.find(n => n.id === e.from)!;
                            const to = graph.nodes.find(n => n.id === e.to)!;
                            const mx = (from.x + to.x) / 2, my = (from.y + to.y) / 2;
                            const isOnPath = step?.shortestPath.length > 0 &&
                                step.shortestPath.some((n, j) => j < step.shortestPath.length - 1 &&
                                    ((n === e.from && step.shortestPath[j + 1] === e.to) || (n === e.to && step.shortestPath[j + 1] === e.from)));
                            return (
                                <g key={i}>
                                    <line x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                                        stroke={isOnPath ? '#22c55e' : '#475569'} strokeWidth={isOnPath ? 3.5 : 2} />
                                    <circle cx={mx} cy={my} r="12" fill="#1e293b" />
                                    <text x={mx} y={my + 4} textAnchor="middle" fill={isOnPath ? '#22c55e' : '#94a3b8'} fontSize="11" fontWeight="bold">{e.weight}</text>
                                </g>
                            );
                        })}
                        {/* Nodes */}
                        {graph.nodes.map(n => {
                            const isVisited = step?.visited.has(n.id);
                            const isCurrent = step?.current === n.id;
                            const isRelaxing = step?.relaxing === n.id;
                            const isOnPath = step?.shortestPath.includes(n.id);
                            const fill = isCurrent ? '#3b82f6' : isRelaxing ? '#f97316' : isOnPath ? '#22c55e' : isVisited ? '#22c55e' : '#334155';
                            const d = step?.dist[n.id];
                            return (
                                <g key={n.id} onClick={() => setStartNode(n.id)} className="cursor-pointer">
                                    <circle cx={n.x} cy={n.y} r="24" fill={fill} stroke={isCurrent ? '#93c5fd' : '#64748b'} strokeWidth="3" />
                                    <text x={n.x} y={n.y + 5} textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">{n.id}</text>
                                    <text x={n.x} y={n.y + 42} textAnchor="middle" fill="#94a3b8" fontSize="10" fontFamily="JetBrains Mono">
                                        {d === Infinity ? '∞' : d}
                                    </text>
                                </g>
                            );
                        })}
                    </svg>
                    <p className="text-xs text-algo-muted text-center mt-2">點擊節點可更改起點</p>
                </div>

                {/* Distance table */}
                <div className="space-y-3">
                    <div className="bg-algo-surface border border-algo-border rounded-xl p-4 overflow-x-auto">
                        <h4 className="text-algo-accent font-bold mb-3">距離表</h4>
                        <table className="text-sm w-full">
                            <thead>
                                <tr className="border-b border-algo-border">
                                    <th className="text-left py-1 text-algo-muted">節點</th>
                                    <th className="text-left py-1 text-algo-muted">dist</th>
                                    <th className="text-left py-1 text-algo-muted">前驅</th>
                                    <th className="text-left py-1 text-algo-muted">狀態</th>
                                </tr>
                            </thead>
                            <tbody>
                                {graph.nodes.map(n => (
                                    <tr key={n.id} className="border-b border-algo-border/40">
                                        <td className="py-1 font-bold">{n.id}</td>
                                        <td className="py-1 font-mono text-algo-comparing">{step?.dist[n.id] === Infinity ? '∞' : step?.dist[n.id]}</td>
                                        <td className="py-1 font-mono text-algo-muted">{step?.prev[n.id] || '-'}</td>
                                        <td className="py-1">{step?.visited.has(n.id) ? <span className="text-algo-done">✓ 確定</span> : <span className="text-algo-muted">未確定</span>}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="bg-algo-card rounded-xl p-3 text-sm text-algo-text">{step?.description}</div>

                    {step?.shortestPath.length > 0 && (
                        <div className="bg-algo-done/10 border border-algo-done/30 rounded-xl p-4">
                            <h4 className="text-algo-done font-bold mb-1">最短路徑</h4>
                            <p className="font-mono text-algo-done">{step.shortestPath.join(' → ')}</p>
                            <p className="text-sm text-algo-text mt-1">總距離：{step.dist[step.shortestPath[step.shortestPath.length - 1]]}</p>
                        </div>
                    )}
                </div>
            </div>

            <PseudocodeDisplay code={pseudocode} highlightLine={step?.pseudocodeLine ?? -1} title="Dijkstra 虛擬碼" />

            <AlgorithmInfoCard
                coreIdea="每次選擇距離最短且未確定的節點，用它去「鬆弛」鄰居的距離。"
                steps={['初始化 dist[start]=0, 其餘 ∞', '選未確定中 dist 最小的節點 u', '標記 u 為已確定', '對 u 的每個鄰居 v 嘗試鬆弛', '重複直到所有節點確定']}
                timeComplexity="O(V² ) 或 O((V+E) log V) 用 priority queue"
                spaceComplexity="O(V)"
                useCases={['GPS 導航', '網路路由', '遊戲 AI 的路徑搜尋']}
                commonMistakes={['Dijkstra 不能處理負權邊', '忘記初始化 dist 為 ∞', '混淆 BFS（無權圖）和 Dijkstra（非負加權圖）']}
                classroomQuestion="如果圖中有負權邊，Dijkstra 還能正確嗎？為什麼？"
            />
        </div>
    );
};

export default DijkstraModule;
