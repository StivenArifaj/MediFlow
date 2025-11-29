// MediFlow Design System - Colors
// Based on the roadmap's brand identity guidelines

export const COLORS = {
    // Primary Colors
    primary: '#3A7AFE',        // Trust Blue - primary actions, headers
    primaryDark: '#2563EB',    // Darker blue for pressed states
    primaryLight: '#60A5FA',   // Lighter blue for backgrounds

    success: '#10B981',        // Success Green - confirmations, taken status
    successLight: '#34D399',   // Light green for backgrounds

    // Secondary Colors
    warning: '#F59E0B',        // Warning Orange - upcoming reminders
    warningLight: '#FCD34D',   // Light orange for backgrounds

    error: '#EF4444',          // Error Red - missed doses, errors
    errorLight: '#F87171',     // Light red for backgrounds

    neutral: '#6B7280',        // Neutral Gray - body text

    // Accent Colors
    purple: '#8B5CF6',         // Premium features
    pink: '#EC4899',           // Special highlights
    teal: '#14B8A6',           // Alternative accent

    // Backgrounds
    white: '#FFFFFF',
    lightGray: '#F9FAFB',
    mediumGray: '#F3F4F6',
    cardBackground: '#FFFFFF',

    // Glassmorphism
    glassBackground: 'rgba(255, 255, 255, 0.7)',
    glassBorder: 'rgba(255, 255, 255, 0.18)',

    // Text Colors
    textPrimary: '#111827',
    textSecondary: '#6B7280',
    textDisabled: '#D1D5DB',
    textWhite: '#FFFFFF',

    // Status Colors
    taken: '#10B981',
    skipped: '#F59E0B',
    missed: '#EF4444',
    upcoming: '#3A7AFE',

    // Gradients
    gradientPrimary: ['#3A7AFE', '#60A5FA'],
    gradientSuccess: ['#10B981', '#34D399'],
    gradientWarning: ['#F59E0B', '#FCD34D'],
    gradientPremium: ['#8B5CF6', '#EC4899'],
    gradientHero: ['#3A7AFE', '#14B8A6'],

    // Borders
    border: '#E5E7EB',
    borderLight: '#F3F4F6',
    borderDark: '#D1D5DB',

    // Shadows (for elevation)
    shadow: {
        small: 'rgba(0, 0, 0, 0.05)',
        medium: 'rgba(0, 0, 0, 0.1)',
        large: 'rgba(0, 0, 0, 0.15)',
    },
};

export default COLORS;
