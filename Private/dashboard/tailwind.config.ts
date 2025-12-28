import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Surface hierarchy - warm cream palette inspired by Harvey/Flow
        surface: {
          base: '#F5F3EF',      // Main background - warm cream
          raised: '#FFFFFF',    // Cards, panels
          sunken: '#EDEAE4',    // Inset areas, inputs
          hover: '#E8E5DF',     // Hover states
          overlay: 'rgba(0, 0, 0, 0.4)',
        },
        // Ink hierarchy - warm grays
        ink: {
          primary: '#1C1917',   // Headings, primary text
          secondary: '#44403C', // Body text
          muted: '#78716C',     // Secondary info
          faint: '#A8A29E',     // Disabled, hints
        },
        // Stroke colors
        stroke: {
          subtle: '#E7E5E4',
          hover: '#D6D3D1',
          active: '#A8A29E',
        },
        // Accent - warm amber/orange
        accent: {
          primary: '#EA580C',   // Primary actions
          hover: '#DC4D0A',
          muted: '#FED7AA',
          subtle: 'rgba(234, 88, 12, 0.08)',
        },
        // Category colors
        category: {
          foundational: '#2563EB',  // Blue
          architectural: '#7C3AED', // Purple
          operational: '#059669',   // Emerald
          methodology: '#D97706',   // Amber
        },
        // Status colors
        status: {
          success: '#22C55E',
          warning: '#F59E0B',
          error: '#EF4444',
          info: '#3B82F6',
        },
      },
      fontFamily: {
        sans: ['IBM Plex Sans', 'system-ui', 'sans-serif'],
        serif: ['Instrument Serif', 'Georgia', 'serif'],
        mono: ['IBM Plex Mono', 'Menlo', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
      },
      boxShadow: {
        'soft': '0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06)',
        'medium': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
        'panel': '0 0 0 1px rgba(0, 0, 0, 0.03), 0 1px 3px rgba(0, 0, 0, 0.05)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
    },
  },
  plugins: [],
}

export default config
