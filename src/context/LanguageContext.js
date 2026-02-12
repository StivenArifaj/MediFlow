import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { translations } from '../constants/translations';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState('en');
    const [isLoaded, setIsLoaded] = useState(false);

    // Load saved language on startup
    useEffect(() => {
        loadLanguage();
    }, []);

    const loadLanguage = async () => {
        try {
            const savedLanguage = await AsyncStorage.getItem('user_language');
            if (savedLanguage && translations[savedLanguage]) {
                setLanguage(savedLanguage);
            }
        } catch (error) {
            console.error('Error loading language:', error);
        } finally {
            setIsLoaded(true);
        }
    };

    const changeLanguage = async (newLanguage) => {
        if (translations[newLanguage]) {
            setLanguage(newLanguage);
            try {
                await AsyncStorage.setItem('user_language', newLanguage);
            } catch (error) {
                console.error('Error saving language:', error);
            }
        }
    };

    // Translation helper
    const t = (key) => {
        const keys = key.split('.');
        let value = translations[language];

        for (const k of keys) {
            if (value && value[k]) {
                value = value[k];
            } else {
                // Fallback to English if key missing
                let fallback = translations['en'];
                for (const fk of keys) {
                    if (fallback && fallback[fk]) {
                        fallback = fallback[fk];
                    } else {
                        return key; // Return key if not found in fallback either
                    }
                }
                return fallback;
            }
        }
        return value;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage: changeLanguage, t, isLoaded }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
