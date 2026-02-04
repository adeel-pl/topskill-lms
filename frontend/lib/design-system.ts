/**
 * Design System Tokens
 * Reusable design tokens matching the reference style
 * Based on: https://topskillspk.lovable.app/
 */

export const designTokens = {
  // Color System
  colors: {
    // Primary Brand Colors (EXACT from reference site)
    primary: {
      DEFAULT: '#048181',      // Deep teal - hero bg, primary buttons
      hover: '#036969',        // Darker teal on hover
      light: '#5a9c7d',        // Sage green - accent
      '50': '#f0fdfa',
      '100': '#ccfbf1',
      '500': '#048181',
      '600': '#036969',
      '700': '#024d4d',
    },
    
    // Secondary/Accent Colors (EXACT from reference site)
    secondary: {
      DEFAULT: '#f45c2c',      // Reddish-orange - logo accent, secondary CTAs
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
    
    // Border Colors (EXACT from reference site)
    border: {
      DEFAULT: '#E5E7EB',       // Light border
      muted: '#F3F4F6',        // Very light border
      accent: '#048181',       // Accent border (deep teal from reference)
    },
    
    // Status Colors
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  },
  
  // Typography System
  typography: {
    fontFamily: {
      sans: ['CameraPlainVariable', '"CameraPlainVariable Fallback"', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      heading: ['CameraPlainVariable', '"CameraPlainVariable Fallback"', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
    },
    fontSize: {
      // Display/Hero
      display: ['4.5rem', { lineHeight: '1.1', fontWeight: '800' }],      // 72px
      'display-sm': ['3.5rem', { lineHeight: '1.1', fontWeight: '800' }], // 56px
      
      // Headings
      h1: ['3rem', { lineHeight: '1.2', fontWeight: '700' }],            // 48px
      h2: ['2.25rem', { lineHeight: '1.3', fontWeight: '700' }],          // 36px
      h3: ['1.875rem', { lineHeight: '1.4', fontWeight: '600' }],         // 30px
      h4: ['1.5rem', { lineHeight: '1.4', fontWeight: '600' }],          // 24px
      h5: ['1.25rem', { lineHeight: '1.5', fontWeight: '600' }],          // 20px
      h6: ['1.125rem', { lineHeight: '1.5', fontWeight: '600' }],        // 18px
      
      // Body
      'body-lg': ['1.125rem', { lineHeight: '1.6', fontWeight: '400' }],  // 18px
      'body': ['1rem', { lineHeight: '1.6', fontWeight: '400' }],         // 16px
      'body-sm': ['0.875rem', { lineHeight: '1.5', fontWeight: '400' }],  // 14px
      
      // Small/Caption
      'sm': ['0.875rem', { lineHeight: '1.5', fontWeight: '400' }],        // 14px
      'xs': ['0.75rem', { lineHeight: '1.4', fontWeight: '400' }],        // 12px
    },
    fontWeight: {
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
    },
  },
  
  // Spacing System
  spacing: {
    // Section Padding
    section: {
      py: '4.5rem',            // 72px vertical padding (slightly reduced for better balance)
      pySm: '3rem',            // 48px for smaller sections
      pyLg: '5.5rem',          // 88px for large sections
    },
    
    // Container
    container: {
      maxWidth: '1400px',
      maxWidthXl: '1600px',
      maxWidth2xl: '1800px',
      padding: '1rem',         // 16px base padding
      paddingSm: '1.5rem',     // 24px
      paddingMd: '2rem',       // 32px
      paddingLg: '3rem',       // 48px
    },
    
    // Card
    card: {
      padding: '1.25rem',      // 20px (slightly reduced for cleaner look)
      paddingSm: '1rem',       // 16px
      paddingLg: '1.75rem',    // 28px
      gap: '0.875rem',         // 14px gap between elements (tighter, cleaner)
    },
    
    // Grid
    grid: {
      gap: '1.75rem',          // 28px gap between cards (increased for better breathing room)
      gapSm: '1.25rem',        // 20px
      gapLg: '2.25rem',        // 36px
    },
  },
  
  // Border Radius System (softer, more rounded)
  borderRadius: {
    sm: '0.5rem',              // 8px
    md: '0.875rem',            // 14px (increased for softer feel)
    lg: '1rem',                // 16px
    xl: '1.125rem',            // 18px (increased for cards)
    '2xl': '1.5rem',           // 24px
    full: '9999px',
  },
  
  // Shadow System (softer, more subtle)
  shadow: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.04)',
    DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.08), 0 1px 2px -1px rgba(0, 0, 0, 0.08)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -2px rgba(0, 0, 0, 0.08)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.08)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.08)',
    card: '0 1px 3px 0 rgba(0, 0, 0, 0.06), 0 1px 2px -1px rgba(0, 0, 0, 0.06)',
    cardHover: '0 8px 12px -2px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.08)',
  },
  
  // Transition System
  transition: {
    DEFAULT: 'all 0.3s ease',
    fast: 'all 0.15s ease',
    slow: 'all 0.5s ease',
  },
} as const;

// Export for use in components
export default designTokens;

