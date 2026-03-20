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
const presetGraphNodes: GraphNode[] = [
    { id: 'A', x: 120, y: 60 }, { id: 'B', x: 280, y: 60 },
    { id: 'C', x: 60, y: 180 }, { id: 'D', x: 200, y: 180 },
    { id: 'E', x: 340, y: 180 }, { id: 'F', x: 120, y: 300 },
    { id: 'G', x: 280, y: 300 },
];
const presetGraphEdges: GraphEdge[] = [
    { from: 'A', to: 'B' }, { from: 'A', to: 'C' }, { from: 'A', to: 'D' },
    { from: 'B', to: 'E' }, { from: 'C', to: 'F' }, { from: 'D', to: 'F' },
    { from: 'D', to: 'G' }, { from: 'E', to: 'G' },
];

function getAdj(nodes: GraphNode[], edges: GraphEdge[], directed: boolean): Record<string, string[]> {
    const adj: Record<string, string[]> = {};
    for (const n of nodes) adj[n.id] = [];
    for (const e of edges) {
        if (!adj[e.from]) adj[e.from] = [];
        if (!adj[e.to]) adj[e.to] = [];
        if (!adj[e.from].includes(e.to)) adj[e.from].push(e.to);
        if (!directed && !adj[e.to].includes(e.from)) adj[e.to].push(e.from);
    }
    return adj;
}

// ======== DFS steps ========
function generateDFSSteps(nodes: GraphNode[], start: string, edges: GraphEdge[], directed: boolean): TraversalStep[] {
    const adj = getAdj(nodes, edges, directed);
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
function generateBFSSteps(nodes: GraphNode[], start: string, edges: GraphEdge[], directed: boolean): TraversalStep[] {
    const adj = getAdj(nodes, edges, directed);
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
            { id: 'A', x: 120, y: 150 },
            { id: 'B', x: 230, y: 60 },
            { id: 'C', x: 230, y: 240 },
            { id: 'D', x: 340, y: 150 },
        ],
        edges: [
            { from: 'A', to: 'B' }, { from: 'A', to: 'B' },
            { from: 'A', to: 'C' }, { from: 'A', to: 'C' },
            { from: 'A', to: 'D' }, { from: 'B', to: 'D' },
            { from: 'C', to: 'D' },
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
    const [customNodes, setCustomNodes] = useState<GraphNode[]>(presetGraphNodes);
    const [customEdges, setCustomEdges] = useState<GraphEdge[]>(presetGraphEdges);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedNode, setSelectedNode] = useState<string | null>(null);

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

    useEffect(() => { 
        if (!customNodes.find(n => n.id === startNode)) {
            if (customNodes.length > 0) setStartNode(customNodes[0].id);
            return;
        }
        setDfsSteps(generateDFSSteps(customNodes, startNode, customEdges, isDirected)); setDfsStep(0); 
    }, [startNode, customNodes, customEdges, isDirected]);

    useEffect(() => { 
        if (!customNodes.find(n => n.id === startNode)) return;
        setBfsSteps(generateBFSSteps(customNodes, startNode, customEdges, isDirected)); setBfsStep(0); 
    }, [startNode, customNodes, customEdges, isDirected]);

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

    const renderGraph = (nodes: GraphNode[], edges: GraphEdge[], step?: TraversalStep, directed?: boolean, isCustomizing?: boolean) => (
        <svg viewBox="0 0 400 340" className={`w-full max-w-[500px] mx-auto ${isCustomizing ? 'cursor-crosshair bg-algo-surface/50 border-2 border-dashed border-algo-border rounded-xl' : ''}`}
            onClick={(e) => {
                if (!isCustomizing) return;
                const rect = e.currentTarget.getBoundingClientRect();
                const x = (e.clientX - rect.left) * (400 / rect.width);
                const y = (e.clientY - rect.top) * (340 / rect.height);
                
                let newId = 'A';
                for (let i = 0; i < 26; i++) {
                    const char = String.fromCharCode(65 + i);
                    if (!customNodes.some(n => n.id === char)) {
                        newId = char;
                        break;
                    }
                }
                if (customNodes.length < 26) {
                    setCustomNodes([...customNodes, { id: newId, x, y }]);
                }
            }}
        >
            {/* Edges */}
            {edges.map((e, i) => {
                const from = nodes.find(n => n.id === e.from)!;
                const to = nodes.find(n => n.id === e.to)!;
                if (!from || !to) return null;
                
                let edgeCount = 0;
                let edgeIndex = 0;
                edges.forEach((ed, idx) => {
                    const isSame = (ed.from === e.from && ed.to === e.to) || (!directed && ed.from === e.to && ed.to === e.from);
                    if (isSame) {
                        if (idx < i) edgeIndex++;
                        edgeCount++;
                    }
                });

                    if (edgeCount > 1) {
                        const dx = to.x - from.x;
                        const dy = to.y - from.y;
                        const mx = (from.x + to.x) / 2;
                        const my = (from.y + to.y) / 2;
                        const len = Math.sqrt(dx * dx + dy * dy);
                        const nx = -dy / len;
                        const ny = dx / len;
                        const offsetAmount = (edgeIndex - (edgeCount - 1) / 2) * 50;
                        const cx = mx + nx * offsetAmount;
                        const cy = my + ny * offsetAmount;
                        
                        // arrowhead angle at `to`
                        const angle = Math.atan2(to.y - cy, to.x - cx);
                        const targetX = to.x - 25 * Math.cos(angle);
                        const targetY = to.y - 25 * Math.sin(angle);

                        return (
                            <g key={i}>
                                <path d={`M ${from.x} ${from.y} Q ${cx} ${cy} ${to.x} ${to.y}`} fill="none" stroke="#64748b" strokeWidth="2.5" className="transition-all" />
                                {directed && (
                                    <polygon
                                        points={`${targetX},${targetY} ${targetX - 14},${targetY - 7} ${targetX - 14},${targetY + 7}`}
                                        fill="#64748b"
                                        transform={`rotate(${angle * 180 / Math.PI}, ${targetX}, ${targetY})`}
                                        className="transition-all"
                                    />
                                )}
                            </g>
                        );
                    }

                    const angle = Math.atan2(to.y - from.y, to.x - from.x);
                    const targetX = to.x - 25 * Math.cos(angle);
                    const targetY = to.y - 25 * Math.sin(angle);

                    return (
                        <g key={i}>
                            <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke="#64748b" strokeWidth="2.5" className="transition-all" />
                            {directed && (
                                <polygon
                                    points={`${targetX},${targetY} ${targetX - 14},${targetY - 7} ${targetX - 14},${targetY + 7}`}
                                    fill="#64748b"
                                    transform={`rotate(${angle * 180 / Math.PI}, ${targetX}, ${targetY})`}
                                    className="transition-all"
                                />
                            )}
                        </g>
                    );
                })}
            {/* Nodes */}
            {nodes.map(n => {
                const isVisited = step?.visited.has(n.id);
                const isCurrent = isCustomizing ? selectedNode === n.id : step?.current === n.id;
                const fill = isCurrent ? '#3b82f6' : isVisited ? '#22c55e' : '#334155';
                let stroke = isCurrent ? '#60a5fa' : isVisited ? '#4ade80' : '#64748b';
                
                if (isCustomizing && selectedNode && selectedNode !== n.id) {
                     stroke = '#94a3b8';
                }

                return (
                    <g key={n.id} onClick={(e) => {
                        if (isCustomizing) {
                            e.stopPropagation();
                            if (!selectedNode) {
                                setSelectedNode(n.id);
                            } else {
                                if (selectedNode !== n.id) {
                                    const exists = customEdges.find(ed => (ed.from === selectedNode && ed.to === n.id) || (!directed && ed.from === n.id && ed.to === selectedNode));
                                    if (exists) {
                                        setCustomEdges(customEdges.filter(ed => !((ed.from === selectedNode && ed.to === n.id) || (!directed && ed.from === n.id && ed.to === selectedNode))));
                                    } else {
                                        setCustomEdges([...customEdges, { from: selectedNode, to: n.id }]);
                                    }
                                }
                                setSelectedNode(null);
                            }
                        } else {
                            setStartNode(n.id);
                        }
                    }} className="cursor-pointer">
                        <circle cx={n.x} cy={n.y} r="22" fill={fill} stroke={stroke} strokeWidth="3" className="transition-colors" />
                        <text x={n.x} y={n.y + 5} textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">{n.id}</text>
                        {step?.distances && step.distances[n.id] !== undefined && (
                            <text x={n.x} y={n.y + 38} textAnchor="middle" fill="#94a3b8" fontSize="10">d={step.distances[n.id]}</text>
                        )}
                        {isCustomizing && (
                            <g onClick={(e) => {
                                e.stopPropagation();
                                setCustomNodes(customNodes.filter(nn => nn.id !== n.id));
                                setCustomEdges(customEdges.filter(ed => ed.from !== n.id && ed.to !== n.id));
                                if (selectedNode === n.id) setSelectedNode(null);
                            }}>
                                <circle cx={n.x + 18} cy={n.y - 18} r="10" fill="#ef4444" className="hover:fill-red-400 transition-colors" />
                                <text x={n.x + 18} y={n.y - 14} textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">×</text>
                            </g>
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
                    <div className="flex gap-3 flex-wrap items-center">
                        <button onClick={() => setIsDirected(!isDirected)} className="px-4 py-2 rounded-lg text-sm bg-algo-card border border-algo-border text-algo-text hover:bg-algo-surface transition-colors">
                            {isDirected ? '有向圖' : '無向圖'} — 點擊切換
                        </button>
                        <button onClick={() => setShowMatrix(!showMatrix)} className="px-4 py-2 rounded-lg text-sm bg-algo-card border border-algo-border text-algo-text hover:bg-algo-surface transition-colors">
                            {showMatrix ? '相鄰矩陣' : '相鄰串列'} — 點擊切換
                        </button>
                        <div className="w-px h-6 bg-algo-border mx-1 hidden sm:block"></div>
                        <button onClick={() => { setIsEditing(!isEditing); setSelectedNode(null); }} className={`px-4 py-2 rounded-lg text-sm transition-colors border font-bold ${isEditing ? 'bg-algo-comparing text-white border-algo-comparing' : 'bg-algo-card text-algo-text border-algo-border hover:border-algo-comparing/50'}`}>
                            {isEditing ? '✓ 完成建圖' : '✏️ 自己建圖'}
                        </button>
                        {isEditing && (
                            <>
                                <button onClick={() => { setCustomNodes([]); setCustomEdges([]); setSelectedNode(null); }} className="px-3 py-2 rounded-lg text-sm bg-algo-error/10 text-algo-error border border-algo-error/30 hover:bg-algo-error/20 transition-colors">
                                    清空這張圖
                                </button>
                                <button onClick={() => { setCustomNodes(presetGraphNodes); setCustomEdges(presetGraphEdges); setSelectedNode(null); }} className="px-3 py-2 rounded-lg text-sm bg-algo-card border border-algo-border text-algo-text hover:bg-algo-surface transition-colors">
                                    重置預設圖
                                </button>
                            </>
                        )}
                    </div>
                    
                    {isEditing && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-algo-comparing/10 border border-algo-comparing/30 rounded-xl p-3 text-sm text-algo-text flex items-center gap-2">
                            <span>💡 <span className="font-bold text-algo-comparing">建圖模式：</span>點擊空白處新增節點；點擊紅色「×」刪除節點；<span className="font-bold">點擊兩節點</span>建立/取消邊。</span>
                        </motion.div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-algo-surface border border-algo-border rounded-2xl p-4 flex items-center justify-center shadow-sm">
                            {renderGraph(customNodes, customEdges, undefined, isDirected, isEditing)}
                        </div>
                        <div className="bg-algo-surface border border-algo-border rounded-2xl p-6 flex flex-col shadow-sm">
                            <h3 className="text-xl font-bold text-algo-accent mb-5 flex items-center gap-2">
                                <span>{showMatrix ? '🧮 相鄰矩陣 Adjacency Matrix' : '🔗 相鄰串列 Adjacency List'}</span>
                            </h3>
                            {showMatrix ? (
                                <div className="space-y-4 flex-1 flex flex-col justify-between">
                                    <div className="overflow-x-auto pb-2">
                                        <table className="w-full text-base font-mono border-collapse">
                                            <thead>
                                                <tr>
                                                    <th className="p-2 border border-algo-border/50 bg-algo-card/50 rounded-tl-lg"></th>
                                                    {customNodes.map(n => <th key={n.id} className="p-2 border border-algo-border/50 bg-algo-card/50 text-algo-accent font-bold min-w-[40px]">{n.id}</th>)}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {customNodes.map(from => (
                                                    <tr key={from.id} className="hover:bg-algo-card/30 transition-colors">
                                                        <th className="p-2 border border-algo-border/50 bg-algo-card/50 text-algo-accent font-bold">{from.id}</th>
                                                        {customNodes.map(to => {
                                                            const hasEdge = customEdges.some(e => (e.from === from.id && e.to === to.id) || (!isDirected && e.from === to.id && e.to === from.id));
                                                            return (
                                                                <td key={to.id} className={`p-2 border border-algo-border/50 text-center xl:text-lg ${hasEdge ? 'text-algo-done font-bold bg-algo-done/10 shadow-[inset_0_0_8px_rgba(34,197,94,0.15)]' : 'text-algo-muted/30'}`}>
                                                                    {hasEdge ? 1 : 0}
                                                                </td>
                                                            );
                                                        })}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="bg-algo-hero/30 p-4 rounded-xl border border-algo-border text-sm text-algo-text shadow-sm mt-4">
                                        <p className="font-semibold text-algo-accent mb-2 border-b border-algo-border/50 pb-1">📝 矩陣說明：</p>
                                        <ul className="list-disc list-inside space-y-1.5 text-algo-muted">
                                            <li>使用 <span className="font-mono text-algo-text bg-algo-surface px-1.5 py-0.5 rounded shadow-sm border border-algo-border/50">V × V</span> 的二維陣列（V為節點數）。</li>
                                            <li>若 <span className="font-mono text-algo-text">i</span> 到 <span className="font-mono text-algo-text">j</span> 有邊，設為 <span className="font-mono text-algo-text">1</span>，否則為 <span className="font-mono text-algo-text">0</span>。</li>
                                            <li><span className="text-algo-done font-semibold">優點：</span>快速判斷任意兩點是否相連（O(1)）。</li>
                                            <li><span className="text-algo-error font-semibold">缺點：</span>非常耗費空間O(V²)，不適合「稀疏圖」。</li>
                                        </ul>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4 flex-1 flex flex-col justify-between">
                                    <div className="space-y-3 font-mono overflow-y-auto pr-2" style={{ maxHeight: '380px' }}>
                                        {Object.entries(getAdj(customNodes, customEdges, isDirected)).map(([node, neighbors]) => (
                                            <div key={node} className="flex items-center gap-3">
                                                <div className="flex-shrink-0 w-11 h-11 flex items-center justify-center rounded-xl bg-algo-accent text-white font-bold text-xl shadow-lg shadow-algo-accent/20">
                                                    {node}
                                                </div>
                                                <div className="text-algo-muted">➔</div>
                                                <div className="flex flex-wrap gap-2 items-center">
                                                    {neighbors.length > 0 ? neighbors.map((n, i) => (
                                                        <React.Fragment key={`${node}-${n}-${i}`}>
                                                            <div className="px-3.5 py-1.5 rounded-lg border-2 border-algo-done/40 bg-algo-done/10 text-algo-text font-bold text-lg hover:border-algo-done hover:bg-algo-done/20 transition-all shadow-sm">
                                                                {n}
                                                            </div>
                                                            {i < neighbors.length - 1 && <span className="text-algo-muted self-center text-sm">→</span>}
                                                        </React.Fragment>
                                                    )) : (
                                                        <span className="px-4 py-1.5 rounded-lg border-2 border-dashed border-algo-border text-algo-muted text-sm italic items-center flex shadow-inner">null</span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="bg-algo-hero/30 p-4 rounded-xl border border-algo-border text-sm text-algo-text shadow-sm mt-4">
                                        <p className="font-semibold text-algo-accent mb-2 border-b border-algo-border/50 pb-1">📝 串列說明：</p>
                                        <ul className="list-disc list-inside space-y-1.5 text-algo-muted">
                                            <li>為每個節點建立一個列表，記錄能直接到達的鄰居。</li>
                                            <li><span className="text-algo-done font-semibold">優點：</span>節省空間 O(V+E)，只存真實存在的邊；能極快走訪某點的所有鄰居。</li>
                                            <li><span className="text-algo-error font-semibold">缺點：</span>判斷相連時需循序搜尋鄰居列表（較慢）。</li>
                                        </ul>
                                    </div>
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
                        onReset={() => { setDfsSteps(generateDFSSteps(customNodes, startNode, customEdges, isDirected)); setDfsStep(0); }}
                        speed={dfsSpeed} onSpeedChange={setDfsSpeed} currentStep={dfsStep} totalSteps={dfsSteps.length - 1} />

                    {isTeachingMode && curDfs && (
                        <motion.div key={dfsStep} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="bg-algo-pivot/10 border border-algo-pivot/30 rounded-lg p-3 text-sm">
                            🎓 {curDfs.description}
                        </motion.div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-algo-surface border border-algo-border rounded-2xl p-4">
                            {renderGraph(customNodes, customEdges, curDfs, isDirected)}
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
                        onReset={() => { setBfsSteps(generateBFSSteps(customNodes, startNode, customEdges, isDirected)); setBfsStep(0); }}
                        speed={bfsSpeed} onSpeedChange={setBfsSpeed} currentStep={bfsStep} totalSteps={bfsSteps.length - 1} />

                    {isTeachingMode && curBfs && (
                        <motion.div key={bfsStep} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="bg-algo-pivot/10 border border-algo-pivot/30 rounded-lg p-3 text-sm">
                            🎓 {curBfs.description}
                        </motion.div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-algo-surface border border-algo-border rounded-2xl p-4">
                            {renderGraph(customNodes, customEdges, curBfs, isDirected)}
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
