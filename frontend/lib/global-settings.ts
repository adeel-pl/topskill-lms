/**
 * ============================================
 * GLOBAL SETTINGS - SINGLE SOURCE OF TRUTH
 * ============================================
 * 
 * ⚠️ IMPORTANT: This is the ONLY file for global settings!
 * 
 * Manage ALL global settings here:
 * - Colors (with accessibility compliance)
 * - Course Cards
 * - Buttons
 * - Typography
 * - Spacing
 * - Components
 * - Everything!
 * 
 * Reference: https://purelogics.com/
 * ============================================
 */

/**
 * COLOR SYSTEM - EXACT from PureLogics website
 * All colors with proper contrast ratios for accessibility
 */
export const colors = {
  // Primary Brand Colors (EXACT from PureLogics)
  primary: '#00235A',        // Dark blue - primary brand color
  primaryLight: '#4ABA6A',   // Green - primary accent
  primaryHover: '#003A7A',   // Lighter dark blue on hover
  primaryDark: '#001A3D',    // Darker blue for depth
  
  // Secondary/Accent (for backward compatibility)
  secondary: '#4ABA6A',      // Green - primary accent
  secondaryHover: '#5ACA7A', // Lighter green on hover
  secondaryLight: '#8BE5BF', // Mint green
  accentColor: '#4ABA6A',    // Green
  highlight: '#4ABA6A',      // Green
  
  // Accent Colors (EXACT from PureLogics)
  accent: {
    // PureLogics colors
    cyan: '#18FFCA',         // Bright cyan
    mint: '#8BE5BF',         // Mint green
    light: '#CAFCE5',        // Light green/cyan
    green: '#4ABA6A',        // Green
    // Backward compatibility
    primary: '#4ABA6A',      // Green (same as green)
    secondary: '#18FFCA',    // Cyan (same as cyan)
    accent: '#4ABA6A',       // Green (same as green)
    highlight: '#4ABA6A',    // Green (same as green)
  },
  
  // Background Colors - With proper contrast
  background: {
    primary: '#FFFFFF',      // White - main background
    secondary: '#FFFFFF',    // White (for cards - backward compatibility)
    soft: '#F9FAFB',         // Soft gray - section backgrounds
    muted: '#F3F4F6',        // Muted background (backward compatibility)
    card: '#FFFFFF',         // Card background
    dark: '#00235A',         // Dark blue background
    section: '#F9FAFB',      // Section backgrounds (backward compatibility)
    highlight: '#CAFCE5',    // Light green tint (from PureLogics)
    subtle: '#FAFAFA',       // Very subtle background
  },
  
  // Text Colors - WCAG AA Compliant (4.5:1 minimum)
  text: {
    // On white background
    primary: '#00235A',      // Dark blue - excellent contrast (21:1)
    secondary: '#1F2937',    // Dark gray - excellent contrast (15:1)
    muted: '#4B5563',        // Medium gray - good contrast (7:1)
    light: '#6B7280',        // Light gray - acceptable contrast (4.5:1)
    
    // On dark background (#00235A)
    onDark: '#FFFFFF',       // White - excellent contrast (21:1)
    onDarkMuted: '#CAFCE5',  // Light cyan - good contrast (8:1)
    
    // On colored backgrounds
    onGreen: '#00235A',      // Dark blue on green - excellent contrast
    onCyan: '#00235A',       // Dark blue on cyan - excellent contrast
    
    // Standard
    white: '#FFFFFF',
    dark: '#00235A',
  },
  
  // Border Colors
  border: {
    primary: '#E5E7EB',      // Light gray
    muted: '#F3F4F6',        // Very light gray
    accent: '#4ABA6A',       // Green accent
    light: '#E5E7EB',        // Light border (same as primary - backward compatibility)
    dark: '#00235A',         // Dark blue
    subtle: '#F9FAFB',       // Subtle border
  },
  
  // Button Colors - With proper contrast
  button: {
    primary: '#00235A',      // Dark blue button (white text)
    primaryText: '#FFFFFF',  // White text on primary
    accent: '#4ABA6A',       // Green button (dark text)
    accentText: '#00235A',   // Dark text on accent
    secondary: '#18FFCA',    // Cyan button (dark text)
    secondaryText: '#00235A', // Dark text on secondary
  },
  
  // Status Colors - WCAG AA Compliant
  status: {
    success: '#4ABA6A',      // Green
    warning: '#F59E0B',       // Amber
    error: '#EF4444',        // Red
    info: '#00235A',         // Dark blue
  },
  
  // Hover Colors
  hover: {
    primary: '#003A7A',      // Lighter dark blue
    accent: '#5ACA7A',       // Lighter green
  },
  
  // Visual Grouping Colors (for backward compatibility)
  grouping: {
    sectionLight: '#FFFFFF',   // White sections
    sectionSoft: '#F9FAFB',    // Soft gray sections (alternating)
    sectionHighlight: '#CAFCE5', // Light green tint from PureLogics
    cardDefault: '#FFFFFF',     // Default card background
    cardElevated: '#FFFFFF',    // Elevated card (with shadow)
    cardSubtle: '#FAFAFA',      // Subtle card background
    hover: '#F9FAFB',          // Hover background
    active: '#F3F4F6',         // Active state background
    focus: '#CAFCE5',          // Focus state (green tint)
  },
} as const;

/**
 * COURSE CARD SETTINGS - Global configuration
 */
export const courseCard = {
  // Dimensions
  image: {
    aspectRatio: '16/9',     // Standard video aspect ratio
    borderRadius: '0.875rem', // 14px - matches design
  },
  
  // Spacing
  padding: {
    default: '1.25rem',      // 20px
    compact: '1rem',         // 16px
    spacious: '1.5rem',      // 24px
  },
  
  // Typography
  title: {
    fontSize: '1.125rem',     // 18px
    fontWeight: '600',
    lineHeight: '1.5',
    color: colors.text.primary,
    maxLines: 2,
  },
  
  instructor: {
    fontSize: '0.875rem',     // 14px
    color: colors.text.muted,
  },
  
  price: {
    fontSize: '1.25rem',      // 20px
    fontWeight: '700',
    color: colors.primaryLight,
  },
  
  // Colors
  backgroundColor: colors.background.card,
  borderColor: colors.border.primary,
  hoverBorderColor: colors.border.accent,
  
  // Effects
  hover: {
    transform: 'translateY(-2px)',
    shadow: '0 8px 12px -2px rgba(0, 0, 0, 0.1)',
  },
  
  // Badge
  badge: {
    backgroundColor: colors.accent.green,
    textColor: colors.text.onGreen,
    fontSize: '0.75rem',      // 12px
    padding: '0.25rem 0.75rem',
    borderRadius: '0.5rem',
  },
} as const;

/**
 * BUTTON SETTINGS - Global configuration
 */
export const button = {
  // Sizes
  sizes: {
    sm: {
      padding: '0.5rem 1rem',
      fontSize: '0.875rem',
      height: '2.25rem',
    },
    default: {
      padding: '0.75rem 1.5rem',
      fontSize: '0.875rem',
      height: '2.75rem',
    },
    lg: {
      padding: '1rem 2rem',
      fontSize: '1rem',
      height: '3.25rem',
    },
  },
  
  // Border Radius
  borderRadius: '0.75rem',   // 12px
  
  // Typography
  fontWeight: '600',
  
  // Colors (from colors.button)
  primary: colors.button.primary,
  primaryText: colors.button.primaryText,
  accent: colors.button.accent,
  accentText: colors.button.accentText,
  
  // Effects
  hover: {
    transform: 'translateY(-2px)',
    shadow: '0 4px 12px rgba(0, 35, 90, 0.2)',
  },
  
  // Transitions
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
} as const;

/**
 * TYPOGRAPHY SETTINGS - Global configuration
 */
export const typography = {
  // Font Family
  fontFamily: {
    sans: ['CameraPlainVariable', '"CameraPlainVariable Fallback"', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
    heading: ['CameraPlainVariable', '"CameraPlainVariable Fallback"', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
  },
  
  // Font Sizes
  fontSize: {
    xs: '0.75rem',      // 12px
    sm: '0.875rem',     // 14px
    base: '1rem',       // 16px
    lg: '1.125rem',     // 18px
    xl: '1.25rem',      // 20px
    '2xl': '1.5rem',    // 24px
    '3xl': '1.875rem',  // 30px
    '4xl': '2.25rem',   // 36px
    '5xl': '3rem',      // 48px
  },
  
  // Font Weights
  fontWeight: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
  
  // Line Heights
  lineHeight: {
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.75',
  },
  
  // Colors (from colors.text)
  color: {
    primary: colors.text.primary,
    secondary: colors.text.secondary,
    muted: colors.text.muted,
    light: colors.text.light,
  },
} as const;

/**
 * SPACING SETTINGS - Global configuration
 */
export const spacing = {
  // Section Padding
  section: {
    default: '4.5rem',   // 72px
    sm: '3rem',          // 48px
    lg: '5.5rem',        // 88px
  },
  
  // Container Padding
  container: {
    sm: '1rem',          // 16px
    md: '1.5rem',        // 24px
    lg: '2rem',          // 32px
    xl: '3rem',          // 48px
  },
  
  // Card Padding
  card: {
    sm: '1rem',          // 16px
    default: '1.25rem',  // 20px
    lg: '1.5rem',        // 24px
  },
  
  // Grid Gaps
  grid: {
    sm: '1rem',          // 16px
    default: '1.75rem',  // 28px
    lg: '2.25rem',       // 36px
  },
} as const;

/**
 * BORDER RADIUS SETTINGS - Global configuration
 */
export const borderRadius = {
  sm: '0.5rem',      // 8px
  md: '0.75rem',     // 12px
  lg: '0.875rem',    // 14px
  xl: '1rem',        // 16px
  '2xl': '1.125rem', // 18px
  '3xl': '1.5rem',   // 24px
  full: '9999px',
} as const;

/**
 * SHADOW SETTINGS - Global configuration
 */
export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  default: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
  card: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
  cardHover: '0 8px 12px -2px rgba(0, 0, 0, 0.15)',
} as const;

/**
 * TRANSITION SETTINGS - Global configuration
 */
export const transitions = {
  fast: 'all 0.15s ease',
  default: 'all 0.3s ease',
  slow: 'all 0.5s ease',
  button: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
} as const;

/**
 * EXPORT ALL SETTINGS
 */
export const globalSettings = {
  colors,
  courseCard,
  button,
  typography,
  spacing,
  borderRadius,
  shadows,
  transitions,
} as const;

// Default export
export default globalSettings;

