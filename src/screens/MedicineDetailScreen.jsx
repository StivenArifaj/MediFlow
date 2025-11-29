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

// Stores
import useMedicineStore from '../store/useMedicineStore';
import useReminderStore from '../store/useReminderStore';

// Constants
import COLORS from '../constants/colors';
import TYPOGRAPHY from '../constants/typography';

const MedicineDetailScreen = ({ route, navigation }) => {
    const { medId } = route.params;
    const { getMedicineById, deleteMedicine, currentMedicine } = useMedicineStore();
    const { getRemindersByMedicine } = useReminderStore();

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
            'Delete Medicine',
            'Are you sure you want to delete this medicine? This will also delete all associated reminders.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteMedicine(medId, medicine.user_id);
                            navigation.goBack();
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete medicine');
                        }
                    },
                },
            ]
        );
    };

    if (loading || !medicine) {
        return (
            <View style={styles.container}>
                <View style={styles.loadingContainer}>
                    <Text>Loading...</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView style={styles.scrollView}>
                {/* Medicine Header */}
                <Card style={styles.headerCard}>
                    <View style={styles.medicineHeader}>
                        <View style={styles.iconContainer}>
                            <Text style={styles.icon}>💊</Text>
                        </View>
                        <View style={styles.headerInfo}>
                            <Text style={styles.medicineName}>{medicine.verified_name}</Text>
                            {medicine.brand_name && (
                                <Text style={styles.brandName}>{medicine.brand_name}</Text>
                            )}
                            {medicine.category && (
                                <View style={styles.categoryBadge}>
                                    <Text style={styles.categoryText}>{medicine.category}</Text>
                                </View>
                            )}
                        </View>
                    </View>
                </Card>

                {/* Medicine Information */}
                <Card style={styles.section}>
                    <Text style={styles.sectionTitle}>Medicine Information</Text>

                    {medicine.generic_name && (
                        <InfoRow label="Generic Name" value={medicine.generic_name} />
                    )}
                    {medicine.manufacturer && (
                        <InfoRow label="Manufacturer" value={medicine.manufacturer} />
                    )}
                    {medicine.form && (
                        <InfoRow label="Form" value={medicine.form} />
                    )}
                    {medicine.strength && (
                        <InfoRow label="Strength" value={medicine.strength} />
                    )}
                    {medicine.notes && (
                        <InfoRow label="Notes" value={medicine.notes} />
                    )}

                    <InfoRow
                        label="Source"
                        value={medicine.api_source === 'manual' ? 'Manually Added' : 'OpenFDA Database'}
                    />
                    <InfoRow
                        label="Added On"
                        value={new Date(medicine.created_at).toLocaleDateString()}
                    />
                </Card>

                {/* Reminders */}
                <Card style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>⏰ Reminders ({reminders.length})</Text>
                        <TouchableOpacity
                            onPress={() => navigation.navigate('ReminderSetup', { medId })}
                        >
                            <Text style={styles.addButton}>+ Add</Text>
                        </TouchableOpacity>
                    </View>

                    {reminders.length === 0 ? (
                        <Text style={styles.emptyText}>No reminders set</Text>
                    ) : (
                        reminders.map((reminder) => (
                            <View key={reminder.reminder_id} style={styles.reminderItem}>
                                <Text style={styles.reminderTime}>🔔 {reminder.time}</Text>
                                <Text style={styles.reminderFrequency}>
                                    {reminder.frequency_type === 'daily' ? 'Every day' : 'Custom schedule'}
                                </Text>
                            </View>
                        ))
                    )}
                </Card>

                {/* Medical Disclaimer */}
                <Card variant="outlined" style={styles.disclaimerCard}>
                    <Text style={styles.disclaimerTitle}>⚠️ Important</Text>
                    <Text style={styles.disclaimerText}>
                        This app does NOT provide medical advice. Always consult your doctor or pharmacist for dosage, interactions, or health concerns.
                    </Text>
                </Card>

                {/* Actions */}
                <View style={styles.actions}>
                    <Button
                        title="Set Reminder"
                        onPress={() => navigation.navigate('ReminderSetup', { medId })}
                        variant="primary"
                        size="large"
                        style={styles.actionButton}
                    />

                    <Button
                        title="Delete Medicine"
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
const InfoRow = ({ label, value }) => (
    <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>{label}:</Text>
        <Text style={styles.infoValue}>{value}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.lightGray,
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
        backgroundColor: COLORS.primary + '20',
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
        color: COLORS.textPrimary,
        marginBottom: 4,
    },
    brandName: {
        fontSize: TYPOGRAPHY.fontSize.body,
        color: COLORS.textSecondary,
        marginBottom: 8,
    },
    categoryBadge: {
        alignSelf: 'flex-start',
        backgroundColor: COLORS.primary + '20',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    categoryText: {
        fontSize: TYPOGRAPHY.fontSize.small,
        color: COLORS.primary,
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
        color: COLORS.textPrimary,
        marginBottom: 12,
    },
    addButton: {
        fontSize: TYPOGRAPHY.fontSize.body,
        color: COLORS.primary,
        fontWeight: TYPOGRAPHY.fontWeight.semiBold,
    },
    infoRow: {
        flexDirection: 'row',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderLight,
    },
    infoLabel: {
        fontSize: TYPOGRAPHY.fontSize.body,
        color: COLORS.textSecondary,
        width: 120,
    },
    infoValue: {
        flex: 1,
        fontSize: TYPOGRAPHY.fontSize.body,
        color: COLORS.textPrimary,
        fontWeight: TYPOGRAPHY.fontWeight.medium,
    },
    reminderItem: {
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderLight,
    },
    reminderTime: {
        fontSize: TYPOGRAPHY.fontSize.body,
        fontWeight: TYPOGRAPHY.fontWeight.semiBold,
        color: COLORS.textPrimary,
        marginBottom: 4,
    },
    reminderFrequency: {
        fontSize: TYPOGRAPHY.fontSize.small,
        color: COLORS.textSecondary,
    },
    emptyText: {
        fontSize: TYPOGRAPHY.fontSize.body,
        color: COLORS.textSecondary,
        textAlign: 'center',
        paddingVertical: 16,
    },
    disclaimerCard: {
        margin: 16,
        marginTop: 8,
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
    actions: {
        padding: 16,
        paddingTop: 8,
    },
    actionButton: {
        marginBottom: 12,
    },
});

export default MedicineDetailScreen;
