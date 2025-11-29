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
} from 'react-native';


// Components
import Card from '../components/common/Card';

// Stores
import useUserStore from '../store/useUserStore';

// Services
import databaseService from '../services/databaseService';

// Constants
import COLORS from '../constants/colors';
import TYPOGRAPHY from '../constants/typography';

const HistoryScreen = () => {
    const { user } = useUserStore();
    const [history, setHistory] = useState([]);
    const [stats, setStats] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState('timeline'); // timeline, stats

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
                return '✓';
            case 'skipped':
                return '⏭️';
            case 'missed':
                return '❌';
            default:
                return '•';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'taken':
                return COLORS.taken;
            case 'skipped':
                return COLORS.skipped;
            case 'missed':
                return COLORS.missed;
            default:
                return COLORS.textSecondary;
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
            return 'Today';
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Yesterday';
        } else {
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
            });
        }
    };

    // Group history by date
    const groupedHistory = history.reduce((groups, entry) => {
        const date = formatDate(entry.scheduled_time);
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(entry);
        return groups;
    }, {});

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>History</Text>
            </View>

            {/* Tabs */}
            <View style={styles.tabs}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'timeline' ? styles.tabActive : null]}
                    onPress={() => setActiveTab('timeline')}
                >
                    <Text style={[styles.tabText, activeTab === 'timeline' ? styles.tabTextActive : null]}>
                        Timeline
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'stats' ? styles.tabActive : null]}
                    onPress={() => setActiveTab('stats')}
                >
                    <Text style={[styles.tabText, activeTab === 'stats' ? styles.tabTextActive : null]}>
                        Statistics
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
                    /* Timeline View */
                    <View style={styles.content}>
                        {history.length === 0 ? (
                            <Card>
                                <Text style={styles.emptyText}>No history yet</Text>
                                <Text style={styles.emptySubtext}>
                                    Your medication intake history will appear here
                                </Text>
                            </Card>
                        ) : (
                            Object.keys(groupedHistory).map((date) => (
                                <View key={date} style={styles.dateGroup}>
                                    <Text style={styles.dateHeader}>{date}</Text>
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
                                                    <Text style={styles.historyTime}>
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
                                            <Text style={styles.medicineName}>
                                                {entry.medicine_name || 'Medicine'}
                                            </Text>
                                            {entry.late_by_minutes > 0 && (
                                                <Text style={styles.lateText}>
                                                    {entry.late_by_minutes} minutes late
                                                </Text>
                                            )}
                                            {entry.notes && (
                                                <Text style={styles.notes}>Note: {entry.notes}</Text>
                                            )}
                                        </Card>
                                    ))}
                                </View>
                            ))
                        )}
                    </View>
                ) : (
                    /* Statistics View */
                    <View style={styles.content}>
                        {stats && (
                            <>
                                {/* Overall Adherence */}
                                <Card style={styles.statsCard}>
                                    <Text style={styles.statsTitle}>Overall Adherence</Text>
                                    <Text style={styles.statsPercentage}>{stats.adherenceRate}%</Text>
                                    <View style={styles.progressBar}>
                                        <View
                                            style={[
                                                styles.progressFill,
                                                { width: `${stats.adherenceRate}%` },
                                            ]}
                                        />
                                    </View>
                                    <Text style={styles.statsSubtext}>
                                        {stats.taken} taken / {stats.total} total (Last 30 days)
                                    </Text>
                                </Card>

                                {/* Breakdown */}
                                <Card style={styles.statsCard}>
                                    <Text style={styles.statsTitle}>Breakdown</Text>
                                    <View style={styles.statsRow}>
                                        <View style={styles.statItem}>
                                            <Text style={[styles.statValue, { color: COLORS.taken }]}>
                                                {stats.taken}
                                            </Text>
                                            <Text style={styles.statLabel}>Taken</Text>
                                        </View>
                                        <View style={styles.statItem}>
                                            <Text style={[styles.statValue, { color: COLORS.skipped }]}>
                                                {stats.skipped}
                                            </Text>
                                            <Text style={styles.statLabel}>Skipped</Text>
                                        </View>
                                        <View style={styles.statItem}>
                                            <Text style={[styles.statValue, { color: COLORS.missed }]}>
                                                {stats.missed}
                                            </Text>
                                            <Text style={styles.statLabel}>Missed</Text>
                                        </View>
                                    </View>
                                </Card>

                                {/* Encouragement */}
                                {stats.adherenceRate >= 80 && (
                                    <Card variant="outlined" style={styles.encouragementCard}>
                                        <Text style={styles.encouragementIcon}>🎉</Text>
                                        <Text style={styles.encouragementText}>
                                            Great job! You're doing excellent with your medication adherence!
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
        backgroundColor: COLORS.lightGray,
    },
    header: {
        backgroundColor: COLORS.white,
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    headerTitle: {
        fontSize: TYPOGRAPHY.fontSize.h2,
        fontWeight: TYPOGRAPHY.fontWeight.bold,
        color: COLORS.textPrimary,
    },
    tabs: {
        flexDirection: 'row',
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    tab: {
        flex: 1,
        paddingVertical: 16,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    tabActive: {
        borderBottomColor: COLORS.primary,
    },
    tabText: {
        fontSize: TYPOGRAPHY.fontSize.body,
        color: COLORS.textSecondary,
    },
    tabTextActive: {
        color: COLORS.primary,
        fontWeight: TYPOGRAPHY.fontWeight.semiBold,
    },
    scrollView: {
        flex: 1,
    },
    content: {
        padding: 16,
    },
    emptyText: {
        fontSize: TYPOGRAPHY.fontSize.body,
        color: COLORS.textSecondary,
        textAlign: 'center',
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: TYPOGRAPHY.fontSize.small,
        color: COLORS.textDisabled,
        textAlign: 'center',
    },
    dateGroup: {
        marginBottom: 24,
    },
    dateHeader: {
        fontSize: TYPOGRAPHY.fontSize.body,
        fontWeight: TYPOGRAPHY.fontWeight.bold,
        color: COLORS.textPrimary,
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
        color: COLORS.textPrimary,
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
        color: COLORS.textPrimary,
        marginBottom: 4,
    },
    lateText: {
        fontSize: TYPOGRAPHY.fontSize.small,
        color: COLORS.warning,
    },
    notes: {
        fontSize: TYPOGRAPHY.fontSize.small,
        color: COLORS.textSecondary,
        fontStyle: 'italic',
        marginTop: 4,
    },
    statsCard: {
        marginBottom: 16,
    },
    statsTitle: {
        fontSize: TYPOGRAPHY.fontSize.h3,
        fontWeight: TYPOGRAPHY.fontWeight.bold,
        color: COLORS.textPrimary,
        marginBottom: 16,
    },
    statsPercentage: {
        fontSize: 48,
        fontWeight: TYPOGRAPHY.fontWeight.bold,
        color: COLORS.primary,
        textAlign: 'center',
        marginBottom: 16,
    },
    progressBar: {
        height: 12,
        backgroundColor: COLORS.border,
        borderRadius: 6,
        overflow: 'hidden',
        marginBottom: 8,
    },
    progressFill: {
        height: '100%',
        backgroundColor: COLORS.primary,
    },
    statsSubtext: {
        fontSize: TYPOGRAPHY.fontSize.small,
        color: COLORS.textSecondary,
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
        color: COLORS.textSecondary,
    },
    encouragementCard: {
        alignItems: 'center',
        padding: 20,
        backgroundColor: COLORS.success + '10',
        borderColor: COLORS.success,
    },
    encouragementIcon: {
        fontSize: 48,
        marginBottom: 12,
    },
    encouragementText: {
        fontSize: TYPOGRAPHY.fontSize.body,
        color: COLORS.textPrimary,
        textAlign: 'center',
        lineHeight: 24,
    },
});

export default HistoryScreen;
