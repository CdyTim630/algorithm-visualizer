import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useTeachingMode } from '../../context/TeachingModeContext';
import ControlBar from '../../components/ControlBar';
import PseudocodeDisplay from '../../components/PseudocodeDisplay';
import AlgorithmInfoCard from '../../components/AlgorithmInfoCard';

// ======== Graph data types ========
interface GraphNode { id: string; x: number; y: number; }
interface GraphEdge { from: string; to: string; }

interface TraversalStep {
    visited: Set<string>;
    current: string | null;
    stack: string[];  // or queue
    description: string;
    pseudocodeLine: number;
    layer?: number;
    distances?: Record<string, number>;
}

// ======== Preset Graphs ========
const graphNodes: GraphNode[] = [
    { id: 'A', x: 120, y: 60 }, { id: 'B', x: 280, y: 60 },
    { id: 'C', x: 60, y: 180 }, { id: 'D', x: 200, y: 180 },
    { id: 'E', x: 340, y: 180 }, { id: 'F', x: 120, y: 300 },
    { id: 'G', x: 280, y: 300 },
];
const graphEdges: GraphEdge[] = [
    { from: 'A', to: 'B' }, { from: 'A', to: 'C' }, { from: 'A', to: 'D' },
    { from: 'B', to: 'E' }, { from: 'C', to: 'F' }, { from: 'D', to: 'F' },
    { from: 'D', to: 'G' }, { from: 'E', to: 'G' },
];

function getAdj(edges: GraphEdge[], directed: boolean): Record<string, string[]> {
    const adj: Record<string, string[]> = {};
    for (const n of graphNodes) adj[n.id] = [];
    for (const e of edges) {
        adj[e.from].push(e.to);
        if (!directed) adj[e.to].push(e.from);
    }
    return adj;
}

// ======== DFS steps ========
function generateDFSSteps(start: string, edges: GraphEdge[]): TraversalStep[] {
    const adj = getAdj(edges, false);
    const steps: TraversalStep[] = [];
    const visited = new Set<string>();
    const stack = [start];
    steps.push({ visited: new Set(), current: null, stack: [start], description: `將起點 ${start} 放入 stack`, pseudocodeLine: 0 });

    while (stack.length > 0) {
        const node = stack.pop()!;
        if (visited.has(node)) continue;
        visited.add(node);
        steps.push({ visited: new Set(visited), current: node, stack: [...stack], description: `拜訪 ${node}（從 stack 取出）`, pseudocodeLine: 1 });
        const neighbors = adj[node].filter(n => !visited.has(n)).reverse();
        for (const n of neighbors) {
            stack.push(n);
        }
        steps.push({ visited: new Set(visited), current: node, stack: [...stack], description: `${node} 的鄰居 ${neighbors.join(', ') || '無'} 推入 stack`, pseudocodeLine: 2 });
    }
    steps.push({ visited: new Set(visited), current: null, stack: [], description: 'DFS 完成！', pseudocodeLine: 3 });
    return steps;
}

// ======== BFS steps ========
function generateBFSSteps(start: string, edges: GraphEdge[]): TraversalStep[] {
    const adj = getAdj(edges, false);
    const steps: TraversalStep[] = [];
    const visited = new Set<string>([start]);
    const queue = [start];
    const dist: Record<string, number> = { [start]: 0 };
    steps.push({ visited: new Set(visited), current: null, stack: [...queue], description: `將起點 ${start} 放入 queue`, pseudocodeLine: 0, layer: 0, distances: { ...dist } });

    while (queue.length > 0) {
        const node = queue.shift()!;
        const layer = dist[node];
        steps.push({ visited: new Set(visited), current: node, stack: [...queue], description: `拜訪 ${node}（第 ${layer} 層）`, pseudocodeLine: 1, layer, distances: { ...dist } });
        for (const n of adj[node]) {
            if (!visited.has(n)) {
                visited.add(n);
                queue.push(n);
                dist[n] = layer + 1;
            }
        }
        steps.push({ visited: new Set(visited), current: node, stack: [...queue], description: `${node} 的未訪問鄰居加入 queue`, pseudocodeLine: 2, layer, distances: { ...dist } });
    }
    steps.push({ visited: new Set(visited), current: null, stack: [], description: 'BFS 完成！', pseudocodeLine: 3, distances: { ...dist } });
    return steps;
}

// ======== Euler Path ========
const eulerExamples = [
    {
        name: '有歐拉迴路',
        nodes: [
            { id: '1', x: 100, y: 80 }, { id: '2', x: 300, y: 80 },
            { id: '3', x: 300, y: 250 }, { id: '4', x: 100, y: 250 },
        ],
        edges: [
            { from: '1', to: '2' }, { from: '2', to: '3' },
            { from: '3', to: '4' }, { from: '4', to: '1' },
            { from: '1', to: '3' }, { from: '2', to: '4' },
        ],
    },
    {
        name: '有歐拉路徑',
        nodes: [
            { id: '1', x: 80, y: 80 }, { id: '2', x: 200, y: 80 },
            { id: '3', x: 320, y: 80 }, { id: '4', x: 140, y: 220 },
            { id: '5', x: 260, y: 220 },
        ],
        edges: [
            { from: '1', to: '2' }, { from: '2', to: '3' },
            { from: '1', to: '4' }, { from: '2', to: '4' },
            { from: '2', to: '5' }, { from: '3', to: '5' },
        ],
    },
    {
        name: '柯尼斯堡七橋 ❌',
        nodes: [
            { id: 'A', x: 80, y: 150 }, { id: 'B', x: 200, y: 60 },
            { id: 'C', x: 200, y: 240 }, { id: 'D', x: 330, y: 150 },
        ],
        edges: [
            { from: 'A', to: 'B' }, { from: 'A', to: 'B' },
            { from: 'A', to: 'C' }, { from: 'A', to: 'C' },
            { from: 'B', to: 'D' }, { from: 'C', to: 'D' },
            { from: 'B', to: 'C' },
        ],
    },
];

type GraphTab = 'concepts' | 'dfs' | 'bfs' | 'euler';

const dfsPseudocode = ['stack.push(start)', 'while stack not empty:', '  node = stack.pop()', '  if node not visited:', '    visit(node)', '    push neighbors to stack'];
const bfsPseudocode = ['queue.enqueue(start)', 'while queue not empty:', '  node = queue.dequeue()', '  for neighbor of node:', '    if not visited:', '    queue.enqueue(neighbor)'];

const GraphModule: React.FC = () => {
    const { isTeachingMode } = useTeachingMode();
    const [tab, setTab] = useState<GraphTab>('concepts');
    const [isDirected, setIsDirected] = useState(false);
    const [showMatrix, setShowMatrix] = useState(false);
    const [startNode, setStartNode] = useState('A');

    // DFS state
    const [dfsSteps, setDfsSteps] = useState<TraversalStep[]>([]);
    const [dfsStep, setDfsStep] = useState(0);
    const [dfsPlaying, setDfsPlaying] = useState(false);
    const [dfsSpeed, setDfsSpeed] = useState(1);
    const dfsInterval = useRef<ReturnType<typeof setInterval> | null>(null);

    // BFS state
    const [bfsSteps, setBfsSteps] = useState<TraversalStep[]>([]);
    const [bfsStep, setBfsStep] = useState(0);
    const [bfsPlaying, setBfsPlaying] = useState(false);
    const [bfsSpeed, setBfsSpeed] = useState(1);
    const bfsInterval = useRef<ReturnType<typeof setInterval> | null>(null);

    // Euler state
    const [eulerIdx, setEulerIdx] = useState(0);

    useEffect(() => { setDfsSteps(generateDFSSteps(startNode, graphEdges)); setDfsStep(0); }, [startNode]);
    useEffect(() => { setBfsSteps(generateBFSSteps(startNode, graphEdges)); setBfsStep(0); }, [startNode]);

    useEffect(() => {
        if (dfsPlaying && dfsStep < dfsSteps.length - 1) {
            dfsInterval.current = setInterval(() => {
                setDfsStep(p => { if (p >= dfsSteps.length - 1) { setDfsPlaying(false); return p; } return p + 1; });
            }, 800 / dfsSpeed);
        }
        return () => { if (dfsInterval.current) clearInterval(dfsInterval.current); };
    }, [dfsPlaying, dfsSpeed, dfsSteps.length, dfsStep]);

    useEffect(() => {
        if (bfsPlaying && bfsStep < bfsSteps.length - 1) {
            bfsInterval.current = setInterval(() => {
                setBfsStep(p => { if (p >= bfsSteps.length - 1) { setBfsPlaying(false); return p; } return p + 1; });
            }, 800 / bfsSpeed);
        }
        return () => { if (bfsInterval.current) clearInterval(bfsInterval.current); };
    }, [bfsPlaying, bfsSpeed, bfsSteps.length, bfsStep]);

    const renderGraph = (nodes: GraphNode[], edges: GraphEdge[], step?: TraversalStep, directed?: boolean) => (
        <svg viewBox="0 0 400 340" className="w-full max-w-[500px] mx-auto">
            {/* Edges */}
            {edges.map((e, i) => {
                const from = nodes.find(n => n.id === e.from)!;
                const to = nodes.find(n => n.id === e.to)!;
                if (!from || !to) return null;
                return (
                    <g key={i}>
                        <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke="#475569" strokeWidth="2" />
                        {directed && (
                            <polygon
                                points={`${to.x},${to.y} ${to.x - 8},${to.y - 4} ${to.x - 8},${to.y + 4}`}
                                fill="#475569"
                                transform={`rotate(${Math.atan2(to.y - from.y, to.x - from.x) * 180 / Math.PI}, ${to.x}, ${to.y})`}
                            />
                        )}
                    </g>
                );
            })}
            {/* Nodes */}
            {nodes.map(n => {
                const isVisited = step?.visited.has(n.id);
                const isCurrent = step?.current === n.id;
                const fill = isCurrent ? '#3b82f6' : isVisited ? '#22c55e' : '#334155';
                const stroke = isCurrent ? '#60a5fa' : isVisited ? '#4ade80' : '#64748b';
                return (
                    <g key={n.id} onClick={() => setStartNode(n.id)} className="cursor-pointer">
                        <circle cx={n.x} cy={n.y} r="22" fill={fill} stroke={stroke} strokeWidth="3" />
                        <text x={n.x} y={n.y + 5} textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">{n.id}</text>
                        {step?.distances && step.distances[n.id] !== undefined && (
                            <text x={n.x} y={n.y + 38} textAnchor="middle" fill="#94a3b8" fontSize="10">d={step.distances[n.id]}</text>
                        )}
                    </g>
                );
            })}
        </svg>
    );

    const tabs: { id: GraphTab; label: string }[] = [
        { id: 'concepts', label: '📌 基本概念' }, { id: 'dfs', label: '🔍 DFS' },
        { id: 'bfs', label: '🌊 BFS' }, { id: 'euler', label: '🌉 歐拉路徑' },
    ];

    const curDfs = dfsSteps[dfsStep];
    const curBfs = bfsSteps[bfsStep];
    const euler = eulerExamples[eulerIdx];

    // Euler degree computation
    const eulerDegrees: Record<string, number> = {};
    if (euler) {
        euler.nodes.forEach(n => { eulerDegrees[n.id] = 0; });
        euler.edges.forEach(e => { eulerDegrees[e.from]++; eulerDegrees[e.to]++; });
    }
    const oddCount = Object.values(eulerDegrees).filter(d => d % 2 !== 0).length;
    const eulerResult = oddCount === 0 ? '✅ 有歐拉迴路' : oddCount === 2 ? '✅ 有歐拉路徑' : '❌ 不存在歐拉路徑或迴路';

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold mb-2">🕸️ 圖論 Graph</h2>
                <p className="text-algo-muted">理解節點與邊的關係，學會用 DFS 和 BFS 走遍圖。</p>
            </div>

            <div className="flex flex-wrap gap-2">
                {tabs.map(t => (
                    <button key={t.id} onClick={() => setTab(t.id)}
                        className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all border ${tab === t.id ? 'bg-algo-processing/20 text-algo-processing border-algo-processing/50' : 'bg-algo-card text-algo-muted border-algo-border'
                            }`}>{t.label}</button>
                ))}
            </div>

            {/* ===== Concepts ===== */}
            {tab === 'concepts' && (
                <div className="space-y-4">
                    <div className="flex gap-3 flex-wrap">
                        <button onClick={() => setIsDirected(!isDirected)} className="px-4 py-2 rounded-lg text-sm bg-algo-card border border-algo-border text-algo-text">
                            {isDirected ? '有向圖' : '無向圖'} — 點擊切換
                        </button>
                        <button onClick={() => setShowMatrix(!showMatrix)} className="px-4 py-2 rounded-lg text-sm bg-algo-card border border-algo-border text-algo-text">
                            {showMatrix ? '相鄰矩陣' : '相鄰串列'} — 點擊切換
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-algo-surface border border-algo-border rounded-2xl p-4">
                            {renderGraph(graphNodes, graphEdges, undefined, isDirected)}
                        </div>
                        <div className="bg-algo-surface border border-algo-border rounded-2xl p-4 overflow-x-auto">
                            <h3 className="font-bold text-algo-accent mb-3">{showMatrix ? '相鄰矩陣 Adjacency Matrix' : '相鄰串列 Adjacency List'}</h3>
                            {showMatrix ? (
                                <table className="text-xs font-mono">
                                    <thead><tr><th className="px-2 py-1" /></tr></thead>
                                    <tbody>
                                        <tr><td className="px-2" />{graphNodes.map(n => <td key={n.id} className="px-2 text-center text-algo-muted font-bold">{n.id}</td>)}</tr>
                                        {graphNodes.map(from => (
                                            <tr key={from.id}>
                                                <td className="px-2 text-algo-muted font-bold">{from.id}</td>
                                                {graphNodes.map(to => {
                                                    const hasEdge = graphEdges.some(e => (e.from === from.id && e.to === to.id) || (!isDirected && e.from === to.id && e.to === from.id));
                                                    return <td key={to.id} className={`px-2 text-center ${hasEdge ? 'text-algo-done font-bold' : 'text-algo-muted/30'}`}>{hasEdge ? 1 : 0}</td>;
                                                })}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="space-y-1 text-sm font-mono">
                                    {Object.entries(getAdj(graphEdges, isDirected)).map(([node, neighbors]) => (
                                        <div key={node}><span className="text-algo-accent font-bold">{node}</span> → [{neighbors.join(', ')}]</div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-algo-surface border border-algo-border rounded-xl p-4">
                            <h4 className="text-algo-accent font-bold mb-2">節點 Vertex</h4>
                            <p className="text-sm text-algo-text">圖中的「點」，代表實體（人、城市、網頁等等）。</p>
                        </div>
                        <div className="bg-algo-surface border border-algo-border rounded-xl p-4">
                            <h4 className="text-algo-accent font-bold mb-2">邊 Edge</h4>
                            <p className="text-sm text-algo-text">節點之間的「線」，代表關係（友誼、道路、連結等等）。</p>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== DFS ===== */}
            {tab === 'dfs' && (
                <div className="space-y-4">
                    <div className="bg-algo-surface border border-algo-border rounded-xl p-3 text-sm text-algo-text">
                        💡 DFS（深度優先搜尋）：<span className="text-algo-accent font-semibold">一路走到底，再回頭！</span>點擊節點可更改起點。
                    </div>

                    <ControlBar isPlaying={dfsPlaying} onPlay={() => setDfsPlaying(true)} onPause={() => setDfsPlaying(false)}
                        onNextStep={() => setDfsStep(s => Math.min(s + 1, dfsSteps.length - 1))}
                        onPrevStep={() => setDfsStep(s => Math.max(s - 1, 0))}
                        onReset={() => { setDfsSteps(generateDFSSteps(startNode, graphEdges)); setDfsStep(0); }}
                        speed={dfsSpeed} onSpeedChange={setDfsSpeed} currentStep={dfsStep} totalSteps={dfsSteps.length - 1} />

                    {isTeachingMode && curDfs && (
                        <motion.div key={dfsStep} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="bg-algo-pivot/10 border border-algo-pivot/30 rounded-lg p-3 text-sm">
                            🎓 {curDfs.description}
                        </motion.div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-algo-surface border border-algo-border rounded-2xl p-4">
                            {renderGraph(graphNodes, graphEdges, curDfs)}
                        </div>
                        <div className="space-y-3">
                            <div className="bg-algo-surface border border-algo-border rounded-xl p-4">
                                <h4 className="text-algo-accent font-bold mb-2">Stack 堆疊</h4>
                                <div className="flex flex-wrap gap-1">
                                    {curDfs?.stack.length ? curDfs.stack.map((n, i) => (
                                        <span key={i} className="px-2 py-1 rounded bg-algo-comparing/20 text-algo-comparing text-sm font-mono">{n}</span>
                                    )) : <span className="text-algo-muted text-sm">（空）</span>}
                                </div>
                            </div>
                            <div className="bg-algo-surface border border-algo-border rounded-xl p-4">
                                <h4 className="text-algo-done font-bold mb-2">已拜訪 Visited</h4>
                                <div className="flex flex-wrap gap-1">
                                    {curDfs?.visited.size ? [...curDfs.visited].map(n => (
                                        <span key={n} className="px-2 py-1 rounded bg-algo-done/20 text-algo-done text-sm font-mono">{n}</span>
                                    )) : <span className="text-algo-muted text-sm">（無）</span>}
                                </div>
                            </div>
                            <div className="bg-algo-card rounded-xl p-3 text-sm text-algo-text">{curDfs?.description}</div>
                        </div>
                    </div>

                    <PseudocodeDisplay code={dfsPseudocode} highlightLine={curDfs?.pseudocodeLine ?? -1} title="DFS 虛擬碼" />
                </div>
            )}

            {/* ===== BFS ===== */}
            {tab === 'bfs' && (
                <div className="space-y-4">
                    <div className="bg-algo-surface border border-algo-border rounded-xl p-3 text-sm text-algo-text">
                        💡 BFS（廣度優先搜尋）：<span className="text-algo-accent font-semibold">一層一層往外擴散！</span>點擊節點可更改起點。
                    </div>

                    <ControlBar isPlaying={bfsPlaying} onPlay={() => setBfsPlaying(true)} onPause={() => setBfsPlaying(false)}
                        onNextStep={() => setBfsStep(s => Math.min(s + 1, bfsSteps.length - 1))}
                        onPrevStep={() => setBfsStep(s => Math.max(s - 1, 0))}
                        onReset={() => { setBfsSteps(generateBFSSteps(startNode, graphEdges)); setBfsStep(0); }}
                        speed={bfsSpeed} onSpeedChange={setBfsSpeed} currentStep={bfsStep} totalSteps={bfsSteps.length - 1} />

                    {isTeachingMode && curBfs && (
                        <motion.div key={bfsStep} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="bg-algo-pivot/10 border border-algo-pivot/30 rounded-lg p-3 text-sm">
                            🎓 {curBfs.description}
                        </motion.div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-algo-surface border border-algo-border rounded-2xl p-4">
                            {renderGraph(graphNodes, graphEdges, curBfs)}
                        </div>
                        <div className="space-y-3">
                            <div className="bg-algo-surface border border-algo-border rounded-xl p-4">
                                <h4 className="text-algo-comparing font-bold mb-2">Queue 佇列</h4>
                                <div className="flex flex-wrap gap-1">
                                    {curBfs?.stack.length ? curBfs.stack.map((n, i) => (
                                        <span key={i} className="px-2 py-1 rounded bg-algo-comparing/20 text-algo-comparing text-sm font-mono">{n}</span>
                                    )) : <span className="text-algo-muted text-sm">（空）</span>}
                                </div>
                            </div>
                            <div className="bg-algo-surface border border-algo-border rounded-xl p-4">
                                <h4 className="text-algo-done font-bold mb-2">已拜訪 + 層數</h4>
                                <div className="flex flex-wrap gap-1">
                                    {curBfs?.visited.size ? [...curBfs.visited].map(n => (
                                        <span key={n} className="px-2 py-1 rounded bg-algo-done/20 text-algo-done text-sm font-mono">
                                            {n}{curBfs.distances && curBfs.distances[n] !== undefined ? `(d=${curBfs.distances[n]})` : ''}
                                        </span>
                                    )) : <span className="text-algo-muted text-sm">（無）</span>}
                                </div>
                            </div>
                            <div className="bg-algo-card rounded-xl p-3 text-sm text-algo-text">{curBfs?.description}</div>
                        </div>
                    </div>

                    <PseudocodeDisplay code={bfsPseudocode} highlightLine={curBfs?.pseudocodeLine ?? -1} title="BFS 虛擬碼" />

                    <AlgorithmInfoCard
                        coreIdea="BFS 一層一層往外擴展，DFS 一路走到底再回頭。兩者是圖搜尋的基礎。"
                        steps={['選擇起點', '用佇列（BFS）或堆疊（DFS）管理待拜訪節點', '取出節點、標記已拜訪', '將未拜訪的鄰居加入']}
                        timeComplexity="O(V + E)"
                        spaceComplexity="O(V)"
                        useCases={['走迷宮', '社交網路朋友推薦', '網頁爬蟲', '最短路徑（BFS 在無權圖）']}
                        commonMistakes={['忘記標記 visited 導致無限迴圈', '搞混 stack 和 queue 導致用錯搜尋法']}
                        classroomQuestion="如果要找兩個節點之間的最短距離（無權圖），應該用 DFS 還是 BFS？為什麼？"
                    />
                </div>
            )}

            {/* ===== Euler Path ===== */}
            {tab === 'euler' && (
                <div className="space-y-4">
                    <div className="flex gap-2 flex-wrap">
                        {eulerExamples.map((ex, i) => (
                            <button key={i} onClick={() => setEulerIdx(i)}
                                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all border ${eulerIdx === i ? 'bg-algo-processing/20 text-algo-processing border-algo-processing/50' : 'bg-algo-card text-algo-muted border-algo-border'
                                    }`}>{ex.name}</button>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-algo-surface border border-algo-border rounded-2xl p-4">
                            {renderGraph(euler.nodes, euler.edges)}
                        </div>
                        <div className="space-y-3">
                            <div className="bg-algo-surface border border-algo-border rounded-xl p-4">
                                <h4 className="text-algo-accent font-bold mb-3">各節點 degree（度數）</h4>
                                <div className="flex flex-wrap gap-2">
                                    {Object.entries(eulerDegrees).map(([node, deg]) => (
                                        <div key={node} className={`px-3 py-2 rounded-lg text-sm font-mono border ${deg % 2 !== 0 ? 'bg-algo-error/20 text-algo-error border-algo-error/40' : 'bg-algo-done/20 text-algo-done border-algo-done/40'
                                            }`}>
                                            {node}: {deg} {deg % 2 !== 0 ? '(奇)' : '(偶)'}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-algo-surface border border-algo-border rounded-xl p-4">
                                <h4 className="text-algo-accent font-bold mb-2">判斷結果</h4>
                                <p className="text-sm text-algo-text">奇數度點數量：<span className="font-bold text-algo-comparing">{oddCount}</span></p>
                                <p className="text-lg font-bold mt-2">{eulerResult}</p>
                            </div>

                            <div className="bg-algo-surface border border-algo-border rounded-xl p-4 text-sm space-y-2">
                                <p className="text-algo-text">📘 <span className="text-algo-done font-semibold">所有點皆偶數度</span> → 有歐拉迴路（可以從任意點出發走完所有邊回到起點）</p>
                                <p className="text-algo-text">📙 <span className="text-algo-comparing font-semibold">恰有兩個奇數度點</span> → 有歐拉路徑（從一端走到另一端）</p>
                                <p className="text-algo-text">📕 <span className="text-algo-error font-semibold">超過兩個奇數度點</span> → 不存在歐拉路徑或迴路</p>
                            </div>
                        </div>
                    </div>

                    {eulerIdx === 2 && (
                        <div className="bg-algo-pivot/10 border border-algo-pivot/30 rounded-xl p-4 text-sm text-algo-text leading-relaxed">
                            <h4 className="font-bold text-algo-pivot mb-2">🌉 柯尼斯堡七橋問題</h4>
                            <p>18世紀的柯尼斯堡有 7 座橋連接 4 塊陸地。歐拉證明了不可能走過每座橋恰好一次並回到起點——因為所有 4 個節點的 degree 都是奇數！這就是圖論的起源故事。</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default GraphModule;
