// MediFlow Add Medicine Screen
// Manual medicine entry form (OCR will be added in Phase 2)

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Alert,
    TouchableOpacity,
} from 'react-native';


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

    return (
        <View style={styles.container}>
            <ScrollView style={styles.scrollView}>
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
                        label="Generic Name"
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
});

export default AddMedicineScreen;
