import React, { useState } from 'react';
import { TeachingModeProvider, useTeachingMode } from './context/TeachingModeContext';
import Sidebar from './components/Sidebar';
import Hero from './components/Hero';
import Footer from './components/Footer';
import BigOModule from './modules/BigO/BigOModule';
import SortingModule from './modules/Sorting/SortingModule';
import DPModule from './modules/DynamicProgramming/DPModule';
import GraphModule from './modules/Graph/GraphModule';
import BinarySearchModule from './modules/BinarySearch/BinarySearchModule';
import DijkstraModule from './modules/Dijkstra/DijkstraModule';
import TopoSortModule from './modules/TopologicalSort/TopoSortModule';

const AppContent: React.FC = () => {
    const [currentSection, setCurrentSection] = useState('hero');
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const { isTeachingMode, toggleTeachingMode } = useTeachingMode();

    const renderSection = () => {
        switch (currentSection) {
            case 'hero': return <Hero onNavigate={setCurrentSection} />;
            case 'bigo': return <BigOModule />;
            case 'sorting': return <SortingModule />;
            case 'dp': return <DPModule />;
            case 'graph': return <GraphModule />;
            case 'binary-search': return <BinarySearchModule />;
            case 'dijkstra': return <DijkstraModule />;
            case 'topo-sort': return <TopoSortModule />;
            default: return <Hero onNavigate={setCurrentSection} />;
        }
    };

    return (
        <div className="flex min-h-screen bg-algo-bg">
            <Sidebar
                currentSection={currentSection}
                onNavigate={setCurrentSection}
                isOpen={sidebarOpen}
                onToggle={() => setSidebarOpen(!sidebarOpen)}
            />

            <main className="flex-1 flex flex-col min-h-screen">
                {/* Top bar - IlluMinate themed */}
                {currentSection !== 'hero' && (
                    <div className="sticky top-0 z-30 bg-algo-bg/80 backdrop-blur-xl border-b border-algo-border/40 px-6 py-3 flex items-center justify-between">
                        <button onClick={() => setCurrentSection('hero')} className="text-algo-muted hover:text-algo-gold text-sm flex items-center gap-1.5 transition-colors group">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="group-hover:-translate-x-0.5 transition-transform"><polyline points="15 18 9 12 15 6" /></svg>
                            <span className="font-cinzel text-xs tracking-wider">IlluMinate</span>
                            <span className="text-algo-muted/40 mx-1">·</span>
                            <span>返回首頁</span>
                        </button>

                        <div className="flex items-center gap-4">
                            <span className="hidden md:inline text-[10px] text-algo-gold/40 tracking-widest font-cinzel">2026 臺大資管營</span>
                            <button onClick={toggleTeachingMode}
                                className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all border ${isTeachingMode
                                        ? 'bg-algo-gold/15 text-algo-gold border-algo-gold/40 shadow-[0_0_12px_rgba(212,168,83,0.15)]'
                                        : 'bg-algo-card text-algo-muted border-algo-border hover:text-algo-text hover:border-algo-pivot/30'
                                    }`}>
                                {isTeachingMode ? '🔮 教學模式 ON' : '📖 一般模式'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Content */}
                <div className="flex-1 px-6 py-8 max-w-6xl mx-auto w-full">
                    {renderSection()}
                </div>

                <Footer />
            </main>
        </div>
    );
};

const App: React.FC = () => (
    <TeachingModeProvider>
        <AppContent />
    </TeachingModeProvider>
);

export default App;
