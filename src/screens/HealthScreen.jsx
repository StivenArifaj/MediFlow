// MediFlow Health Screen
// Dashboard for tracking health measurements

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Modal,
    TextInput,
    Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Activity, Heart, Scale, Thermometer, Plus, X, Droplet, Wind, TrendingUp, Moon, Footprints, Ruler, Circle } from 'lucide-react-native';

// Components
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import FloatingActionButton from '../components/common/FloatingActionButton';

// Stores
import useHealthStore from '../store/useHealthStore';
import useUserStore from '../store/useUserStore';

// Constants
import COLORS from '../constants/colors';
import TYPOGRAPHY from '../constants/typography';

const MEASUREMENT_TYPES = [
    { id: 'weight', label: 'Weight', icon: <Scale size={24} color={COLORS.primary} />, unit: 'kg' },
    { id: 'blood_pressure', label: 'Blood Pressure', icon: <Activity size={24} color={COLORS.error} />, unit: 'mmHg' },
    { id: 'heart_rate', label: 'Heart Rate', icon: <Heart size={24} color={COLORS.error} />, unit: 'bpm' },
    { id: 'glucose', label: 'Blood Glucose', icon: <Droplet size={24} color={COLORS.secondary} />, unit: 'mg/dL' },
    { id: 'temperature', label: 'Temperature', icon: <Thermometer size={24} color={COLORS.warning} />, unit: '°C' },
    { id: 'spo2', label: 'SpO2', icon: <Wind size={24} color={COLORS.primary} />, unit: '%' },
    { id: 'bmi', label: 'BMI', icon: <TrendingUp size={24} color={COLORS.secondary} />, unit: '' },
    { id: 'cholesterol', label: 'Cholesterol', icon: <Droplet size={24} color={COLORS.warning} />, unit: 'mg/dL' },
    { id: 'steps', label: 'Steps', icon: <Footprints size={24} color={COLORS.primary} />, unit: 'steps' },
    { id: 'sleep', label: 'Sleep Hours', icon: <Moon size={24} color={COLORS.secondary} />, unit: 'hrs' },
    { id: 'water', label: 'Water Intake', icon: <Droplet size={24} color={COLORS.primary} />, unit: 'L' },
    { id: 'waist', label: 'Waist', icon: <Ruler size={24} color={COLORS.warning} />, unit: 'cm' },
    { id: 'respiratory_rate', label: 'Respiratory Rate', icon: <Wind size={24} color={COLORS.error} />, unit: 'bpm' },
];

const HealthScreen = () => {
    const insets = useSafeAreaInsets();
    const { user } = useUserStore();
    const { measurements, loadMeasurements, addMeasurement, loading } = useHealthStore();

    const [modalVisible, setModalVisible] = useState(false);
    const [selectedType, setSelectedType] = useState(MEASUREMENT_TYPES[0]);
    const [value, setValue] = useState('');
    const [notes, setNotes] = useState('');

    useEffect(() => {
        if (user?.user_id) {
            loadMeasurements(user.user_id);
        }
    }, [user]);

    const handleAddMeasurement = async () => {
        if (!value) {
            Alert.alert('Error', 'Please enter a value');
            return;
        }

        try {
            await addMeasurement(
                user.user_id,
                selectedType.id,
                value,
                selectedType.unit,
                notes
            );
            setModalVisible(false);
            setValue('');
            setNotes('');
            Alert.alert('Success', 'Measurement added successfully');
        } catch (error) {
            Alert.alert('Error', 'Failed to add measurement');
        }
    };

    const getLatestMeasurement = (typeId) => {
        return measurements.find(m => m.type === typeId);
    };

    return (
        <View style={styles.container}>
            {/* Gradient Header */}
            <LinearGradient
                colors={COLORS.gradientHero}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.header, { paddingTop: insets.top + 20 }]}
            >
                <Text style={styles.headerTitle}>Health Tracker</Text>
                <Text style={styles.headerSubtitle}>Monitor your vitals</Text>
            </LinearGradient>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Overview Cards */}
                <View style={styles.gridContainer}>
                    {MEASUREMENT_TYPES.map((type) => {
                        const latest = getLatestMeasurement(type.id);
                        return (
                            <Card key={type.id} style={styles.metricCard} onPress={() => {
                                setSelectedType(type);
                                setModalVisible(true);
                            }}>
                                <View style={styles.metricHeader}>
                                    {type.icon}
                                    <Text style={styles.metricLabel}>{type.label}</Text>
                                </View>
                                <View style={styles.metricValueContainer}>
                                    <Text style={styles.metricValue}>
                                        {latest ? latest.value : '--'}
                                    </Text>
                                    <Text style={styles.metricUnit}>{type.unit}</Text>
                                </View>
                                <Text style={styles.metricDate}>
                                    {latest ? new Date(latest.date).toLocaleDateString() : 'No data'}
                                </Text>
                            </Card>
                        );
                    })}
                </View>

                {/* Recent History */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Recent History</Text>
                    {measurements.length === 0 ? (
                        <Text style={styles.emptyText}>No measurements recorded yet.</Text>
                    ) : (
                        measurements.slice(0, 10).map((item) => {
                            const typeConfig = MEASUREMENT_TYPES.find(t => t.id === item.type);
                            return (
                                <Card key={item.id} style={styles.historyItem}>
                                    <View style={styles.historyLeft}>
                                        {typeConfig?.icon}
                                        <View style={styles.historyInfo}>
                                            <Text style={styles.historyType}>{typeConfig?.label || item.type}</Text>
                                            <Text style={styles.historyDate}>
                                                {new Date(item.date).toLocaleString()}
                                            </Text>
                                        </View>
                                    </View>
                                    <Text style={styles.historyValue}>
                                        {item.value} <Text style={styles.historyUnit}>{item.unit}</Text>
                                    </Text>
                                </Card>
                            );
                        })
                    )}
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>

            <FloatingActionButton
                icon={<Plus size={24} color={COLORS.white} />}
                onPress={() => setModalVisible(true)}
            />

            {/* Add Measurement Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Add Measurement</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <X size={24} color={COLORS.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeSelector}>
                            {MEASUREMENT_TYPES.map((type) => (
                                <TouchableOpacity
                                    key={type.id}
                                    style={[
                                        styles.typeChip,
                                        selectedType.id === type.id && styles.typeChipActive
                                    ]}
                                    onPress={() => setSelectedType(type)}
                                >
                                    <Text style={[
                                        styles.typeChipText,
                                        selectedType.id === type.id && styles.typeChipTextActive
                                    ]}>
                                        {type.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>
                                Value ({selectedType.unit})
                            </Text>
                            <TextInput
                                style={styles.input}
                                value={value}
                                onChangeText={setValue}
                                keyboardType="numeric"
                                placeholder="0.0"
                                placeholderTextColor={COLORS.textDisabled}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Notes (Optional)</Text>
                            <TextInput
                                style={styles.input}
                                value={notes}
                                onChangeText={setNotes}
                                placeholder="Add a note..."
                                placeholderTextColor={COLORS.textDisabled}
                            />
                        </View>

                        <Button
                            title="Save Measurement"
                            onPress={handleAddMeasurement}
                            loading={loading}
                            variant="primary"
                            style={{ marginTop: 16 }}
                        />
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        paddingBottom: 24,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    headerTitle: {
        fontSize: TYPOGRAPHY.fontSize.h1,
        fontWeight: TYPOGRAPHY.fontWeight.bold,
        color: COLORS.white,
    },
    headerSubtitle: {
        fontSize: TYPOGRAPHY.fontSize.body,
        color: COLORS.white,
        opacity: 0.8,
    },
    content: {
        flex: 1,
        padding: 16,
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    metricCard: {
        width: '48%',
        marginBottom: 16,
        padding: 16,
    },
    metricHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    metricLabel: {
        fontSize: TYPOGRAPHY.fontSize.small,
        fontWeight: TYPOGRAPHY.fontWeight.semiBold,
        color: COLORS.textSecondary,
        marginLeft: 8,
    },
    metricValueContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 4,
    },
    metricValue: {
        fontSize: 24,
        fontWeight: TYPOGRAPHY.fontWeight.bold,
        color: COLORS.textPrimary,
    },
    metricUnit: {
        fontSize: TYPOGRAPHY.fontSize.small,
        color: COLORS.textSecondary,
        marginLeft: 4,
    },
    metricDate: {
        fontSize: 10,
        color: COLORS.textDisabled,
    },
    section: {
        marginTop: 8,
    },
    sectionTitle: {
        fontSize: TYPOGRAPHY.fontSize.h3,
        fontWeight: TYPOGRAPHY.fontWeight.bold,
        color: COLORS.textPrimary,
        marginBottom: 16,
    },
    historyItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        padding: 16,
    },
    historyLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    historyInfo: {
        marginLeft: 12,
    },
    historyType: {
        fontSize: TYPOGRAPHY.fontSize.body,
        fontWeight: TYPOGRAPHY.fontWeight.semiBold,
        color: COLORS.textPrimary,
    },
    historyDate: {
        fontSize: TYPOGRAPHY.fontSize.small,
        color: COLORS.textSecondary,
    },
    historyValue: {
        fontSize: TYPOGRAPHY.fontSize.h3,
        fontWeight: TYPOGRAPHY.fontWeight.bold,
        color: COLORS.primary,
    },
    historyUnit: {
        fontSize: TYPOGRAPHY.fontSize.small,
        fontWeight: 'normal',
        color: COLORS.textSecondary,
    },
    emptyText: {
        textAlign: 'center',
        color: COLORS.textSecondary,
        marginTop: 20,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: COLORS.white,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingBottom: 40,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        fontSize: TYPOGRAPHY.fontSize.h2,
        fontWeight: TYPOGRAPHY.fontWeight.bold,
        color: COLORS.textPrimary,
    },
    typeSelector: {
        flexDirection: 'row',
        marginBottom: 24,
    },
    typeChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: COLORS.lightGray,
        marginRight: 8,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    typeChipActive: {
        backgroundColor: COLORS.primary + '20',
        borderColor: COLORS.primary,
    },
    typeChipText: {
        fontSize: TYPOGRAPHY.fontSize.small,
        fontWeight: TYPOGRAPHY.fontWeight.semiBold,
        color: COLORS.textSecondary,
    },
    typeChipTextActive: {
        color: COLORS.primary,
    },
    inputContainer: {
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: TYPOGRAPHY.fontSize.small,
        fontWeight: TYPOGRAPHY.fontWeight.bold,
        color: COLORS.textPrimary,
        marginBottom: 8,
    },
    input: {
        backgroundColor: COLORS.lightGray,
        borderRadius: 12,
        padding: 16,
        fontSize: TYPOGRAPHY.fontSize.body,
        color: COLORS.textPrimary,
    },
});

export default HealthScreen;
