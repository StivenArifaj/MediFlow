// MediFlow Main App Entry Point
// Initializes database, notifications, and navigation

import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Services
import databaseService from './src/services/databaseService';
import notificationService from './src/services/notificationService';

// Stores
import useUserStore from './src/store/useUserStore';

// Navigation
import AppNavigator from './src/navigation/AppNavigator';

// Constants
import COLORS from './src/constants/colors';

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const { initUser, loadUser } = useUserStore();

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

      // Initialize or load user
      console.log('👤 Loading user...');
      const userId = 'local_user_1';
      let user = await databaseService.getUser(userId);

      if (!user) {
        console.log('Creating new user...');
        await initUser({ name: 'User' });
        console.log('✅ User created');
      } else {
        console.log('Loading existing user...');
        await loadUser(userId);
        console.log('✅ User loaded');
      }

      console.log('🎉 MediFlow ready!');
      setIsReady(true);
    } catch (error) {
      console.error('❌ App initialization error:', error);
      console.error('Error details:', error.message);
      console.error('Stack:', error.stack);
      // Still show app even if init fails
      setIsReady(true);
    }
  };

  if (!isReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <AppNavigator />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
});
