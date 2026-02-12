// MediFlow Card Component
// Reusable card container for medicines, reminders, etc.

import React, { useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';

const Card = ({
    children,
    onPress,
    style,
    variant = 'default', // default, elevated, outlined, gradient
    gradientColors,
}) => {
    const { colors } = useTheme();
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
        const styles = [{
            backgroundColor: colors.cardBackground,
            borderRadius: 16,
            padding: 16,
            marginVertical: 8,
        }];

        switch (variant) {
            case 'elevated':
                styles.push({
                    shadowColor: colors.shadow.large,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 1,
                    shadowRadius: 12,
                    elevation: 6,
                });
                break;
            case 'outlined':
                styles.push({
                    borderWidth: 1,
                    borderColor: colors.border,
                    shadowOpacity: 0,
                    elevation: 0,
                });
                break;
            case 'gradient':
                styles.push({ padding: 0, overflow: 'hidden' });
                break;
            default:
                styles.push({
                    shadowColor: colors.shadow.medium,
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 1,
                    shadowRadius: 8,
                    elevation: 3,
                });
        }

        return styles;
    };

    const CardContainer = onPress ? TouchableOpacity : View;
    const animatedStyle = onPress ? { transform: [{ scale: scaleAnim }] } : {};

    if (variant === 'gradient') {
        return (
            <Animated.View style={[...getCardStyle(), style, animatedStyle]}>
                <LinearGradient
                    colors={gradientColors || colors.gradientPrimary}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{ borderRadius: 16 }}
                >
                    <CardContainer
                        onPress={onPress}
                        onPressIn={handlePressIn}
                        onPressOut={handlePressOut}
                        activeOpacity={0.9}
                        style={{ padding: 16 }}
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

export default Card;
