// MediFlow Reminder Store - Zustand State Management
// Manages reminder data and notification scheduling

import { create } from 'zustand';
import databaseService from '../services/databaseService';
import notificationService from '../services/notificationService';

const useReminderStore = create((set, get) => ({
    // State
    reminders: [],
    loading: false,
    error: null,
    upcomingReminders: [],

    // Actions

    /**
     * Load all reminders for a user
     */
    loadReminders: async (userId) => {
        set({ loading: true, error: null });
        try {
            const reminders = await databaseService.getReminders(userId);
            set({ reminders, loading: false });
            return reminders;
        } catch (error) {
            set({ error: error.message, loading: false });
            console.error('Error loading reminders:', error);
            return [];
        }
    },

    /**
     * Add a new reminder and schedule notification
     */
    addReminder: async (userId, medId, reminderData, medicine) => {
        set({ loading: true, error: null });
        try {
            // Save reminder to database
            const reminderId = await databaseService.saveReminder({
                ...reminderData,
                user_id: userId,
                med_id: medId,
            });

            // Schedule notification
            if (reminderData.notification_enabled !== false) {
                const reminder = { ...reminderData, reminder_id: reminderId };
                await notificationService.scheduleReminder(reminder, medicine);
            }

            // Reload reminders
            await get().loadReminders(userId);

            set({ loading: false });
            return reminderId;
        } catch (error) {
            set({ error: error.message, loading: false });
            console.error('Error adding reminder:', error);
            throw error;
        }
    },

    /**
     * Update an existing reminder
     */
    updateReminder: async (reminderId, updates, userId, medicine) => {
        set({ loading: true, error: null });
        try {
            // Update in database
            await databaseService.updateReminder(reminderId, updates);

            // Cancel old notifications
            await notificationService.cancelReminderNotifications(reminderId);

            // Reschedule if notification enabled
            if (updates.notification_enabled !== false) {
                const reminder = { ...updates, reminder_id: reminderId };
                await notificationService.scheduleReminder(reminder, medicine);
            }

            // Reload reminders
            await get().loadReminders(userId);

            set({ loading: false });
        } catch (error) {
            set({ error: error.message, loading: false });
            console.error('Error updating reminder:', error);
            throw error;
        }
    },

    /**
     * Delete a reminder
     */
    deleteReminder: async (reminderId, userId) => {
        set({ loading: true, error: null });
        try {
            // Delete from database
            await databaseService.deleteReminder(reminderId);

            // Cancel notifications
            await notificationService.cancelReminderNotifications(reminderId);

            // Reload reminders
            await get().loadReminders(userId);

            set({ loading: false });
        } catch (error) {
            set({ error: error.message, loading: false });
            console.error('Error deleting reminder:', error);
            throw error;
        }
    },

    /**
     * Get reminders for a specific medicine
     */
    getRemindersByMedicine: async (medId) => {
        set({ loading: true, error: null });
        try {
            const reminders = await databaseService.getRemindersByMedicine(medId);
            set({ loading: false });
            return reminders;
        } catch (error) {
            set({ error: error.message, loading: false });
            console.error('Error getting medicine reminders:', error);
            return [];
        }
    },

    /**
     * Get today's upcoming reminders
     */
    getTodaysReminders: () => {
        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes();
        const currentDay = now.getDay();

        const reminders = get().reminders.filter(reminder => {
            if (!reminder.is_active) return false;

            // Parse reminder time
            const [hours, minutes] = reminder.time.split(':').map(Number);
            const reminderTime = hours * 60 + minutes;

            // Check if reminder is for today
            const days = JSON.parse(reminder.days);
            const isToday = days.includes(currentDay) || reminder.frequency_type === 'daily';

            // Check if reminder is upcoming (not passed)
            const isUpcoming = reminderTime >= currentTime;

            return isToday && isUpcoming;
        });

        return reminders.sort((a, b) => {
            const [aHours, aMinutes] = a.time.split(':').map(Number);
            const [bHours, bMinutes] = b.time.split(':').map(Number);
            return (aHours * 60 + aMinutes) - (bHours * 60 + bMinutes);
        });
    },

    /**
     * Mark reminder as taken (log to history)
     */
    markAsTaken: async (reminder, medId, userId, notes = '') => {
        try {
            const now = Date.now();
            const scheduledTime = new Date();
            const [hours, minutes] = reminder.time.split(':').map(Number);
            scheduledTime.setHours(hours, minutes, 0, 0);

            // Calculate if late
            const lateByMinutes = Math.floor((now - scheduledTime.getTime()) / (1000 * 60));

            // Log to history
            await databaseService.logHistory({
                reminder_id: reminder.reminder_id,
                med_id: medId,
                user_id: userId,
                scheduled_time: scheduledTime.getTime(),
                actual_time: now,
                status: 'taken',
                notes,
                late_by_minutes: lateByMinutes > 0 ? lateByMinutes : 0,
            });

            console.log('✅ Marked reminder as taken');
        } catch (error) {
            console.error('Error marking reminder as taken:', error);
            throw error;
        }
    },

    /**
     * Mark reminder as skipped
     */
    markAsSkipped: async (reminder, medId, userId, notes = '') => {
        try {
            const scheduledTime = new Date();
            const [hours, minutes] = reminder.time.split(':').map(Number);
            scheduledTime.setHours(hours, minutes, 0, 0);

            await databaseService.logHistory({
                reminder_id: reminder.reminder_id,
                med_id: medId,
                user_id: userId,
                scheduled_time: scheduledTime.getTime(),
                actual_time: Date.now(),
                status: 'skipped',
                notes,
                late_by_minutes: 0,
            });

            console.log('✅ Marked reminder as skipped');
        } catch (error) {
            console.error('Error marking reminder as skipped:', error);
            throw error;
        }
    },

    /**
     * Snooze a reminder
     */
    snoozeReminder: async (reminder, medicine, snoozeDuration = 15) => {
        try {
            // Schedule snoozed notification
            await notificationService.scheduleSnooze(reminder, medicine, snoozeDuration);
            console.log(`✅ Snoozed reminder for ${snoozeDuration} minutes`);
        } catch (error) {
            console.error('Error snoozing reminder:', error);
            throw error;
        }
    },

    /**
     * Clear error
     */
    clearError: () => {
        set({ error: null });
    },
}));

export default useReminderStore;
