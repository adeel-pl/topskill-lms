/**
 * Global Color Configuration
 * EXACT colors from LOGO: https://topskillspk.lovable.app/assets/topskills-logo-Dx7knxYN.png
 * Logo colors ONLY - no other color scheme
 */

export const colors = {
  // Logo Colors (EXACT from logo image)
  primary: '#366854',        // Dark green - from "TOP" in logo
  primaryHover: '#2a5242',   // Darker green on hover
  primaryLight: '#4a7a66',   // Lighter green variant
  
  secondary: '#0F3A62',      // Dark blue - from "SKILLS" in logo
  secondaryHover: '#0c2d4a', // Darker blue on hover
  secondaryLight: '#1a4d7a', // Lighter blue variant
  
  // Legacy support (for backward compatibility)
  accent: {
    primary: '#366854',      // Dark green from logo
    secondary: '#0F3A62',    // Dark blue from logo
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
    primary: '#366854',      // Dark green - main text (from logo)
    secondary: '#4B5563',    // Medium gray - secondary text
    dark: '#366854',         // Dark green - headings (from logo)
    darkGray: '#366854',     // Dark green - same as dark
    muted: '#64748B',        // Muted gray - descriptions
    light: '#9CA3AF',        // Light gray - captions
    white: '#FFFFFF',        // White text
  },
  
  // Border Colors
  border: {
    primary: '#E5E7EB',      // Light border
    muted: '#F3F4F6',        // Very light border
    accent: '#366854',       // Accent border (dark green from logo)
    light: '#E5E7EB',        // Light border (same as primary)
    dark: '#334155',         // Dark border (if needed)
  },
  
  // Button Colors (from logo)
  button: {
    primary: '#366854',      // Dark green button (from logo)
    secondary: '#0F3A62',    // Dark blue button (from logo)
    accent: '#366854',       // Dark green button
    dark: '#1F2937',         // Dark button
  },
  
  // Status Colors
  status: {
    success: '#10B981',
    warning: '#F59E0B',       // Amber for stars/ratings
    error: '#EF4444',        // Red for errors
    info: '#3B82F6',
  },
  
  // Hover colors (from logo)
  hover: {
    primary: '#2a5242',       // Darker green on hover
    secondary: '#0c2d4a',     // Darker blue on hover
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
