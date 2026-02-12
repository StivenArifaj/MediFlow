// MediFlow Input Component
// Reusable text input with validation and error handling

import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import TYPOGRAPHY from '../../constants/typography';

const Input = ({
    label,
    value,
    onChangeText,
    placeholder,
    error,
    secureTextEntry = false,
    keyboardType = 'default',
    multiline = false,
    numberOfLines = 1,
    maxLength,
    editable = true,
    style,
    inputStyle,
}) => {
    const { colors } = useTheme();
    const [isFocused, setIsFocused] = useState(false);

    return (
        <View style={[styles.container, style]}>
            {label ? (
                <Text style={[styles.label, { color: colors.textPrimary }]}>{label}</Text>
            ) : null}

            <TextInput
                style={[
                    styles.input,
                    {
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                        color: colors.textPrimary,
                    },
                    isFocused ? { borderColor: colors.primary, borderWidth: 2 } : null,
                    error ? { borderColor: colors.error } : null,
                    !editable ? { backgroundColor: colors.lightGray, color: colors.textDisabled } : null,
                    multiline ? styles.inputMultiline : null,
                    inputStyle,
                ]}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor={colors.textDisabled}
                secureTextEntry={secureTextEntry}
                keyboardType={keyboardType}
                multiline={multiline}
                numberOfLines={numberOfLines}
                maxLength={maxLength}
                editable={editable}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
            />

            {error ? (
                <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
            ) : null}

            {maxLength && (
                <Text style={[styles.characterCount, { color: colors.textSecondary }]}>
                    {value?.length || 0}/{maxLength}
                </Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginVertical: 8,
    },
    label: {
        fontSize: TYPOGRAPHY.fontSize.small,
        fontWeight: TYPOGRAPHY.fontWeight.medium,
        marginBottom: 6,
    },
    input: {
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: TYPOGRAPHY.fontSize.body,
    },
    inputMultiline: {
        minHeight: 80,
        textAlignVertical: 'top',
    },
    errorText: {
        fontSize: TYPOGRAPHY.fontSize.caption,
        marginTop: 4,
    },
    characterCount: {
        fontSize: TYPOGRAPHY.fontSize.caption,
        textAlign: 'right',
        marginTop: 4,
    },
});

export default Input;
