import React from 'react';

const Footer: React.FC = () => (
    <footer className="border-t border-algo-border/40 py-8 px-6 text-center relative">
        {/* Decorative top line */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-px bg-gradient-to-r from-transparent via-algo-gold/40 to-transparent" />

        <p className="text-algo-muted text-sm italic mb-3 max-w-2xl mx-auto leading-relaxed">
            「演算法不是死背步驟，而是學會如何拆解問題、看見規律，並設計有效率的解法。」
        </p>

        <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-algo-gold/30 text-xs">✦</span>
            <span className="text-algo-gold/30 text-xs">·</span>
            <span className="font-cinzel text-sm text-algo-gold/60 tracking-wider">IlluMinate</span>
            <span className="text-algo-gold/30 text-xs">·</span>
            <span className="text-algo-gold/30 text-xs">✦</span>
        </div>

        <p className="text-algo-muted/50 text-xs">
            <span className="text-algo-gold/60">2026 臺大資管營</span> · 演算法視覺化互動教學平台
        </p>
        <p className="text-algo-muted/30 text-[10px] mt-1">
            Designed & Built by <span className="text-algo-pivot/60">陳鼎元 DingYuan Chen</span>
        </p>
    </footer>
);

export default Footer;
