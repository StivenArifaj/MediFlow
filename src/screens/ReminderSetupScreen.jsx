// MediFlow Reminder Setup Screen
// Wizard for creating medicine reminders

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
} from 'react-native';

import DateTimePicker from '@react-native-community/datetimepicker';
import { Clock, Calendar, List, Check } from 'lucide-react-native';

// Components
import Card from '../components/common/Card';
import Button from '../components/common/Button';

// Theme
import { useTheme } from '../context/ThemeContext';

// Stores
import useReminderStore from '../store/useReminderStore';
import useUserStore from '../store/useUserStore';

// Constants
import TYPOGRAPHY from '../constants/typography';
import CONFIG from '../constants/config';

const ReminderSetupScreen = ({ route, navigation }) => {
    const { medId } = route.params || {};
    const { addReminder } = useReminderStore();
    const { user } = useUserStore();
    const { colors } = useTheme();

    const [selectedTimes, setSelectedTimes] = useState([]);
    const [frequency, setFrequency] = useState('daily');
    const [selectedDays, setSelectedDays] = useState([0, 1, 2, 3, 4, 5, 6]);
    const [loading, setLoading] = useState(false);

    const [showTimePicker, setShowTimePicker] = useState(false);
    const [customTime, setCustomTime] = useState(new Date());

    const onTimeSelected = (event, selectedDate) => {
        setShowTimePicker(false);
        if (selectedDate) {
            setCustomTime(selectedDate);
            const formattedTime = selectedDate.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
            });
            togglePresetTime(formattedTime);
        }
    };

    const togglePresetTime = (time) => {
        if (selectedTimes.includes(time)) {
            setSelectedTimes(selectedTimes.filter(t => t !== time));
        } else {
            setSelectedTimes([...selectedTimes, time]);
        }
    };

    const toggleDay = (day) => {
        if (selectedDays.includes(day)) {
            setSelectedDays(selectedDays.filter(d => d !== day));
        } else {
            setSelectedDays([...selectedDays, day].sort());
        }
    };

    const handleSubmit = async () => {
        if (selectedTimes.length === 0) {
            Alert.alert('No Times Selected', 'Please select at least one reminder time');
            return;
        }

        if (frequency === 'specific_days' && selectedDays.length === 0) {
            Alert.alert('No Days Selected', 'Please select at least one day');
            return;
        }

        setLoading(true);

        try {
            const userId = user?.user_id || 'local_user_1';

            for (const time of selectedTimes) {
                await addReminder(
                    userId,
                    medId,
                    {
                        time,
                        days: selectedDays,
                        frequency_type: frequency,
                        notification_enabled: true,
                        sound: 'default',
                        snooze_enabled: true,
                    },
                    { verified_name: 'Medicine' }
                );
            }

            Alert.alert(
                'Success!',
                `${selectedTimes.length} reminder(s) created successfully`,
                [
                    {
                        text: 'Done',
                        onPress: () => navigation.goBack(),
                    },
                ]
            );
        } catch (error) {
            Alert.alert('Error', 'Failed to create reminders');
            console.error('Error creating reminders:', error);
        } finally {
            setLoading(false);
        }
    };

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView style={styles.scrollView}>
                <Card style={styles.section}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                        <Clock size={24} color={colors.primary} style={{ marginRight: 8 }} />
                        <Text style={[styles.sectionTitle, { marginBottom: 0, color: colors.textPrimary }]}>When to take?</Text>
                    </View>

                    {CONFIG.TIME_PRESETS.map((preset) => (
                        <TouchableOpacity
                            key={preset.time}
                            style={[
                                styles.presetButton,
                                {
                                    borderColor: colors.border,
                                    backgroundColor: colors.surface,
                                },
                                selectedTimes.includes(preset.time) ? {
                                    borderColor: colors.primary,
                                    backgroundColor: colors.primary + '10',
                                } : null,
                            ]}
                            onPress={() => togglePresetTime(preset.time)}
                        >
                            <Text style={styles.presetIcon}>{preset.icon}</Text>
                            <View style={styles.presetInfo}>
                                <Text style={[
                                    styles.presetLabel,
                                    { color: colors.textPrimary },
                                    selectedTimes.includes(preset.time) ? { color: colors.primary } : null,
                                ]}>
                                    {preset.label}
                                </Text>
                                <Text style={[
                                    styles.presetTime,
                                    { color: colors.textSecondary },
                                    selectedTimes.includes(preset.time) ? { color: colors.primary } : null,
                                ]}>
                                    {preset.time}
                                </Text>
                            </View>
                            {selectedTimes.includes(preset.time) ? (
                                <Check size={24} color={colors.primary} />
                            ) : null}
                        </TouchableOpacity>
                    ))}

                    {/* Custom Time Picker */}
                    <TouchableOpacity
                        style={[styles.customTimeButton, { borderColor: colors.primary, backgroundColor: colors.primary + '05' }]}
                        onPress={() => setShowTimePicker(true)}
                    >
                        <Text style={[styles.customTimeText, { color: colors.primary }]}>+ Add Custom Time</Text>
                    </TouchableOpacity>

                    {showTimePicker && (
                        <DateTimePicker
                            value={customTime}
                            mode="time"
                            is24Hour={false}
                            display="default"
                            onChange={onTimeSelected}
                        />
                    )}

                    {selectedTimes.length > 0 ? (
                        <View style={[styles.selectedTimesContainer, { backgroundColor: colors.success + '10' }]}>
                            <Text style={[styles.selectedTimesLabel, { color: colors.textPrimary }]}>
                                Selected Times ({selectedTimes.length}):
                            </Text>
                            <View style={styles.selectedTimesList}>
                                {selectedTimes.map((time) => (
                                    <View key={time} style={[styles.selectedTimeChip, { backgroundColor: colors.success }]}>
                                        <Text style={styles.selectedTimeText}>{time}</Text>
                                        <TouchableOpacity onPress={() => togglePresetTime(time)}>
                                            <Text style={styles.removeTime}>✕</Text>
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </View>
                        </View>
                    ) : null}
                </Card>

                <Card style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>📅 How often?</Text>

                    <TouchableOpacity
                        style={[
                            styles.frequencyOption,
                            {
                                borderColor: colors.border,
                                backgroundColor: colors.surface,
                            },
                            frequency === 'daily' ? {
                                borderColor: colors.primary,
                                backgroundColor: colors.primary + '10',
                            } : null,
                        ]}
                        onPress={() => setFrequency('daily')}
                    >
                        <View style={[styles.radioButton, { borderColor: colors.primary }]}>
                            {frequency === 'daily' ? <View style={[styles.radioButtonInner, { backgroundColor: colors.primary }]} /> : null}
                        </View>
                        <Text style={[styles.frequencyText, { color: colors.textPrimary }]}>Every day</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.frequencyOption,
                            {
                                borderColor: colors.border,
                                backgroundColor: colors.surface,
                            },
                            frequency === 'specific_days' ? {
                                borderColor: colors.primary,
                                backgroundColor: colors.primary + '10',
                            } : null,
                        ]}
                        onPress={() => setFrequency('specific_days')}
                    >
                        <View style={[styles.radioButton, { borderColor: colors.primary }]}>
                            {frequency === 'specific_days' ? <View style={[styles.radioButtonInner, { backgroundColor: colors.primary }]} /> : null}
                        </View>
                        <Text style={[styles.frequencyText, { color: colors.textPrimary }]}>Specific days</Text>
                    </TouchableOpacity>

                    {frequency === 'specific_days' ? (
                        <View style={styles.daysContainer}>
                            {days.map((day, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={[
                                        styles.dayButton,
                                        {
                                            borderColor: colors.border,
                                            backgroundColor: colors.surface,
                                        },
                                        selectedDays.includes(index) ? {
                                            borderColor: colors.primary,
                                            backgroundColor: colors.primary,
                                        } : null,
                                    ]}
                                    onPress={() => toggleDay(index)}
                                >
                                    <Text
                                        style={[
                                            styles.dayText,
                                            { color: colors.textSecondary },
                                            selectedDays.includes(index) ? { color: '#FFFFFF' } : null,
                                        ]}
                                    >
                                        {day}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    ) : null}

                    <TouchableOpacity
                        style={[
                            styles.frequencyOption,
                            {
                                borderColor: colors.border,
                                backgroundColor: colors.surface,
                            },
                            frequency === 'as_needed' ? {
                                borderColor: colors.primary,
                                backgroundColor: colors.primary + '10',
                            } : null,
                        ]}
                        onPress={() => setFrequency('as_needed')}
                    >
                        <View style={[styles.radioButton, { borderColor: colors.primary }]}>
                            {frequency === 'as_needed' ? <View style={[styles.radioButtonInner, { backgroundColor: colors.primary }]} /> : null}
                        </View>
                        <Text style={[styles.frequencyText, { color: colors.textPrimary }]}>As needed (no reminders)</Text>
                    </TouchableOpacity>
                </Card>

                <Card variant="outlined" style={[styles.summaryCard, { backgroundColor: colors.primary + '05', borderLeftColor: colors.primary }]}>
                    <Text style={[styles.summaryTitle, { color: colors.textPrimary }]}>📋 Summary</Text>
                    <Text style={[styles.summaryText, { color: colors.textSecondary }]}>
                        {selectedTimes.length} reminder(s) at:{' '}
                        {selectedTimes.join(', ') || 'None selected'}
                    </Text>
                    <Text style={[styles.summaryText, { color: colors.textSecondary }]}>
                        Frequency: {frequency === 'daily' ? 'Every day' : frequency === 'specific_days' ? 'Selected days' : 'As needed'}
                    </Text>
                    {frequency === 'specific_days' ? (
                        <Text style={[styles.summaryText, { color: colors.textSecondary }]}>
                            Days: {selectedDays.map(d => days[d]).join(', ')}
                        </Text>
                    ) : null}
                </Card>

                <View style={styles.actions}>
                    <Button
                        title="Create Reminder(s)"
                        onPress={handleSubmit}
                        loading={loading}
                        variant="primary"
                        size="large"
                    />
                </View>
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
    section: {
        margin: 16,
        marginBottom: 8,
    },
    sectionTitle: {
        fontSize: TYPOGRAPHY.fontSize.h3,
        fontWeight: TYPOGRAPHY.fontWeight.bold,
        marginBottom: 16,
    },
    presetButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        borderWidth: 2,
        marginBottom: 12,
    },
    presetIcon: {
        fontSize: 32,
        marginRight: 16,
    },
    presetInfo: {
        flex: 1,
    },
    presetLabel: {
        fontSize: TYPOGRAPHY.fontSize.body,
        fontWeight: TYPOGRAPHY.fontWeight.semiBold,
    },
    presetTime: {
        fontSize: TYPOGRAPHY.fontSize.small,
    },
    customTimeButton: {
        padding: 16,
        borderRadius: 12,
        borderWidth: 2,
        borderStyle: 'dashed',
        alignItems: 'center',
        marginBottom: 16,
    },
    customTimeText: {
        fontSize: TYPOGRAPHY.fontSize.body,
        fontWeight: TYPOGRAPHY.fontWeight.bold,
    },
    selectedTimesContainer: {
        marginTop: 16,
        padding: 12,
        borderRadius: 12,
    },
    selectedTimesLabel: {
        fontSize: TYPOGRAPHY.fontSize.small,
        fontWeight: TYPOGRAPHY.fontWeight.semiBold,
        marginBottom: 8,
    },
    selectedTimesList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    selectedTimeChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        marginRight: 8,
        marginBottom: 8,
    },
    selectedTimeText: {
        fontSize: TYPOGRAPHY.fontSize.small,
        color: '#FFFFFF',
        marginRight: 8,
    },
    removeTime: {
        fontSize: 16,
        color: '#FFFFFF',
    },
    frequencyOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 12,
    },
    radioButton: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        marginRight: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioButtonInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    frequencyText: {
        fontSize: TYPOGRAPHY.fontSize.body,
    },
    daysContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 12,
        marginBottom: 12,
    },
    dayButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    dayText: {
        fontSize: TYPOGRAPHY.fontSize.small,
        fontWeight: TYPOGRAPHY.fontWeight.semiBold,
    },
    summaryCard: {
        margin: 16,
        marginTop: 8,
        borderLeftWidth: 4,
    },
    summaryTitle: {
        fontSize: TYPOGRAPHY.fontSize.body,
        fontWeight: TYPOGRAPHY.fontWeight.bold,
        marginBottom: 8,
    },
    summaryText: {
        fontSize: TYPOGRAPHY.fontSize.small,
        marginBottom: 4,
    },
    actions: {
        padding: 16,
        paddingTop: 8,
        paddingBottom: 32,
    },
});

export default ReminderSetupScreen;
