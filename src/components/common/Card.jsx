// MediFlow Card Component
// Reusable card container for medicines, reminders, etc.

import React, { useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import COLORS from '../../constants/colors';

const Card = ({
    children,
    onPress,
    style,
    variant = 'default', // default, elevated, outlined, gradient
    gradientColors,
}) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        if (onPress) {
            Animated.spring(scaleAnim, {
                toValue: 0.98,
                useNativeDriver: true,
                friction: 8,
            }).start();
        }
    };

    const handlePressOut = () => {
        if (onPress) {
            Animated.spring(scaleAnim, {
                toValue: 1,
                useNativeDriver: true,
                friction: 8,
            }).start();
        }
    };

    const getCardStyle = () => {
        const styles = [cardStyles.base];

        switch (variant) {
            case 'elevated':
                styles.push(cardStyles.elevated);
                break;
            case 'outlined':
                styles.push(cardStyles.outlined);
                break;
            case 'gradient':
                styles.push(cardStyles.gradient);
                break;
            default:
                styles.push(cardStyles.default);
        }

        return styles;
    };

    const CardContainer = onPress ? TouchableOpacity : View;
    const animatedStyle = onPress ? { transform: [{ scale: scaleAnim }] } : {};

    if (variant === 'gradient') {
        return (
            <Animated.View style={[...getCardStyle(), style, animatedStyle]}>
                <LinearGradient
                    colors={gradientColors || COLORS.gradientPrimary}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={cardStyles.gradientBackground}
                >
                    <CardContainer
                        onPress={onPress}
                        onPressIn={handlePressIn}
                        onPressOut={handlePressOut}
                        activeOpacity={0.9}
                        style={cardStyles.gradientContent}
                    >
                        {children}
                    </CardContainer>
                </LinearGradient>
            </Animated.View>
        );
    }

    return (
        <Animated.View style={[...getCardStyle(), style, animatedStyle]}>
            <CardContainer
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                activeOpacity={onPress ? 0.9 : 1}
            >
                {children}
            </CardContainer>
        </Animated.View>
    );
};

const cardStyles = StyleSheet.create({
    base: {
        backgroundColor: COLORS.cardBackground,
        borderRadius: 16,
        padding: 16,
        marginVertical: 8,
    },
    default: {
        shadowColor: COLORS.shadow.medium,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 1,
        shadowRadius: 8,
        elevation: 3,
    },
    elevated: {
        shadowColor: COLORS.shadow.large,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 1,
        shadowRadius: 12,
        elevation: 6,
    },
    outlined: {
        borderWidth: 1,
        borderColor: COLORS.border,
        shadowOpacity: 0,
        elevation: 0,
    },
    gradient: {
        padding: 0,
        overflow: 'hidden',
    },
    gradientBackground: {
        borderRadius: 16,
    },
    gradientContent: {
        padding: 16,
    },
});

export default Card;
