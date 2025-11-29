// MediFlow User Store - Zustand State Management
// Manages user profile and app settings

import { create } from 'zustand';
import databaseService from '../services/databaseService';

const useUserStore = create((set, get) => ({
    // State
    user: null,
    loading: false,
    error: null,
    isAuthenticated: false,

    // Actions

    /**
     * Initialize user (create or load)
     */
    initUser: async (userData = {}) => {
        set({ loading: true, error: null });
        try {
            // For MVP, we'll use a simple local user
            // In V2, this will integrate with Firebase Auth
            const userId = 'local_user_' + Date.now();

            const user = await databaseService.createUser({
                user_id: userId,
                name: userData.name || 'User',
                email: userData.email || null,
                settings: {
                    theme: 'light',
                    notifications: {
                        enabled: true,
                        sound: 'default',
                        vibration: true,
                        quiet_hours: {
                            enabled: false,
                            start: '22:00',
                            end: '08:00',
                        },
                    },
                    reminders: {
                        snooze_enabled: true,
                        snooze_duration: 15,
                        persistent: true,
                    },
                    privacy: {
                        analytics: true,
                        crash_reports: true,
                    },
                },
            });

            set({ user: { user_id: userId, ...userData }, isAuthenticated: true, loading: false });
            return userId;
        } catch (error) {
            set({ error: error.message, loading: false });
            console.error('Error initializing user:', error);
            throw error;
        }
    },

    /**
     * Load existing user
     */
    loadUser: async (userId) => {
        set({ loading: true, error: null });
        try {
            const user = await databaseService.getUser(userId);
            if (user) {
                set({ user, isAuthenticated: true, loading: false });
                return user;
            } else {
                set({ loading: false });
                return null;
            }
        } catch (error) {
            set({ error: error.message, loading: false });
            console.error('Error loading user:', error);
            return null;
        }
    },

    /**
     * Update user profile
     */
    updateUser: async (updates) => {
        const userId = get().user?.user_id;
        if (!userId) {
            throw new Error('No user logged in');
        }

        set({ loading: true, error: null });
        try {
            await databaseService.updateUser(userId, updates);

            // Reload user
            const updatedUser = await databaseService.getUser(userId);
            set({ user: updatedUser, loading: false });
        } catch (error) {
            set({ error: error.message, loading: false });
            console.error('Error updating user:', error);
            throw error;
        }
    },

    /**
     * Update user settings
     */
    updateSettings: async (settings) => {
        const userId = get().user?.user_id;
        if (!userId) {
            throw new Error('No user logged in');
        }

        try {
            const currentUser = get().user;
            const newSettings = {
                ...currentUser.settings,
                ...settings,
            };

            await get().updateUser({ settings: newSettings });
        } catch (error) {
            console.error('Error updating settings:', error);
            throw error;
        }
    },

    /**
     * Get user ID
     */
    getUserId: () => {
        return get().user?.user_id || null;
    },

    /**
     * Check if user is premium
     */
    isPremium: () => {
        const user = get().user;
        if (!user) return false;

        if (!user.is_premium) return false;

        // Check if premium hasn't expired
        if (user.premium_expires_at && user.premium_expires_at < Date.now()) {
            return false;
        }

        return true;
    },

    /**
     * Logout user
     */
    logout: () => {
        set({ user: null, isAuthenticated: false });
    },

    /**
     * Clear error
     */
    clearError: () => {
        set({ error: null });
    },
}));

export default useUserStore;
