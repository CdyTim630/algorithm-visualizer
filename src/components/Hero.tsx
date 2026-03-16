import React from 'react';
import { motion } from 'framer-motion';

const topicCards = [
    { id: 'sorting', title: '排序 Sorting', desc: '把混亂資料排成順序', icon: '⚗️', runeSymbol: '↕', color: 'from-[#5b8def] to-[#22d3ee]' },
    { id: 'dp', title: '動態規劃 DP', desc: '把重複子問題存起來', icon: '🔮', runeSymbol: '◈', color: 'from-[#a78bfa] to-[#c084fc]' },
    { id: 'graph', title: '圖論 Graph', desc: '理解關係、路徑與連通性', icon: '🕸️', runeSymbol: '⬡', color: 'from-[#34d399] to-[#22d3ee]' },
    { id: 'binary-search', title: '二分搜尋', desc: '每次砍半的高效搜尋', icon: '🔍', runeSymbol: '◎', color: 'from-[#d4a853] to-[#f59e0b]' },
    { id: 'dijkstra', title: '最短路徑 Dijkstra', desc: '找最短成本路徑', icon: '🛤️', runeSymbol: '⟡', color: 'from-[#f472b6] to-[#a78bfa]' },
    { id: 'topo-sort', title: '拓樸排序', desc: '處理有先後依賴的任務排序', icon: '📐', runeSymbol: '▽', color: 'from-[#818cf8] to-[#6366f1]' },
];

// Floating rune particles
const RuneParticles = () => {
    const runes = ['◇', '△', '☆', '◎', '⬡', '◈', '⟡', '▽'];
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {runes.map((rune, i) => (
                <motion.span
                    key={i}
                    className="absolute text-algo-pivot/20 text-lg select-none"
                    style={{
                        left: `${10 + (i * 12) % 80}%`,
                        top: `${15 + (i * 17) % 70}%`,
                    }}
                    animate={{
                        y: [0, -20, 0],
                        opacity: [0.15, 0.4, 0.15],
                        rotate: [0, 180, 360],
                    }}
                    transition={{
                        duration: 5 + i * 0.7,
                        repeat: Infinity,
                        delay: i * 0.5,
                        ease: "easeInOut",
                    }}
                >
                    {rune}
                </motion.span>
            ))}
        </div>
    );
};

interface HeroProps {
    onNavigate: (id: string) => void;
}

const Hero: React.FC<HeroProps> = ({ onNavigate }) => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 relative">
            <RuneParticles />

            {/* Main Hero — IlluMinate Key Visual */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="text-center max-w-4xl relative z-10"
            >
                {/* Camp Badge */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-algo-gold/30 bg-algo-gold/5 text-algo-gold text-xs font-medium tracking-wider mb-6"
                >
                    <span className="w-1.5 h-1.5 rounded-full bg-algo-gold animate-pulse" />
                    2026 臺大資管營 · 微課程
                </motion.div>

                {/* Key Visual Image */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1.2, delay: 0.3 }}
                    className="relative mb-8"
                >
                    <div className="relative mx-auto max-w-2xl rounded-2xl overflow-hidden shadow-lantern">
                        <img
                            src={`${import.meta.env.BASE_URL}illuminate-hero.jpg`}
                            alt="IlluMinate 2026 臺大資管營主視覺"
                            className="w-full h-auto object-cover animate-lantern-flicker"
                        />
                        {/* Overlay gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-algo-bg via-transparent to-transparent opacity-80" />
                        <div className="absolute inset-0 bg-gradient-to-b from-algo-bg/30 via-transparent to-transparent" />
                    </div>
                </motion.div>

                {/* Title */}
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className="text-4xl md:text-5xl lg:text-6xl font-bold mb-3 font-cinzel"
                >
                    <span className="text-shimmer">
                        IlluMinate
                    </span>
                </motion.h1>

                <motion.h2
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.8 }}
                    className="text-xl md:text-2xl font-semibold mb-3"
                >
                    <span className="bg-gradient-to-r from-algo-pivot via-algo-accent to-algo-gold bg-clip-text text-transparent">
                        演算法視覺化互動教學
                    </span>
                </motion.h2>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 1 }}
                    className="text-base md:text-lg text-algo-muted mb-3 max-w-xl mx-auto"
                >
                    用互動動畫理解排序、圖論、動態規劃與搜尋
                </motion.p>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 1.1 }}
                    className="text-sm text-algo-muted/60 mb-8 max-w-lg mx-auto leading-relaxed"
                >
                    演算法不是背公式，而是理解問題拆解、狀態轉移與流程設計。
                    <br />透過視覺化與逐步操作，讓你真正看懂每一步。
                </motion.p>

                <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 1.3 }}
                    whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(212, 168, 83, 0.3)' }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onNavigate('bigo')}
                    className="px-8 py-3 bg-gradient-to-r from-algo-gold via-algo-warm to-algo-gold text-algo-bg rounded-xl font-bold text-lg shadow-lantern hover:shadow-xl transition-all tracking-wide"
                >
                    ✦ 開始探索
                </motion.button>
            </motion.div>

            {/* Topic Cards - Runic Stone Style */}
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.5 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-16 max-w-5xl w-full relative z-10"
            >
                {topicCards.map((card, i) => (
                    <motion.button
                        key={card.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.7 + i * 0.1 }}
                        whileHover={{ y: -6, scale: 1.02 }}
                        onClick={() => onNavigate(card.id)}
                        className="glass-card glow-hover rounded-2xl p-6 text-left transition-all group relative overflow-hidden"
                    >
                        {/* Rune symbol watermark */}
                        <span className="absolute top-3 right-4 text-4xl font-cinzel text-algo-pivot/10 select-none group-hover:text-algo-pivot/20 transition-colors">
                            {card.runeSymbol}
                        </span>

                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center text-2xl mb-4 shadow-lg group-hover:shadow-rune transition-shadow`}>
                            {card.icon}
                        </div>
                        <h3 className="font-bold text-algo-text mb-1 group-hover:text-algo-gold transition-colors">{card.title}</h3>
                        <p className="text-sm text-algo-muted">{card.desc}</p>
                    </motion.button>
                ))}
            </motion.div>
        </div>
    );
};

export default Hero;
