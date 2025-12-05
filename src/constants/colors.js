// MediFlow Design System - Premium Brand Colors
// Matching the MediFlow logo aesthetic: Teal/Cyan + Navy Blue

export const COLORS = {
    // Primary Brand Colors (from logo)
    primary: '#00D4D4',        // Vibrant Teal/Cyan - main brand color
    primaryDark: '#00A3A3',    // Darker teal for pressed states
    primaryLight: '#4DFFFF',   // Light cyan for backgrounds

    navy: '#1B2B44',           // Deep navy blue from logo
    navyDark: '#0F1B2E',       // Darker navy
    navyLight: '#2D3E5F',      // Lighter navy

    // Success & Health
    success: '#10B981',        // Emerald green - medicine taken
    successLight: '#6EE7B7',   // Light emerald
    successDark: '#059669',    // Dark emerald

    // Warning & Alerts
    warning: '#F59E0B',        // Amber - upcoming reminders
    warningLight: '#FCD34D',   // Light amber

    error: '#EF4444',          // Red - missed doses
    errorLight: '#FCA5A5',     // Light red

    // Accent Colors
    accent: '#00D4D4',         // Same as primary for consistency
    purple: '#8B5CF6',         // Premium features
    pink: '#EC4899',           // Special highlights

    // Backgrounds
    background: '#F0FAFA',     // Very light cyan tint
    backgroundAlt: '#E6F7F7',  // Slightly darker cyan tint
    white: '#FFFFFF',
    surface: '#FFFFFF',
    surfaceElevated: '#FFFFFF',

    // Glassmorphism Effects
    glass: 'rgba(0, 212, 212, 0.1)',
    glassWhite: 'rgba(255, 255, 255, 0.9)',
    glassBorder: 'rgba(0, 212, 212, 0.2)',

    // Text Colors
    textPrimary: '#1B2B44',    // Navy for primary text
    textSecondary: '#64748B',  // Slate gray
    textTertiary: '#94A3B8',   // Light slate
    textDisabled: '#CBD5E1',   // Very light gray
    textWhite: '#FFFFFF',
    textOnPrimary: '#FFFFFF',  // White text on teal

    // Status Colors
    taken: '#10B981',          // Green checkmark
    pending: '#F59E0B',        // Amber warning
    missed: '#EF4444',         // Red alert
    upcoming: '#00D4D4',       // Teal (brand color)
    skipped: '#94A3B8',        // Gray

    // Gradients - Premium teal-based
    gradientPrimary: ['#00D4D4', '#00A3A3'],           // Teal gradient
    gradientHero: ['#00D4D4', '#1B2B44'],              // Teal to Navy
    gradientSuccess: ['#10B981', '#34D399'],           // Emerald gradient
    gradientWarning: ['#F59E0B', '#FBBF24'],           // Amber gradient
    gradientPremium: ['#8B5CF6', '#EC4899'],           // Purple to Pink
    gradientCard: ['#FFFFFF', '#F0FAFA'],              // White to light teal
    gradientOverlay: ['rgba(27, 43, 68, 0.8)', 'rgba(0, 212, 212, 0.3)'], // Navy to teal overlay

    // Borders
    border: '#E2E8F0',         // Light slate
    borderLight: '#F1F5F9',    // Very light slate
    borderDark: '#CBD5E1',     // Medium slate
    borderPrimary: '#00D4D4',  // Teal border for focus

    // Shadows (for depth)
    shadow: {
        small: 'rgba(27, 43, 68, 0.08)',
        medium: 'rgba(27, 43, 68, 0.12)',
        large: 'rgba(27, 43, 68, 0.16)',
        teal: 'rgba(0, 212, 212, 0.25)',  // Teal glow
    },

    // Special Effects
    shimmer: 'rgba(255, 255, 255, 0.5)',
    overlay: 'rgba(27, 43, 68, 0.5)',
    backdrop: 'rgba(0, 0, 0, 0.3)',
};

export default COLORS;
