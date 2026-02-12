// MediFlow Design System - Premium Brand Colors
// Light & Dark palettes — Teal/Cyan + Navy Blue

export const LIGHT_COLORS = {
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
    secondary: '#10B981',      // Secondary brand color
    purple: '#8B5CF6',         // Premium features
    pink: '#EC4899',           // Special highlights

    // Backgrounds
    background: '#F0FAFA',     // Very light cyan tint
    backgroundAlt: '#E6F7F7',  // Slightly darker cyan tint
    white: '#FFFFFF',
    surface: '#FFFFFF',
    surfaceElevated: '#FFFFFF',
    cardBackground: '#FFFFFF',
    lightGray: '#F1F5F9',

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
    gradientHeader: ['#00D4D4', '#00A3A3'],            // Header gradient
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

    // Tab Bar
    tabActive: '#00D4D4',
    tabInactive: '#94A3B8',
    tabBarBackground: '#FFFFFF',
    tabBarBorder: '#E2E8F0',
};

export const DARK_COLORS = {
    // Primary Brand Colors (same accent in both modes)
    primary: '#00E5E5',        // Slightly brighter teal for dark mode
    primaryDark: '#00B8B8',
    primaryLight: '#33FFFF',

    navy: '#E8ECF1',
    navyDark: '#CDD5DF',
    navyLight: '#B0BEC5',

    // Success & Health (slightly brighter for dark bg)
    success: '#34D399',
    successLight: '#6EE7B7',
    successDark: '#10B981',

    // Warning & Alerts
    warning: '#FBBF24',
    warningLight: '#FDE68A',

    error: '#F87171',
    errorLight: '#FCA5A5',

    // Accent Colors
    accent: '#00E5E5',
    secondary: '#34D399',
    purple: '#A78BFA',
    pink: '#F472B6',

    // Backgrounds — Deep navy palette
    background: '#0F1629',     // Deepest navy
    backgroundAlt: '#1A2332',  // Slightly lighter
    white: '#1E2D3D',          // "white" → dark card surface
    surface: '#1E2D3D',
    surfaceElevated: '#243042',
    cardBackground: '#1E2D3D',
    lightGray: '#1A2332',

    // Glassmorphism Effects
    glass: 'rgba(0, 229, 229, 0.08)',
    glassWhite: 'rgba(30, 45, 61, 0.9)',
    glassBorder: 'rgba(0, 229, 229, 0.15)',

    // Text Colors — Light on dark
    textPrimary: '#E8ECF1',
    textSecondary: '#8899AA',
    textTertiary: '#6B7B8D',
    textDisabled: '#4A5568',
    textWhite: '#FFFFFF',
    textOnPrimary: '#0F1629',  // Dark text on bright teal

    // Status Colors (same as light, slightly brighter)
    taken: '#34D399',
    pending: '#FBBF24',
    missed: '#F87171',
    upcoming: '#00E5E5',
    skipped: '#6B7B8D',

    // Gradients — darker, richer
    gradientPrimary: ['#00D4D4', '#00A3A3'],
    gradientHero: ['#0F1629', '#1B2B44'],              // Dark navy gradient
    gradientHeader: ['#1A2332', '#0F1629'],
    gradientSuccess: ['#059669', '#10B981'],
    gradientWarning: ['#D97706', '#F59E0B'],
    gradientPremium: ['#7C3AED', '#DB2777'],
    gradientCard: ['#1E2D3D', '#243042'],
    gradientOverlay: ['rgba(15, 22, 41, 0.9)', 'rgba(0, 212, 212, 0.2)'],

    // Borders
    border: '#2A3A4A',
    borderLight: '#1E2D3D',
    borderDark: '#3A4A5A',
    borderPrimary: '#00E5E5',

    // Shadows
    shadow: {
        small: 'rgba(0, 0, 0, 0.2)',
        medium: 'rgba(0, 0, 0, 0.3)',
        large: 'rgba(0, 0, 0, 0.4)',
        teal: 'rgba(0, 229, 229, 0.2)',
    },

    // Special Effects
    shimmer: 'rgba(255, 255, 255, 0.1)',
    overlay: 'rgba(0, 0, 0, 0.6)',
    backdrop: 'rgba(0, 0, 0, 0.5)',

    // Tab Bar
    tabActive: '#00E5E5',
    tabInactive: '#6B7B8D',
    tabBarBackground: '#141D2B',
    tabBarBorder: '#2A3A4A',
};

// Default export keeps backward compatibility
export const COLORS = LIGHT_COLORS;
export default COLORS;
