/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'algo-bg': '#0f172a',
                'algo-surface': '#1e293b',
                'algo-card': '#334155',
                'algo-border': '#475569',
                'algo-text': '#f1f5f9',
                'algo-muted': '#94a3b8',
                'algo-processing': '#3b82f6',
                'algo-done': '#22c55e',
                'algo-comparing': '#f97316',
                'algo-error': '#ef4444',
                'algo-pivot': '#a855f7',
                'algo-accent': '#06b6d4',
            },
            fontFamily: {
                'display': ['Inter', 'Noto Sans TC', 'sans-serif'],
                'mono': ['JetBrains Mono', 'Fira Code', 'monospace'],
            },
        },
    },
    plugins: [],
}
