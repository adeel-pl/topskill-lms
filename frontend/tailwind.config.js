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
        // Primary Brand Colors (from actual logo)
        primary: {
          DEFAULT: '#366854',      // Dark green - "TOP" text in logo
          hover: '#2a5242',        // Darker green on hover
          light: '#4a7a66',        // Lighter green variant
          50: '#f0f7f4',
          100: '#d4e8df',
          500: '#366854',
          600: '#2a5242',
          700: '#1e3d30',
        },
        // Secondary/Accent Colors (from actual logo)
        secondary: {
          DEFAULT: '#0F3A62',      // Dark blue - "SKILLS" text in logo
          hover: '#0c2d4a',
          light: '#1a5a8a',
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
        // Legacy support (updated to match actual logo)
        'topskill-primary': '#366854',      // Dark green from logo
        'topskill-secondary': '#0F3A62',    // Dark blue from logo
        'topskill-accent': '#4a7a66',       // Medium green
        'topskill-highlight': '#ecca72',    // Pale gold
        'topskill-dark': '#366854',         // Dark green
        'topskill-light': '#9fbeb2',        // Light green
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


