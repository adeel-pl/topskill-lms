/**
 * Global Color Configuration
 * EXACT colors from reference site: https://topskillspk.lovable.app/
 * Extracted from logo and reference design
 */

export const colors = {
  // Primary Brand Colors (from logo)
  primary: '#048181',        // Deep teal - primary brand color
  primaryHover: '#036969',   // Darker teal on hover
  primaryLight: '#5a9c7d',   // Lighter teal variant
  
  // Secondary/Accent Colors
  secondary: '#f45c2c',      // Reddish-orange - secondary CTA
  secondaryHover: '#d94a1f', // Darker orange on hover
  accentColor: '#5a9c7d',    // Sage green - secondary buttons
  highlight: '#ecca72',      // Pale gold - highlights
  
  // Legacy support (for backward compatibility)
  accent: {
    primary: '#048181',
    secondary: '#f45c2c',
    accent: '#5a9c7d',
    highlight: '#ecca72',
  },
  
  // Background Colors
  background: {
    primary: '#FFFFFF',      // Main white background
    secondary: '#FFFFFF',    // White (for cards)
    soft: '#F9FAFB',         // Soft section background
    muted: '#F3F4F6',        // Muted background
    card: '#FFFFFF',         // Card background
    dark: '#0F172A',         // Dark background (if needed)
  },
  
  // Text Colors (EXACT from reference)
  text: {
    primary: '#1F2937',       // Dark gray - main text (NOT #366854)
    secondary: '#4B5563',    // Medium gray - secondary text
    dark: '#1F2937',         // Dark gray - headings
    darkGray: '#1F2937',     // Dark gray - same as dark
    muted: '#6B7280',        // Muted gray - descriptions (NOT #64748B)
    light: '#9CA3AF',        // Light gray - captions
    white: '#FFFFFF',        // White text
  },
  
  // Border Colors (EXACT from reference)
  border: {
    primary: '#E5E7EB',      // Light border (NOT #CBD5E1)
    muted: '#F3F4F6',        // Very light border
    accent: '#048181',       // Accent border
    light: '#E5E7EB',        // Light border (same as primary)
    dark: '#334155',         // Dark border (if needed)
  },
  
  // Button Colors
  button: {
    primary: '#048181',      // Deep teal button
    secondary: '#f45c2c',    // Orange button
    accent: '#5a9c7d',       // Sage green button
    dark: '#1F2937',         // Dark button
  },
  
  // Status Colors (from reference)
  status: {
    success: '#10B981',
    warning: '#F59E0B',       // Amber for stars/ratings
    error: '#EF4444',        // Red for errors
    info: '#3B82F6',
  },
  
  // Hover colors
  hover: {
    primary: '#036969',       // Darker teal on hover
    secondary: '#d94a1f',     // Darker orange on hover
  },
} as const;

// Export individual colors for easy access
export const {
  background,
  text,
  accent,
  border,
  button,
} = colors;

