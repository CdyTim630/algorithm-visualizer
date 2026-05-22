import React from 'react';
import { motion } from 'framer-motion';

const topicCards = [
    { id: 'bigo', title: 'Big-O 複雜度', desc: '衡量演算法效率', accent: 'text-algo-warm' },
    { id: 'sorting', title: '排序 Sorting', desc: '把混亂資料排成順序', accent: 'text-algo-accent' },
    { id: 'dp', title: '動態規劃 DP', desc: '把重複子問題存起來', accent: 'text-algo-pivot' },
    { id: 'graph', title: '圖論 Graph', desc: '理解關係、路徑與連通性', accent: 'text-algo-done' },
    { id: 'binary-search', title: '二分搜尋', desc: '每次砍半的高效搜尋', accent: 'text-algo-gold' },
    { id: 'dijkstra', title: '最短路徑 Dijkstra', desc: '找最短成本路徑', accent: 'text-algo-comparing' },
    { id: 'topo-sort', title: '拓樸排序', desc: '處理有先後依賴的任務排序', accent: 'text-algo-processing' },
];

interface HeroProps {
    onNavigate: (id: string) => void;
}

const Hero: React.FC<HeroProps> = ({ onNavigate }) => {
    return (
        <div className="min-h-screen flex flex-col items-center px-6 pt-16 pb-20">
            {/* Hero block */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="text-center max-w-3xl w-full"
            >
                {/* Camp Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-algo-gold/25 bg-algo-gold/5 text-algo-gold text-xs tracking-wider mb-8">
                    <span className="w-1.5 h-1.5 rounded-full bg-algo-gold animate-pulse" />
                    2026 臺大資管營 · 微課程
                </div>

                {/* Key Visual Image */}
                <div className="relative mx-auto max-w-xl rounded-2xl overflow-hidden border border-algo-border/40 mb-10">
                    <img
                        src={`${import.meta.env.BASE_URL}illuminate-hero.jpg`}
                        alt="IlluMinate 2026 臺大資管營主視覺"
                        className="w-full h-auto object-cover"
                    />
                    <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-algo-bg to-transparent" />
                </div>

                {/* Title */}
                <h1 className="text-5xl md:text-6xl font-bold mb-4 font-cinzel tracking-tight">
                    <span className="text-shimmer">IlluMinate</span>
                </h1>

                <h2 className="text-lg md:text-xl text-algo-text mb-3 font-medium">
                    演算法視覺化互動教學
                </h2>

                <p className="text-sm md:text-base text-algo-muted max-w-xl mx-auto mb-10 leading-relaxed">
                    用互動動畫理解排序、圖論、動態規劃與搜尋。<br />
                    演算法不是背公式，而是看懂每一步。
                </p>

                <button
                    onClick={() => onNavigate('bigo')}
                    className="px-7 py-2.5 bg-algo-gold hover:bg-algo-warm text-algo-bg rounded-lg font-semibold text-base transition-colors"
                >
                    開始探索 →
                </button>
            </motion.div>

            {/* Topic List */}
            <div className="w-full max-w-3xl mt-20">
                <div className="flex items-center gap-3 mb-5">
                    <h3 className="text-sm font-semibold text-algo-muted tracking-wider uppercase">課程主題</h3>
                    <div className="flex-1 h-px bg-algo-border/30" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {topicCards.map((card, i) => (
                        <motion.button
                            key={card.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.05 * i }}
                            onClick={() => onNavigate(card.id)}
                            className="group flex items-center gap-4 px-4 py-3.5 rounded-lg border border-algo-border/30 bg-algo-surface/40 hover:bg-algo-surface hover:border-algo-gold/40 text-left transition-all"
                        >
                            <span className={`text-xs font-mono tabular-nums ${card.accent} opacity-60 group-hover:opacity-100 transition-opacity`}>
                                0{i + 1}
                            </span>
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-semibold text-algo-text group-hover:text-algo-gold transition-colors">
                                    {card.title}
                                </div>
                                <div className="text-xs text-algo-muted mt-0.5 truncate">{card.desc}</div>
                            </div>
                            <span className="text-algo-muted/40 group-hover:text-algo-gold group-hover:translate-x-0.5 transition-all">→</span>
                        </motion.button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Hero;
