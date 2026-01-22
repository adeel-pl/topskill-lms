/**
 * Global Color Configuration
 * Change colors here to update the entire site
 * New TopSkill Color Palette
 */

export const colors = {
  // New TopSkill Color Palette
  background: {
    primary: '#FFFFFF',      // White (main site background)
    secondary: '#FFFFFF',    // White (for alternating sections)
    dark: '#0F172A',         // Dark background (for contrast sections if needed)
    card: '#FFFFFF',        // White for cards
    light: '#9fbeb2',        // Pale mint - light background
  },
  
  text: {
    primary: '#366854',      // Dark forest green (main text)
    secondary: '#366854',    // Dark forest green text
    dark: '#366854',         // Dark forest green text
    darkGray: '#1E293B',     // Dark gray text
    muted: '#64748B',        // Muted gray text
    white: '#FFFFFF',        // White text (for dark sections or buttons)
  },
  
  accent: {
    primary: '#048181',      // Deep teal - primary accent (replaces old green)
    secondary: '#f45c2c',    // Reddish-orange - secondary accent/CTA
    accent: '#5a9c7d',       // Sage green - secondary buttons
    highlight: '#ecca72',    // Pale gold - highlights
    orange: '#f45c2c',       // Orange (for headings)
    blue: '#048181',         // Teal (primary)
  },
  
  border: {
    primary: '#CBD5E1',      // Light border (for light backgrounds)
    dark: '#334155',        // Dark border (for dark sections)
    light: '#9fbeb2',       // Pale mint border
  },
  
  button: {
    primary: '#048181',      // Deep teal button (replaces old green)
    secondary: '#f45c2c',    // Orange button
    accent: '#5a9c7d',       // Sage green button
    dark: '#1E293B',         // Dark button
  },
  
  // Hover colors - use accent.primary for all hover states
  hover: {
    primary: '#048181',      // Deep teal on hover
    secondary: '#f45c2c',    // Orange on hover
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

