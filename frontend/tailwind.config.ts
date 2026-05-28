import type { Config } from 'tailwindcss'
import daisyui from 'daisyui'

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
    },
  },
  plugins: [daisyui],
  daisyui: {
    themes: [
      {
        rcr: {
          primary: '#1d4ed8',
          'primary-content': '#ffffff',
          secondary: '#7c3aed',
          'secondary-content': '#ffffff',
          accent: '#0ea5e9',
          'accent-content': '#ffffff',
          neutral: '#1e293b',
          'neutral-content': '#f1f5f9',
          'base-100': '#f8fafc',
          'base-200': '#f1f5f9',
          'base-300': '#e2e8f0',
          'base-content': '#0f172a',
          info: '#0ea5e9',
          success: '#16a34a',
          warning: '#d97706',
          error: '#dc2626',
        },
      },
      {
        'rcr-dark': {
          primary: '#3b82f6',
          'primary-content': '#ffffff',
          secondary: '#8b5cf6',
          'secondary-content': '#ffffff',
          accent: '#38bdf8',
          'accent-content': '#0f172a',
          neutral: '#334155',
          'neutral-content': '#f1f5f9',
          'base-100': '#0f172a',
          'base-200': '#1e293b',
          'base-300': '#334155',
          'base-content': '#f1f5f9',
          info: '#38bdf8',
          success: '#4ade80',
          warning: '#fbbf24',
          error: '#f87171',
        },
      },
    ],
    darkTheme: 'rcr-dark',
    base: true,
    styled: true,
    utils: true,
    logs: false,
  },
}

export default config
