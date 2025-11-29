// MediFlow Button Component
// Reusable button with variants

import React, { useRef } from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import COLORS from '../../constants/colors';
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
        const styles = [buttonStyles.base];

        // Variant styles
        switch (variant) {
            case 'primary':
                styles.push(buttonStyles.primary);
                break;
            case 'secondary':
                styles.push(buttonStyles.secondary);
                break;
            case 'outline':
                styles.push(buttonStyles.outline);
                break;
            case 'danger':
                styles.push(buttonStyles.danger);
                break;
            case 'gradient':
                styles.push(buttonStyles.gradient);
                break;
        }

        // Size styles
        switch (size) {
            case 'small':
                styles.push(buttonStyles.small);
                break;
            case 'medium':
                styles.push(buttonStyles.medium);
                break;
            case 'large':
                styles.push(buttonStyles.large);
                break;
        }

        // Disabled style
        if (disabled) {
            styles.push(buttonStyles.disabled);
        }

        return styles;
    };

    const getTextStyle = () => {
        const styles = [buttonStyles.text];

        // Variant text styles
        switch (variant) {
            case 'primary':
                styles.push(buttonStyles.primaryText);
                break;
            case 'secondary':
                styles.push(buttonStyles.secondaryText);
                break;
            case 'outline':
                styles.push(buttonStyles.outlineText);
                break;
            case 'danger':
                styles.push(buttonStyles.dangerText);
                break;
        }

        // Size text styles
        switch (size) {
            case 'small':
                styles.push(buttonStyles.smallText);
                break;
            case 'medium':
                styles.push(buttonStyles.mediumText);
                break;
            case 'large':
                styles.push(buttonStyles.largeText);
                break;
        }

        return styles;
    };

    const animatedStyle = { transform: [{ scale: scaleAnim }] };

    if (variant === 'gradient') {
        return (
            <Animated.View style={[...getButtonStyle(), style, animatedStyle]}>
                <LinearGradient
                    colors={gradientColors || COLORS.gradientPrimary}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={buttonStyles.gradientBackground}
                >
                    <TouchableOpacity
                        onPress={onPress}
                        onPressIn={handlePressIn}
                        onPressOut={handlePressOut}
                        disabled={disabled || loading}
                        activeOpacity={0.9}
                        style={buttonStyles.gradientContent}
                    >
                        {loading ? (
                            <ActivityIndicator color={COLORS.white} />
                        ) : (
                            <>
                                {icon && icon}
                                <Text style={[...getTextStyle(), textStyle, { color: COLORS.white }]}>{title}</Text>
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
                        color={variant === 'outline' ? COLORS.primary : COLORS.white}
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

const buttonStyles = StyleSheet.create({
    base: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 12,
        paddingHorizontal: 24,
        paddingVertical: 12,
    },

    // Variants
    primary: {
        backgroundColor: COLORS.primary,
    },
    secondary: {
        backgroundColor: COLORS.success,
    },
    outline: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: COLORS.primary,
    },
    danger: {
        backgroundColor: COLORS.error,
    },
    gradient: {
        padding: 0,
        overflow: 'hidden',
    },
    gradientBackground: {
        borderRadius: 12,
    },
    gradientContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
        paddingVertical: 12,
    },

    // Sizes
    small: {
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    medium: {
        paddingHorizontal: 24,
        paddingVertical: 12,
    },
    large: {
        paddingHorizontal: 32,
        paddingVertical: 16,
    },

    // Disabled
    disabled: {
        opacity: 0.5,
    },

    // Text styles
    text: {
        fontWeight: TYPOGRAPHY.fontWeight.semiBold,
        textAlign: 'center',
    },
    primaryText: {
        color: COLORS.white,
        fontSize: TYPOGRAPHY.fontSize.body,
    },
    secondaryText: {
        color: COLORS.white,
        fontSize: TYPOGRAPHY.fontSize.body,
    },
    outlineText: {
        color: COLORS.primary,
        fontSize: TYPOGRAPHY.fontSize.body,
    },
    dangerText: {
        color: COLORS.white,
        fontSize: TYPOGRAPHY.fontSize.body,
    },
    smallText: {
        fontSize: TYPOGRAPHY.fontSize.small,
    },
    mediumText: {
        fontSize: TYPOGRAPHY.fontSize.body,
    },
    largeText: {
        fontSize: TYPOGRAPHY.fontSize.h3,
    },
});

export default Button;
