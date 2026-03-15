import React from 'react';
import { motion } from 'framer-motion';

const sections = [
    { id: 'hero', label: '首頁', icon: '🏠' },
    { id: 'bigo', label: 'Big-O 複雜度', icon: '📈' },
    { id: 'sorting', label: '排序 Sorting', icon: '📊' },
    { id: 'dp', label: '動態規劃 DP', icon: '🧩' },
    { id: 'graph', label: '圖論 Graph', icon: '🕸️' },
    { id: 'binary-search', label: '二分搜尋', icon: '🔍' },
    { id: 'dijkstra', label: '最短路徑', icon: '🛤️' },
    { id: 'topo-sort', label: '拓樸排序', icon: '📐' },
];

interface SidebarProps {
    currentSection: string;
    onNavigate: (id: string) => void;
    isOpen: boolean;
    onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentSection, onNavigate, isOpen, onToggle }) => {
    return (
        <>
            {/* Mobile toggle */}
            <button onClick={onToggle}
                className="fixed top-4 left-4 z-50 lg:hidden w-10 h-10 bg-algo-surface border border-algo-border rounded-lg flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
                </svg>
            </button>

            {/* Overlay */}
            {isOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onToggle} />}

            {/* Sidebar */}
            <motion.aside
                initial={false}
                animate={{ x: isOpen ? 0 : -280 }}
                className="fixed left-0 top-0 bottom-0 w-[260px] bg-algo-surface/95 backdrop-blur-xl border-r border-algo-border z-40 flex flex-col
          lg:translate-x-0 lg:static lg:z-auto"
                style={{ willChange: 'transform' }}
            >
                <div className="p-5 border-b border-algo-border">
                    <h1 className="text-lg font-bold bg-gradient-to-r from-algo-accent to-algo-processing bg-clip-text text-transparent">
                        演算法視覺化
                    </h1>
                    <p className="text-xs text-algo-muted mt-1">Interactive Algorithm Visualizer</p>
                </div>

                <nav className="flex-1 overflow-y-auto p-3 space-y-1">
                    {sections.map(s => (
                        <button key={s.id} onClick={() => { onNavigate(s.id); if (window.innerWidth < 1024) onToggle(); }}
                            className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all flex items-center gap-3
                ${currentSection === s.id
                                    ? 'bg-algo-processing/20 text-algo-processing border border-algo-processing/30'
                                    : 'text-algo-muted hover:text-algo-text hover:bg-algo-card'
                                }`}>
                            <span className="text-base">{s.icon}</span>
                            {s.label}
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-algo-border text-xs text-algo-muted text-center">
                    by 陳鼎元 DingYuan Chen
                </div>
            </motion.aside>
        </>
    );
};

export default Sidebar;
