// MediFlow Main App Entry Point
// Initializes database, notifications, and checks for existing session

import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Services
import databaseService from './src/services/databaseService';
import notificationService from './src/services/notificationService';

// Stores
import useUserStore from './src/store/useUserStore';

// Theme
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { LanguageProvider } from './src/context/LanguageContext';

// Navigation
import AppNavigator from './src/navigation/AppNavigator';

// Inner app component that can use theme
function AppContent() {
  const [isReady, setIsReady] = useState(false);
  const { checkSession } = useUserStore();
  const { colors } = useTheme();

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      console.log('🚀 Starting MediFlow initialization...');

      // Initialize database
      console.log('📦 Initializing database...');
      await databaseService.init();
      console.log('✅ Database initialized');

      // Initialize notifications
      console.log('🔔 Initializing notifications...');
      await notificationService.init();
      console.log('✅ Notifications initialized');

      // Check for existing session
      console.log('👤 Checking session...');
      const user = await checkSession();
      if (user) {
        console.log('✅ Session restored for:', user.name);
      } else {
        console.log('ℹ️ No active session — showing auth screens');
      }

      console.log('🎉 MediFlow ready!');
      setIsReady(true);
    } catch (error) {
      console.error('❌ App initialization error:', error);
      console.error('Error details:', error.message);
      // Still show app even if init fails
      setIsReady(true);
    }
  };

  if (!isReady) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return <AppNavigator />;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <LanguageProvider>
        <ThemeProvider>
          <AppContent />
        </ThemeProvider>
      </LanguageProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
