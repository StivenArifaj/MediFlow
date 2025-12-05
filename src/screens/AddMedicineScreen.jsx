// MediFlow Add Medicine Screen
// Manual medicine entry form (OCR will be added in Phase 2)

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Alert,
    TouchableOpacity,
    Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Clock, X, CheckCircle, Edit, Pill, Building2, FlaskConical, Package } from 'lucide-react-native';

// Components
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Card from '../components/common/Card';

// Stores
import useMedicineStore from '../store/useMedicineStore';
import useUserStore from '../store/useUserStore';

// Constants
import COLORS from '../constants/colors';
import TYPOGRAPHY from '../constants/typography';
import CONFIG from '../constants/config';

const AddMedicineScreen = ({ navigation, route }) => {
    const { user } = useUserStore();
    const { addMedicine, isLimitReached } = useMedicineStore();

    // Get scanned data from route params if available
    const scannedData = route?.params?.scannedData || {};
    const photoUri = route?.params?.photoUri || null;

    // Debug: Log received data
    console.log('📥 AddMedicineScreen received scannedData:', scannedData);
    console.log('📸 Photo URI:', photoUri);

    const [formData, setFormData] = useState({
        verified_name: scannedData.verified_name || '',
        brand_name: scannedData.brand_name || '',
        generic_name: scannedData.generic_name || '',
        manufacturer: scannedData.manufacturer || '',
        strength: scannedData.strength || '',
        form: scannedData.form || 'Tablet',
        category: scannedData.category || '',
        notes: '',
        api_source: scannedData.api_source || 'manual',
    });

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    // Confirmation mode - show when data is auto-filled from scan
    const [confirmationMode, setConfirmationMode] = useState(
        !!(scannedData.verified_name || scannedData.api_source === 'openfda')
    );

    // Time picker state
    const [reminderTimes, setReminderTimes] = useState([]);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [tempTime, setTempTime] = useState(new Date());

    // Update form data when scannedData changes (fixes caching issue)
    useEffect(() => {
        console.log('🔄 Route params changed, updating form data');

        if (scannedData && Object.keys(scannedData).length > 0) {
            setFormData({
                verified_name: scannedData.verified_name || '',
                brand_name: scannedData.brand_name || '',
                generic_name: scannedData.generic_name || '',
                manufacturer: scannedData.manufacturer || '',
                strength: scannedData.strength || '',
                form: scannedData.form || 'Tablet',
                category: scannedData.category || '',
                notes: '',
                api_source: scannedData.api_source || 'manual',
            });

            // Show confirmation mode if data was scanned
            setConfirmationMode(!!(scannedData.verified_name || scannedData.api_source === 'openfda'));
        } else {
            // Reset to empty form for manual entry
            setConfirmationMode(false);
        }
    }, [route?.params?.scannedData]);

    const validateForm = () => {
        const newErrors = {};

        if (!formData.verified_name.trim()) {
            newErrors.verified_name = 'Medicine name is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            return;
        }

        // Check medicine limit for free users
        if (!user.is_premium && isLimitReached(CONFIG.FREE_MEDICINE_LIMIT)) {
            Alert.alert(
                'Medicine Limit Reached',
                `Free users can add up to ${CONFIG.FREE_MEDICINE_LIMIT} medicines. Upgrade to Premium for unlimited medicines!`,
                [{ text: 'OK' }]
            );
            return;
        }

        setLoading(true);

        try {
            const medId = await addMedicine(user.user_id, {
                ...formData,
                api_source: 'manual',
            });

            Alert.alert(
                'Success!',
                'Medicine added successfully',
                [
                    {
                        text: 'Set Reminder',
                        onPress: () => navigation.navigate('ReminderSetup', { medId }),
                    },
                    {
                        text: 'Done',
                        onPress: () => navigation.goBack(),
                    },
                ]
            );
        } catch (error) {
            Alert.alert('Error', 'Failed to add medicine. Please try again.');
            console.error('Error adding medicine:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateField = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: null }));
        }
    };

    const handleTimeChange = (event, selectedDate) => {
        if (Platform.OS === 'android') {
            setShowTimePicker(false);
        }
        if (selectedDate) {
            setTempTime(selectedDate);
            if (Platform.OS === 'android') {
                addReminderTime(selectedDate);
            }
        }
    };

    const addReminderTime = (date) => {
        const timeString = date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });
        if (!reminderTimes.includes(timeString)) {
            setReminderTimes([...reminderTimes, timeString]);
        }
        setShowTimePicker(false);
    };

    const removeReminderTime = (time) => {
        setReminderTimes(reminderTimes.filter(t => t !== time));
    };

    return (
        <View style={styles.container}>
            <ScrollView style={styles.scrollView}>
                {confirmationMode ? (
                    // Confirmation Screen - Show when medicine is scanned
                    <>
                        <Card style={styles.successCard}>
                            <View style={styles.successHeader}>
                                <CheckCircle size={48} color={COLORS.success} />
                                <Text style={styles.successTitle}>Medicine Scanned Successfully!</Text>
                                <Text style={styles.successSubtitle}>Review the information below</Text>
                            </View>
                        </Card>

                        <View style={styles.confirmationContent}>
                            {/* Medicine Name */}
                            <Card style={styles.dataCard}>
                                <View style={styles.dataRow}>
                                    <Pill size={24} color={COLORS.primary} />
                                    <View style={styles.dataInfo}>
                                        <Text style={styles.dataLabel}>Medicine Name</Text>
                                        <Text style={styles.dataValue}>{formData.verified_name || 'Not detected'}</Text>
                                    </View>
                                </View>
                            </Card>

                            {/* Strength & Form */}
                            {(formData.strength || formData.form) && (
                                <Card style={styles.dataCard}>
                                    <View style={styles.dataRow}>
                                        <Package size={24} color={COLORS.secondary} />
                                        <View style={styles.dataInfo}>
                                            <Text style={styles.dataLabel}>Dosage & Form</Text>
                                            <Text style={styles.dataValue}>
                                                {formData.strength || 'N/A'} • {formData.form}
                                            </Text>
                                        </View>
                                    </View>
                                </Card>
                            )}

                            {/* Manufacturer */}
                            {formData.manufacturer && (
                                <Card style={styles.dataCard}>
                                    <View style={styles.dataRow}>
                                        <Building2 size={24} color={COLORS.warning} />
                                        <View style={styles.dataInfo}>
                                            <Text style={styles.dataLabel}>Manufacturer</Text>
                                            <Text style={styles.dataValue}>{formData.manufacturer}</Text>
                                        </View>
                                    </View>
                                </Card>
                            )}

                            {/* Scientific Name */}
                            {formData.generic_name && (
                                <Card style={styles.dataCard}>
                                    <View style={styles.dataRow}>
                                        <FlaskConical size={24} color={COLORS.primary} />
                                        <View style={styles.dataInfo}>
                                            <Text style={styles.dataLabel}>Scientific Name</Text>
                                            <Text style={styles.dataValue}>{formData.generic_name}</Text>
                                        </View>
                                    </View>
                                </Card>
                            )}

                            {/* Category */}
                            {formData.category && (
                                <Card style={styles.dataCard}>
                                    <View style={styles.dataRow}>
                                        <View style={styles.categoryBadge}>
                                            <Text style={styles.categoryText}>{formData.category}</Text>
                                        </View>
                                    </View>
                                </Card>
                            )}

                            {/* Action Buttons */}
                            <View style={styles.confirmationActions}>
                                <TouchableOpacity
                                    style={styles.editButton}
                                    onPress={() => setConfirmationMode(false)}
                                >
                                    <Edit size={20} color={COLORS.primary} />
                                    <Text style={styles.editButtonText}>Edit Details</Text>
                                </TouchableOpacity>

                                <Button
                                    title="Looks Good - Save"
                                    onPress={handleSubmit}
                                    loading={loading}
                                    variant="primary"
                                    size="large"
                                    style={styles.confirmButton}
                                />
                            </View>
                        </View>
                    </>
                ) : (
                    // Original Form - Show for manual entry or when editing
                    <>
                        <Card style={styles.infoCard}>
                            <Text style={styles.infoText}>
                                ℹ️ Enter your medicine details manually. You can also search our database or scan the medicine box (coming soon).
                            </Text>
                        </Card>

                        <View style={styles.form}>
                            <Text style={styles.sectionTitle}>Basic Information</Text>

                            <Input
                                label="Medicine Name *"
                                value={formData.verified_name}
                                onChangeText={(value) => updateField('verified_name', value)}
                                placeholder="e.g., Aspirin"
                                error={errors.verified_name}
                                maxLength={100}
                            />

                            <Input
                                label="Brand Name"
                                value={formData.brand_name}
                                onChangeText={(value) => updateField('brand_name', value)}
                                placeholder="e.g., Bayer"
                                maxLength={100}
                            />

                            <Input
                                label="Scientific Name (Optional)"
                                value={formData.generic_name}
                                onChangeText={(value) => updateField('generic_name', value)}
                                placeholder="e.g., Acetylsalicylic Acid"
                                maxLength={100}
                            />

                            <Input
                                label="Manufacturer"
                                value={formData.manufacturer}
                                onChangeText={(value) => updateField('manufacturer', value)}
                                placeholder="e.g., Bayer AG"
                                maxLength={100}
                            />

                            <Text style={styles.sectionTitle}>Dosage Information</Text>

                            <Input
                                label="Strength/Dosage"
                                value={formData.strength}
                                onChangeText={(value) => updateField('strength', value)}
                                placeholder="e.g., 500mg"
                                maxLength={50}
                            />

                            {/* Form Type Selector */}
                            <Text style={styles.label}>Form Type</Text>
                            <View style={styles.formTypeContainer}>
                                {CONFIG.MEDICINE_FORMS.slice(0, 6).map((form) => (
                                    <TouchableOpacity
                                        key={form}
                                        style={[
                                            styles.formTypeButton,
                                            formData.form === form ? styles.formTypeButtonActive : null,
                                        ]}
                                        onPress={() => updateField('form', form)}
                                    >
                                        <Text
                                            style={[
                                                styles.formTypeText,
                                                formData.form === form ? styles.formTypeTextActive : null,
                                            ]}
                                        >
                                            {form}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <Text style={styles.sectionTitle}>Additional Details</Text>

                            <Input
                                label="Category"
                                value={formData.category}
                                onChangeText={(value) => updateField('category', value)}
                                placeholder="e.g., Pain Relief, Antibiotic"
                                maxLength={50}
                            />

                            <Input
                                label="Notes"
                                value={formData.notes}
                                onChangeText={(value) => updateField('notes', value)}
                                placeholder="Any additional notes..."
                                multiline
                                numberOfLines={4}
                                maxLength={500}
                            />

                            <Text style={styles.sectionTitle}>Reminder Times (Optional)</Text>
                            <Text style={styles.helperText}>Set reminder times now, or add them later</Text>

                            <TouchableOpacity
                                style={styles.addTimeButton}
                                onPress={() => setShowTimePicker(true)}
                            >
                                <Clock size={20} color={COLORS.primary} />
                                <Text style={styles.addTimeText}>Add Reminder Time</Text>
                            </TouchableOpacity>

                            {reminderTimes.length > 0 && (
                                <View style={styles.timesContainer}>
                                    {reminderTimes.map((time, index) => (
                                        <View key={index} style={styles.timeChip}>
                                            <Text style={styles.timeChipText}>{time}</Text>
                                            <TouchableOpacity onPress={() => removeReminderTime(time)}>
                                                <X size={16} color={COLORS.textSecondary} />
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                </View>
                            )}

                            {showTimePicker && (
                                <DateTimePicker
                                    value={tempTime}
                                    mode="time"
                                    is24Hour={false}
                                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                    onChange={handleTimeChange}
                                />
                            )}

                            <Card variant="outlined" style={styles.disclaimerCard}>
                                <Text style={styles.disclaimerTitle}>⚠️ Important</Text>
                                <Text style={styles.disclaimerText}>
                                    This app does NOT provide medical advice. Always consult your doctor or pharmacist for dosage, interactions, or health concerns.
                                </Text>
                            </Card>

                            <Button
                                title="Add Medicine"
                                onPress={handleSubmit}
                                loading={loading}
                                variant="primary"
                                size="large"
                                style={styles.submitButton}
                            />
                        </View>
                    </>
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.lightGray,
    },
    scrollView: {
        flex: 1,
    },
    infoCard: {
        margin: 16,
        backgroundColor: COLORS.primary + '10',
        borderLeftWidth: 4,
        borderLeftColor: COLORS.primary,
    },
    infoText: {
        fontSize: TYPOGRAPHY.fontSize.small,
        color: COLORS.textSecondary,
        lineHeight: 20,
    },
    form: {
        padding: 16,
    },
    sectionTitle: {
        fontSize: TYPOGRAPHY.fontSize.h3,
        fontWeight: TYPOGRAPHY.fontWeight.bold,
        color: COLORS.textPrimary,
        marginTop: 16,
        marginBottom: 12,
    },
    label: {
        fontSize: TYPOGRAPHY.fontSize.small,
        fontWeight: TYPOGRAPHY.fontWeight.medium,
        color: COLORS.textPrimary,
        marginBottom: 8,
        marginTop: 8,
    },
    formTypeContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 16,
    },
    formTypeButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: COLORS.border,
        backgroundColor: COLORS.white,
        marginRight: 8,
        marginBottom: 8,
    },
    formTypeButtonActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    formTypeText: {
        fontSize: TYPOGRAPHY.fontSize.small,
        color: COLORS.textSecondary,
    },
    formTypeTextActive: {
        color: COLORS.white,
        fontWeight: TYPOGRAPHY.fontWeight.semiBold,
    },
    disclaimerCard: {
        marginTop: 16,
        marginBottom: 16,
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
    submitButton: {
        marginTop: 8,
        marginBottom: 32,
    },
    helperText: {
        fontSize: TYPOGRAPHY.fontSize.small,
        color: COLORS.textSecondary,
        marginBottom: 12,
    },
    addTimeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: COLORS.primary,
        borderStyle: 'dashed',
        backgroundColor: COLORS.primary + '05',
        marginBottom: 16,
    },
    addTimeText: {
        fontSize: TYPOGRAPHY.fontSize.body,
        fontWeight: TYPOGRAPHY.fontWeight.semiBold,
        color: COLORS.primary,
        marginLeft: 8,
    },
    timesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 16,
    },
    timeChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.primary,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 8,
        marginBottom: 8,
    },
    timeChipText: {
        fontSize: TYPOGRAPHY.fontSize.small,
        fontWeight: TYPOGRAPHY.fontWeight.semiBold,
        color: COLORS.white,
        marginRight: 8,
    },
    // Confirmation Screen Styles
    successCard: {
        margin: 16,
        backgroundColor: COLORS.success + '10',
        borderLeftWidth: 4,
        borderLeftColor: COLORS.success,
    },
    successHeader: {
        alignItems: 'center',
        padding: 8,
    },
    successTitle: {
        fontSize: TYPOGRAPHY.fontSize.h2,
        fontWeight: TYPOGRAPHY.fontWeight.bold,
        color: COLORS.textPrimary,
        marginTop: 12,
    },
    successSubtitle: {
        fontSize: TYPOGRAPHY.fontSize.body,
        color: COLORS.textSecondary,
        marginTop: 4,
    },
    confirmationContent: {
        padding: 16,
    },
    dataCard: {
        marginBottom: 12,
        padding: 16,
    },
    dataRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dataInfo: {
        marginLeft: 12,
        flex: 1,
    },
    dataLabel: {
        fontSize: TYPOGRAPHY.fontSize.small,
        color: COLORS.textSecondary,
        marginBottom: 4,
    },
    dataValue: {
        fontSize: TYPOGRAPHY.fontSize.h3,
        fontWeight: TYPOGRAPHY.fontWeight.semiBold,
        color: COLORS.textPrimary,
    },
    categoryBadge: {
        backgroundColor: COLORS.primary + '20',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    categoryText: {
        fontSize: TYPOGRAPHY.fontSize.body,
        fontWeight: TYPOGRAPHY.fontWeight.semiBold,
        color: COLORS.primary,
    },
    confirmationActions: {
        marginTop: 24,
    },
    editButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: COLORS.primary,
        backgroundColor: COLORS.white,
        marginBottom: 12,
    },
    editButtonText: {
        fontSize: TYPOGRAPHY.fontSize.body,
        fontWeight: TYPOGRAPHY.fontWeight.semiBold,
        color: COLORS.primary,
        marginLeft: 8,
    },
    confirmButton: {
        marginBottom: 32,
    },
});

export default AddMedicineScreen;
