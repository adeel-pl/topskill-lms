/**
 * Global Color Configuration
 * EXACT colors from reference site: https://topskillspk.lovable.app/
 * Extracted directly from the reference site design
 */

export const colors = {
  // Primary Brand Colors (EXACT from reference site)
  primary: '#048181',        // Deep teal - hero background, primary buttons
  primaryHover: '#036969',   // Darker teal on hover
  primaryLight: '#5a9c7d',   // Sage green - accent/highlights
  
  // Secondary/Accent Colors (EXACT from reference site)
  secondary: '#f45c2c',      // Reddish-orange - logo accent, secondary CTAs
  secondaryHover: '#d94a1f', // Darker orange on hover
  accentColor: '#5a9c7d',    // Sage green - "No.1" highlight, secondary buttons
  highlight: '#ecca72',      // Pale gold - checkmark circles, badges
  
  // Legacy support (for backward compatibility)
  accent: {
    primary: '#048181',      // Deep teal from reference
    secondary: '#f45c2c',    // Reddish-orange from reference
    accent: '#5a9c7d',       // Sage green from reference
    highlight: '#ecca72',    // Pale gold from reference
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
  
  // Text Colors
  text: {
    primary: '#1F2937',      // Dark gray - main text
    secondary: '#6B7280',    // Muted gray - secondary text
    dark: '#1F2937',         // Dark gray - headings
    darkGray: '#1F2937',     // Dark gray - same as dark
    muted: '#6B7280',        // Muted gray - descriptions
    light: '#9CA3AF',        // Light gray - captions
    white: '#FFFFFF',        // White text
  },
  
  // Border Colors (EXACT from reference site)
  border: {
    primary: '#E5E7EB',      // Light border
    muted: '#F3F4F6',        // Very light border
    accent: '#048181',       // Accent border (deep teal from reference)
    light: '#E5E7EB',        // Light border (same as primary)
    dark: '#334155',         // Dark border (if needed)
  },
  
  // Button Colors (EXACT from reference site)
  button: {
    primary: '#048181',      // Deep teal button (from reference)
    secondary: '#f45c2c',    // Reddish-orange button (from reference)
    accent: '#5a9c7d',       // Sage green button
    dark: '#1F2937',         // Dark button
  },
  
  // Status Colors
  status: {
    success: '#10B981',
    warning: '#F59E0B',       // Amber for stars/ratings
    error: '#EF4444',        // Red for errors
    info: '#3B82F6',
  },
  
  // Hover colors (EXACT from reference site)
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
