import React from 'react';
import { motion } from 'framer-motion';

const topicCards = [
    { id: 'sorting', title: '排序 Sorting', desc: '把混亂資料排成順序', icon: '📊', color: 'from-blue-500 to-cyan-500' },
    { id: 'dp', title: '動態規劃 DP', desc: '把重複子問題存起來', icon: '🧩', color: 'from-purple-500 to-pink-500' },
    { id: 'graph', title: '圖論 Graph', desc: '理解關係、路徑與連通性', icon: '🕸️', color: 'from-green-500 to-emerald-500' },
    { id: 'binary-search', title: '二分搜尋', desc: '每次砍半的高效搜尋', icon: '🔍', color: 'from-orange-500 to-amber-500' },
    { id: 'dijkstra', title: '最短路徑 Dijkstra', desc: '找最短成本路徑', icon: '🛤️', color: 'from-red-500 to-rose-500' },
    { id: 'topo-sort', title: '拓樸排序', desc: '處理有先後依賴的任務排序', icon: '📐', color: 'from-indigo-500 to-violet-500' },
];

interface HeroProps {
    onNavigate: (id: string) => void;
}

const Hero: React.FC<HeroProps> = ({ onNavigate }) => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-6 py-20">
            {/* Hero Title */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center max-w-3xl"
            >
                <h1 className="text-5xl md:text-6xl font-extrabold mb-4">
                    <span className="bg-gradient-to-r from-algo-accent via-algo-processing to-algo-pivot bg-clip-text text-transparent">
                        演算法視覺化平台
                    </span>
                </h1>
                <p className="text-xl md:text-2xl text-algo-muted mb-4">
                    用互動動畫理解排序、圖論、動態規劃與搜尋
                </p>
                <p className="text-sm text-algo-muted/70 mb-8 max-w-xl mx-auto leading-relaxed">
                    演算法不是背公式，而是理解問題拆解、狀態轉移與流程設計。
                    <br />透過視覺化與逐步操作，讓你真正看懂每一步。
                </p>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onNavigate('bigo')}
                    className="px-8 py-3 bg-gradient-to-r from-algo-processing to-algo-accent text-white rounded-xl font-semibold text-lg shadow-lg shadow-algo-processing/30 hover:shadow-xl transition-shadow"
                >
                    開始探索 →
                </motion.button>
            </motion.div>

            {/* Topic Cards */}
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-16 max-w-5xl w-full"
            >
                {topicCards.map((card, i) => (
                    <motion.button
                        key={card.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 + i * 0.1 }}
                        whileHover={{ y: -4, scale: 1.02 }}
                        onClick={() => onNavigate(card.id)}
                        className="bg-algo-surface border border-algo-border rounded-2xl p-6 text-left hover:border-algo-processing/50 transition-all group"
                    >
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center text-2xl mb-4 shadow-lg`}>
                            {card.icon}
                        </div>
                        <h3 className="font-bold text-algo-text mb-1 group-hover:text-algo-accent transition-colors">{card.title}</h3>
                        <p className="text-sm text-algo-muted">{card.desc}</p>
                    </motion.button>
                ))}
            </motion.div>
        </div>
    );
};

export default Hero;
