import React from 'react';

const Footer: React.FC = () => (
    <footer className="border-t border-algo-border py-8 px-6 text-center">
        <p className="text-algo-muted text-sm italic mb-3 max-w-2xl mx-auto leading-relaxed">
            「演算法不是死背步驟，而是學會如何拆解問題、看見規律，並設計有效率的解法。」
        </p>
        <p className="text-algo-muted/60 text-xs">
            Designed & Built by <span className="text-algo-accent">陳鼎元 DingYuan Chen</span> · 演算法視覺化互動教學平台
        </p>
    </footer>
);

export default Footer;
