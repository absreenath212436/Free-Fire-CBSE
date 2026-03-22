/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Nunito', 'sans-serif'],
        mono: ['Orbitron', 'monospace'],
      },
      animation: {
        float: 'float 3s ease-in-out infinite',
        shake: 'shake 0.4s ease-in-out',
        bounce: 'bounce 0.6s ease',
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-up': 'slideUp 0.3s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%': { transform: 'translateX(-6px)' },
          '40%': { transform: 'translateX(6px)' },
          '60%': { transform: 'translateX(-4px)' },
          '80%': { transform: 'translateX(4px)' },
        },
        slideUp: {
          from: { transform: 'translateY(20px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        scaleIn: {
          from: { transform: 'scale(0.9)', opacity: '0' },
          to: { transform: 'scale(1)', opacity: '1' },
        },
      },
      colors: {
        game: {
          bg: '#060d14',
          card: '#0d1b2a',
          border: 'rgba(255,255,255,0.08)',
          text: {
            primary: '#ffffff',
            secondary: '#94a3b8',
            muted: '#475569',
          },
          correct: '#6BCB77',
          wrong: '#E74C3C',
          gold: '#FFD93D',
          purple: '#a78bfa',
        },
      },
    },
  },
  plugins: [],
}
