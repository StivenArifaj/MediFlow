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

// Stores
import useMedicineStore from '../store/useMedicineStore';
import useReminderStore from '../store/useReminderStore';
import useUserStore from '../store/useUserStore';
import notificationService from '../services/notificationService';

// Constants
import COLORS from '../constants/colors';
import TYPOGRAPHY from '../constants/typography';

const HomeScreen = ({ navigation }) => {
    const [refreshing, setRefreshing] = useState(false);

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
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    const insets = useSafeAreaInsets();

    return (
        <View style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                showsVerticalScrollIndicator={false}
            >
                {/* Gradient Hero Header */}
                <LinearGradient
                    colors={COLORS.gradientHero}
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
                            <Text style={styles.statLabel}>Medicines</Text>
                        </View>
                        <View style={styles.statCard}>
                            <Text style={styles.statValue}>{todaysReminders.length}</Text>
                            <Text style={styles.statLabel}>Today</Text>
                        </View>
                        <View style={styles.statCard}>
                            <Text style={styles.statValue}>{reminders.length}</Text>
                            <Text style={styles.statLabel}>Reminders</Text>
                        </View>
                    </View>
                </LinearGradient>

                {/* Today's Reminders Section */}
                {todaysReminders.length > 0 && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Calendar size={20} color={COLORS.primary} style={{ marginRight: 8 }} />
                            <Text style={styles.sectionTitle}>Today's Schedule</Text>
                        </View>
                        {todaysReminders.map((reminder) => (
                            <Card
                                key={reminder.reminder_id}
                                style={styles.reminderCard}
                                variant="elevated"
                            >
                                <View style={styles.reminderContent}>
                                    <View style={styles.reminderLeft}>
                                        <View style={styles.timeContainer}>
                                            <Text style={styles.reminderTime}>{reminder.time}</Text>
                                        </View>
                                        <View style={styles.reminderInfo}>
                                            <Text style={styles.reminderMedicine}>
                                                Medicine #{reminder.med_id.slice(0, 8)}
                                            </Text>
                                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                <Clock size={12} color={COLORS.warning} style={{ marginRight: 4 }} />
                                                <Text style={styles.reminderStatus}>Upcoming</Text>
                                            </View>
                                        </View>
                                    </View>
                                    <TouchableOpacity style={styles.reminderAction}>
                                        <Check size={20} color={COLORS.success} />
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
                            <Pill size={20} color={COLORS.primary} style={{ marginRight: 8 }} />
                            <Text style={styles.sectionTitle}>My Medicines</Text>
                        </View>
                        {medicines.length > 0 && (
                            <TouchableOpacity>
                                <Text style={styles.seeAll}>See All →</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {medicines.length === 0 ? (
                        <EmptyState
                            icon={<Pill size={48} color={COLORS.textDisabled} />}
                            title="No medicines yet"
                            description="Start by scanning or adding your first medicine"
                            actionText="Add Medicine"
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
                                        <View style={styles.medicineIcon}>
                                            <Pill size={28} color={COLORS.primary} />
                                        </View>
                                        <View style={styles.medicineInfo}>
                                            <Text style={styles.medicineName}>
                                                {medicine.verified_name}
                                            </Text>
                                            <View style={styles.medicineDetails}>
                                                {medicine.strength && (
                                                    <Text style={styles.medicineStrength}>
                                                        {medicine.strength}
                                                    </Text>
                                                )}
                                                {medicine.form && (
                                                    <Text style={styles.medicineForm}>
                                                        • {medicine.form}
                                                    </Text>
                                                )}
                                            </View>
                                        </View>
                                        <TouchableOpacity style={styles.medicineAction}>
                                            <ChevronRight size={20} color={COLORS.textSecondary} />
                                        </TouchableOpacity>
                                    </View>
                                </Card>
                            ))}

                            {medicines.length > 5 && (
                                <TouchableOpacity style={styles.viewAllButton}>
                                    <Text style={styles.viewAllText}>
                                        View All {medicines.length} Medicines →
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </>
                    )}
                </View>

                {/* Health Tip Card */}
                <Card variant="gradient" gradientColors={COLORS.gradientSuccess} style={styles.tipCard}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                        <Lightbulb size={24} color={COLORS.white} style={{ marginRight: 8 }} />
                        <Text style={styles.tipTitle}>Health Tip</Text>
                    </View>
                    <Text style={styles.tipText}>
                        Take your medicines at the same time each day to build a consistent routine
                    </Text>
                </Card>

                {/* Bottom Spacing for FAB */}
                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Floating Action Button */}
            <FloatingActionButton
                icon={<Camera size={24} color={COLORS.white} />}
                onPress={() => navigation.navigate('ScanMedicine')}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
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
        color: COLORS.white,
        opacity: 0.9,
        marginBottom: 4,
    },
    userName: {
        fontSize: TYPOGRAPHY.fontSize.h1,
        fontWeight: TYPOGRAPHY.fontWeight.bold,
        color: COLORS.white,
    },
    avatarContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: COLORS.white,
    },
    avatarText: {
        fontSize: 20,
        fontWeight: TYPOGRAPHY.fontWeight.bold,
        color: COLORS.white,
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
        color: COLORS.white,
        marginBottom: 4,
    },
    statLabel: {
        fontSize: TYPOGRAPHY.fontSize.small,
        color: COLORS.white,
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
        color: COLORS.textPrimary,
    },
    seeAll: {
        fontSize: TYPOGRAPHY.fontSize.body,
        color: COLORS.primary,
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
        backgroundColor: COLORS.primaryLight + '20',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
        marginRight: 12,
    },
    reminderTime: {
        fontSize: TYPOGRAPHY.fontSize.body,
        fontWeight: TYPOGRAPHY.fontWeight.bold,
        color: COLORS.primary,
    },
    reminderInfo: {
        flex: 1,
    },
    reminderMedicine: {
        fontSize: TYPOGRAPHY.fontSize.body,
        fontWeight: TYPOGRAPHY.fontWeight.semiBold,
        color: COLORS.textPrimary,
        marginBottom: 4,
    },
    reminderStatus: {
        fontSize: TYPOGRAPHY.fontSize.small,
        color: COLORS.textSecondary,
    },
    reminderAction: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.success + '20',
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionIcon: {
        fontSize: 20,
        color: COLORS.success,
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
        backgroundColor: COLORS.primaryLight + '20',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    medicineEmoji: {
        fontSize: 28,
    },
    medicineInfo: {
        flex: 1,
    },
    medicineName: {
        fontSize: TYPOGRAPHY.fontSize.body,
        fontWeight: TYPOGRAPHY.fontWeight.bold,
        color: COLORS.textPrimary,
        marginBottom: 6,
    },
    medicineDetails: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    medicineStrength: {
        fontSize: TYPOGRAPHY.fontSize.small,
        color: COLORS.textSecondary,
        marginRight: 8,
    },
    medicineForm: {
        fontSize: TYPOGRAPHY.fontSize.small,
        color: COLORS.textDisabled,
    },
    medicineAction: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: COLORS.backgroundAlt,
        justifyContent: 'center',
        alignItems: 'center',
    },
    viewAllButton: {
        paddingVertical: 16,
        alignItems: 'center',
    },
    viewAllText: {
        fontSize: TYPOGRAPHY.fontSize.body,
        color: COLORS.primary,
        fontWeight: TYPOGRAPHY.fontWeight.semiBold,
    },
    tipCard: {
        marginHorizontal: 20,
        marginBottom: 20,
    },
    tipIcon: {
        fontSize: 32,
        marginBottom: 12,
    },
    tipTitle: {
        fontSize: TYPOGRAPHY.fontSize.h3,
        fontWeight: TYPOGRAPHY.fontWeight.bold,
        color: COLORS.white,
        marginBottom: 8,
    },
    tipText: {
        fontSize: TYPOGRAPHY.fontSize.body,
        color: COLORS.white,
        lineHeight: 22,
        opacity: 0.95,
    },
});

export default HomeScreen;
