/**
 * Bokivo Premium Brand Theme Tokens
 * Harmonized with the Official Bokivo Logo:
 * - Deep Royal Indigo/Navy (#1E3A5F, #0F172A)
 * - Vibrant Sunset Orange (#FF7A00, #FF8A1E)
 * - Clean Teal / Cyan (#0D9488, #14B8A6, #38B6FF)
 */
export const theme = {
  colors: {
    // Brand Primaries (from Logo's Book Base & Outline)
    brandNavy: '#1E3A5F',
    primaryNavy: '#0F1E36',
    primaryHover: '#162C4E',

    // Brand Accents (from Logo's Ticket & Checkmark)
    sunsetOrange: '#FF7A00',
    sunsetOrangeHover: '#EA6C00',
    sunsetOrangeLight: '#FFF7ED',
    
    tealAccent: '#0D9488',
    tealHover: '#0F766E',
    tealLight: '#F0FDFA',

    accentBlue: '#38B6FF',
    accentBlueHover: '#0099EE',

    // Surfaces & Backgrounds
    surfaceBg: '#F3F4F6', // Modern cool gray off-white canvas for optimal contrast & depth
    surfaceWhite: '#FFFFFF',
    surfaceMuted: '#E5E7EB',
    cardWhite: '#FFFFFF',

    // Borders & Dividers
    borderLight: '#E2E8F0',
    borderMuted: '#CBD5E1',
    borderFocus: '#FF7A00',

    // Typography
    textPrimary: '#0F172A',
    textSecondary: '#475569',
    textMuted: '#94A3B8',

    // Status indicators
    successGreen: '#10B981',
    errorRed: '#EF4444',
    gold: '#F59E0B',
  },
  shadows: {
    sm: '0 1px 3px 0 rgba(15, 30, 54, 0.05)',
    card: '0 4px 16px -2px rgba(15, 30, 54, 0.08), 0 2px 4px -2px rgba(15, 30, 54, 0.04)',
    cardHover: '0 20px 30px -8px rgba(15, 30, 54, 0.14), 0 8px 12px -4px rgba(255, 122, 0, 0.12)',
    orangeGlow: '0 10px 25px -3px rgba(255, 122, 0, 0.35)',
    tealGlow: '0 10px 25px -3px rgba(13, 148, 136, 0.35)',
    modal: '0 25px 50px -12px rgba(15, 30, 54, 0.35)',
  },
  radii: {
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '22px',
    full: '9999px',
  }
};
