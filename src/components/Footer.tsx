import React from 'react';

const Footer: React.FC = () => (
    <footer className="border-t border-algo-border/30 py-6 px-6 text-center">
        <p className="text-algo-muted/80 text-sm italic mb-2 max-w-2xl mx-auto leading-relaxed">
            「演算法不是死背步驟，而是學會拆解問題、看見規律、設計有效率的解法。」
        </p>
        <p className="text-algo-muted/50 text-xs">
            <span className="font-cinzel text-algo-gold/70 mr-1">IlluMinate</span>
            · 2026 臺大資管營 · Designed by 陳鼎元 DingYuan Chen
        </p>
    </footer>
);

export default Footer;
