import type { Config } from 'tailwindcss'
import animate from 'tailwindcss-animate'

const config: Config = {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Neural Interface Palette
        void:     { DEFAULT: '#030712', 50: '#0a1628' },
        abyss:    { DEFAULT: '#050d1a', 100: '#071221', 200: '#0a1a30' },
        surface:  { DEFAULT: '#0c1f3f', 100: '#0f2550', 200: '#122d60' },
        panel:    { DEFAULT: '#111f3a', 100: '#162848', 200: '#1c3360' },
        border:   { DEFAULT: '#1e3a6a', muted: '#152d54', bright: '#2a4f90' },
        // Accent Spectrum
        cyan:     { DEFAULT: '#00d4ff', dim: '#00a8cc', glow: '#00d4ff40', bright: '#4de8ff' },
        violet:   { DEFAULT: '#7c3aed', dim: '#6d28d9', glow: '#7c3aed40', bright: '#a78bfa' },
        emerald:  { DEFAULT: '#10b981', dim: '#059669', glow: '#10b98140' },
        amber:    { DEFAULT: '#f59e0b', dim: '#d97706', glow: '#f59e0b40' },
        rose:     { DEFAULT: '#f43f5e', dim: '#e11d48', glow: '#f43f5e40' },
        // Text hierarchy
        text: {
          primary:  '#e2e8f0',
          secondary: '#94a3b8',
          muted:    '#475569',
          accent:   '#00d4ff',
        },
      },
      fontFamily: {
        mono:    ['IBM Plex Mono', 'Fira Code', 'monospace'],
        display: ['Syne', 'sans-serif'],
        body:    ['DM Sans', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['0.65rem', { lineHeight: '1rem' }],
      },
      boxShadow: {
        'cyan-glow':   '0 0 20px #00d4ff30, 0 0 60px #00d4ff10',
        'violet-glow': '0 0 20px #7c3aed30, 0 0 60px #7c3aed10',
        'panel':       '0 4px 24px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
        'inner-glow':  'inset 0 1px 0 rgba(0, 212, 255, 0.1)',
      },
      backgroundImage: {
        'grid-pattern':     'linear-gradient(rgba(0,212,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.03) 1px, transparent 1px)',
        'noise':            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E\")",
        'gradient-radial':  'radial-gradient(var(--tw-gradient-stops))',
        'neural-mesh':      'radial-gradient(ellipse at 20% 20%, #7c3aed15 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, #00d4ff10 0%, transparent 60%)',
      },
      backgroundSize: {
        'grid': '32px 32px',
      },
      animation: {
        'pulse-slow':     'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-pulse':     'glowPulse 3s ease-in-out infinite',
        'scan-line':      'scanLine 8s linear infinite',
        'float':          'float 6s ease-in-out infinite',
        'typing':         'typing 1.5s steps(3) infinite',
        'fade-in':        'fadeIn 0.3s ease-out',
        'slide-in-left':  'slideInLeft 0.3s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'slide-up':       'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px #00d4ff20' },
          '50%':      { boxShadow: '0 0 40px #00d4ff50, 0 0 80px #00d4ff20' },
        },
        scanLine: {
          '0%':   { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        slideInLeft: {
          from: { transform: 'translateX(-16px)', opacity: '0' },
          to:   { transform: 'translateX(0)', opacity: '1' },
        },
        slideInRight: {
          from: { transform: 'translateX(16px)', opacity: '0' },
          to:   { transform: 'translateX(0)', opacity: '1' },
        },
        slideUp: {
          from: { transform: 'translateY(20px)', opacity: '0' },
          to:   { transform: 'translateY(0)', opacity: '1' },
        },
        typing: {
          '0%, 100%': { content: '"▋"' },
          '50%':      { content: '""' },
        },
      },
      borderRadius: {
        'xl2': '1rem',
        'xl3': '1.5rem',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [animate],
}

export default config
