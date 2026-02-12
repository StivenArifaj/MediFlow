// MediFlow History Screen
// Shows medication intake history and statistics

import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
    Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Check, X, SkipForward, Clock } from 'lucide-react-native';

// Components
import Card from '../components/common/Card';

// Theme
import { useTheme } from '../context/ThemeContext';

// Stores
import useUserStore from '../store/useUserStore';
import { useLanguage } from '../context/LanguageContext';

// Services
import databaseService from '../services/databaseService';

// Constants
import TYPOGRAPHY from '../constants/typography';

const HistoryScreen = () => {
    const { user } = useUserStore();
    const { colors } = useTheme();
    const { t } = useLanguage();
    const [history, setHistory] = useState([]);
    const [stats, setStats] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState('timeline');

    useEffect(() => {
        if (user?.user_id) {
            loadHistory();
        }
    }, [user]);

    const loadHistory = async () => {
        if (!user?.user_id) return;

        try {
            const historyData = await databaseService.getHistory(user.user_id, 30);
            setHistory(historyData);

            const statsData = await databaseService.getAdherenceStats(user.user_id, 30);
            setStats(statsData);
        } catch (error) {
            console.error('Error loading history:', error);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadHistory();
        setRefreshing(false);
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'taken':
                return <Check size={16} color={colors.taken} />;
            case 'skipped':
                return <SkipForward size={16} color={colors.skipped} />;
            case 'missed':
                return <X size={16} color={colors.missed} />;
            default:
                return <Clock size={16} color={colors.textSecondary} />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'taken':
                return colors.taken;
            case 'skipped':
                return colors.skipped;
            case 'missed':
                return colors.missed;
            default:
                return colors.textSecondary;
        }
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });
    };

    const formatDate = (timestamp) => {
        const date = new Date(timestamp);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return t('home.today');
        } else if (date.toDateString() === yesterday.toDateString()) {
            return t('common.yesterday');
        } else {
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
            });
        }
    };

    const groupedHistory = history.reduce((groups, entry) => {
        const date = formatDate(entry.scheduled_time);
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(entry);
        return groups;
    }, {});

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Gradient Header */}
            <LinearGradient
                colors={colors.gradientHero}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.header}
            >
                <Text style={styles.headerTitle}>{t('history.title')}</Text>
            </LinearGradient>

            {/* Tabs */}
            <View style={[styles.tabs, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'timeline' ? { borderBottomColor: colors.primary } : null]}
                    onPress={() => setActiveTab('timeline')}
                >
                    <Text style={[
                        styles.tabText,
                        { color: colors.textSecondary },
                        activeTab === 'timeline' ? { color: colors.primary, fontWeight: TYPOGRAPHY.fontWeight.semiBold } : null,
                    ]}>
                        {t('history.timeline')}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'stats' ? { borderBottomColor: colors.primary } : null]}
                    onPress={() => setActiveTab('stats')}
                >
                    <Text style={[
                        styles.tabText,
                        { color: colors.textSecondary },
                        activeTab === 'stats' ? { color: colors.primary, fontWeight: TYPOGRAPHY.fontWeight.semiBold } : null,
                    ]}>
                        {t('history.statistics')}
                    </Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.scrollView}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {activeTab === 'timeline' ? (
                    <View style={styles.content}>
                        {history.length === 0 ? (
                            <Card>
                                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{t('history.noHistory')}</Text>
                                <Text style={[styles.emptySubtext, { color: colors.textDisabled }]}>
                                    {t('history.noHistoryDesc')}
                                </Text>
                            </Card>
                        ) : (
                            Object.keys(groupedHistory).map((date) => (
                                <View key={date} style={styles.dateGroup}>
                                    <Text style={[styles.dateHeader, { color: colors.textPrimary }]}>{date}</Text>
                                    {groupedHistory[date].map((entry) => (
                                        <Card key={entry.entry_id} style={styles.historyCard}>
                                            <View style={styles.historyHeader}>
                                                <View style={styles.statusContainer}>
                                                    <Text
                                                        style={[
                                                            styles.statusIcon,
                                                            { color: getStatusColor(entry.status) },
                                                        ]}
                                                    >
                                                        {getStatusIcon(entry.status)}
                                                    </Text>
                                                    <Text style={[styles.historyTime, { color: colors.textPrimary }]}>
                                                        {formatTime(entry.actual_time || entry.scheduled_time)}
                                                    </Text>
                                                </View>
                                                <Text
                                                    style={[
                                                        styles.statusBadge,
                                                        { backgroundColor: getStatusColor(entry.status) + '20' },
                                                    ]}
                                                >
                                                    {entry.status}
                                                </Text>
                                            </View>
                                            <Text style={[styles.medicineName, { color: colors.textPrimary }]}>
                                                {entry.medicine_name || t('common.medicine')}
                                            </Text>
                                            {entry.late_by_minutes > 0 && (
                                                <Text style={[styles.lateText, { color: colors.warning }]}>
                                                    {t('history.minutesLate').replace('{min}', entry.late_by_minutes)}
                                                </Text>
                                            )}
                                            {entry.notes && (
                                                <Text style={[styles.notes, { color: colors.textSecondary }]}>{t('addMedicine.notes')}: {entry.notes}</Text>
                                            )}
                                        </Card>
                                    ))}
                                </View>
                            ))
                        )}
                    </View>
                ) : (
                    <View style={styles.content}>
                        {stats && (
                            <>
                                <Card style={styles.statsCard}>
                                    <Text style={[styles.statsTitle, { color: colors.textPrimary }]}>{t('history.overallAdherence')}</Text>
                                    <Text style={[styles.statsPercentage, { color: colors.primary }]}>{stats.adherenceRate}%</Text>
                                    <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
                                        <View
                                            style={[
                                                styles.progressFill,
                                                { width: `${stats.adherenceRate}%`, backgroundColor: colors.primary },
                                            ]}
                                        />
                                    </View>
                                    <Text style={[styles.statsSubtext, { color: colors.textSecondary }]}>
                                        {/* Simplified stats text to avoid complex pluralization for now */}
                                        {stats.taken} / {stats.total} ({t('history.last30')})
                                    </Text>
                                </Card>

                                <Card style={styles.statsCard}>
                                    <Text style={[styles.statsTitle, { color: colors.textPrimary }]}>{t('history.breakdown')}</Text>
                                    <View style={styles.statsRow}>
                                        <View style={styles.statItem}>
                                            <Text style={[styles.statValue, { color: colors.taken }]}>
                                                {stats.taken}
                                            </Text>
                                            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t('home.taken')}</Text>
                                        </View>
                                        <View style={styles.statItem}>
                                            <Text style={[styles.statValue, { color: colors.skipped }]}>
                                                {stats.skipped}
                                            </Text>
                                            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t('home.skipped')}</Text>
                                        </View>
                                        <View style={styles.statItem}>
                                            <Text style={[styles.statValue, { color: colors.missed }]}>
                                                {stats.missed}
                                            </Text>
                                            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Missed</Text>
                                        </View>
                                    </View>
                                </Card>

                                {stats.adherenceRate >= 80 && (
                                    <Card variant="outlined" style={[styles.encouragementCard, { backgroundColor: colors.success + '10', borderColor: colors.success }]}>
                                        <Text style={styles.encouragementIcon}>🎉</Text>
                                        <Text style={[styles.encouragementText, { color: colors.textPrimary }]}>
                                            {t('history.encouragement')}
                                        </Text>
                                    </Card>
                                )}
                            </>
                        )}
                    </View>
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingTop: Platform.OS === 'android' ? 40 : 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        elevation: 4,
    },
    headerTitle: {
        fontSize: TYPOGRAPHY.fontSize.h1,
        fontWeight: TYPOGRAPHY.fontWeight.bold,
        color: '#FFFFFF',
    },
    tabs: {
        flexDirection: 'row',
        borderBottomWidth: 1,
    },
    tab: {
        flex: 1,
        paddingVertical: 16,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    tabText: {
        fontSize: TYPOGRAPHY.fontSize.body,
    },
    scrollView: {
        flex: 1,
    },
    content: {
        padding: 16,
    },
    emptyText: {
        fontSize: TYPOGRAPHY.fontSize.body,
        textAlign: 'center',
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: TYPOGRAPHY.fontSize.small,
        textAlign: 'center',
    },
    dateGroup: {
        marginBottom: 24,
    },
    dateHeader: {
        fontSize: TYPOGRAPHY.fontSize.body,
        fontWeight: TYPOGRAPHY.fontWeight.bold,
        marginBottom: 12,
        paddingLeft: 4,
    },
    historyCard: {
        marginBottom: 8,
    },
    historyHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusIcon: {
        fontSize: 20,
        marginRight: 8,
    },
    historyTime: {
        fontSize: TYPOGRAPHY.fontSize.body,
        fontWeight: TYPOGRAPHY.fontWeight.semiBold,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        fontSize: TYPOGRAPHY.fontSize.caption,
        textTransform: 'capitalize',
    },
    medicineName: {
        fontSize: TYPOGRAPHY.fontSize.body,
        marginBottom: 4,
    },
    lateText: {
        fontSize: TYPOGRAPHY.fontSize.small,
    },
    notes: {
        fontSize: TYPOGRAPHY.fontSize.small,
        fontStyle: 'italic',
        marginTop: 4,
    },
    statsCard: {
        marginBottom: 16,
    },
    statsTitle: {
        fontSize: TYPOGRAPHY.fontSize.h3,
        fontWeight: TYPOGRAPHY.fontWeight.bold,
        marginBottom: 16,
    },
    statsPercentage: {
        fontSize: 48,
        fontWeight: TYPOGRAPHY.fontWeight.bold,
        textAlign: 'center',
        marginBottom: 16,
    },
    progressBar: {
        height: 12,
        borderRadius: 6,
        overflow: 'hidden',
        marginBottom: 8,
    },
    progressFill: {
        height: '100%',
    },
    statsSubtext: {
        fontSize: TYPOGRAPHY.fontSize.small,
        textAlign: 'center',
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
        marginBottom: 4,
    },
    statLabel: {
        fontSize: TYPOGRAPHY.fontSize.small,
    },
    encouragementCard: {
        alignItems: 'center',
        padding: 20,
    },
    encouragementIcon: {
        fontSize: 48,
        marginBottom: 12,
    },
    encouragementText: {
        fontSize: TYPOGRAPHY.fontSize.body,
        textAlign: 'center',
        lineHeight: 24,
    },
});

export default HistoryScreen;
