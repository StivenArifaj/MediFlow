// MediFlow Home Screen - Modern Redesign
// Main dashboard with gradient header, medicine cards, and FAB

import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Pill, Camera, ChevronRight, Lightbulb, Calendar, Check, Clock } from 'lucide-react-native';

// Components
import Card from '../components/common/Card';
import FloatingActionButton from '../components/common/FloatingActionButton';
import EmptyState from '../components/common/EmptyState';

// Theme
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

// Stores
import useMedicineStore from '../store/useMedicineStore';
import useReminderStore from '../store/useReminderStore';
import useUserStore from '../store/useUserStore';
import notificationService from '../services/notificationService';

// Constants
import TYPOGRAPHY from '../constants/typography';

const HomeScreen = ({ navigation }) => {
    const [refreshing, setRefreshing] = useState(false);
    const { colors } = useTheme();
    const { t } = useLanguage();

    const { user } = useUserStore();
    const { medicines, loadMedicines } = useMedicineStore();
    const { reminders, loadReminders, getTodaysReminders } = useReminderStore();

    useEffect(() => {
        if (user?.user_id) {
            loadData();
        }

        // Listen for foreground notifications to refresh data
        const subscription = notificationService.addNotificationReceivedListener(() => {
            console.log('🔔 Notification received in foreground, refreshing data...');
            loadData();
        });

        return () => {
            notificationService.removeNotificationListener(subscription);
        };
    }, [user]);

    const loadData = async () => {
        if (!user?.user_id) return;

        try {
            await Promise.all([
                loadMedicines(user.user_id),
                loadReminders(user.user_id),
            ]);
        } catch (error) {
            console.error('Error loading data:', error);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    };

    const todaysReminders = getTodaysReminders();

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return t('home.goodMorning');
        if (hour < 18) return t('home.goodAfternoon');
        return t('home.goodEvening');
    };

    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView
                style={styles.scrollView}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                showsVerticalScrollIndicator={false}
            >
                {/* Gradient Hero Header */}
                <LinearGradient
                    colors={colors.gradientHero}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[styles.heroHeader, { paddingTop: insets.top + 20 }]}
                >
                    <View style={styles.headerContent}>
                        <View>
                            <Text style={styles.greeting}>{getGreeting()} 👋</Text>
                            <Text style={styles.userName}>{user?.name || 'User'}</Text>
                        </View>
                        <TouchableOpacity
                            style={styles.avatarContainer}
                            onPress={() => navigation.navigate('Profile')}
                        >
                            <Text style={styles.avatarText}>
                                {(user?.name || 'U').charAt(0).toUpperCase()}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Quick Stats */}
                    <View style={styles.statsContainer}>
                        <View style={styles.statCard}>
                            <Text style={styles.statValue}>{medicines.length}</Text>
                            <Text style={styles.statLabel}>{t('home.medicines')}</Text>
                        </View>
                        <View style={styles.statCard}>
                            <Text style={styles.statValue}>{todaysReminders.length}</Text>
                            <Text style={styles.statLabel}>{t('home.today')}</Text>
                        </View>
                        <View style={styles.statCard}>
                            <Text style={styles.statValue}>{reminders.length}</Text>
                            <Text style={styles.statLabel}>{t('home.reminders')}</Text>
                        </View>
                    </View>
                </LinearGradient>

                {/* Today's Reminders Section */}
                {todaysReminders.length > 0 && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Calendar size={20} color={colors.primary} style={{ marginRight: 8 }} />
                            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>{t('home.todaysSchedule')}</Text>
                        </View>
                        {todaysReminders.map((reminder) => (
                            <Card
                                key={reminder.reminder_id}
                                style={styles.reminderCard}
                                variant="elevated"
                            >
                                <View style={styles.reminderContent}>
                                    <View style={styles.reminderLeft}>
                                        <View style={[styles.timeContainer, { backgroundColor: colors.primaryLight + '20' }]}>
                                            <Text style={[styles.reminderTime, { color: colors.primary }]}>{reminder.time}</Text>
                                        </View>
                                        <View style={styles.reminderInfo}>
                                            <Text style={[styles.reminderMedicine, { color: colors.textPrimary }]}>
                                                Medicine #{reminder.med_id.slice(0, 8)}
                                            </Text>
                                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                <Clock size={12} color={colors.warning} style={{ marginRight: 4 }} />
                                                <Text style={[styles.reminderStatus, { color: colors.textSecondary }]}>{t('home.upcoming')}</Text>
                                            </View>
                                        </View>
                                    </View>
                                    <TouchableOpacity style={[styles.reminderAction, { backgroundColor: colors.success + '20' }]}>
                                        <Check size={20} color={colors.success} />
                                    </TouchableOpacity>
                                </View>
                            </Card>
                        ))}
                    </View>
                )}

                {/* My Medicines Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Pill size={20} color={colors.primary} style={{ marginRight: 8 }} />
                            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>{t('home.myMedicines')}</Text>
                        </View>
                        {medicines.length > 0 && (
                            <TouchableOpacity>
                                <Text style={[styles.seeAll, { color: colors.primary }]}>{t('home.seeAll')} →</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {medicines.length === 0 ? (
                        <EmptyState
                            icon={<Pill size={48} color={colors.textDisabled} />}
                            title={t('home.noMedicines')}
                            description={t('home.startScanning')}
                            actionText={t('navigation.addMedicine')}
                            onAction={() => navigation.navigate('AddMedicine')}
                        />
                    ) : (
                        <>
                            {medicines.slice(0, 5).map((medicine) => (
                                <Card
                                    key={medicine.med_id}
                                    style={styles.medicineCard}
                                    onPress={() => navigation.navigate('MedicineDetail', { medId: medicine.med_id })}
                                >
                                    <View style={styles.medicineContent}>
                                        <View style={[styles.medicineIcon, { backgroundColor: colors.primaryLight + '20' }]}>
                                            <Pill size={28} color={colors.primary} />
                                        </View>
                                        <View style={styles.medicineInfo}>
                                            <Text style={[styles.medicineName, { color: colors.textPrimary }]}>
                                                {medicine.verified_name}
                                            </Text>
                                            <View style={styles.medicineDetails}>
                                                {medicine.strength && (
                                                    <Text style={[styles.medicineStrength, { color: colors.textSecondary }]}>
                                                        {medicine.strength}
                                                    </Text>
                                                )}
                                                {medicine.form && (
                                                    <Text style={[styles.medicineForm, { color: colors.textDisabled }]}>
                                                        • {medicine.form}
                                                    </Text>
                                                )}
                                            </View>
                                        </View>
                                        <TouchableOpacity style={[styles.medicineAction, { backgroundColor: colors.backgroundAlt }]}>
                                            <ChevronRight size={20} color={colors.textSecondary} />
                                        </TouchableOpacity>
                                    </View>
                                </Card>
                            ))}

                            {medicines.length > 5 && (
                                <TouchableOpacity style={styles.viewAllButton}>
                                    <Text style={[styles.viewAllText, { color: colors.primary }]}>
                                        {t('home.viewAll').replace('{count}', medicines.length)} →
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </>
                    )}
                </View>

                {/* Health Tip Card */}
                <Card variant="gradient" gradientColors={colors.gradientSuccess} style={styles.tipCard}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                        <Lightbulb size={24} color="#FFFFFF" style={{ marginRight: 8 }} />
                        <Text style={styles.tipTitle}>{t('home.healthTip')}</Text>
                    </View>
                    <Text style={styles.tipText}>
                        {t('home.healthTipText')}
                    </Text>
                </Card>

                {/* Bottom Spacing for FAB */}
                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Floating Action Button */}
            <FloatingActionButton
                icon={<Camera size={24} color="#FFFFFF" />}
                onPress={() => navigation.navigate('ScanMedicine')}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    heroHeader: {
        paddingTop: 20,
        paddingBottom: 24,
        paddingHorizontal: 20,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    greeting: {
        fontSize: TYPOGRAPHY.fontSize.body,
        color: '#FFFFFF',
        opacity: 0.9,
        marginBottom: 4,
    },
    userName: {
        fontSize: TYPOGRAPHY.fontSize.h1,
        fontWeight: TYPOGRAPHY.fontWeight.bold,
        color: '#FFFFFF',
    },
    avatarContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    avatarText: {
        fontSize: 20,
        fontWeight: TYPOGRAPHY.fontWeight.bold,
        color: '#FFFFFF',
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    statCard: {
        flex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 16,
        padding: 16,
        marginHorizontal: 4,
        alignItems: 'center',
    },
    statValue: {
        fontSize: TYPOGRAPHY.fontSize.h1,
        fontWeight: TYPOGRAPHY.fontWeight.bold,
        color: '#FFFFFF',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: TYPOGRAPHY.fontSize.small,
        color: '#FFFFFF',
        opacity: 0.9,
    },
    section: {
        padding: 20,
        paddingTop: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: TYPOGRAPHY.fontSize.h2,
        fontWeight: TYPOGRAPHY.fontWeight.bold,
    },
    seeAll: {
        fontSize: TYPOGRAPHY.fontSize.body,
        fontWeight: TYPOGRAPHY.fontWeight.semiBold,
    },
    reminderCard: {
        marginBottom: 12,
    },
    reminderContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    reminderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    timeContainer: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
        marginRight: 12,
    },
    reminderTime: {
        fontSize: TYPOGRAPHY.fontSize.body,
        fontWeight: TYPOGRAPHY.fontWeight.bold,
    },
    reminderInfo: {
        flex: 1,
    },
    reminderMedicine: {
        fontSize: TYPOGRAPHY.fontSize.body,
        fontWeight: TYPOGRAPHY.fontWeight.semiBold,
        marginBottom: 4,
    },
    reminderStatus: {
        fontSize: TYPOGRAPHY.fontSize.small,
    },
    reminderAction: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    medicineCard: {
        marginBottom: 12,
    },
    medicineContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    medicineIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    medicineInfo: {
        flex: 1,
    },
    medicineName: {
        fontSize: TYPOGRAPHY.fontSize.body,
        fontWeight: TYPOGRAPHY.fontWeight.bold,
        marginBottom: 6,
    },
    medicineDetails: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    medicineStrength: {
        fontSize: TYPOGRAPHY.fontSize.small,
        marginRight: 8,
    },
    medicineForm: {
        fontSize: TYPOGRAPHY.fontSize.small,
    },
    medicineAction: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    viewAllButton: {
        paddingVertical: 16,
        alignItems: 'center',
    },
    viewAllText: {
        fontSize: TYPOGRAPHY.fontSize.body,
        fontWeight: TYPOGRAPHY.fontWeight.semiBold,
    },
    tipCard: {
        marginHorizontal: 20,
        marginBottom: 20,
    },
    tipTitle: {
        fontSize: TYPOGRAPHY.fontSize.h3,
        fontWeight: TYPOGRAPHY.fontWeight.bold,
        color: '#FFFFFF',
        marginBottom: 8,
    },
    tipText: {
        fontSize: TYPOGRAPHY.fontSize.body,
        color: '#FFFFFF',
        lineHeight: 22,
        opacity: 0.95,
    },
});

export default HomeScreen;
