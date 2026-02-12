/**
 * ============================================
 * CENTRALIZED COLOR SYSTEM - SINGLE SOURCE OF TRUTH
 * ============================================
 * 
 * ⚠️ IMPORTANT: Colors are now in global-settings.ts
 * This file re-exports for backward compatibility
 * 
 * For new code, use: import { globalSettings } from '@/lib/global-settings';
 * 
 * Reference: https://purelogics.com/
 * ============================================
 */

// Re-export from global-settings for backward compatibility
export { colors } from './global-settings';

// Re-export individual colors for easy access
export { colors as default } from './global-settings';
