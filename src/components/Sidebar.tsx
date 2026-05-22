import React from 'react';
import { motion } from 'framer-motion';

const sections = [
    { id: 'hero', label: '首頁' },
    { id: 'bigo', label: 'Big-O 複雜度' },
    { id: 'sorting', label: '排序 Sorting' },
    { id: 'dp', label: '動態規劃 DP' },
    { id: 'graph', label: '圖論 Graph' },
    { id: 'binary-search', label: '二分搜尋' },
    { id: 'dijkstra', label: '最短路徑' },
    { id: 'topo-sort', label: '拓樸排序' },
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
                className="fixed top-4 left-4 z-50 lg:hidden w-10 h-10 rounded-lg bg-algo-surface border border-algo-border/40 flex items-center justify-center text-algo-text hover:text-algo-gold transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
                </svg>
            </button>

            {/* Overlay */}
            {isOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm" onClick={onToggle} />}

            {/* Sidebar */}
            <motion.aside
                initial={false}
                animate={{ x: isOpen ? 0 : -260 }}
                className="fixed left-0 top-0 bottom-0 w-[240px] z-40 flex flex-col
                    bg-algo-surface border-r border-algo-border/30
                    lg:translate-x-0 lg:static lg:z-auto"
                style={{ willChange: 'transform' }}
            >
                {/* Logo */}
                <button
                    onClick={() => onNavigate('hero')}
                    className="px-5 py-5 border-b border-algo-border/30 flex items-center gap-3 text-left hover:bg-algo-card/30 transition-colors"
                >
                    <div className="w-9 h-9 rounded-lg bg-algo-gold flex items-center justify-center text-algo-bg font-cinzel font-bold text-sm">
                        IM
                    </div>
                    <div>
                        <h1 className="text-base font-bold font-cinzel text-algo-text">
                            IlluMinate
                        </h1>
                        <p className="text-[10px] text-algo-muted mt-0.5 tracking-wider">2026 臺大資管營</p>
                    </div>
                </button>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
                    {sections.map(s => {
                        const active = currentSection === s.id;
                        return (
                            <button
                                key={s.id}
                                onClick={() => { onNavigate(s.id); if (window.innerWidth < 1024) onToggle(); }}
                                className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-3 relative
                                    ${active
                                        ? 'bg-algo-gold/10 text-algo-gold'
                                        : 'text-algo-muted hover:text-algo-text hover:bg-algo-card/40'
                                    }`}
                            >
                                {active && (
                                    <motion.span
                                        layoutId="activeIndicator"
                                        className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-r bg-algo-gold"
                                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                                    />
                                )}
                                <span className="ml-1">{s.label}</span>
                            </button>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-algo-border/30">
                    <p className="text-[11px] text-algo-muted/70 text-center">
                        2026 臺大資管營
                    </p>
                    <p className="text-[10px] text-algo-muted/40 text-center mt-0.5">
                        by 陳鼎元 DingYuan Chen
                    </p>
                </div>
            </motion.aside>
        </>
    );
};

export default Sidebar;
