/**
 * Global Color Configuration
 * EXACT colors from actual logo: https://topskillspk.lovable.app/assets/topskills-logo-Dx7knxYN.png
 * Logo colors extracted from the actual logo image:
 * - "TOP" text: #366854 (dark green)
 * - "SKILLS" text: #0F3A62 (dark blue)
 */

export const colors = {
  // Primary Brand Colors (from actual logo)
  primary: '#366854',        // Dark green - "TOP" text in logo
  primaryHover: '#2a5242',   // Darker green on hover
  primaryLight: '#4a7a66',    // Lighter green variant
  
  // Secondary/Accent Colors (from actual logo)
  secondary: '#0F3A62',      // Dark blue - "SKILLS" text in logo
  secondaryHover: '#0c2d4a', // Darker blue on hover
  accentColor: '#4a7a66',    // Medium green - secondary buttons
  highlight: '#ecca72',      // Pale gold - highlights (kept for UI elements)
  
  // Legacy support (for backward compatibility)
  accent: {
    primary: '#366854',      // Dark green from logo
    secondary: '#0F3A62',    // Dark blue from logo
    accent: '#4a7a66',       // Medium green
    highlight: '#ecca72',    // Pale gold
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
  
  // Border Colors
  border: {
    primary: '#E5E7EB',      // Light border
    muted: '#F3F4F6',        // Very light border
    accent: '#366854',       // Accent border (dark green from logo)
    light: '#E5E7EB',        // Light border (same as primary)
    dark: '#334155',         // Dark border (if needed)
  },
  
  // Button Colors (from actual logo)
  button: {
    primary: '#366854',      // Dark green button (from "TOP" in logo)
    secondary: '#0F3A62',    // Dark blue button (from "SKILLS" in logo)
    accent: '#4a7a66',       // Medium green button
    dark: '#1F2937',         // Dark button
  },
  
  // Status Colors (from reference)
  status: {
    success: '#10B981',
    warning: '#F59E0B',       // Amber for stars/ratings
    error: '#EF4444',        // Red for errors
    info: '#3B82F6',
  },
  
  // Hover colors (from actual logo)
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

