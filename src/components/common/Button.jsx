// MediFlow Button Component
// Reusable button with variants

import React, { useRef } from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import TYPOGRAPHY from '../../constants/typography';

const Button = ({
    title,
    onPress,
    variant = 'primary', // primary, secondary, outline, danger, gradient
    size = 'medium', // small, medium, large
    disabled = false,
    loading = false,
    icon = null,
    style,
    textStyle,
    gradientColors,
}) => {
    const { colors } = useTheme();
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        Animated.spring(scaleAnim, {
            toValue: 0.96,
            useNativeDriver: true,
            friction: 8,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
            friction: 8,
        }).start();
    };

    const getButtonStyle = () => {
        const styles = [{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 12,
        }];

        // Variant styles
        switch (variant) {
            case 'primary':
                styles.push({ backgroundColor: colors.primary });
                break;
            case 'secondary':
                styles.push({ backgroundColor: colors.success });
                break;
            case 'outline':
                styles.push({
                    backgroundColor: 'transparent',
                    borderWidth: 2,
                    borderColor: colors.primary,
                });
                break;
            case 'danger':
                styles.push({ backgroundColor: colors.error });
                break;
            case 'gradient':
                styles.push({ padding: 0, overflow: 'hidden' });
                break;
        }

        // Size styles
        switch (size) {
            case 'small':
                styles.push({ paddingHorizontal: 16, paddingVertical: 8 });
                break;
            case 'large':
                styles.push({ paddingHorizontal: 32, paddingVertical: 16 });
                break;
            default:
                styles.push({ paddingHorizontal: 24, paddingVertical: 12 });
        }

        // Disabled style
        if (disabled) {
            styles.push({ opacity: 0.5 });
        }

        return styles;
    };

    const getTextStyle = () => {
        const styles = [{ fontWeight: TYPOGRAPHY.fontWeight.semiBold, textAlign: 'center' }];

        // Variant text styles
        switch (variant) {
            case 'primary':
            case 'secondary':
            case 'danger':
                styles.push({ color: colors.textWhite, fontSize: TYPOGRAPHY.fontSize.body });
                break;
            case 'outline':
                styles.push({ color: colors.primary, fontSize: TYPOGRAPHY.fontSize.body });
                break;
        }

        // Size text styles
        switch (size) {
            case 'small':
                styles.push({ fontSize: TYPOGRAPHY.fontSize.small });
                break;
            case 'large':
                styles.push({ fontSize: TYPOGRAPHY.fontSize.h3 });
                break;
            default:
                styles.push({ fontSize: TYPOGRAPHY.fontSize.body });
                break;
        }

        return styles;
    };

    const animatedStyle = { transform: [{ scale: scaleAnim }] };

    if (variant === 'gradient') {
        return (
            <Animated.View style={[...getButtonStyle(), style, animatedStyle]}>
                <LinearGradient
                    colors={gradientColors || colors.gradientPrimary}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{ borderRadius: 12 }}
                >
                    <TouchableOpacity
                        onPress={onPress}
                        onPressIn={handlePressIn}
                        onPressOut={handlePressOut}
                        disabled={disabled || loading}
                        activeOpacity={0.9}
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                            paddingHorizontal: 24,
                            paddingVertical: 12,
                        }}
                    >
                        {loading ? (
                            <ActivityIndicator color={colors.textWhite} />
                        ) : (
                            <>
                                {icon && icon}
                                <Text style={[...getTextStyle(), textStyle, { color: colors.textWhite }]}>{title}</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </LinearGradient>
            </Animated.View>
        );
    }

    return (
        <Animated.View style={[animatedStyle]}>
            <TouchableOpacity
                style={[...getButtonStyle(), style]}
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                disabled={disabled || loading}
                activeOpacity={0.9}
            >
                {loading ? (
                    <ActivityIndicator
                        color={variant === 'outline' ? colors.primary : colors.textWhite}
                    />
                ) : (
                    <>
                        {icon && icon}
                        <Text style={[...getTextStyle(), textStyle]}>{title}</Text>
                    </>
                )}
            </TouchableOpacity>
        </Animated.View>
    );
};

export default Button;
