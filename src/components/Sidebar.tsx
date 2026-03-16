import React from 'react';
import { motion } from 'framer-motion';

const sections = [
    { id: 'hero', label: '首頁', icon: '🏠', rune: '◈' },
    { id: 'bigo', label: 'Big-O 複雜度', icon: '📈', rune: '∞' },
    { id: 'sorting', label: '排序 Sorting', icon: '⚗️', rune: '↕' },
    { id: 'dp', label: '動態規劃 DP', icon: '🔮', rune: '◇' },
    { id: 'graph', label: '圖論 Graph', icon: '🕸️', rune: '⬡' },
    { id: 'binary-search', label: '二分搜尋', icon: '🔍', rune: '◎' },
    { id: 'dijkstra', label: '最短路徑', icon: '🛤️', rune: '⟡' },
    { id: 'topo-sort', label: '拓樸排序', icon: '📐', rune: '▽' },
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
                className="fixed top-4 left-4 z-50 lg:hidden w-10 h-10 glass-card rounded-lg flex items-center justify-center text-algo-gold hover:text-algo-warm transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
                </svg>
            </button>

            {/* Overlay */}
            {isOpen && <div className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm" onClick={onToggle} />}

            {/* Sidebar */}
            <motion.aside
                initial={false}
                animate={{ x: isOpen ? 0 : -280 }}
                className="fixed left-0 top-0 bottom-0 w-[260px] z-40 flex flex-col
                    bg-algo-surface/95 backdrop-blur-xl border-r border-algo-border/50
                    lg:translate-x-0 lg:static lg:z-auto"
                style={{ willChange: 'transform' }}
            >
                {/* Logo Area */}
                <div className="p-5 border-b border-algo-border/50">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-algo-gold to-algo-pivot flex items-center justify-center text-algo-bg font-cinzel font-bold text-sm shadow-lantern">
                            IM
                        </div>
                        <div>
                            <h1 className="text-base font-bold font-cinzel bg-gradient-to-r from-algo-gold to-algo-warm bg-clip-text text-transparent">
                                IlluMinate
                            </h1>
                            <p className="text-[10px] text-algo-muted mt-0.5 tracking-wider">2026 臺大資管營</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto p-3 space-y-1">
                    {sections.map(s => (
                        <button key={s.id} onClick={() => { onNavigate(s.id); if (window.innerWidth < 1024) onToggle(); }}
                            className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all flex items-center gap-3 group relative
                ${currentSection === s.id
                                    ? 'bg-algo-gold/15 text-algo-gold border border-algo-gold/25'
                                    : 'text-algo-muted hover:text-algo-text hover:bg-algo-card/50'
                                }`}>
                            <span className="text-base">{s.icon}</span>
                            <span className="flex-1">{s.label}</span>
                            {currentSection === s.id && (
                                <motion.span
                                    layoutId="activeRune"
                                    className="text-algo-gold/50 text-xs font-cinzel"
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                >
                                    {s.rune}
                                </motion.span>
                            )}
                        </button>
                    ))}
                </nav>

                {/* Footer / Branding */}
                <div className="p-4 border-t border-algo-border/50">
                    <div className="flex items-center gap-2 justify-center">
                        <span className="text-algo-gold/40 text-xs">✦</span>
                        <p className="text-xs text-algo-muted/60 text-center">
                            2026 臺大資管營
                        </p>
                        <span className="text-algo-gold/40 text-xs">✦</span>
                    </div>
                    <p className="text-[10px] text-algo-muted/40 text-center mt-1">
                        by 陳鼎元 DingYuan Chen
                    </p>
                </div>
            </motion.aside>
        </>
    );
};

export default Sidebar;
