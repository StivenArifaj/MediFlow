// MediFlow Health Screen
// Dashboard for tracking health measurements

import React, { useState, useEffect, useMemo } from 'react';
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
import { Activity, Heart, Scale, Thermometer, Plus, X, Droplet, Wind, TrendingUp, Moon, Footprints, Ruler } from 'lucide-react-native';

// Components
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import FloatingActionButton from '../components/common/FloatingActionButton';

// Theme
import { useTheme } from '../context/ThemeContext';

// Stores
import useHealthStore from '../store/useHealthStore';
import useUserStore from '../store/useUserStore';
import { useLanguage } from '../context/LanguageContext';

// Constants
import TYPOGRAPHY from '../constants/typography';

const getMeasurementTypes = (colors, t) => [
    { id: 'weight', label: t('health.types.weight'), icon: <Scale size={24} color={colors.primary} />, unit: 'kg' },
    { id: 'blood_pressure', label: t('health.types.blood_pressure'), icon: <Activity size={24} color={colors.error} />, unit: 'mmHg' },
    { id: 'heart_rate', label: t('health.types.heart_rate'), icon: <Heart size={24} color={colors.error} />, unit: 'bpm' },
    { id: 'glucose', label: t('health.types.glucose'), icon: <Droplet size={24} color={colors.secondary} />, unit: 'mg/dL' },
    { id: 'temperature', label: t('health.types.temperature'), icon: <Thermometer size={24} color={colors.warning} />, unit: '°C' },
    { id: 'spo2', label: t('health.types.spo2'), icon: <Wind size={24} color={colors.primary} />, unit: '%' },
    { id: 'bmi', label: t('health.types.bmi'), icon: <TrendingUp size={24} color={colors.secondary} />, unit: '' },
    { id: 'cholesterol', label: t('health.types.cholesterol'), icon: <Droplet size={24} color={colors.warning} />, unit: 'mg/dL' },
    { id: 'steps', label: t('health.types.steps'), icon: <Footprints size={24} color={colors.primary} />, unit: 'steps' },
    { id: 'sleep', label: t('health.types.sleep'), icon: <Moon size={24} color={colors.secondary} />, unit: 'hrs' },
    { id: 'water', label: t('health.types.water'), icon: <Droplet size={24} color={colors.primary} />, unit: 'L' },
    { id: 'waist', label: t('health.types.waist'), icon: <Ruler size={24} color={colors.warning} />, unit: 'cm' },
    { id: 'respiratory_rate', label: t('health.types.respiratory_rate'), icon: <Wind size={24} color={colors.error} />, unit: 'bpm' },
];

const HealthScreen = () => {
    const insets = useSafeAreaInsets();
    const { user } = useUserStore();
    const { measurements, loadMeasurements, addMeasurement, loading } = useHealthStore();
    const { colors } = useTheme();
    const { t } = useLanguage();

    const MEASUREMENT_TYPES = useMemo(() => getMeasurementTypes(colors, t), [colors, t]);

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
            Alert.alert(t('common.error'), t('addMedicine.errorValue'));
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
            Alert.alert(t('common.success'), t('health.measurementAdded'));
        } catch (error) {
            Alert.alert(t('common.error'), t('health.failedToAdd'));
        }
    };

    const getLatestMeasurement = (typeId) => {
        return measurements.find(m => m.type === typeId);
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Gradient Header */}
            <LinearGradient
                colors={colors.gradientHero}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.header, { paddingTop: insets.top + 20 }]}
            >
                <Text style={styles.headerTitle}>{t('health.title')}</Text>
                <Text style={styles.headerSubtitle}>{t('health.track')}</Text>
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
                                    <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>{type.label}</Text>
                                </View>
                                <View style={styles.metricValueContainer}>
                                    <Text style={[styles.metricValue, { color: colors.textPrimary }]}>
                                        {latest ? latest.value : '--'}
                                    </Text>
                                    <Text style={[styles.metricUnit, { color: colors.textSecondary }]}>{type.unit}</Text>
                                </View>
                                <Text style={[styles.metricDate, { color: colors.textDisabled }]}>
                                    {latest ? new Date(latest.date).toLocaleDateString() : 'No data'}
                                </Text>
                            </Card>
                        );
                    })}
                </View>

                {/* Recent History */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>{t('medicineDetail.history')}</Text>
                    {measurements.length === 0 ? (
                        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{t('health.noMeasurements')}</Text>
                    ) : (
                        measurements.slice(0, 10).map((item) => {
                            const typeConfig = MEASUREMENT_TYPES.find(t => t.id === item.type);
                            return (
                                <Card key={item.id} style={styles.historyItem}>
                                    <View style={styles.historyLeft}>
                                        {typeConfig?.icon}
                                        <View style={styles.historyInfo}>
                                            <Text style={[styles.historyType, { color: colors.textPrimary }]}>{typeConfig?.label || item.type}</Text>
                                            <Text style={[styles.historyDate, { color: colors.textSecondary }]}>
                                                {new Date(item.date).toLocaleString()}
                                            </Text>
                                        </View>
                                    </View>
                                    <Text style={[styles.historyValue, { color: colors.primary }]}>
                                        {item.value} <Text style={[styles.historyUnit, { color: colors.textSecondary }]}>{item.unit}</Text>
                                    </Text>
                                </Card>
                            );
                        })
                    )}
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>

            <FloatingActionButton
                icon={<Plus size={24} color="#FFFFFF" />}
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
                    <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>{t('health.add')}</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <X size={24} color={colors.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeSelector}>
                            {MEASUREMENT_TYPES.map((type) => (
                                <TouchableOpacity
                                    key={type.id}
                                    style={[
                                        styles.typeChip,
                                        {
                                            backgroundColor: colors.lightGray,
                                            borderColor: colors.border,
                                        },
                                        selectedType.id === type.id ? {
                                            backgroundColor: colors.primary + '20',
                                            borderColor: colors.primary,
                                        } : null,
                                    ]}
                                    onPress={() => setSelectedType(type)}
                                >
                                    <Text style={[
                                        styles.typeChipText,
                                        { color: colors.textSecondary },
                                        selectedType.id === type.id ? { color: colors.primary } : null,
                                    ]}>
                                        {type.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        <View style={styles.inputContainer}>
                            <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>
                                {t('health.value')} ({selectedType.unit})
                            </Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: colors.lightGray, color: colors.textPrimary }]}
                                value={value}
                                onChangeText={setValue}
                                keyboardType="numeric"
                                placeholder="0.0"
                                placeholderTextColor={colors.textDisabled}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>{t('addMedicine.notes')}</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: colors.lightGray, color: colors.textPrimary }]}
                                value={notes}
                                onChangeText={setNotes}
                                placeholder={t('health.addNote')}
                                placeholderTextColor={colors.textDisabled}
                            />
                        </View>

                        <Button
                            title={t('common.save')}
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
        color: '#FFFFFF',
    },
    headerSubtitle: {
        fontSize: TYPOGRAPHY.fontSize.body,
        color: '#FFFFFF',
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
    },
    metricUnit: {
        fontSize: TYPOGRAPHY.fontSize.small,
        marginLeft: 4,
    },
    metricDate: {
        fontSize: 10,
    },
    section: {
        marginTop: 8,
    },
    sectionTitle: {
        fontSize: TYPOGRAPHY.fontSize.h3,
        fontWeight: TYPOGRAPHY.fontWeight.bold,
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
    },
    historyDate: {
        fontSize: TYPOGRAPHY.fontSize.small,
    },
    historyValue: {
        fontSize: TYPOGRAPHY.fontSize.h3,
        fontWeight: TYPOGRAPHY.fontWeight.bold,
    },
    historyUnit: {
        fontSize: TYPOGRAPHY.fontSize.small,
        fontWeight: 'normal',
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 20,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
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
    },
    typeSelector: {
        flexDirection: 'row',
        marginBottom: 24,
    },
    typeChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 8,
        borderWidth: 1,
    },
    typeChipText: {
        fontSize: TYPOGRAPHY.fontSize.small,
        fontWeight: TYPOGRAPHY.fontWeight.semiBold,
    },
    inputContainer: {
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: TYPOGRAPHY.fontSize.small,
        fontWeight: TYPOGRAPHY.fontWeight.bold,
        marginBottom: 8,
    },
    input: {
        borderRadius: 12,
        padding: 16,
        fontSize: TYPOGRAPHY.fontSize.body,
    },
});

export default HealthScreen;
