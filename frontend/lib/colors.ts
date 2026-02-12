/**
 * Global Color Configuration
 * EXACT colors from PureLogics website: https://purelogics.com/
 * Extracted directly from PureLogics brand design
 */

export const colors = {
  // Primary Brand Colors (EXACT from PureLogics website)
  primary: '#00d084',        // PureLogics green - primary buttons, hero background
  primaryHover: '#00b875',   // Darker green on hover
  primaryLight: '#34d399',   // Lighter green - accent/highlights
  
  // Secondary/Accent Colors (EXACT from PureLogics website)
  secondary: '#3B82F6',      // Blue accent - secondary CTAs
  secondaryHover: '#2563eb', // Darker blue on hover
  accentColor: '#10B981',    // Emerald green - highlights, secondary buttons
  highlight: '#00d084',      // PureLogics green - badges, icons
  
  // Legacy support (for backward compatibility)
  accent: {
    primary: '#00d084',      // PureLogics green
    secondary: '#3B82F6',    // Blue accent
    accent: '#10B981',       // Emerald green
    highlight: '#00d084',    // PureLogics green
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
  
  // Border Colors (EXACT from PureLogics website)
  border: {
    primary: '#E5E7EB',      // Light border
    muted: '#F3F4F6',        // Very light border
    accent: '#00d084',       // Accent border (PureLogics green)
    light: '#E5E7EB',        // Light border (same as primary)
    dark: '#334155',         // Dark border (if needed)
  },
  
  // Button Colors (EXACT from PureLogics website)
  button: {
    primary: '#00d084',      // PureLogics green button
    secondary: '#3B82F6',    // Blue button
    accent: '#10B981',       // Emerald green button
    dark: '#1F2937',         // Dark button
  },
  
  // Status Colors
  status: {
    success: '#10B981',
    warning: '#F59E0B',       // Amber for stars/ratings
    error: '#EF4444',        // Red for errors
    info: '#3B82F6',
  },
  
  // Hover colors (EXACT from PureLogics website)
  hover: {
    primary: '#00b875',       // Darker green on hover
    secondary: '#2563eb',     // Darker blue on hover
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
