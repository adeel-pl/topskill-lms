/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  important: true,
  theme: {
    extend: {
      colors: {
        // Primary Brand Colors (EXACT from PureLogics website)
        primary: {
          DEFAULT: '#00d084',      // PureLogics green - hero bg, primary buttons
          hover: '#00b875',        // Darker green on hover
          light: '#34d399',        // Lighter green - accent
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#00d084',
          600: '#00b875',
          700: '#059669',
        },
        // Secondary/Accent Colors (EXACT from PureLogics website)
        secondary: {
          DEFAULT: '#3B82F6',      // Blue accent - secondary CTAs
          hover: '#2563eb',
          light: '#60a5fa',
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
          secondary: '#6B7280',    // Muted gray - secondary text
          muted: '#6B7280',        // Muted gray - descriptions
          light: '#9CA3AF',        // Light gray - captions
          white: '#FFFFFF',        // White text
        },
        // Border Colors (EXACT from PureLogics website)
        border: {
          DEFAULT: '#E5E7EB',       // Light border
          muted: '#F3F4F6',        // Very light border
          accent: '#00d084',       // Accent border (PureLogics green)
        },
        // Legacy support (EXACT from PureLogics website)
        'topskill-primary': '#00d084',      // PureLogics green
        'topskill-secondary': '#3B82F6',    // Blue accent
        'topskill-accent': '#10B981',       // Emerald green
        'topskill-highlight': '#00d084',    // PureLogics green
        'topskill-dark': '#1F2937',         // Dark gray
        'topskill-light': '#6B7280',        // Muted gray
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
