/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  important: true, // Force Tailwind to use !important
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563eb',
          dark: '#1e40af',
        },
        secondary: '#7c3aed',
        accent: '#06b6d4',
        // PureLogics brand colors
        'purelogics-dark': '#0A0E27',
        'purelogics-green': '#10B981',
        'purelogics-green-dark': '#059669',
        'purelogics-green-light': '#34D399',
        'bg-primary': '#0F172A',
        'bg-secondary': '#1E293B',
        'bg-tertiary': '#334155',
        'bg-card': '#1E293B',
        'border-primary': '#334155',
        'border-secondary': '#475569',
        'border-accent': '#10B981',
        'text-primary': '#F9FAFB',
        'text-secondary': '#E5E7EB',
        'text-tertiary': '#D1D5DB',
        'text-muted': '#9CA3AF',
      },
      maxWidth: {
        'container': '1400px',
        'container-xl': '1600px',
        'container-2xl': '1800px',
      },
      spacing: {
        '50': '50px',
      },
      fontFamily: {
        jakarta: ['var(--font-jakarta)', 'sans-serif'],
      },
    },
  },
  plugins: [],
};


