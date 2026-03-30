import type { Config } from 'tailwindcss'
import animate from 'tailwindcss-animate'

const config: Config = {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Earthy & Calm Palette
        void:     { DEFAULT: '#1a1a18', 50: '#242422' },
        abyss:    { DEFAULT: '#1e1e1c', 100: '#232321', 200: '#2a2a27' },
        surface:  { DEFAULT: '#2d2d2a', 100: '#353532', 200: '#3d3d39' },
        panel:    { DEFAULT: '#323230', 100: '#3a3a37', 200: '#42423e' },
        border:   { DEFAULT: '#4a4a45', muted: '#3d3d39', bright: '#5c5c55' },
        // Accent Spectrum - Natural tones
        cyan:     { DEFAULT: '#2d6a4f', dim: '#1b4332', glow: '#2d6a4f40', bright: '#40916c' },
        violet:   { DEFAULT: '#6b705c', dim: '#5c614f', glow: '#6b705c40', bright: '#a3b18a' },
        emerald:  { DEFAULT: '#588157', dim: '#3a5a40', glow: '#58815740' },
        amber:    { DEFAULT: '#bc6c25', dim: '#9a5a1f', glow: '#bc6c2540' },
        rose:     { DEFAULT: '#9c6644', dim: '#7f5539', glow: '#9c664440' },
        // Text hierarchy
        text: {
          primary:  '#e9e5e0',
          secondary: '#b5b0a8',
          muted:    '#7a756d',
          accent:   '#40916c',
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
        'cyan-glow':   '0 0 20px #2d6a4f20, 0 0 40px #2d6a4f10',
        'violet-glow': '0 0 20px #6b705c20, 0 0 40px #6b705c10',
        'panel':       '0 4px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.03)',
        'inner-glow':  'inset 0 1px 0 rgba(64, 145, 108, 0.1)',
      },
      backgroundImage: {
        'grid-pattern':     'linear-gradient(rgba(64,145,108,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(64,145,108,0.02) 1px, transparent 1px)',
        'noise':            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E\")",
        'gradient-radial':  'radial-gradient(var(--tw-gradient-stops))',
        'neural-mesh':      'radial-gradient(ellipse at 20% 20%, #6b705c10 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, #2d6a4f08 0%, transparent 60%)',
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
          '0%, 100%': { boxShadow: '0 0 15px #2d6a4f15' },
          '50%':      { boxShadow: '0 0 25px #2d6a4f30, 0 0 50px #2d6a4f15' },
        },
        scanLine: {
          '0%':   { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-6px)' },
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
