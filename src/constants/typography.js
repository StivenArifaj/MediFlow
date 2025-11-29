// MediFlow Design System - Typography
// Using Inter font family as specified in roadmap

export const TYPOGRAPHY = {
    // Font Families
    fontFamily: {
        regular: 'System',  // Will use system font, can be replaced with Inter
        medium: 'System',
        bold: 'System',
    },

    // Font Sizes (from roadmap)
    fontSize: {
        h1: 32,
        h2: 24,
        h3: 20,
        body: 16,
        small: 14,
        caption: 12,
    },

    // Font Weights - using string keywords for React Native compatibility
    fontWeight: {
        regular: 'normal',
        medium: '500',
        semiBold: '600',
        bold: 'bold',
    },

    // Line Heights
    lineHeight: {
        h1: 40,
        h2: 32,
        h3: 28,
        body: 24,
        small: 20,
        caption: 16,
    },
};

export default TYPOGRAPHY;
