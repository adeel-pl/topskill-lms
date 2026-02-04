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
        // Primary Brand Colors
        primary: {
          DEFAULT: '#048181',      // Deep teal - primary brand
          hover: '#036969',        // Darker teal on hover
          light: '#5a9c7d',        // Lighter teal variant
          50: '#f0fdfa',
          100: '#ccfbf1',
          500: '#048181',
          600: '#036969',
          700: '#024d4d',
        },
        // Secondary/Accent Colors
        secondary: {
          DEFAULT: '#f45c2c',      // Reddish-orange - secondary CTA
          hover: '#d94a1f',
          light: '#ff7a5c',
        },
        // Background Colors
        background: {
          main: '#FFFFFF',         // Main white background
          soft: '#F9FAFB',         // Soft section background
          card: '#FFFFFF',         // Card background
          muted: '#F3F4F6',        // Muted background
        },
        // Text Colors
        text: {
          primary: '#1F2937',      // Dark gray - main text
          secondary: '#4B5563',    // Medium gray - secondary text
          muted: '#6B7280',        // Muted gray - descriptions
          light: '#9CA3AF',        // Light gray - captions
          white: '#FFFFFF',        // White text
        },
        // Border Colors
        border: {
          DEFAULT: '#E5E7EB',       // Light border
          muted: '#F3F4F6',        // Very light border
          accent: '#048181',       // Accent border
        },
        // Legacy support
        'topskill-primary': '#048181',
        'topskill-secondary': '#f45c2c',
        'topskill-accent': '#5a9c7d',
        'topskill-highlight': '#ecca72',
        'topskill-dark': '#366854',
        'topskill-light': '#9fbeb2',
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


