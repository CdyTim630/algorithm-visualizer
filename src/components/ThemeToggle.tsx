import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

interface ThemeToggleProps {
    /** compact = icon-only square, default = pill with day/night animation */
    variant?: 'pill' | 'compact';
    className?: string;
}

/**
 * IlluMinate-themed day/night toggle.
 * A glowing orb slides between sun (day) and moon (night) with constellation hints.
 */
const ThemeToggle: React.FC<ThemeToggleProps> = ({ variant = 'pill', className = '' }) => {
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === 'dark';

    if (variant === 'compact') {
        return (
            <button
                onClick={toggleTheme}
                aria-label={isDark ? '切換為淺色模式' : '切換為深色模式'}
                title={isDark ? '切換為淺色模式' : '切換為深色模式'}
                className={`w-9 h-9 rounded-md border border-algo-border/40 bg-algo-card/40 hover:bg-algo-card hover:border-algo-gold/40 flex items-center justify-center text-algo-text transition-colors ${className}`}
            >
                {isDark ? <MoonIcon /> : <SunIcon />}
            </button>
        );
    }

    return (
        <button
            onClick={toggleTheme}
            aria-label={isDark ? '切換為淺色模式' : '切換為深色模式'}
            title={isDark ? '日出' : '入夜'}
            className={`relative w-[68px] h-8 rounded-full overflow-hidden border transition-colors duration-500
                ${isDark
                    ? 'bg-gradient-to-r from-[#0a0d1a] via-[#1a1640] to-[#1d1850] border-algo-gold/30'
                    : 'bg-gradient-to-r from-[#fde9b0] via-[#f4d791] to-[#e6b964] border-algo-gold/40'
                } ${className}`}
        >
            {/* Stars (visible only in dark mode) */}
            <div className={`absolute inset-0 transition-opacity duration-500 ${isDark ? 'opacity-100' : 'opacity-0'}`}>
                <span className="absolute top-1.5 left-2 w-px h-px rounded-full bg-white shadow-[0_0_2px_white]" />
                <span className="absolute top-3 left-4 w-0.5 h-0.5 rounded-full bg-white/80 shadow-[0_0_3px_white]" />
                <span className="absolute top-5 left-6 w-px h-px rounded-full bg-white/60" />
                <span className="absolute top-1 left-9 w-px h-px rounded-full bg-white/70" />
            </div>

            {/* Sun rays (visible only in light mode) */}
            <div className={`absolute inset-0 transition-opacity duration-500 ${isDark ? 'opacity-0' : 'opacity-100'}`}>
                <span className="absolute top-1/2 right-2 -translate-y-1/2 w-1 h-1 rounded-full bg-white/50" />
                <span className="absolute top-1.5 right-3 w-px h-1.5 bg-white/40" />
                <span className="absolute bottom-1.5 right-3 w-px h-1.5 bg-white/40" />
                <span className="absolute top-1/2 right-1 -translate-y-1/2 w-1.5 h-px bg-white/40" />
            </div>

            {/* Sliding orb */}
            <motion.div
                className="absolute top-0.5 w-7 h-7 rounded-full shadow-lg flex items-center justify-center"
                animate={{
                    x: isDark ? 36 : 2,
                    background: isDark
                        ? 'radial-gradient(circle at 35% 35%, #f5e6c8 0%, #d4a853 50%, #8a6520 100%)'
                        : 'radial-gradient(circle at 35% 35%, #fff7d6 0%, #ffd166 45%, #e89a1a 100%)',
                    boxShadow: isDark
                        ? '0 0 10px rgba(212,168,83,0.55), inset -2px -2px 4px rgba(0,0,0,0.4)'
                        : '0 0 12px rgba(255,180,40,0.6), inset -1px -1px 3px rgba(180,100,0,0.2)',
                }}
                transition={{ type: 'spring', stiffness: 320, damping: 24 }}
            >
                {/* Crescent moon shadow overlay when dark */}
                <motion.div
                    className="absolute inset-0 rounded-full"
                    animate={{
                        boxShadow: isDark
                            ? 'inset 6px -2px 0 0 rgba(13,15,26,0.55)'
                            : 'inset 0 0 0 0 rgba(0,0,0,0)',
                    }}
                    transition={{ duration: 0.4 }}
                />
                {/* Rune mark on the orb */}
                <span
                    className={`relative z-10 font-cinzel text-[10px] font-bold transition-opacity duration-300 ${
                        isDark ? 'text-algo-bg/70' : 'text-amber-900/60'
                    }`}
                >
                    {isDark ? '☾' : '☀'}
                </span>
            </motion.div>
        </button>
    );
};

const SunIcon: React.FC = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
);

const MoonIcon: React.FC = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
);

export default ThemeToggle;
