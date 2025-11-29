// MediFlow Profile Screen
// User profile and app settings

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
} from 'react-native';


// Components
import Card from '../components/common/Card';
import Button from '../components/common/Button';

// Stores
import useUserStore from '../store/useUserStore';
import useMedicineStore from '../store/useMedicineStore';

// Constants
import COLORS from '../constants/colors';
import TYPOGRAPHY from '../constants/typography';
import CONFIG from '../constants/config';

const ProfileScreen = () => {
    const { user, isPremium } = useUserStore();
    const { getMedicineCount } = useMedicineStore();

    const medicineCount = getMedicineCount();
    const isUserPremium = isPremium();

    const handleClearData = () => {
        Alert.alert(
            'Clear All Data',
            'Are you sure you want to clear all your data? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Clear',
                    style: 'destructive',
                    onPress: () => {
                        // TODO: Implement clear data
                        Alert.alert('Info', 'Clear data functionality coming soon');
                    },
                },
            ]
        );
    };

    const handleExportData = () => {
        Alert.alert('Info', 'Export data functionality coming soon');
    };

    return (
        <View style={styles.container}>
            <ScrollView style={styles.scrollView}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.avatarContainer}>
                        <Text style={styles.avatarText}>
                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                        </Text>
                    </View>
                    <Text style={styles.userName}>{user?.name || 'User'}</Text>
                    {user?.email && (
                        <Text style={styles.userEmail}>{user.email}</Text>
                    )}
                    {isUserPremium && (
                        <View style={styles.premiumBadge}>
                            <Text style={styles.premiumText}>⭐ Premium</Text>
                        </View>
                    )}
                </View>

                {/* Account Stats */}
                <Card style={styles.statsCard}>
                    <Text style={styles.sectionTitle}>Account Stats</Text>
                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{medicineCount}</Text>
                            <Text style={styles.statLabel}>Medicines</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>
                                {isUserPremium ? '∞' : `${CONFIG.FREE_MEDICINE_LIMIT - medicineCount}`}
                            </Text>
                            <Text style={styles.statLabel}>Remaining</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>
                                {new Date(user?.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                            </Text>
                            <Text style={styles.statLabel}>Member Since</Text>
                        </View>
                    </View>
                </Card>

                {/* Premium Upgrade */}
                {!isUserPremium && (
                    <Card style={styles.premiumCard}>
                        <Text style={styles.premiumCardTitle}>🌟 Upgrade to Premium</Text>
                        <Text style={styles.premiumCardText}>
                            • Unlimited medicines{'\n'}
                            • Cloud sync across devices{'\n'}
                            • Advanced analytics{'\n'}
                            • Priority support{'\n'}
                            • Ad-free experience
                        </Text>
                        <Button
                            title="Upgrade Now - $4.99/month"
                            onPress={() => Alert.alert('Info', 'Premium upgrade coming soon!')}
                            variant="primary"
                            size="medium"
                            style={styles.upgradeButton}
                        />
                    </Card>
                )}

                {/* App Settings */}
                <Card style={styles.section}>
                    <Text style={styles.sectionTitle}>App Settings</Text>

                    <SettingItem
                        icon="🌙"
                        label="Theme"
                        value="Light"
                        onPress={() => Alert.alert('Info', 'Theme settings coming soon')}
                    />

                    <SettingItem
                        icon="🔔"
                        label="Notifications"
                        value="Enabled"
                        onPress={() => Alert.alert('Info', 'Notification settings coming soon')}
                    />

                    <SettingItem
                        icon="🔒"
                        label="Privacy"
                        value="Settings"
                        onPress={() => Alert.alert('Info', 'Privacy settings coming soon')}
                    />
                </Card>

                {/* Data & Storage */}
                <Card style={styles.section}>
                    <Text style={styles.sectionTitle}>Data & Storage</Text>

                    <SettingItem
                        icon="📤"
                        label="Export My Data"
                        onPress={handleExportData}
                    />

                    <SettingItem
                        icon="🗑️"
                        label="Clear All Data"
                        onPress={handleClearData}
                        danger
                    />
                </Card>

                {/* About */}
                <Card style={styles.section}>
                    <Text style={styles.sectionTitle}>About</Text>

                    <SettingItem
                        icon="ℹ️"
                        label="Help & Support"
                        onPress={() => Alert.alert('Info', 'Help & Support coming soon')}
                    />

                    <SettingItem
                        icon="📜"
                        label="Privacy Policy"
                        onPress={() => Alert.alert('Info', 'Privacy Policy coming soon')}
                    />

                    <SettingItem
                        icon="📋"
                        label="Terms of Service"
                        onPress={() => Alert.alert('Info', 'Terms of Service coming soon')}
                    />

                    <SettingItem
                        icon="⭐"
                        label="Rate MediFlow"
                        onPress={() => Alert.alert('Info', 'Rate MediFlow coming soon')}
                    />

                    <View style={styles.versionContainer}>
                        <Text style={styles.versionText}>
                            Version {CONFIG.APP_VERSION}
                        </Text>
                    </View>
                </Card>

                {/* Medical Disclaimer */}
                <Card variant="outlined" style={styles.disclaimerCard}>
                    <Text style={styles.disclaimerTitle}>⚠️ Medical Disclaimer</Text>
                    <Text style={styles.disclaimerText}>
                        MediFlow is a medication organization tool only. We do NOT provide medical advice, dosage recommendations, or diagnoses. Always consult your doctor or pharmacist for all medical questions.
                    </Text>
                </Card>
            </ScrollView>
        </View>
    );
};

// Helper component for setting items
const SettingItem = ({ icon, label, value, onPress, danger = false }) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
        <View style={styles.settingLeft}>
            <Text style={styles.settingIcon}>{icon}</Text>
            <Text style={[styles.settingLabel, danger ? styles.settingLabelDanger : null]}>
                {label}
            </Text>
        </View>
        {value ? <Text style={styles.settingValue}>{value}</Text> : null}
        <Text style={styles.settingArrow}>›</Text>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.lightGray,
    },
    scrollView: {
        flex: 1,
    },
    header: {
        backgroundColor: COLORS.white,
        padding: 32,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    avatarContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    avatarText: {
        fontSize: 36,
        fontWeight: TYPOGRAPHY.fontWeight.bold,
        color: COLORS.white,
    },
    userName: {
        fontSize: TYPOGRAPHY.fontSize.h2,
        fontWeight: TYPOGRAPHY.fontWeight.bold,
        color: COLORS.textPrimary,
        marginBottom: 4,
    },
    userEmail: {
        fontSize: TYPOGRAPHY.fontSize.body,
        color: COLORS.textSecondary,
        marginBottom: 12,
    },
    premiumBadge: {
        backgroundColor: COLORS.warning + '20',
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 16,
    },
    premiumText: {
        fontSize: TYPOGRAPHY.fontSize.small,
        fontWeight: TYPOGRAPHY.fontWeight.semiBold,
        color: COLORS.warning,
    },
    statsCard: {
        margin: 16,
    },
    sectionTitle: {
        fontSize: TYPOGRAPHY.fontSize.h3,
        fontWeight: TYPOGRAPHY.fontWeight.bold,
        color: COLORS.textPrimary,
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
        color: COLORS.primary,
        marginBottom: 4,
    },
    statLabel: {
        fontSize: TYPOGRAPHY.fontSize.small,
        color: COLORS.textSecondary,
    },
    premiumCard: {
        margin: 16,
        marginTop: 0,
        backgroundColor: COLORS.primary + '05',
        borderLeftWidth: 4,
        borderLeftColor: COLORS.primary,
    },
    premiumCardTitle: {
        fontSize: TYPOGRAPHY.fontSize.h3,
        fontWeight: TYPOGRAPHY.fontWeight.bold,
        color: COLORS.textPrimary,
        marginBottom: 12,
    },
    premiumCardText: {
        fontSize: TYPOGRAPHY.fontSize.body,
        color: COLORS.textSecondary,
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
        borderBottomColor: COLORS.borderLight,
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
        color: COLORS.textPrimary,
    },
    settingLabelDanger: {
        color: COLORS.error,
    },
    settingValue: {
        fontSize: TYPOGRAPHY.fontSize.body,
        color: COLORS.textSecondary,
        marginRight: 8,
    },
    settingArrow: {
        fontSize: 24,
        color: COLORS.textDisabled,
    },
    versionContainer: {
        paddingTop: 16,
        alignItems: 'center',
    },
    versionText: {
        fontSize: TYPOGRAPHY.fontSize.small,
        color: COLORS.textDisabled,
    },
    disclaimerCard: {
        margin: 16,
        marginTop: 0,
        marginBottom: 32,
        backgroundColor: COLORS.warning + '10',
        borderLeftWidth: 4,
        borderLeftColor: COLORS.warning,
    },
    disclaimerTitle: {
        fontSize: TYPOGRAPHY.fontSize.body,
        fontWeight: TYPOGRAPHY.fontWeight.bold,
        color: COLORS.textPrimary,
        marginBottom: 8,
    },
    disclaimerText: {
        fontSize: TYPOGRAPHY.fontSize.small,
        color: COLORS.textSecondary,
        lineHeight: 20,
    },
});

export default ProfileScreen;
