// MediFlow Empty State Component
// Display when no data is available

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Button from './Button';
import { useTheme } from '../../context/ThemeContext';
import TYPOGRAPHY from '../../constants/typography';

const EmptyState = ({
    icon = '📭',
    title = 'No items yet',
    description = 'Get started by adding your first item',
    actionText,
    onAction,
    style,
}) => {
    const { colors } = useTheme();

    return (
        <View style={[styles.container, style]}>
            <Text style={styles.icon}>{icon}</Text>
            <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
            <Text style={[styles.description, { color: colors.textSecondary }]}>{description}</Text>
            {actionText && onAction && (
                <Button
                    title={actionText}
                    onPress={onAction}
                    variant="gradient"
                    style={styles.button}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    icon: {
        fontSize: 80,
        marginBottom: 24,
    },
    title: {
        fontSize: TYPOGRAPHY.fontSize.h2,
        fontWeight: TYPOGRAPHY.fontWeight.bold,
        marginBottom: 12,
        textAlign: 'center',
    },
    description: {
        fontSize: TYPOGRAPHY.fontSize.body,
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 24,
    },
    button: {
        minWidth: 200,
    },
});

export default EmptyState;
