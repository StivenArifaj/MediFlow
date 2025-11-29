// MediFlow Configuration Constants

export const CONFIG = {
    // App Info
    APP_NAME: 'MediFlow',
    APP_VERSION: '1.0.0',

    // API Configuration
    OPENFDA_BASE_URL: 'https://api.fda.gov/drug',

    // Feature Flags
    FEATURES: {
        OCR_SCANNING: false,      // Will enable in Phase 2
        CLOUD_SYNC: false,        // Will enable in V2
        PREMIUM_FEATURES: false,  // Will enable in V3
        ANALYTICS: true,
    },

    // Limits
    FREE_MEDICINE_LIMIT: 10,
    MAX_REMINDERS_PER_MEDICINE: 5,

    // Notification Settings
    NOTIFICATION_CHANNEL_ID: 'mediflow-reminders',
    NOTIFICATION_CHANNEL_NAME: 'Medicine Reminders',

    // Snooze Durations (in minutes)
    SNOOZE_OPTIONS: [5, 10, 15, 30],
    DEFAULT_SNOOZE_DURATION: 15,

    // Time Presets
    TIME_PRESETS: [
        { label: 'Morning', time: '08:00', icon: '☀️' },
        { label: 'Afternoon', time: '14:00', icon: '🌤️' },
        { label: 'Evening', time: '20:00', icon: '🌙' },
        { label: 'Before Bed', time: '22:00', icon: '🛏️' },
    ],

    // Medicine Forms
    MEDICINE_FORMS: [
        'Tablet',
        'Capsule',
        'Liquid',
        'Injection',
        'Cream/Ointment',
        'Drops',
        'Inhaler',
        'Patch',
        'Other',
    ],

    // Reminder Frequencies
    FREQUENCY_TYPES: {
        DAILY: 'daily',
        SPECIFIC_DAYS: 'specific_days',
        INTERVAL: 'interval',
        AS_NEEDED: 'as_needed',
    },
};

export default CONFIG;
