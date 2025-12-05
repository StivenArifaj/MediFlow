// MediFlow Notification Service - Local Notifications
// Handles reminder scheduling and notification management

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import CONFIG from '../constants/config';

// Configure notification behavior
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});

class NotificationService {
    constructor() {
        this.initialized = false;
    }

    /**
     * Initialize notification service and request permissions
     */
    async init() {
        try {
            // Request permissions
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;

            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }

            if (finalStatus !== 'granted') {
                console.warn('⚠️ Notification permissions not granted');
                return false;
            }

            // Set up notification channel for Android
            if (Platform.OS === 'android') {
                await Notifications.setNotificationChannelAsync(CONFIG.NOTIFICATION_CHANNEL_ID, {
                    name: CONFIG.NOTIFICATION_CHANNEL_NAME,
                    importance: Notifications.AndroidImportance.MAX,
                    vibrationPattern: [0, 250, 250, 250],
                    lightColor: '#3A7AFE',
                    sound: 'default',
                });
            }

            this.initialized = true;
            console.log('✅ Notification service initialized');
            return true;
        } catch (error) {
            console.error('❌ Notification initialization error:', error);
            return false;
        }
    }

    /**
     * Schedule a reminder notification
     * @param {Object} reminder - Reminder object with medicine and time info
     * @returns {Promise<string>} Notification ID
     */
    async scheduleReminder(reminder, medicine) {
        try {
            // Parse time (HH:MM format)
            const [hours, minutes] = reminder.time.split(':').map(Number);
            const notificationIds = [];

            // Get days array (0 = Sunday, 6 = Saturday)
            const days = typeof reminder.days === 'string' ? JSON.parse(reminder.days) : reminder.days;

            if (reminder.frequency_type === 'specific_days') {
                // Schedule a separate notification for each day
                for (const day of days) {
                    // Expo uses 1=Sunday, 7=Saturday. JS uses 0=Sunday, 6=Saturday.
                    // Map: 0->1, 1->2, ..., 6->7
                    const weekday = day + 1;

                    const trigger = {
                        hour: hours,
                        minute: minutes,
                        weekday: weekday,
                        repeats: true,
                    };

                    const id = await this._scheduleSingleNotification(reminder, medicine, trigger);
                    notificationIds.push(id);
                }
                // Return the first ID or a joined string (we might need to store all IDs)
                // For simplicity, we'll return the first one, but in reality we should track all.
                // However, our cancel logic cancels by reminder_id in data, so it handles multiple.
                return notificationIds[0];
            }

            let trigger;
            if (reminder.frequency_type === 'daily') {
                trigger = {
                    hour: hours,
                    minute: minutes,
                    repeats: true,
                };
            } else if (reminder.frequency_type === 'interval') {
                const intervalSeconds = (reminder.interval_days || 1) * 24 * 60 * 60;
                trigger = {
                    seconds: intervalSeconds,
                    repeats: true,
                };
            }

            const id = await this._scheduleSingleNotification(reminder, medicine, trigger);
            return id;

        } catch (error) {
            console.error('❌ Error scheduling notification:', error);
            throw error;
        }
    }

    /**
     * Helper to schedule a single notification
     */
    async _scheduleSingleNotification(reminder, medicine, trigger) {
        const notificationId = await Notifications.scheduleNotificationAsync({
            content: {
                title: '💊 Time for your medicine',
                body: `Take your ${medicine.verified_name || medicine.custom_name}`,
                data: {
                    reminder_id: reminder.reminder_id,
                    med_id: reminder.med_id,
                    type: 'medicine_reminder',
                },
                sound: reminder.sound || 'default',
                priority: Notifications.AndroidNotificationPriority.MAX,
                categoryIdentifier: 'medicine_reminder',
            },
            trigger,
        });

        console.log(`✅ Scheduled notification ${notificationId} for ${medicine.verified_name}`);
        return notificationId;
    }

    /**
     * Schedule multiple reminders for a medicine
     */
    async scheduleMultipleReminders(reminders, medicine) {
        const notificationIds = [];

        for (const reminder of reminders) {
            if (reminder.notification_enabled) {
                const id = await this.scheduleReminder(reminder, medicine);
                notificationIds.push(id);
            }
        }

        return notificationIds;
    }

    /**
     * Cancel a scheduled notification
     */
    async cancelNotification(notificationId) {
        try {
            await Notifications.cancelScheduledNotificationAsync(notificationId);
            console.log(`✅ Cancelled notification ${notificationId}`);
        } catch (error) {
            console.error('❌ Error cancelling notification:', error);
        }
    }

    /**
     * Cancel all notifications for a reminder
     */
    async cancelReminderNotifications(reminderId) {
        try {
            const scheduled = await Notifications.getAllScheduledNotificationsAsync();

            for (const notification of scheduled) {
                if (notification.content.data?.reminder_id === reminderId) {
                    await Notifications.cancelScheduledNotificationAsync(notification.identifier);
                }
            }

            console.log(`✅ Cancelled all notifications for reminder ${reminderId}`);
        } catch (error) {
            console.error('❌ Error cancelling reminder notifications:', error);
        }
    }

    /**
     * Cancel all notifications for a medicine
     */
    async cancelMedicineNotifications(medId) {
        try {
            const scheduled = await Notifications.getAllScheduledNotificationsAsync();

            for (const notification of scheduled) {
                if (notification.content.data?.med_id === medId) {
                    await Notifications.cancelScheduledNotificationAsync(notification.identifier);
                }
            }

            console.log(`✅ Cancelled all notifications for medicine ${medId}`);
        } catch (error) {
            console.error('❌ Error cancelling medicine notifications:', error);
        }
    }

    /**
     * Cancel all scheduled notifications
     */
    async cancelAllNotifications() {
        try {
            await Notifications.cancelAllScheduledNotificationsAsync();
            console.log('✅ Cancelled all notifications');
        } catch (error) {
            console.error('❌ Error cancelling all notifications:', error);
        }
    }

    /**
     * Get all scheduled notifications
     */
    async getScheduledNotifications() {
        try {
            const notifications = await Notifications.getAllScheduledNotificationsAsync();
            return notifications;
        } catch (error) {
            console.error('❌ Error getting scheduled notifications:', error);
            return [];
        }
    }

    /**
     * Schedule a snoozed notification
     */
    async scheduleSnooze(reminder, medicine, durationMinutes = 15) {
        try {
            const trigger = {
                seconds: durationMinutes * 60,
                repeats: false,
            };

            await Notifications.scheduleNotificationAsync({
                content: {
                    title: '💊 Reminder (Snoozed)',
                    body: `Time to take your ${medicine.verified_name || medicine.custom_name}`,
                    data: {
                        reminder_id: reminder.reminder_id,
                        med_id: reminder.med_id,
                        type: 'medicine_reminder_snoozed',
                    },
                    sound: reminder.sound || 'default',
                    priority: Notifications.AndroidNotificationPriority.MAX,
                },
                trigger,
            });

            console.log(`✅ Scheduled snooze for ${durationMinutes} minutes`);
        } catch (error) {
            console.error('❌ Error scheduling snooze:', error);
            throw error;
        }
    }

    /**
     * Send immediate notification (for testing or manual triggers)
     */
    async sendImmediateNotification(title, body, data = {}) {
        try {
            await Notifications.scheduleNotificationAsync({
                content: {
                    title,
                    body,
                    data,
                    sound: 'default',
                },
                trigger: null, // Immediate
            });
        } catch (error) {
            console.error('❌ Error sending immediate notification:', error);
        }
    }

    /**
     * Add notification response listener
     * Handles when user taps on notification
     */
    addNotificationResponseListener(callback) {
        return Notifications.addNotificationResponseReceivedListener(callback);
    }

    /**
     * Add notification received listener
     * Handles when notification is received while app is open
     */
    addNotificationReceivedListener(callback) {
        return Notifications.addNotificationReceivedListener(callback);
    }

    /**
     * Remove notification listener
     */
    removeNotificationListener(subscription) {
        if (subscription) {
            subscription.remove();
        }
    }

    /**
     * Check if notifications are enabled
     */
    async areNotificationsEnabled() {
        const { status } = await Notifications.getPermissionsAsync();
        return status === 'granted';
    }

    /**
     * Get notification badge count
     */
    async getBadgeCount() {
        if (Platform.OS === 'ios') {
            return await Notifications.getBadgeCountAsync();
        }
        return 0;
    }

    /**
     * Set notification badge count
     */
    async setBadgeCount(count) {
        if (Platform.OS === 'ios') {
            await Notifications.setBadgeCountAsync(count);
        }
    }

    /**
     * Clear badge count
     */
    async clearBadge() {
        await this.setBadgeCount(0);
    }
}

// Export singleton instance
const notificationService = new NotificationService();
export default notificationService;
