// MediFlow User Store - Zustand State Management
// Manages user profile, authentication, and app settings

import { create } from 'zustand';
import databaseService from '../services/databaseService';
import authService from '../services/authService';

const useUserStore = create((set, get) => ({
    // State
    user: null,
    loading: false,
    error: null,
    isAuthenticated: false,

    // ==================== AUTH ACTIONS ====================

    /**
     * Register a new user
     */
    register: async (name, email, password) => {
        set({ loading: true, error: null });
        try {
            const user = await authService.register(name, email, password);
            set({ user, isAuthenticated: true, loading: false });
            console.log('✅ User registered:', user.user_id);
            return user;
        } catch (error) {
            set({ error: error.message, loading: false });
            throw error;
        }
    },

    /**
     * Login existing user
     */
    login: async (email, password) => {
        set({ loading: true, error: null });
        try {
            const user = await authService.login(email, password);
            set({ user, isAuthenticated: true, loading: false });
            console.log('✅ User logged in:', user.user_id);
            return user;
        } catch (error) {
            set({ error: error.message, loading: false });
            throw error;
        }
    },

    /**
     * Check for existing session on app launch
     */
    checkSession: async () => {
        try {
            const userId = await authService.getSession();
            if (userId) {
                const user = await databaseService.getUser(userId);
                if (user) {
                    set({ user, isAuthenticated: true });
                    console.log('✅ Session restored:', userId);
                    return user;
                }
            }
            return null;
        } catch (error) {
            console.error('Session check error:', error);
            return null;
        }
    },

    /**
     * Logout user
     */
    logout: async () => {
        try {
            await authService.logout();
        } catch (e) {
            // Ignore errors clearing session
        }
        set({ user: null, isAuthenticated: false, error: null });
        console.log('✅ User logged out');
    },

    // ==================== LEGACY: initUser / loadUser ====================
    // Kept for backward compatibility during migration

    initUser: async (userData = {}) => {
        set({ loading: true, error: null });
        try {
            const userId = userData.user_id || 'local_user_1';

            await databaseService.createUser({
                user_id: userId,
                name: userData.name || 'User',
                email: userData.email || null,
                settings: {
                    theme: 'light',
                    notifications: {
                        enabled: true,
                        sound: 'default',
                        vibration: true,
                        quiet_hours: { enabled: false, start: '22:00', end: '08:00' },
                    },
                    reminders: { snooze_enabled: true, snooze_duration: 15, persistent: true },
                    privacy: { analytics: true, crash_reports: true },
                },
            });

            const fullUser = await databaseService.getUser(userId);
            set({ user: fullUser || { user_id: userId, ...userData }, isAuthenticated: true, loading: false });
            return userId;
        } catch (error) {
            set({ error: error.message, loading: false });
            console.error('Error initializing user:', error);
            throw error;
        }
    },

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

    // ==================== PROFILE ACTIONS ====================

    /**
     * Update user profile
     */
    updateUser: async (updates) => {
        const userId = get().user?.user_id;
        if (!userId) throw new Error('No user logged in');

        set({ loading: true, error: null });
        try {
            await databaseService.updateUser(userId, updates);
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
        if (!userId) throw new Error('No user logged in');

        try {
            const currentUser = get().user;
            const newSettings = { ...currentUser.settings, ...settings };
            await get().updateUser({ settings: newSettings });
        } catch (error) {
            console.error('Error updating settings:', error);
            throw error;
        }
    },

    /**
     * Get user ID
     */
    getUserId: () => get().user?.user_id || null,

    /**
     * Check if user is premium
     */
    isPremium: () => {
        const user = get().user;
        if (!user || !user.is_premium) return false;
        if (user.premium_expires_at && user.premium_expires_at < Date.now()) return false;
        return true;
    },

    /**
     * Clear all user data (factory reset)
     */
    clearAllData: async () => {
        const userId = get().user?.user_id;
        if (!userId) return;

        try {
            await databaseService.clearAllData(userId);

            const notificationService = require('../services/notificationService').default;
            await notificationService.cancelAllNotifications();

            const useMedicineStore = require('./useMedicineStore').default;
            const useReminderStore = require('./useReminderStore').default;
            const useHealthStore = require('./useHealthStore').default;

            useMedicineStore.setState({ medicines: [], searchResults: [], currentMedicine: null });
            useReminderStore.setState({ reminders: [], upcomingReminders: [] });
            useHealthStore.setState({ measurements: [] });

            // Clear session and reset
            await authService.logout();
            set({ user: null, isAuthenticated: false, loading: false, error: null });

            console.log('✅ All data cleared successfully');
        } catch (error) {
            console.error('Error clearing all data:', error);
            throw error;
        }
    },

    /**
     * Toggle premium status (simulated local purchase)
     */
    togglePremium: async () => {
        const userId = get().user?.user_id;
        if (!userId) return;

        try {
            const currentUser = get().user;
            const newPremiumStatus = !currentUser.is_premium;
            const expiresAt = newPremiumStatus ? Date.now() + (365 * 24 * 60 * 60 * 1000) : null;

            await databaseService.updateUser(userId, {
                is_premium: newPremiumStatus ? 1 : 0,
                premium_expires_at: expiresAt,
            });

            const updatedUser = await databaseService.getUser(userId);
            set({ user: updatedUser });
        } catch (error) {
            console.error('Error toggling premium:', error);
            throw error;
        }
    },

    /**
     * Clear error
     */
    clearError: () => set({ error: null }),
}));

export default useUserStore;
