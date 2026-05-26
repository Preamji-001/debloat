import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0D0D0D',
        surface: '#161616',
        surface2: '#1E1E1E',
        border: '#2A2A2A',
        'off-white': '#F0EFE8',
        muted: '#666666',
      },
      fontFamily: {
        logo: ['"Press Start 2P"', 'monospace'],
        mono: ['"Share Tech Mono"', 'monospace'],
        body: ['Inter', 'sans-serif'],
      },
      transitionDuration: { DEFAULT: '150ms' },
    },
  },
  plugins: [],
}

export default config
