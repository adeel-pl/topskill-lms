/**
 * Global Color Configuration
 * Change colors here to update the entire site
 */

export const colors = {
  // PureLogics Color Scheme - Exact Colors from PureLogics Website
  background: {
    primary: '#CAFCE5',      // PureLogics light blue-green background (main site background)
    secondary: '#FFFFFF',    // White (for alternating sections)
    dark: '#0F172A',         // Dark background (for contrast sections if needed)
    card: '#FFFFFF',        // White for cards
  },
  
  text: {
    primary: '#00235A',      // PureLogics dark blue text (main text on light background)
    secondary: '#00235A',    // Dark blue text
    dark: '#00235A',         // Dark blue text (PureLogics style)
    darkGray: '#1E293B',     // Dark gray text
    muted: '#64748B',        // Muted gray text
    white: '#FFFFFF',        // White text (for dark sections or buttons)
  },
  
  accent: {
    primary: '#10B981',      // Green (main accent)
    orange: '#F97316',        // Orange (for headings)
    blue: '#00235A',         // Dark blue (PureLogics style)
  },
  
  border: {
    primary: '#CBD5E1',      // Light border (for light backgrounds)
    dark: '#334155',        // Dark border (for dark sections)
    light: '#E5E7EB',       // Very light border
  },
  
  button: {
    primary: '#10B981',      // Green button
    secondary: '#00235A',    // Dark blue button
    dark: '#1E293B',         // Dark button
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

