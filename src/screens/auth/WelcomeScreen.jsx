// MediFlow Welcome Screen
// Premium branded splash with Login / Register navigation

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
    Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Heart, Shield, Bell, Pill } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen({ navigation }) {
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const { t } = useLanguage();

    const features = [
        { icon: Pill, label: t('features.trackMedicines') },
        { icon: Bell, label: t('features.smartReminders') },
        { icon: Heart, label: t('features.healthMonitoring') },
        { icon: Shield, label: t('features.securePrivate') },
    ];

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            <LinearGradient
                colors={['#0F1B2E', '#1B2B44', '#00A3A3']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.gradient, { paddingTop: insets.top + 40 }]}
            >
                {/* Logo & Brand */}
                <View style={styles.brandSection}>
                    <View style={styles.logoContainer}>
                        <LinearGradient
                            colors={['#00D4D4', '#00A3A3']}
                            style={styles.logoGradient}
                        >
                            <Pill size={40} color="#FFFFFF" strokeWidth={2.5} />
                        </LinearGradient>
                    </View>
                    <Text style={styles.appName}>MediFlow</Text>
                    <Text style={styles.tagline}>{t('auth.tagline')}</Text>
                </View>

                {/* Features Grid */}
                <View style={styles.featuresSection}>
                    {features.map((feature, index) => (
                        <View key={index} style={styles.featureItem}>
                            <View style={styles.featureIconContainer}>
                                <feature.icon size={22} color="#00D4D4" strokeWidth={2} />
                            </View>
                            <Text style={styles.featureLabel}>{feature.label}</Text>
                        </View>
                    ))}
                </View>

                {/* Buttons */}
                <View style={[styles.buttonSection, { paddingBottom: insets.bottom + 30 }]}>
                    <TouchableOpacity
                        style={styles.primaryButton}
                        activeOpacity={0.85}
                        onPress={() => navigation.navigate('Register')}
                    >
                        <LinearGradient
                            colors={['#00D4D4', '#00A3A3']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.primaryButtonGradient}
                        >
                            <Text style={styles.primaryButtonText}>{t('auth.getStarted')}</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.secondaryButton}
                        activeOpacity={0.7}
                        onPress={() => navigation.navigate('Login')}
                    >
                        <Text style={styles.secondaryButtonText}>{t('auth.hasAccount')}</Text>
                    </TouchableOpacity>
                </View>
            </LinearGradient>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    gradient: {
        flex: 1,
        justifyContent: 'space-between',
    },
    brandSection: {
        alignItems: 'center',
        paddingTop: 40,
    },
    logoContainer: {
        marginBottom: 20,
    },
    logoGradient: {
        width: 90,
        height: 90,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#00D4D4',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
        elevation: 12,
    },
    appName: {
        fontSize: 42,
        fontWeight: 'bold',
        color: '#FFFFFF',
        letterSpacing: 1,
    },
    tagline: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.7)',
        marginTop: 8,
        letterSpacing: 0.5,
    },
    featuresSection: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        paddingHorizontal: 30,
        gap: 16,
    },
    featureItem: {
        width: (width - 80) / 2,
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 16,
        paddingVertical: 20,
        paddingHorizontal: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    featureIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 14,
        backgroundColor: 'rgba(0,212,212,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    featureLabel: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 14,
        fontWeight: '600',
    },
    buttonSection: {
        paddingHorizontal: 24,
    },
    primaryButton: {
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#00D4D4',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 14,
        elevation: 8,
    },
    primaryButtonGradient: {
        paddingVertical: 18,
        alignItems: 'center',
        borderRadius: 16,
    },
    primaryButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    secondaryButton: {
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 12,
    },
    secondaryButtonText: {
        color: 'rgba(255,255,255,0.75)',
        fontSize: 16,
        fontWeight: '600',
    },
});
