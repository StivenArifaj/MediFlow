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

// Theme
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

// Stores
import useMedicineStore from '../store/useMedicineStore';
import useUserStore from '../store/useUserStore';

// Constants
import TYPOGRAPHY from '../constants/typography';
import CONFIG from '../constants/config';

const AddMedicineScreen = ({ navigation, route }) => {
    const { user } = useUserStore();
    const { addMedicine, isLimitReached } = useMedicineStore();
    const { colors } = useTheme();
    const { t } = useLanguage();

    // Get scanned data from route params if available
    const scannedData = route?.params?.scannedData || {};
    const photoUri = route?.params?.photoUri || null;

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

    const [confirmationMode, setConfirmationMode] = useState(
        !!(scannedData.verified_name || scannedData.api_source === 'openfda')
    );

    const [reminderTimes, setReminderTimes] = useState([]);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [tempTime, setTempTime] = useState(new Date());

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

            setConfirmationMode(!!(scannedData.verified_name || scannedData.api_source === 'openfda'));
        } else {
            setConfirmationMode(false);
        }
    }, [route?.params?.scannedData]);

    const validateForm = () => {
        const newErrors = {};

        if (!formData.verified_name.trim()) {
            newErrors.verified_name = t('addMedicine.errorName');
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            return;
        }

        if (!user.is_premium && isLimitReached(CONFIG.FREE_MEDICINE_LIMIT)) {
            Alert.alert(
                t('common.limitReached'),
                t('common.limitMsg').replace('{limit}', CONFIG.FREE_MEDICINE_LIMIT),
                [{ text: t('common.ok') }]
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
                t('common.successTitle'),
                t('addMedicine.success'),
                [
                    {
                        text: t('navigation.setReminder'),
                        onPress: () => navigation.navigate('ReminderSetup', { medId }),
                    },
                    {
                        text: t('common.done'),
                        onPress: () => navigation.goBack(),
                    },
                ]
            );
        } catch (error) {
            Alert.alert(t('common.error'), 'Failed to add medicine. Please try again.');
            console.error('Error adding medicine:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateField = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
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
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView style={styles.scrollView}>
                {confirmationMode ? (
                    <>
                        <Card style={[styles.successCard, { backgroundColor: colors.success + '10', borderLeftColor: colors.success }]}>
                            <View style={styles.successHeader}>
                                <CheckCircle size={48} color={colors.success} />
                                <Text style={[styles.successTitle, { color: colors.textPrimary }]}>Medicine Scanned Successfully!</Text>
                                <Text style={[styles.successSubtitle, { color: colors.textSecondary }]}>Review the information below</Text>
                            </View>
                        </Card>

                        <View style={styles.confirmationContent}>
                            <Card style={styles.dataCard}>
                                <View style={styles.dataRow}>
                                    <Pill size={24} color={colors.primary} />
                                    <View style={styles.dataInfo}>
                                        <Text style={[styles.dataLabel, { color: colors.textSecondary }]}>Medicine Name</Text>
                                        <Text style={[styles.dataValue, { color: colors.textPrimary }]}>{formData.verified_name || 'Not detected'}</Text>
                                    </View>
                                </View>
                            </Card>

                            {(formData.strength || formData.form) && (
                                <Card style={styles.dataCard}>
                                    <View style={styles.dataRow}>
                                        <Package size={24} color={colors.secondary} />
                                        <View style={styles.dataInfo}>
                                            <Text style={[styles.dataLabel, { color: colors.textSecondary }]}>Dosage & Form</Text>
                                            <Text style={[styles.dataValue, { color: colors.textPrimary }]}>
                                                {formData.strength || 'N/A'} • {formData.form}
                                            </Text>
                                        </View>
                                    </View>
                                </Card>
                            )}

                            {formData.manufacturer && (
                                <Card style={styles.dataCard}>
                                    <View style={styles.dataRow}>
                                        <Building2 size={24} color={colors.warning} />
                                        <View style={styles.dataInfo}>
                                            <Text style={[styles.dataLabel, { color: colors.textSecondary }]}>Manufacturer</Text>
                                            <Text style={[styles.dataValue, { color: colors.textPrimary }]}>{formData.manufacturer}</Text>
                                        </View>
                                    </View>
                                </Card>
                            )}

                            {formData.generic_name && (
                                <Card style={styles.dataCard}>
                                    <View style={styles.dataRow}>
                                        <FlaskConical size={24} color={colors.primary} />
                                        <View style={styles.dataInfo}>
                                            <Text style={[styles.dataLabel, { color: colors.textSecondary }]}>Scientific Name</Text>
                                            <Text style={[styles.dataValue, { color: colors.textPrimary }]}>{formData.generic_name}</Text>
                                        </View>
                                    </View>
                                </Card>
                            )}

                            {formData.category && (
                                <Card style={styles.dataCard}>
                                    <View style={styles.dataRow}>
                                        <View style={[styles.categoryBadge, { backgroundColor: colors.primary + '20' }]}>
                                            <Text style={[styles.categoryText, { color: colors.primary }]}>{formData.category}</Text>
                                        </View>
                                    </View>
                                </Card>
                            )}

                            <View style={styles.confirmationActions}>
                                <TouchableOpacity
                                    style={[styles.editButton, { borderColor: colors.primary, backgroundColor: colors.surface }]}
                                    onPress={() => setConfirmationMode(false)}
                                >
                                    <Edit size={20} color={colors.primary} />
                                    <Text style={[styles.editButtonText, { color: colors.primary }]}>Edit Details</Text>
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
                    <>
                        <Card style={[styles.infoCard, { backgroundColor: colors.primary + '10', borderLeftColor: colors.primary }]}>
                            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                                ℹ️ Enter your medicine details manually. You can also search our database or scan the medicine box (coming soon).
                            </Text>
                        </Card>

                        <View style={styles.form}>
                            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Basic Information</Text>

                            <Input
                                label={t('addMedicine.verifiedName') + " *"}
                                value={formData.verified_name}
                                onChangeText={(value) => updateField('verified_name', value)}
                                placeholder="e.g., Aspirin"
                                error={errors.verified_name}
                                maxLength={100}
                            />

                            <Input
                                label={t('addMedicine.brandName')}
                                value={formData.brand_name}
                                onChangeText={(value) => updateField('brand_name', value)}
                                placeholder="e.g., Bayer"
                                maxLength={100}
                            />

                            <Input
                                label={t('addMedicine.genericName') + " (Optional)"}
                                value={formData.generic_name}
                                onChangeText={(value) => updateField('generic_name', value)}
                                placeholder="e.g., Acetylsalicylic Acid"
                                maxLength={100}
                            />

                            <Input
                                label={t('addMedicine.manufacturer')}
                                value={formData.manufacturer}
                                onChangeText={(value) => updateField('manufacturer', value)}
                                placeholder="e.g., Bayer AG"
                                maxLength={100}
                            />

                            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>{t('addMedicine.sectionDetails')}</Text>

                            <Input
                                label={t('addMedicine.strength')}
                                value={formData.strength}
                                onChangeText={(value) => updateField('strength', value)}
                                placeholder="e.g., 500mg"
                                maxLength={50}
                            />

                            {/* Form Type Selector */}
                            <Text style={[styles.label, { color: colors.textPrimary }]}>{t('addMedicine.form')}</Text>
                            <View style={styles.formTypeContainer}>
                                {CONFIG.MEDICINE_FORMS.slice(0, 6).map((form) => (
                                    <TouchableOpacity
                                        key={form}
                                        style={[
                                            styles.formTypeButton,
                                            {
                                                borderColor: colors.border,
                                                backgroundColor: colors.surface,
                                            },
                                            formData.form === form ? {
                                                backgroundColor: colors.primary,
                                                borderColor: colors.primary,
                                            } : null,
                                        ]}
                                        onPress={() => updateField('form', form)}
                                    >
                                        <Text
                                            style={[
                                                styles.formTypeText,
                                                { color: colors.textSecondary },
                                                formData.form === form ? {
                                                    color: '#FFFFFF',
                                                    fontWeight: TYPOGRAPHY.fontWeight.semiBold,
                                                } : null,
                                            ]}
                                        >
                                            {form}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>{t('addMedicine.sectionNotes')}</Text>

                            <Input
                                label={t('addMedicine.category')}
                                value={formData.category}
                                onChangeText={(value) => updateField('category', value)}
                                placeholder="e.g., Pain Relief, Antibiotic"
                                maxLength={50}
                            />

                            <Input
                                label={t('addMedicine.notes')}
                                value={formData.notes}
                                onChangeText={(value) => updateField('notes', value)}
                                placeholder="Any additional notes..."
                                multiline
                                numberOfLines={4}
                                maxLength={500}
                            />

                            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>{t('addMedicine.sectionReminders')}</Text>
                            <Text style={[styles.helperText, { color: colors.textSecondary }]}>Set reminder times now, or add them later</Text>

                            <TouchableOpacity
                                style={[styles.addTimeButton, { borderColor: colors.primary, backgroundColor: colors.primary + '05' }]}
                                onPress={() => setShowTimePicker(true)}
                            >
                                <Clock size={20} color={colors.primary} />
                                <Text style={[styles.addTimeText, { color: colors.primary }]}>{t('addMedicine.addTime')}</Text>
                            </TouchableOpacity>

                            {reminderTimes.length > 0 && (
                                <View style={styles.timesContainer}>
                                    {reminderTimes.map((time, index) => (
                                        <View key={index} style={[styles.timeChip, { backgroundColor: colors.primary }]}>
                                            <Text style={styles.timeChipText}>{time}</Text>
                                            <TouchableOpacity onPress={() => removeReminderTime(time)}>
                                                <X size={16} color="#FFFFFF" />
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

                            <Card variant="outlined" style={[styles.disclaimerCard, { backgroundColor: colors.warning + '10', borderLeftColor: colors.warning }]}>
                                <Text style={[styles.disclaimerTitle, { color: colors.textPrimary }]}>⚠️ {t('profile.medicalDisclaimer')}</Text>
                                <Text style={[styles.disclaimerText, { color: colors.textSecondary }]}>
                                    {t('profile.disclaimerText')}
                                </Text>
                            </Card>

                            <Button
                                title={t('addMedicine.confirmAdd')}
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
    },
    scrollView: {
        flex: 1,
    },
    infoCard: {
        margin: 16,
        borderLeftWidth: 4,
    },
    infoText: {
        fontSize: TYPOGRAPHY.fontSize.small,
        lineHeight: 20,
    },
    form: {
        padding: 16,
    },
    sectionTitle: {
        fontSize: TYPOGRAPHY.fontSize.h3,
        fontWeight: TYPOGRAPHY.fontWeight.bold,
        marginTop: 16,
        marginBottom: 12,
    },
    label: {
        fontSize: TYPOGRAPHY.fontSize.small,
        fontWeight: TYPOGRAPHY.fontWeight.medium,
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
        marginRight: 8,
        marginBottom: 8,
    },
    formTypeText: {
        fontSize: TYPOGRAPHY.fontSize.small,
    },
    disclaimerCard: {
        marginTop: 16,
        marginBottom: 16,
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
    submitButton: {
        marginTop: 8,
        marginBottom: 32,
    },
    helperText: {
        fontSize: TYPOGRAPHY.fontSize.small,
        marginBottom: 12,
    },
    addTimeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
        borderWidth: 2,
        borderStyle: 'dashed',
        marginBottom: 16,
    },
    addTimeText: {
        fontSize: TYPOGRAPHY.fontSize.body,
        fontWeight: TYPOGRAPHY.fontWeight.semiBold,
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
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 8,
        marginBottom: 8,
    },
    timeChipText: {
        fontSize: TYPOGRAPHY.fontSize.small,
        fontWeight: TYPOGRAPHY.fontWeight.semiBold,
        color: '#FFFFFF',
        marginRight: 8,
    },
    successCard: {
        margin: 16,
        borderLeftWidth: 4,
    },
    successHeader: {
        alignItems: 'center',
        padding: 8,
    },
    successTitle: {
        fontSize: TYPOGRAPHY.fontSize.h2,
        fontWeight: TYPOGRAPHY.fontWeight.bold,
        marginTop: 12,
    },
    successSubtitle: {
        fontSize: TYPOGRAPHY.fontSize.body,
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
        marginBottom: 4,
    },
    dataValue: {
        fontSize: TYPOGRAPHY.fontSize.h3,
        fontWeight: TYPOGRAPHY.fontWeight.semiBold,
    },
    categoryBadge: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    categoryText: {
        fontSize: TYPOGRAPHY.fontSize.body,
        fontWeight: TYPOGRAPHY.fontWeight.semiBold,
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
        marginBottom: 12,
    },
    editButtonText: {
        fontSize: TYPOGRAPHY.fontSize.body,
        fontWeight: TYPOGRAPHY.fontWeight.semiBold,
        marginLeft: 8,
    },
    confirmButton: {
        marginBottom: 32,
    },
});

export default AddMedicineScreen;
