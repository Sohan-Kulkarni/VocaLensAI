/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: '#070812',
        panel: '#0d1020',
        line: 'rgba(255,255,255,0.10)',
        brand: {
          cyan: '#22d3ee',
          mint: '#34d399',
          amber: '#fbbf24',
          coral: '#fb7185',
          violet: '#a78bfa',
        },
      },
      boxShadow: {
        glow: '0 0 45px rgba(34, 211, 238, 0.18)',
      },
      backgroundImage: {
        'signal-grid':
          'linear-gradient(rgba(255,255,255,0.055) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.055) 1px, transparent 1px)',
      },
    },
  },
  plugins: [],
};
