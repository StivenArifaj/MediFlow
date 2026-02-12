// MediFlow Login Screen
// Email + password form with validation

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    ActivityIndicator,
    StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Mail, Lock, Eye, EyeOff, ChevronLeft, Pill } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import useUserStore from '../../store/useUserStore';
import { useLanguage } from '../../context/LanguageContext';

export default function LoginScreen({ navigation }) {
    const insets = useSafeAreaInsets();
    const { colors, isDark } = useTheme();
    const { login, loading, error, clearError } = useUserStore();
    const { t } = useLanguage();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [localError, setLocalError] = useState('');

    const handleLogin = async () => {
        setLocalError('');
        clearError();

        if (!email.trim()) {
            setLocalError(t('auth.fillAllFields'));
            return;
        }
        if (!password) {
            setLocalError(t('auth.fillAllFields'));
            return;
        }

        try {
            await login(email, password);
            // Navigation handled by auth state change in App.js
        } catch (err) {
            setLocalError(err.message);
        }
    };

    const displayError = localError || error;

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

            <KeyboardAvoidingView
                style={styles.flex}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView
                    contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top }]}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {/* Back Button */}
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <ChevronLeft size={24} color={colors.text} />
                    </TouchableOpacity>

                    {/* Header */}
                    <View style={styles.headerSection}>
                        <View style={styles.logoSmall}>
                            <LinearGradient
                                colors={['#00D4D4', '#00A3A3']}
                                style={styles.logoSmallGradient}
                            >
                                <Pill size={24} color="#FFFFFF" strokeWidth={2.5} />
                            </LinearGradient>
                        </View>
                        <Text style={[styles.title, { color: colors.text }]}>{t('auth.welcomeBack')}</Text>
                        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                            {t('auth.signInSubtitle')}
                        </Text>
                    </View>

                    {/* Error Message */}
                    {displayError ? (
                        <View style={styles.errorContainer}>
                            <Text style={styles.errorText}>{displayError}</Text>
                        </View>
                    ) : null}

                    {/* Form */}
                    <View style={styles.formSection}>
                        {/* Email Input */}
                        <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                            <Mail size={20} color={colors.textSecondary} style={styles.inputIcon} />
                            <TextInput
                                style={[styles.input, { color: colors.text }]}
                                placeholder={t('auth.email')}
                                placeholderTextColor={colors.textSecondary}
                                value={email}
                                onChangeText={(text) => { setEmail(text); setLocalError(''); }}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCorrect={false}
                                autoComplete="email"
                            />
                        </View>

                        {/* Password Input */}
                        <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                            <Lock size={20} color={colors.textSecondary} style={styles.inputIcon} />
                            <TextInput
                                style={[styles.input, { color: colors.text }]}
                                placeholder={t('auth.password')}
                                placeholderTextColor={colors.textSecondary}
                                value={password}
                                onChangeText={(text) => { setPassword(text); setLocalError(''); }}
                                secureTextEntry={!showPassword}
                                autoComplete="password"
                            />
                            <TouchableOpacity
                                onPress={() => setShowPassword(!showPassword)}
                                style={styles.eyeButton}
                            >
                                {showPassword
                                    ? <EyeOff size={20} color={colors.textSecondary} />
                                    : <Eye size={20} color={colors.textSecondary} />
                                }
                            </TouchableOpacity>
                        </View>

                        {/* Login Button */}
                        <TouchableOpacity
                            style={styles.submitButton}
                            activeOpacity={0.85}
                            onPress={handleLogin}
                            disabled={loading}
                        >
                            <LinearGradient
                                colors={['#00D4D4', '#00A3A3']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.submitButtonGradient}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#FFFFFF" />
                                ) : (
                                    <Text style={styles.submitButtonText}>{t('auth.login')}</Text>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>

                    {/* Footer */}
                    <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
                        <Text style={[styles.footerText, { color: colors.textSecondary }]}>
                            {t('auth.noAccount')}{' '}
                        </Text>
                        <TouchableOpacity onPress={() => navigation.replace('Register')}>
                            <Text style={[styles.footerLink, { color: colors.primary }]}>{t('auth.register')}</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    flex: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 24,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
    },
    headerSection: {
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 32,
    },
    logoSmall: {
        marginBottom: 20,
    },
    logoSmallGradient: {
        width: 60,
        height: 60,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 15,
        textAlign: 'center',
        lineHeight: 22,
    },
    errorContainer: {
        backgroundColor: 'rgba(239,68,68,0.1)',
        borderWidth: 1,
        borderColor: 'rgba(239,68,68,0.3)',
        borderRadius: 12,
        padding: 14,
        marginBottom: 20,
    },
    errorText: {
        color: '#EF4444',
        fontSize: 14,
        textAlign: 'center',
        fontWeight: '500',
    },
    formSection: {
        gap: 16,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 14,
        borderWidth: 1.5,
        paddingHorizontal: 16,
        height: 56,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
        height: '100%',
    },
    eyeButton: {
        padding: 8,
        marginLeft: 4,
    },
    submitButton: {
        borderRadius: 14,
        overflow: 'hidden',
        marginTop: 8,
        shadowColor: '#00D4D4',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 6,
    },
    submitButtonGradient: {
        paddingVertical: 17,
        alignItems: 'center',
        borderRadius: 14,
    },
    submitButtonText: {
        color: '#FFFFFF',
        fontSize: 17,
        fontWeight: 'bold',
        letterSpacing: 0.3,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 'auto',
        paddingTop: 24,
    },
    footerText: {
        fontSize: 15,
    },
    footerLink: {
        fontSize: 15,
        fontWeight: '700',
    },
});
