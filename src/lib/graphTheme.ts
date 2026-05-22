import { useTheme } from '../context/ThemeContext';

/**
 * Theme-aware palette for SVG-rendered graphs (Graph, Dijkstra, TopoSort).
 * Hardcoded hex (not CSS vars) because SVG attributes like `fill` / `stroke`
 * don't pick up CSS variables across all browsers consistently, and
 * framer-motion needs concrete colors to interpolate.
 *
 * Light variant: nodes are warm beige (not dark slate) so they don't read as
 * dark blobs on parchment; edges shift to a darker neutral so they still have
 * presence on the cream background; saturated state colors get a small AA
 * bump.
 */
export interface GraphPalette {
    /** Default unvisited node fill */
    nodeFill: string;
    /** Default unvisited node stroke */
    nodeStroke: string;
    /** Idle / muted state when another node is selected */
    nodeStrokeMuted: string;
    /** Current node being processed */
    nodeCurrent: string;
    nodeCurrentStroke: string;
    /** Visited / done node */
    nodeVisited: string;
    nodeVisitedStroke: string;
    /** In-queue / relaxing (used by Dijkstra) */
    nodeQueue: string;
    nodeQueueStroke: string;
    /** Result / on-path */
    nodeResult: string;
    nodeResultStroke: string;
    /** Removed (used by TopoSort once a node is taken) */
    nodeRemoved: string;
    nodeRemovedStroke: string;

    /** Default edge stroke */
    edge: string;
    /** Edge background panel for weight labels (Dijkstra) */
    edgeWeightBg: string;
    /** Edge weight text color */
    edgeWeightText: string;
    edgeWeightOnPath: string;

    /** Label text below a node (e.g. "d=∞") */
    label: string;

    /** Generic text rendered ON TOP of a saturated node (white in both modes for max contrast) */
    onNodeText: string;
}

const DARK: GraphPalette = {
    nodeFill: '#334155',
    nodeStroke: '#64748b',
    nodeStrokeMuted: '#94a3b8',
    nodeCurrent: '#3b82f6',
    nodeCurrentStroke: '#60a5fa',
    nodeVisited: '#22c55e',
    nodeVisitedStroke: '#4ade80',
    nodeQueue: '#f97316',
    nodeQueueStroke: '#fb923c',
    nodeResult: '#22c55e',
    nodeResultStroke: '#4ade80',
    nodeRemoved: '#475569',
    nodeRemovedStroke: '#64748b',
    edge: '#64748b',
    edgeWeightBg: '#1e293b',
    edgeWeightText: '#94a3b8',
    edgeWeightOnPath: '#22c55e',
    label: '#94a3b8',
    onNodeText: '#ffffff',
};

const LIGHT: GraphPalette = {
    // Warm parchment-aligned neutral so unvisited nodes don't shout against the cream
    nodeFill: '#d6c9a2',
    nodeStroke: '#8a7a52',
    nodeStrokeMuted: '#a89a78',
    // Saturated states keep their meaning but get a touch deeper for AA on cream
    nodeCurrent: '#2563eb',
    nodeCurrentStroke: '#1d4ed8',
    nodeVisited: '#15803d',
    nodeVisitedStroke: '#166534',
    nodeQueue: '#c2410c',
    nodeQueueStroke: '#9a3412',
    nodeResult: '#15803d',
    nodeResultStroke: '#166534',
    nodeRemoved: '#c6ba9a',
    nodeRemovedStroke: '#a89a78',
    // Edges: a warm slate that reads on cream
    edge: '#6b6346',
    edgeWeightBg: '#f4eede',
    edgeWeightText: '#5a4e2c',
    edgeWeightOnPath: '#15803d',
    label: '#5a4e2c',
    onNodeText: '#ffffff',
};

export const useGraphPalette = (): GraphPalette => {
    const { theme } = useTheme();
    return theme === 'dark' ? DARK : LIGHT;
};
