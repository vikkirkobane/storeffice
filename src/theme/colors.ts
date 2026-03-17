/**
 * Centralized Color System for Storeffice
 * Professional green theme with modern design principles
 */

export const AppColors = {
    // Primary Green Palette
    primary: '#10b981',           // Emerald 500 - Main brand color
    primaryDark: '#059669',       // Emerald 600 - Hover/pressed states
    primaryLight: '#34d399',      // Emerald 400 - Highlights
    primaryPale: '#d1fae5',       // Emerald 100 - Subtle backgrounds

    // Secondary & Accent
    secondary: '#14b8a6',         // Teal 500 - Secondary actions
    accent: '#22c55e',            // Green 500 - Success states

    // Neutral Palette
    background: '#F5F7FA',        // Main background
    surface: '#FFFFFF',           // Cards, modals
    surfaceHover: '#F8FAFC',      // Hover state for cards
    border: '#E4E7EC',            // Borders, dividers
    borderLight: '#F1F3F5',       // Subtle borders

    // Text Colors
    textPrimary: '#212529',       // Main text
    textSecondary: '#6C757D',     // Secondary text
    textMuted: '#ADB5BD',         // Disabled, placeholders
    textOnPrimary: '#FFFFFF',     // Text on green backgrounds

    // Semantic Colors
    success: '#22c55e',           // Green 500
    error: '#ef4444',             // Red 500
    warning: '#f59e0b',           // Amber 500
    info: '#3b82f6',              // Blue 500

    // Semantic Backgrounds
    successBg: '#dcfce7',         // Green 100
    errorBg: '#fee2e2',           // Red 100
    warningBg: '#fef3c7',         // Amber 100
    infoBg: '#dbeafe',            // Blue 100

    // Interactive States
    hover: 'rgba(16, 185, 129, 0.1)',      // Green with opacity
    pressed: 'rgba(16, 185, 129, 0.2)',    // Green with opacity
    disabled: '#E9ECEF',                    // Disabled background
    disabledText: '#ADB5BD',                // Disabled text

    // Shadows (for shadow colors)
    shadowLight: 'rgba(0, 0, 0, 0.05)',
    shadowMedium: 'rgba(0, 0, 0, 0.1)',
    shadowDark: 'rgba(0, 0, 0, 0.15)',
    shadowPrimary: 'rgba(16, 185, 129, 0.2)', // Green shadow for buttons
};

export const Spacing = {
    xs: 4,
    sm: 8,
    md: 12,
    base: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
    xxxl: 64,
};

export const BorderRadius = {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    xxl: 24,
    full: 9999,
};

export const Typography = {
    fontSize: {
        xs: 12,
        sm: 14,
        base: 16,
        lg: 18,
        xl: 20,
        xxl: 24,
        xxxl: 30,
        huge: 36,
    },
    fontWeight: {
        normal: '400' as const,
        medium: '500' as const,
        semibold: '600' as const,
        bold: '700' as const,
        extrabold: '800' as const,
    },
    lineHeight: {
        tight: 1.2,
        normal: 1.5,
        relaxed: 1.75,
    },
};

export const Shadows = {
    sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
    },
    primary: {
        shadowColor: AppColors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
};
