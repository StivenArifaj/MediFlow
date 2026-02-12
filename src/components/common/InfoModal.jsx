// MediFlow Info Modal
// Reusable scrollable content modal for Help, Privacy Policy, Terms of Service

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Modal,
    TouchableOpacity,
    StatusBar,
} from 'react-native';
import { X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Theme
import { useTheme } from '../../context/ThemeContext';

// Constants
import TYPOGRAPHY from '../../constants/typography';

const InfoModal = ({ visible, onClose, title, children }) => {
    const { colors, isDark } = useTheme();
    const insets = useSafeAreaInsets();

    return (
        <Modal
            animationType="slide"
            presentationStyle="pageSheet"
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
                <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

                {/* Header */}
                <View style={[styles.header, { borderBottomColor: colors.border }]}>
                    <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
                    <TouchableOpacity
                        style={[styles.closeButton, { backgroundColor: colors.lightGray }]}
                        onPress={onClose}
                    >
                        <X size={20} color={colors.textSecondary} />
                    </TouchableOpacity>
                </View>

                {/* Content */}
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.contentContainer}
                    showsVerticalScrollIndicator={false}
                >
                    {children}
                </ScrollView>
            </View>
        </Modal>
    );
};

// Helper sub-components for structured content
export const Section = ({ title, children, colors }) => (
    <View style={styles.section}>
        {title && <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>{title}</Text>}
        {children}
    </View>
);

export const Paragraph = ({ children, colors }) => (
    <Text style={[styles.paragraph, { color: colors.textSecondary }]}>{children}</Text>
);

export const BulletPoint = ({ children, colors }) => (
    <View style={styles.bulletRow}>
        <Text style={[styles.bullet, { color: colors.primary }]}>•</Text>
        <Text style={[styles.bulletText, { color: colors.textSecondary }]}>{children}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
    },
    title: {
        fontSize: TYPOGRAPHY.fontSize.h2,
        fontWeight: TYPOGRAPHY.fontWeight.bold,
        flex: 1,
    },
    closeButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 12,
    },
    scrollView: {
        flex: 1,
    },
    contentContainer: {
        padding: 20,
        paddingBottom: 40,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: TYPOGRAPHY.fontSize.h3,
        fontWeight: TYPOGRAPHY.fontWeight.bold,
        marginBottom: 12,
    },
    paragraph: {
        fontSize: TYPOGRAPHY.fontSize.body,
        lineHeight: 24,
        marginBottom: 12,
    },
    bulletRow: {
        flexDirection: 'row',
        paddingLeft: 4,
        marginBottom: 8,
    },
    bullet: {
        fontSize: TYPOGRAPHY.fontSize.body,
        marginRight: 10,
        lineHeight: 24,
    },
    bulletText: {
        fontSize: TYPOGRAPHY.fontSize.body,
        lineHeight: 24,
        flex: 1,
    },
});

export default InfoModal;
