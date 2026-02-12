// MediFlow Medicine Detail Screen
// Shows detailed information about a medicine

import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Alert,
    TouchableOpacity,
} from 'react-native';

// Components
import Card from '../components/common/Card';
import Button from '../components/common/Button';

// Theme
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

// Stores
import useMedicineStore from '../store/useMedicineStore';
import useReminderStore from '../store/useReminderStore';

// Constants
import TYPOGRAPHY from '../constants/typography';

const MedicineDetailScreen = ({ route, navigation }) => {
    const { medId } = route.params;
    const { getMedicineById, deleteMedicine, currentMedicine } = useMedicineStore();
    const { getRemindersByMedicine } = useReminderStore();
    const { colors } = useTheme();
    const { t } = useLanguage();

    const [medicine, setMedicine] = useState(null);
    const [reminders, setReminders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadMedicineDetails();
    }, [medId]);

    const loadMedicineDetails = async () => {
        setLoading(true);
        try {
            const med = await getMedicineById(medId);
            setMedicine(med);

            const rems = await getRemindersByMedicine(medId);
            setReminders(rems);
        } catch (error) {
            console.error('Error loading medicine details:', error);
            Alert.alert('Error', 'Failed to load medicine details');
        } finally {
            setLoading(false);
        }
    };



    const handleDelete = () => {
        Alert.alert(
            t('medicineDetail.deleteTitle'),
            t('medicineDetail.deleteMsg'),
            [
                { text: t('common.cancel'), style: 'cancel' },
                {
                    text: t('common.delete'),
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteMedicine(medId, medicine.user_id);
                            navigation.goBack();
                        } catch (error) {
                            Alert.alert(t('common.error'), 'Failed to delete medicine');
                        }
                    },
                },
            ]
        );
    };

    if (loading || !medicine) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={styles.loadingContainer}>
                    <Text style={{ color: colors.textSecondary }}>{t('common.loading')}</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView style={styles.scrollView}>
                {/* Medicine Header */}
                <Card style={styles.headerCard}>
                    <View style={styles.medicineHeader}>
                        <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
                            <Text style={styles.icon}>💊</Text>
                        </View>
                        <View style={styles.headerInfo}>
                            <Text style={[styles.medicineName, { color: colors.textPrimary }]}>{medicine.verified_name}</Text>
                            {medicine.brand_name && (
                                <Text style={[styles.brandName, { color: colors.textSecondary }]}>{medicine.brand_name}</Text>
                            )}
                            {medicine.category && (
                                <View style={[styles.categoryBadge, { backgroundColor: colors.primary + '20' }]}>
                                    <Text style={[styles.categoryText, { color: colors.primary }]}>{medicine.category}</Text>
                                </View>
                            )}
                        </View>
                    </View>
                </Card>

                {/* Medicine Information */}
                <Card style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>{t('addMedicine.sectionDetails')}</Text>

                    {medicine.generic_name && (
                        <InfoRow label={t('addMedicine.genericName')} value={medicine.generic_name} colors={colors} />
                    )}
                    {medicine.manufacturer && (
                        <InfoRow label={t('addMedicine.manufacturer')} value={medicine.manufacturer} colors={colors} />
                    )}
                    {medicine.form && (
                        <InfoRow label={t('addMedicine.form')} value={medicine.form} colors={colors} />
                    )}
                    {medicine.strength && (
                        <InfoRow label={t('addMedicine.strength')} value={medicine.strength} colors={colors} />
                    )}
                    {medicine.notes && (
                        <InfoRow label={t('addMedicine.notes')} value={medicine.notes} colors={colors} />
                    )}

                    <InfoRow
                        label={t('medicineDetail.source')}
                        value={medicine.api_source === 'manual' ? t('medicineDetail.manuallyAdded') : t('medicineDetail.openFDA')}
                        colors={colors}
                    />
                    <InfoRow
                        label={t('medicineDetail.addedOn')}
                        value={new Date(medicine.created_at).toLocaleDateString()}
                        colors={colors}
                    />
                </Card>

                {/* Reminders */}
                <Card style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>⏰ {t('home.reminders')} ({reminders.length})</Text>
                        <TouchableOpacity
                            onPress={() => navigation.navigate('ReminderSetup', { medId })}
                        >
                            <Text style={[styles.addButton, { color: colors.primary }]}>+ {t('common.add')}</Text>
                        </TouchableOpacity>
                    </View>

                    {reminders.length === 0 ? (
                        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{t('medicineDetail.noReminders')}</Text>
                    ) : (
                        reminders.map((reminder) => (
                            <View key={reminder.reminder_id} style={[styles.reminderItem, { borderBottomColor: colors.borderLight }]}>
                                <Text style={[styles.reminderTime, { color: colors.textPrimary }]}>🔔 {reminder.time}</Text>
                                <Text style={[styles.reminderFrequency, { color: colors.textSecondary }]}>
                                    {reminder.frequency_type === 'daily' ? t('medicineDetail.everyDay') : t('medicineDetail.customSchedule')}
                                </Text>
                            </View>
                        ))
                    )}
                </Card>

                {/* Medical Disclaimer */}
                <Card variant="outlined" style={[styles.disclaimerCard, { backgroundColor: colors.warning + '10', borderLeftColor: colors.warning }]}>
                    <Text style={[styles.disclaimerTitle, { color: colors.textPrimary }]}>⚠️ {t('profile.medicalDisclaimer')}</Text>
                    <Text style={[styles.disclaimerText, { color: colors.textSecondary }]}>
                        {t('profile.disclaimerText')}
                    </Text>
                </Card>

                {/* Actions */}
                <View style={styles.actions}>
                    <Button
                        title={t('navigation.setReminder')}
                        onPress={() => navigation.navigate('ReminderSetup', { medId })}
                        variant="primary"
                        size="large"
                        style={styles.actionButton}
                    />

                    <Button
                        title={t('medicineDetail.deleteTitle')}
                        onPress={handleDelete}
                        variant="danger"
                        size="large"
                        style={styles.actionButton}
                    />
                </View>
            </ScrollView>
        </View>
    );
};

// Helper component for info rows
const InfoRow = ({ label, value, colors }) => (
    <View style={[styles.infoRow, { borderBottomColor: colors.borderLight }]}>
        <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>{label}:</Text>
        <Text style={[styles.infoValue, { color: colors.textPrimary }]}>{value}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerCard: {
        margin: 16,
        marginBottom: 8,
    },
    medicineHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    icon: {
        fontSize: 32,
    },
    headerInfo: {
        flex: 1,
    },
    medicineName: {
        fontSize: TYPOGRAPHY.fontSize.h2,
        fontWeight: TYPOGRAPHY.fontWeight.bold,
        marginBottom: 4,
    },
    brandName: {
        fontSize: TYPOGRAPHY.fontSize.body,
        marginBottom: 8,
    },
    categoryBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    categoryText: {
        fontSize: TYPOGRAPHY.fontSize.small,
        fontWeight: TYPOGRAPHY.fontWeight.medium,
    },
    section: {
        margin: 16,
        marginTop: 8,
        marginBottom: 8,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: TYPOGRAPHY.fontSize.h3,
        fontWeight: TYPOGRAPHY.fontWeight.bold,
        marginBottom: 12,
    },
    addButton: {
        fontSize: TYPOGRAPHY.fontSize.body,
        fontWeight: TYPOGRAPHY.fontWeight.semiBold,
    },
    infoRow: {
        flexDirection: 'row',
        paddingVertical: 8,
        borderBottomWidth: 1,
    },
    infoLabel: {
        fontSize: TYPOGRAPHY.fontSize.body,
        width: 120,
    },
    infoValue: {
        flex: 1,
        fontSize: TYPOGRAPHY.fontSize.body,
        fontWeight: TYPOGRAPHY.fontWeight.medium,
    },
    reminderItem: {
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    reminderTime: {
        fontSize: TYPOGRAPHY.fontSize.body,
        fontWeight: TYPOGRAPHY.fontWeight.semiBold,
        marginBottom: 4,
    },
    reminderFrequency: {
        fontSize: TYPOGRAPHY.fontSize.small,
    },
    emptyText: {
        fontSize: TYPOGRAPHY.fontSize.body,
        textAlign: 'center',
        paddingVertical: 16,
    },
    disclaimerCard: {
        margin: 16,
        marginTop: 8,
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
    actions: {
        padding: 16,
        paddingTop: 8,
    },
    actionButton: {
        marginBottom: 12,
    },
});

export default MedicineDetailScreen;
