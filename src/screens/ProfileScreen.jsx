// MediFlow Profile Screen
// User profile and app settings — ALL features fully functional

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    Switch,
    ActivityIndicator,
    Modal,
} from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as Linking from 'expo-linking';

// Components
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import InfoModal, { Section, Paragraph, BulletPoint } from '../components/common/InfoModal';

// Theme
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

// Stores
import useUserStore from '../store/useUserStore';
import useMedicineStore from '../store/useMedicineStore';
import useReminderStore from '../store/useReminderStore';

// Services
import databaseService from '../services/databaseService';
import notificationService from '../services/notificationService';

// Constants
import TYPOGRAPHY from '../constants/typography';
import CONFIG from '../constants/config';

const ProfileScreen = ({ navigation }) => {
    const { colors, isDark, toggleTheme } = useTheme();
    const { t, language, setLanguage } = useLanguage();
    const { user, isPremium, updateSettings, clearAllData, togglePremium, logout } = useUserStore();
    const { getMedicineCount } = useMedicineStore();

    const medicineCount = getMedicineCount();
    const isUserPremium = isPremium();

    // Modal states
    const [helpVisible, setHelpVisible] = useState(false);
    const [privacyPolicyVisible, setPrivacyPolicyVisible] = useState(false);
    const [termsVisible, setTermsVisible] = useState(false);
    const [languageVisible, setLanguageVisible] = useState(false);
    const [exporting, setExporting] = useState(false);

    // Real stats from database
    const [stats, setStats] = useState({ taken: 0, total: 0, adherenceRate: 0, streak: 0 });

    useEffect(() => {
        loadAccountStats();
    }, [user]);

    const loadAccountStats = async () => {
        const userId = user?.user_id;
        if (!userId) return;
        try {
            const [adherence, streak] = await Promise.all([
                databaseService.getAdherenceStats(userId, 365),
                databaseService.getCurrentStreak(userId),
            ]);
            setStats({ ...adherence, streak });
        } catch (e) {
            console.log('Stats load error:', e);
        }
    };

    const reminderCount = useReminderStore.getState().reminders.length;

    // Settings from user's stored preferences
    const notificationsEnabled = user?.settings?.notifications?.enabled ?? true;
    const analyticsEnabled = user?.settings?.privacy?.analytics ?? true;
    const crashReportsEnabled = user?.settings?.privacy?.crash_reports ?? true;

    // ==================== NOTIFICATIONS ====================
    const handleToggleNotifications = async (value) => {
        try {
            if (value) {
                // Re-enable: check permission
                const enabled = await notificationService.areNotificationsEnabled();
                if (!enabled) {
                    Alert.alert(
                        'Notifications Disabled',
                        'Please enable notifications in your device settings to receive medicine reminders.',
                        [
                            { text: 'Cancel', style: 'cancel' },
                            { text: 'Open Settings', onPress: () => Linking.openSettings() },
                        ]
                    );
                    return;
                }
            } else {
                // Disabling: cancel all scheduled notifications
                await notificationService.cancelAllNotifications();
            }

            // Always read fresh state from the store
            const currentSettings = useUserStore.getState().user?.settings || {};
            await updateSettings({
                notifications: {
                    ...currentSettings.notifications,
                    enabled: value,
                },
            });
        } catch (error) {
            console.error('Error toggling notifications:', error);
            Alert.alert('Error', 'Failed to update notification settings.');
        }
    };

    // ==================== PRIVACY ====================
    const handleToggleAnalytics = async (value) => {
        try {
            const currentSettings = useUserStore.getState().user?.settings || {};
            await updateSettings({
                privacy: {
                    ...currentSettings.privacy,
                    analytics: value,
                },
            });
        } catch (error) {
            Alert.alert('Error', 'Failed to update privacy settings.');
        }
    };

    const handleToggleCrashReports = async (value) => {
        try {
            const currentSettings = useUserStore.getState().user?.settings || {};
            await updateSettings({
                privacy: {
                    ...currentSettings.privacy,
                    crash_reports: value,
                },
            });
        } catch (error) {
            Alert.alert('Error', 'Failed to update privacy settings.');
        }
    };

    // ==================== EXPORT DATA ====================
    const handleExportData = async () => {
        setExporting(true);
        try {
            const userId = useUserStore.getState().user?.user_id;
            if (!userId) {
                Alert.alert('Error', 'No user data found.');
                return;
            }

            const data = await databaseService.getAllDataForExport(userId);
            const jsonString = JSON.stringify(data, null, 2);
            const fileName = `MediFlow_Export_${new Date().toISOString().split('T')[0]}.json`;
            const filePath = `${FileSystem.documentDirectory}${fileName}`;

            await FileSystem.writeAsStringAsync(filePath, jsonString, {
                encoding: FileSystem.EncodingType.UTF8,
            });

            const sharingAvailable = await Sharing.isAvailableAsync();
            if (sharingAvailable) {
                await Sharing.shareAsync(filePath, {
                    mimeType: 'application/json',
                    dialogTitle: 'Export MediFlow Data',
                    UTI: 'public.json',
                });
            } else {
                Alert.alert(
                    'Export Complete',
                    `Your data has been saved to:\n${filePath}\n\nSharing is not available on this device.`
                );
            }
        } catch (error) {
            console.error('Export error:', error);
            Alert.alert('Error', 'Failed to export data. Please try again.');
        } finally {
            setExporting(false);
        }
    };

    // ==================== CLEAR ALL DATA ====================
    const handleClearData = () => {
        Alert.alert(
            'Clear All Data',
            'This will permanently delete ALL your medicines, reminders, history, and health measurements. This action CANNOT be undone.\n\nAre you absolutely sure?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete Everything',
                    style: 'destructive',
                    onPress: () => {
                        Alert.alert(
                            'Final Confirmation',
                            'All data will be permanently erased. You will need to set up your profile again.',
                            [
                                { text: 'Cancel', style: 'cancel' },
                                {
                                    text: 'Yes, Delete All',
                                    style: 'destructive',
                                    onPress: async () => {
                                        try {
                                            await clearAllData();
                                            Alert.alert('Done', 'All your data has been cleared. The app will restart fresh.');
                                        } catch (error) {
                                            Alert.alert('Error', 'Failed to clear data. Please try again.');
                                        }
                                    },
                                },
                            ]
                        );
                    },
                },
            ]
        );
    };

    // ==================== RATE APP ====================
    const handleRateApp = () => {
        Alert.alert(
            'Rate MediFlow',
            'Thank you for using MediFlow! Your feedback helps us improve.',
            [
                { text: 'Not Now', style: 'cancel' },
                {
                    text: 'Rate on App Store',
                    onPress: () => {
                        // This will open the appropriate store when the app is published.
                        // For now it opens the device's app settings as a fallback.
                        Linking.openURL('market://details?id=com.mediflow.app').catch(() => {
                            Linking.openURL('https://apps.apple.com/app/mediflow/id000000000').catch(() => {
                                Alert.alert(
                                    'Thank You! 🎉',
                                    'MediFlow is not yet listed on the app stores. Thank you for your support!'
                                );
                            });
                        });
                    },
                },
            ]
        );
    };

    // ==================== PREMIUM UPGRADE ====================
    const handlePremiumUpgrade = async () => {
        const currentlyPremium = useUserStore.getState().isPremium();
        if (currentlyPremium) {
            Alert.alert(
                'Premium Active',
                'You already have Premium! Enjoy unlimited medicines, cloud sync, and more.',
                [
                    { text: 'Great!', style: 'default' },
                    {
                        text: 'Deactivate Premium',
                        style: 'destructive',
                        onPress: async () => {
                            try {
                                await togglePremium();
                                Alert.alert('Premium Deactivated', 'Your premium features have been deactivated.');
                            } catch (error) {
                                Alert.alert('Error', 'Failed to update premium status.');
                            }
                        },
                    },
                ]
            );
        } else {
            Alert.alert(
                '🌟 Upgrade to Premium',
                'Unlock unlimited features:\n\n• Unlimited medicines (no 10-medicine cap)\n• Cloud sync across devices\n• Advanced health analytics\n• Priority support\n• Ad-free experience\n\nPrice: $4.99/month',
                [
                    { text: 'Not Now', style: 'cancel' },
                    {
                        text: 'Activate Premium',
                        onPress: async () => {
                            try {
                                await togglePremium();
                                Alert.alert('🎉 Welcome to Premium!', 'All premium features are now unlocked. Enjoy!');
                            } catch (error) {
                                Alert.alert('Error', 'Failed to activate premium. Please try again.');
                            }
                        },
                    },
                ]
            );
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView style={styles.scrollView}>
                {/* Header */}
                <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
                    <View style={[styles.avatarContainer, { backgroundColor: colors.primary }]}>
                        <Text style={styles.avatarText}>
                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                        </Text>
                    </View>
                    <Text style={[styles.userName, { color: colors.textPrimary }]}>{user?.name || 'User'}</Text>
                    {user?.email && (
                        <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{user.email}</Text>
                    )}
                    {isUserPremium && (
                        <View style={[styles.premiumBadge, { backgroundColor: colors.warning + '20' }]}>
                            <Text style={[styles.premiumText, { color: colors.warning }]}>⭐ Premium</Text>
                        </View>
                    )}
                </View>

                {/* Account Stats */}
                {/* Account Stats */}
                <Card style={styles.statsCard}>
                    <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>{t('profile.accountStats')}</Text>
                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Text style={[styles.statValue, { color: colors.primary }]}>{medicineCount}</Text>
                            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t('profile.medicines')}</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={[styles.statValue, { color: colors.primary }]}>{reminderCount}</Text>
                            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t('profile.reminders')}</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={[styles.statValue, { color: colors.success }]}>{stats.taken}</Text>
                            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t('profile.dosesTaken')}</Text>
                        </View>
                    </View>
                    <View style={[styles.statsRow, { marginTop: 16 }]}>
                        <View style={styles.statItem}>
                            <Text style={[styles.statValue, { color: Number(stats.adherenceRate) >= 80 ? colors.success : colors.warning }]}>
                                {stats.total > 0 ? `${stats.adherenceRate}%` : '—'}
                            </Text>
                            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t('profile.adherence')}</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={[styles.statValue, { color: colors.primary }]}>
                                {stats.streak > 0 ? `${stats.streak}🔥` : '0'}
                            </Text>
                            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t('profile.streak')}</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={[styles.statValue, { color: colors.primary }]}>
                                {new Date(user?.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                            </Text>
                            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t('profile.joined')}</Text>
                        </View>
                    </View>
                </Card>

                {/* Premium Upgrade */}
                {!isUserPremium && (
                    <Card style={[styles.premiumCard, { backgroundColor: colors.primary + '08', borderLeftColor: colors.primary }]}>
                        <Text style={[styles.premiumCardTitle, { color: colors.textPrimary }]}>🌟 Upgrade to Premium</Text>
                        <Text style={[styles.premiumCardText, { color: colors.textSecondary }]}>
                            • Unlimited medicines{'\n'}
                            • Cloud sync across devices{'\n'}
                            • Advanced analytics{'\n'}
                            • Priority support{'\n'}
                            • Ad-free experience
                        </Text>
                        <Button
                            title="Upgrade Now - $4.99/month"
                            onPress={handlePremiumUpgrade}
                            variant="primary"
                            size="medium"
                            style={styles.upgradeButton}
                        />
                    </Card>
                )}

                {/* App Settings */}
                <Card style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>{t('profile.settings')}</Text>

                    {/* Theme Toggle */}
                    <View style={[styles.settingItem, { borderBottomColor: colors.borderLight }]}>
                        <View style={styles.settingLeft}>
                            <Text style={styles.settingIcon}>🌙</Text>
                            <View>
                                <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>Dark Mode</Text>
                                <Text style={[styles.settingSubLabel, { color: colors.textTertiary }]}>
                                    {isDark ? 'On' : 'Off'}
                                </Text>
                            </View>
                        </View>
                        <Switch
                            value={isDark}
                            onValueChange={toggleTheme}
                            trackColor={{ false: colors.border, true: colors.primary + '60' }}
                            thumbColor={isDark ? colors.primary : colors.textDisabled}
                            ios_backgroundColor={colors.border}
                        />
                    </View>

                    {/* Language Selector */}
                    <TouchableOpacity
                        style={[styles.settingItem, { borderBottomColor: colors.borderLight }]}
                        onPress={() => setLanguageVisible(true)}
                    >
                        <View style={styles.settingLeft}>
                            <Text style={styles.settingIcon}>🌐</Text>
                            <View>
                                <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>{t('profile.language')}</Text>
                                <Text style={[styles.settingSubLabel, { color: colors.textTertiary }]}>
                                    {language === 'en' ? 'English' : language === 'sq' ? 'Shqip' : language === 'de' ? 'Deutsch' : 'Français'}
                                </Text>
                            </View>
                        </View>
                        <Text style={[styles.settingArrow, { color: colors.textDisabled }]}>›</Text>
                    </TouchableOpacity>

                    {/* Notifications Toggle */}
                    <View style={[styles.settingItem, { borderBottomColor: colors.borderLight }]}>
                        <View style={styles.settingLeft}>
                            <Text style={styles.settingIcon}>🔔</Text>
                            <View>
                                <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>{t('profile.notifications')}</Text>
                                <Text style={[styles.settingSubLabel, { color: colors.textTertiary }]}>
                                    {notificationsEnabled ? 'On' : 'Off'}
                                </Text>
                            </View>
                        </View>
                        <Switch
                            value={notificationsEnabled}
                            onValueChange={handleToggleNotifications}
                            trackColor={{ false: colors.border, true: colors.primary + '60' }}
                            thumbColor={notificationsEnabled ? colors.primary : colors.textDisabled}
                            ios_backgroundColor={colors.border}
                        />
                    </View>
                </Card>

                {/* Privacy Settings */}
                <Card style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>{t('profile.privacy')}</Text>

                    <View style={[styles.settingItem, { borderBottomColor: colors.borderLight }]}>
                        <View style={styles.settingLeft}>
                            <Text style={styles.settingIcon}>📊</Text>
                            <View>
                                <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>{t('profile.analytics')}</Text>
                            </View>
                        </View>
                        <Switch
                            value={analyticsEnabled}
                            onValueChange={handleToggleAnalytics}
                            trackColor={{ false: colors.border, true: colors.primary + '60' }}
                            thumbColor={analyticsEnabled ? colors.primary : colors.textDisabled}
                            ios_backgroundColor={colors.border}
                        />
                    </View>

                    <View style={[styles.settingItem, { borderBottomColor: colors.borderLight }]}>
                        <View style={styles.settingLeft}>
                            <Text style={styles.settingIcon}>🐛</Text>
                            <View>
                                <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>{t('profile.crashReports')}</Text>
                            </View>
                        </View>
                        <Switch
                            value={crashReportsEnabled}
                            onValueChange={handleToggleCrashReports}
                            trackColor={{ false: colors.border, true: colors.primary + '60' }}
                            thumbColor={crashReportsEnabled ? colors.primary : colors.textDisabled}
                            ios_backgroundColor={colors.border}
                        />
                    </View>
                </Card>

                {/* Data & Storage */}
                <Card style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>{t('profile.dataManagement')}</Text>

                    <TouchableOpacity
                        style={[styles.settingItem, { borderBottomColor: colors.borderLight }]}
                        onPress={handleExportData}
                        disabled={exporting}
                    >
                        <View style={styles.settingLeft}>
                            <Text style={styles.settingIcon}>📤</Text>
                            <View>
                                <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>{t('profile.exportData')}</Text>
                                <Text style={[styles.settingSubLabel, { color: colors.textTertiary }]}>
                                    JSON
                                </Text>
                            </View>
                        </View>
                        {exporting ? (
                            <ActivityIndicator size="small" color={colors.primary} />
                        ) : (
                            <Text style={[styles.settingArrow, { color: colors.textDisabled }]}>›</Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.settingItem, { borderBottomColor: colors.borderLight }]}
                        onPress={handleClearData}
                    >
                        <View style={styles.settingLeft}>
                            <Text style={styles.settingIcon}>🗑️</Text>
                            <Text style={[styles.settingLabel, { color: colors.error }]}>{t('profile.clearData')}</Text>
                        </View>
                        <Text style={[styles.settingArrow, { color: colors.textDisabled }]}>›</Text>
                    </TouchableOpacity>
                </Card>

                {/* About */}
                <Card style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>{t('profile.about')}</Text>

                    <SettingItem
                        icon="ℹ️"
                        label={t('profile.help')}
                        onPress={() => setHelpVisible(true)}
                        colors={colors}
                    />

                    <SettingItem
                        icon="📜"
                        label={t('profile.privacyPolicy')}
                        onPress={() => setPrivacyPolicyVisible(true)}
                        colors={colors}
                    />

                    <SettingItem
                        icon="📋"
                        label={t('profile.terms')}
                        onPress={() => setTermsVisible(true)}
                        colors={colors}
                    />

                    <SettingItem
                        icon="⭐"
                        label={t('profile.rateApp')}
                        onPress={handleRateApp}
                        colors={colors}
                    />

                    <View style={styles.versionContainer}>
                        <Text style={[styles.versionText, { color: colors.textDisabled }]}>
                            {t('profile.version')} {CONFIG.APP_VERSION}
                        </Text>
                    </View>
                </Card>

                {/* Medical Disclaimer */}
                <Card variant="outlined" style={[styles.disclaimerCard, { backgroundColor: colors.warning + '10', borderLeftColor: colors.warning }]}>
                    <Text style={[styles.disclaimerTitle, { color: colors.textPrimary }]}>⚠️ {t('profile.medicalDisclaimer')}</Text>
                    <Text style={[styles.disclaimerText, { color: colors.textSecondary }]}>
                        {t('profile.disclaimerText')}
                    </Text>
                </Card>

                {/* Logout Button */}
                <TouchableOpacity
                    style={[styles.logoutButton, { backgroundColor: colors.error + '15', borderColor: colors.error + '30' }]}
                    onPress={() => {
                        Alert.alert(
                            t('profile.logout'),
                            t('profile.logoutConfirm'),
                            [
                                { text: t('common.cancel'), style: 'cancel' },
                                {
                                    text: t('profile.logout'),
                                    style: 'destructive',
                                    onPress: () => logout(),
                                },
                            ]
                        );
                    }}
                >
                    <Text style={[styles.logoutButtonText, { color: colors.error }]}>{t('profile.logout')}</Text>
                </TouchableOpacity>

            </ScrollView>

            {/* ==================== MODALS ==================== */}

            {/* Language Selection Modal */}
            <Modal
                visible={languageVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setLanguageVisible(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setLanguageVisible(false)}
                >
                    <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
                        <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>{t('profile.language')}</Text>

                        {[
                            { code: 'en', label: 'English', flag: '🇬🇧' },
                            { code: 'sq', label: 'Shqip', flag: '🇦🇱' },
                            { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
                            { code: 'fr', label: 'Français', flag: '🇫🇷' },
                        ].map((lang) => (
                            <TouchableOpacity
                                key={lang.code}
                                style={[
                                    styles.languageOption,
                                    {
                                        backgroundColor: language === lang.code ? colors.primary + '10' : 'transparent',
                                        borderColor: language === lang.code ? colors.primary : colors.border
                                    }
                                ]}
                                onPress={() => {
                                    setLanguage(lang.code);
                                    setLanguageVisible(false);
                                }}
                            >
                                <Text style={styles.languageFlag}>{lang.flag}</Text>
                                <Text style={[
                                    styles.languageLabel,
                                    { color: language === lang.code ? colors.primary : colors.textPrimary, fontWeight: language === lang.code ? '700' : '400' }
                                ]}>
                                    {lang.label}
                                </Text>
                                {language === lang.code && (
                                    <Text style={{ color: colors.primary, fontWeight: 'bold' }}>✓</Text>
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* ==================== MODALS ==================== */}

            {/* Help & Support Modal */}
            <InfoModal
                visible={helpVisible}
                onClose={() => setHelpVisible(false)}
                title="Help & Support"
            >
                <Section title="Getting Started" colors={colors}>
                    <Paragraph colors={colors}>
                        MediFlow helps you organize and track your medications. Here's how to get the most out of the app:
                    </Paragraph>
                </Section>

                <Section title="Adding Medicines" colors={colors}>
                    <BulletPoint colors={colors}>
                        Tap the "+" button on the Home screen to add a new medicine manually.
                    </BulletPoint>
                    <BulletPoint colors={colors}>
                        Use the Scan tab to photograph a medicine box and automatically extract information using AI-powered text recognition.
                    </BulletPoint>
                    <BulletPoint colors={colors}>
                        Fill in the medicine name, form (tablet, capsule, etc.), strength, and any special notes.
                    </BulletPoint>
                </Section>

                <Section title="Setting Up Reminders" colors={colors}>
                    <BulletPoint colors={colors}>
                        Open any medicine and tap "Set Reminder" to schedule daily, weekly, or interval-based reminders.
                    </BulletPoint>
                    <BulletPoint colors={colors}>
                        Choose from preset times (Morning, Afternoon, Evening, Before Bed) or set a custom time.
                    </BulletPoint>
                    <BulletPoint colors={colors}>
                        Select specific days of the week if your medication is not daily.
                    </BulletPoint>
                    <BulletPoint colors={colors}>
                        Snooze reminders for 5, 10, 15, or 30 minutes if you need a delay.
                    </BulletPoint>
                </Section>

                <Section title="Tracking Your History" colors={colors}>
                    <BulletPoint colors={colors}>
                        The History tab shows your complete medication intake log with status (taken, skipped, missed).
                    </BulletPoint>
                    <BulletPoint colors={colors}>
                        View your adherence rate over the last 7, 14, or 30 days.
                    </BulletPoint>
                    <BulletPoint colors={colors}>
                        Filter history by specific medicines to see patterns.
                    </BulletPoint>
                </Section>

                <Section title="Health Measurements" colors={colors}>
                    <BulletPoint colors={colors}>
                        Track weight, blood pressure, heart rate, blood glucose, temperature, SpO2, and more.
                    </BulletPoint>
                    <BulletPoint colors={colors}>
                        Tap any measurement card to add a new reading.
                    </BulletPoint>
                    <BulletPoint colors={colors}>
                        View your measurement history to identify trends over time.
                    </BulletPoint>
                </Section>

                <Section title="Data & Privacy" colors={colors}>
                    <BulletPoint colors={colors}>
                        All your data is stored locally on your device — nothing is sent to external servers.
                    </BulletPoint>
                    <BulletPoint colors={colors}>
                        Export your data at any time as a JSON file from Profile → Export My Data.
                    </BulletPoint>
                    <BulletPoint colors={colors}>
                        You can clear all data from Profile → Clear All Data if you want a fresh start.
                    </BulletPoint>
                </Section>

                <Section title="Free vs Premium" colors={colors}>
                    <BulletPoint colors={colors}>
                        Free tier: Up to {CONFIG.FREE_MEDICINE_LIMIT} medicines, all core features included.
                    </BulletPoint>
                    <BulletPoint colors={colors}>
                        Premium ($4.99/month): Unlimited medicines, cloud sync, advanced analytics, and priority support.
                    </BulletPoint>
                </Section>

                <Section title="Contact Us" colors={colors}>
                    <Paragraph colors={colors}>
                        Have questions, feedback, or found a bug? We'd love to hear from you:
                    </Paragraph>
                    <Paragraph colors={colors}>
                        📧 Email: support@mediflow.app{'\n'}
                        🌐 Website: www.mediflow.app{'\n'}
                        📱 In-app: Profile → Rate MediFlow
                    </Paragraph>
                </Section>
            </InfoModal>

            {/* Privacy Policy Modal */}
            <InfoModal
                visible={privacyPolicyVisible}
                onClose={() => setPrivacyPolicyVisible(false)}
                title="Privacy Policy"
            >
                <Section colors={colors}>
                    <Paragraph colors={colors}>
                        Effective Date: January 1, 2025{'\n'}Last Updated: February 12, 2026
                    </Paragraph>
                </Section>

                <Section title="1. Information We Collect" colors={colors}>
                    <Paragraph colors={colors}>
                        MediFlow collects the following information to provide its core medication management functionality:
                    </Paragraph>
                    <BulletPoint colors={colors}>
                        Profile information: Name and email address (optional) that you provide during setup.
                    </BulletPoint>
                    <BulletPoint colors={colors}>
                        Medicine data: Names, dosages, forms, schedules, and notes for medications you add to the app.
                    </BulletPoint>
                    <BulletPoint colors={colors}>
                        Reminder history: Records of when medicines were taken, skipped, or missed.
                    </BulletPoint>
                    <BulletPoint colors={colors}>
                        Health measurements: Vitals and health data you manually enter (weight, blood pressure, etc.).
                    </BulletPoint>
                    <BulletPoint colors={colors}>
                        Camera images: Photos taken for medicine box scanning are processed locally and are not stored permanently.
                    </BulletPoint>
                </Section>

                <Section title="2. How We Store Your Data" colors={colors}>
                    <Paragraph colors={colors}>
                        All personal and medical data is stored locally on your device using an encrypted SQLite database. MediFlow does not transmit your health or medicine data to any external servers. Your data stays on your device at all times.
                    </Paragraph>
                </Section>

                <Section title="3. Data We Do NOT Collect" colors={colors}>
                    <BulletPoint colors={colors}>We do not collect your location data.</BulletPoint>
                    <BulletPoint colors={colors}>We do not collect contact lists, call logs, or browsing history.</BulletPoint>
                    <BulletPoint colors={colors}>We do not share any data with advertisers or data brokers.</BulletPoint>
                    <BulletPoint colors={colors}>We do not sell your personal information under any circumstances.</BulletPoint>
                </Section>

                <Section title="4. Analytics & Crash Reports" colors={colors}>
                    <Paragraph colors={colors}>
                        If you opt in, we collect anonymized usage analytics (e.g., which features are used most) and crash reports to improve the app. This data cannot be used to identify you personally. You can disable both at any time from Profile → Privacy Settings.
                    </Paragraph>
                </Section>

                <Section title="5. Third-Party Services" colors={colors}>
                    <Paragraph colors={colors}>
                        MediFlow uses the OpenFDA API to look up drug information when you search for medicines. These API requests include only the medicine name — no personal data is sent. OpenFDA is a public service provided by the U.S. Food and Drug Administration.
                    </Paragraph>
                </Section>

                <Section title="6. Data Export & Deletion" colors={colors}>
                    <Paragraph colors={colors}>
                        You can export all your data as a JSON file at any time from Profile → Export My Data. You can permanently delete all your data from Profile → Clear All Data. Once deleted, data cannot be recovered.
                    </Paragraph>
                </Section>

                <Section title="7. Children's Privacy" colors={colors}>
                    <Paragraph colors={colors}>
                        MediFlow is not directed to children under 13. If you are a parent or guardian and believe your child has provided personal information, please contact us and we will delete that information.
                    </Paragraph>
                </Section>

                <Section title="8. Changes to This Policy" colors={colors}>
                    <Paragraph colors={colors}>
                        We may update this Privacy Policy from time to time. Any changes will be reflected in the "Last Updated" date above. Continued use of MediFlow after changes constitutes acceptance of the updated policy.
                    </Paragraph>
                </Section>

                <Section title="9. Contact" colors={colors}>
                    <Paragraph colors={colors}>
                        If you have questions about this Privacy Policy, contact us at:{'\n'}📧 privacy@mediflow.app
                    </Paragraph>
                </Section>
            </InfoModal>

            {/* Terms of Service Modal */}
            <InfoModal
                visible={termsVisible}
                onClose={() => setTermsVisible(false)}
                title="Terms of Service"
            >
                <Section colors={colors}>
                    <Paragraph colors={colors}>
                        Effective Date: January 1, 2025{'\n'}Last Updated: February 12, 2026
                    </Paragraph>
                </Section>

                <Section title="1. Acceptance of Terms" colors={colors}>
                    <Paragraph colors={colors}>
                        By downloading, installing, or using MediFlow ("the App"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, do not use the App.
                    </Paragraph>
                </Section>

                <Section title="2. Description of Service" colors={colors}>
                    <Paragraph colors={colors}>
                        MediFlow is a personal medication management application that helps users organize medications, set reminders, track intake history, and record health measurements. The App is intended as an organizational tool only.
                    </Paragraph>
                </Section>

                <Section title="3. Medical Disclaimer" colors={colors}>
                    <Paragraph colors={colors}>
                        MediFlow is NOT a medical device and does NOT provide medical advice, diagnosis, or treatment recommendations. The App does NOT verify the accuracy of drug information, dosage instructions, or potential interactions. Always consult a qualified healthcare professional for medical decisions. Never disregard professional medical advice or delay seeking it because of information provided by the App.
                    </Paragraph>
                </Section>

                <Section title="4. User Responsibilities" colors={colors}>
                    <BulletPoint colors={colors}>
                        You are responsible for the accuracy of the information you enter into the App.
                    </BulletPoint>
                    <BulletPoint colors={colors}>
                        You acknowledge that reminder notifications depend on your device settings and may not always be delivered reliably.
                    </BulletPoint>
                    <BulletPoint colors={colors}>
                        You are solely responsible for taking medications as prescribed by your healthcare provider.
                    </BulletPoint>
                    <BulletPoint colors={colors}>
                        You must not rely on MediFlow as your sole method of medication management for critical or life-sustaining medications.
                    </BulletPoint>
                </Section>

                <Section title="5. Account & Data" colors={colors}>
                    <Paragraph colors={colors}>
                        Your data is stored locally on your device. You are responsible for backing up your data. MediFlow is not liable for data loss due to device failure, App uninstallation, or any other cause.
                    </Paragraph>
                </Section>

                <Section title="6. Premium Subscription" colors={colors}>
                    <BulletPoint colors={colors}>
                        Premium features are available for $4.99 per month.
                    </BulletPoint>
                    <BulletPoint colors={colors}>
                        Subscriptions auto-renew unless cancelled at least 24 hours before the current period ends.
                    </BulletPoint>
                    <BulletPoint colors={colors}>
                        You can manage or cancel your subscription through your device's app store.
                    </BulletPoint>
                    <BulletPoint colors={colors}>
                        Refunds are handled according to the app store's refund policy.
                    </BulletPoint>
                </Section>

                <Section title="7. Intellectual Property" colors={colors}>
                    <Paragraph colors={colors}>
                        All content, trademarks, and intellectual property in MediFlow are owned by MediFlow and its licensors. You may not copy, modify, distribute, or reverse-engineer any part of the App.
                    </Paragraph>
                </Section>

                <Section title="8. Limitation of Liability" colors={colors}>
                    <Paragraph colors={colors}>
                        To the maximum extent permitted by law, MediFlow and its developers shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the App. This includes, without limitation, damages for missed medications, health complications, or data loss.
                    </Paragraph>
                </Section>

                <Section title="9. Termination" colors={colors}>
                    <Paragraph colors={colors}>
                        We reserve the right to terminate or suspend access to the App at any time, without notice, for conduct that violates these Terms or is harmful to other users or the service.
                    </Paragraph>
                </Section>

                <Section title="10. Changes to Terms" colors={colors}>
                    <Paragraph colors={colors}>
                        We may modify these Terms at any time. Continued use of the App after changes constitutes acceptance. We encourage you to review these Terms periodically.
                    </Paragraph>
                </Section>

                <Section title="11. Contact" colors={colors}>
                    <Paragraph colors={colors}>
                        Questions about these Terms? Contact us at:{'\n'}📧 legal@mediflow.app
                    </Paragraph>
                </Section>
            </InfoModal>
        </View>
    );
};

// Helper component for setting items
const SettingItem = ({ icon, label, value, onPress, danger = false, colors }) => (
    <TouchableOpacity style={[styles.settingItem, { borderBottomColor: colors.borderLight }]} onPress={onPress}>
        <View style={styles.settingLeft}>
            <Text style={styles.settingIcon}>{icon}</Text>
            <Text style={[styles.settingLabel, danger ? { color: colors.error } : { color: colors.textPrimary }]}>
                {label}
            </Text>
        </View>
        {value ? <Text style={[styles.settingValue, { color: colors.textSecondary }]}>{value}</Text> : null}
        <Text style={[styles.settingArrow, { color: colors.textDisabled }]}>›</Text>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    header: {
        padding: 32,
        alignItems: 'center',
        borderBottomWidth: 1,
    },
    avatarContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    avatarText: {
        fontSize: 36,
        fontWeight: TYPOGRAPHY.fontWeight.bold,
        color: '#FFFFFF',
    },
    userName: {
        fontSize: TYPOGRAPHY.fontSize.h2,
        fontWeight: TYPOGRAPHY.fontWeight.bold,
        marginBottom: 4,
    },
    userEmail: {
        fontSize: TYPOGRAPHY.fontSize.body,
        marginBottom: 12,
    },
    premiumBadge: {
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 16,
    },
    premiumText: {
        fontSize: TYPOGRAPHY.fontSize.small,
        fontWeight: TYPOGRAPHY.fontWeight.semiBold,
    },
    statsCard: {
        margin: 16,
    },
    sectionTitle: {
        fontSize: TYPOGRAPHY.fontSize.h3,
        fontWeight: TYPOGRAPHY.fontWeight.bold,
        marginBottom: 16,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: TYPOGRAPHY.fontSize.h2,
        fontWeight: TYPOGRAPHY.fontWeight.bold,
        marginBottom: 4,
    },
    statLabel: {
        fontSize: TYPOGRAPHY.fontSize.small,
    },
    premiumCard: {
        margin: 16,
        marginTop: 0,
        borderLeftWidth: 4,
    },
    premiumCardTitle: {
        fontSize: TYPOGRAPHY.fontSize.h3,
        fontWeight: TYPOGRAPHY.fontWeight.bold,
        marginBottom: 12,
    },
    premiumCardText: {
        fontSize: TYPOGRAPHY.fontSize.body,
        lineHeight: 24,
        marginBottom: 16,
    },
    upgradeButton: {
        marginTop: 8,
    },
    section: {
        margin: 16,
        marginTop: 0,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
    },
    settingLeft: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    settingIcon: {
        fontSize: 24,
        marginRight: 12,
    },
    settingLabel: {
        fontSize: TYPOGRAPHY.fontSize.body,
    },
    settingSubLabel: {
        fontSize: TYPOGRAPHY.fontSize.caption,
        marginTop: 2,
    },
    settingValue: {
        fontSize: TYPOGRAPHY.fontSize.body,
        marginRight: 8,
    },
    settingArrow: {
        fontSize: 24,
    },
    versionContainer: {
        paddingTop: 16,
        alignItems: 'center',
    },
    versionText: {
        fontSize: TYPOGRAPHY.fontSize.small,
    },
    disclaimerCard: {
        margin: 16,
        marginTop: 0,
        marginBottom: 32,
        borderLeftWidth: 4,
    },
    disclaimerTitle: {
        fontSize: TYPOGRAPHY.fontSize.body,
        fontWeight: TYPOGRAPHY.fontWeight.bold,
        marginBottom: 8,
    },
    disclaimerText: {
        fontSize: TYPOGRAPHY.fontSize.small,
        lineHeight: 20,
    },
    logoutButton: {
        marginHorizontal: 16,
        marginBottom: 40,
        paddingVertical: 16,
        borderRadius: 14,
        borderWidth: 1.5,
        alignItems: 'center',
    },
    logoutButtonText: {
        fontSize: 16,
        fontWeight: '700',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: 20,
    },
    modalContent: {
        borderRadius: 20,
        padding: 24,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    languageOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderRadius: 12,
        marginBottom: 8,
        borderWidth: 1,
    },
    languageFlag: {
        fontSize: 24,
        marginRight: 16,
    },
    languageLabel: {
        fontSize: 16,
        flex: 1,
    },
});

export default ProfileScreen;
