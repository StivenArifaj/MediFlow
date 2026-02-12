// MediFlow Theme Context
// Provides dynamic light/dark colors to the entire app

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { LIGHT_COLORS, DARK_COLORS } from '../constants/colors';
import useUserStore from '../store/useUserStore';

const ThemeContext = createContext({
    colors: LIGHT_COLORS,
    isDark: false,
    toggleTheme: () => { },
    setTheme: () => { },
});

export const ThemeProvider = ({ children }) => {
    const { user, updateSettings } = useUserStore();
    const savedTheme = user?.settings?.theme || 'light';
    const [theme, setThemeState] = useState(savedTheme);

    // Sync with store on user load
    useEffect(() => {
        if (user?.settings?.theme) {
            setThemeState(user.settings.theme);
        }
    }, [user?.settings?.theme]);

    const isDark = theme === 'dark';
    const colors = isDark ? DARK_COLORS : LIGHT_COLORS;

    const toggleTheme = async () => {
        const newTheme = isDark ? 'light' : 'dark';
        setThemeState(newTheme);
        try {
            await updateSettings({ theme: newTheme });
        } catch (e) {
            console.warn('Could not persist theme:', e);
        }
    };

    const setTheme = async (newTheme) => {
        setThemeState(newTheme);
        try {
            await updateSettings({ theme: newTheme });
        } catch (e) {
            console.warn('Could not persist theme:', e);
        }
    };

    const value = useMemo(
        () => ({ colors, isDark, toggleTheme, setTheme }),
        [isDark]
    );

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
export default ThemeContext;
