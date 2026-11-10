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
        navy: {
          950: '#070C18',
          900: '#0B132B',
          850: '#0F172A',
          800: '#15213D',
          700: '#1E293B',
          600: '#334155',
        },
        slate: {
          850: '#172033',
        },
        brand: {
          blue: '#1E40AF',
          royal: '#2563EB',
          accent: '#38BDF8',
          subtle: '#0284C7',
        },
        silver: {
          100: '#F8FAFC',
          200: '#F1F5F9',
          300: '#E2E8F0',
          400: '#94A3B8',
          500: '#64748B',
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'SF Mono', 'ui-monospace', 'Menlo', 'Consolas', 'monospace'],
      },
      backdropBlur: {
        xs: '2px',
        glass: '16px',
        pebble: '24px',
      },
      boxShadow: {
        'glass-subtle': '0 8px 30px rgba(0, 0, 0, 0.28)',
        'glass-card': '0 12px 32px -4px rgba(0, 0, 0, 0.36), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
        'pebble-floating': '0 16px 36px -8px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.12)',
        'pebble-pill': '0 4px 14px rgba(0, 0, 0, 0.2)',
      },
    },
  },
  plugins: [],
}
