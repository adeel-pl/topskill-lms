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
        // Primary Brand Colors (EXACT from LOGO - "TOP" green)
        primary: {
          DEFAULT: '#366854',      // Dark green - from "TOP" in logo
          hover: '#2a5242',        // Darker green on hover
          light: '#4a7a66',        // Lighter green variant
          50: '#f0f7f4',
          100: '#d4e8de',
          500: '#366854',
          600: '#2a5242',
          700: '#1e3a2e',
        },
        // Secondary/Accent Colors (EXACT from LOGO - "SKILLS" blue)
        secondary: {
          DEFAULT: '#0F3A62',      // Dark blue - from "SKILLS" in logo
          hover: '#0c2d4a',
          light: '#1a4d7a',
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
          primary: '#366854',      // Dark green - main text (from logo)
          secondary: '#4B5563',    // Medium gray - secondary text
          muted: '#64748B',        // Muted gray - descriptions
          light: '#9CA3AF',        // Light gray - captions
          white: '#FFFFFF',        // White text
        },
        // Border Colors
        border: {
          DEFAULT: '#E5E7EB',       // Light border
          muted: '#F3F4F6',        // Very light border
          accent: '#366854',       // Accent border (dark green from logo)
        },
        // Legacy support (EXACT from LOGO)
        'topskill-primary': '#366854',      // Dark green from logo
        'topskill-secondary': '#0F3A62',    // Dark blue from logo
        'topskill-accent': '#366854',       // Sage green from reference
        'topskill-highlight': '#ecca72',    // Pale gold from reference
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


