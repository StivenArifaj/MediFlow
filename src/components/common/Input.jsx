// MediFlow Input Component
// Reusable text input with validation and error handling

import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';
import COLORS from '../../constants/colors';
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
    const [isFocused, setIsFocused] = useState(false);

    return (
        <View style={[styles.container, style]}>
            {label ? <Text style={styles.label}>{label}</Text> : null}

            <TextInput
                style={[
                    styles.input,
                    isFocused ? styles.inputFocused : null,
                    error ? styles.inputError : null,
                    !editable ? styles.inputDisabled : null,
                    multiline ? styles.inputMultiline : null,
                    inputStyle,
                ]}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor={COLORS.textDisabled}
                secureTextEntry={secureTextEntry}
                keyboardType={keyboardType}
                multiline={multiline}
                numberOfLines={numberOfLines}
                maxLength={maxLength}
                editable={editable}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
            />

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            {maxLength && (
                <Text style={styles.characterCount}>
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
        color: COLORS.textPrimary,
        marginBottom: 6,
    },
    input: {
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: TYPOGRAPHY.fontSize.body,
        color: COLORS.textPrimary,
    },
    inputFocused: {
        borderColor: COLORS.primary,
        borderWidth: 2,
    },
    inputError: {
        borderColor: COLORS.error,
    },
    inputDisabled: {
        backgroundColor: COLORS.lightGray,
        color: COLORS.textDisabled,
    },
    inputMultiline: {
        minHeight: 80,
        textAlignVertical: 'top',
    },
    errorText: {
        fontSize: TYPOGRAPHY.fontSize.caption,
        color: COLORS.error,
        marginTop: 4,
    },
    characterCount: {
        fontSize: TYPOGRAPHY.fontSize.caption,
        color: COLORS.textSecondary,
        textAlign: 'right',
        marginTop: 4,
    },
});

export default Input;
