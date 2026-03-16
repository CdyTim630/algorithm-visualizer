/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // IlluMinate mystical palette
                'algo-bg': '#0d0f1a',          // Deep midnight navy
                'algo-surface': '#181c30',      // Dark indigo surface
                'algo-card': '#252a4a',         // Elevated card (brighter)
                'algo-border': '#4a4f7a',       // Visible indigo border (brightened)
                'algo-text': '#e8e6f0',         // Soft cream white
                'algo-muted': '#8b8aaa',        // Muted lavender
                'algo-processing': '#5b8def',   // Arcane blue
                'algo-done': '#4ade80',         // Rune green
                'algo-comparing': '#f59e0b',    // Lantern amber
                'algo-error': '#ef4444',        // Crimson
                'algo-pivot': '#a78bfa',        // Mystic purple
                'algo-accent': '#22d3ee',       // Cyan glow
                'algo-gold': '#d4a853',         // Lantern gold
                'algo-warm': '#e8b04a',         // Warm amber glow
            },
            fontFamily: {
                'display': ['Inter', 'Noto Sans TC', 'sans-serif'],
                'cinzel': ['Cinzel Decorative', 'Cinzel', 'serif'],
                'mono': ['JetBrains Mono', 'Fira Code', 'monospace'],
            },
            backgroundImage: {
                'illuminate-gradient': 'linear-gradient(135deg, #0d0f1a 0%, #1a1640 30%, #0d0f1a 60%, #151230 100%)',
                'card-glow': 'linear-gradient(135deg, rgba(167, 139, 250, 0.08), rgba(34, 211, 238, 0.05))',
                'gold-glow': 'radial-gradient(ellipse at center, rgba(212, 168, 83, 0.15) 0%, transparent 70%)',
            },
            boxShadow: {
                'lantern': '0 0 60px rgba(212, 168, 83, 0.15), 0 0 120px rgba(212, 168, 83, 0.05)',
                'rune': '0 0 20px rgba(167, 139, 250, 0.2)',
                'glow-cyan': '0 0 20px rgba(34, 211, 238, 0.2)',
            },
            animation: {
                'float': 'float 6s ease-in-out infinite',
                'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
                'shimmer': 'shimmer 3s linear infinite',
                'lantern-flicker': 'lanternFlicker 4s ease-in-out infinite',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
                pulseGlow: {
                    '0%, 100%': { opacity: '0.4' },
                    '50%': { opacity: '1' },
                },
                shimmer: {
                    '0%': { backgroundPosition: '-200% 0' },
                    '100%': { backgroundPosition: '200% 0' },
                },
                lanternFlicker: {
                    '0%, 100%': { opacity: '0.8', filter: 'brightness(1)' },
                    '25%': { opacity: '1', filter: 'brightness(1.1)' },
                    '50%': { opacity: '0.9', filter: 'brightness(1.05)' },
                    '75%': { opacity: '1', filter: 'brightness(0.95)' },
                },
            },
        },
    },
    plugins: [],
}
