/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                // Theme-aware via CSS variables (see index.css :root / .light)
                'algo-bg':         'rgb(var(--algo-bg) / <alpha-value>)',
                'algo-surface':    'rgb(var(--algo-surface) / <alpha-value>)',
                'algo-card':       'rgb(var(--algo-card) / <alpha-value>)',
                'algo-border':     'rgb(var(--algo-border) / <alpha-value>)',
                'algo-text':       'rgb(var(--algo-text) / <alpha-value>)',
                'algo-muted':      'rgb(var(--algo-muted) / <alpha-value>)',
                'algo-processing': 'rgb(var(--algo-processing) / <alpha-value>)',
                'algo-done':       'rgb(var(--algo-done) / <alpha-value>)',
                'algo-comparing':  'rgb(var(--algo-comparing) / <alpha-value>)',
                'algo-error':      'rgb(var(--algo-error) / <alpha-value>)',
                'algo-pivot':      'rgb(var(--algo-pivot) / <alpha-value>)',
                'algo-accent':     'rgb(var(--algo-accent) / <alpha-value>)',
                'algo-gold':       'rgb(var(--algo-gold) / <alpha-value>)',
                'algo-warm':       'rgb(var(--algo-warm) / <alpha-value>)',
            },
            fontFamily: {
                'display': ['Inter', 'Noto Sans TC', 'sans-serif'],
                'cinzel': ['Cinzel Decorative', 'Cinzel', 'serif'],
                'mono': ['JetBrains Mono', 'Fira Code', 'monospace'],
            },
            backgroundImage: {
                'illuminate-gradient': 'linear-gradient(135deg, rgb(var(--algo-bg)) 0%, rgb(var(--algo-surface)) 50%, rgb(var(--algo-bg)) 100%)',
                'card-glow': 'linear-gradient(135deg, rgb(var(--algo-pivot) / 0.08), rgb(var(--algo-accent) / 0.05))',
                'gold-glow': 'radial-gradient(ellipse at center, rgb(var(--algo-gold) / 0.15) 0%, transparent 70%)',
            },
            boxShadow: {
                'lantern': '0 0 60px rgb(var(--algo-gold) / 0.15), 0 0 120px rgb(var(--algo-gold) / 0.05)',
                'rune': '0 0 20px rgb(var(--algo-pivot) / 0.2)',
                'glow-cyan': '0 0 20px rgb(var(--algo-accent) / 0.2)',
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
