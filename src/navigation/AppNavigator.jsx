// MediFlow App Navigator
// Navigation structure with bottom tabs and stack navigation

import React from 'react';
import { Text, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Screens
import HomeScreen from '../screens/HomeScreen';
import HistoryScreen from '../screens/HistoryScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AddMedicineScreen from '../screens/AddMedicineScreen';
import MedicineDetailScreen from '../screens/MedicineDetailScreen';
import ReminderSetupScreen from '../screens/ReminderSetupScreen';
import ScanScreen from '../screens/ScanScreen';

// Constants
import COLORS from '../constants/colors';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Simplified HomeStack for testing
const HomeStack = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerStyle: {
                    backgroundColor: COLORS.primary,
                },
                headerTintColor: COLORS.textWhite,
                headerTitleStyle: {
                    fontWeight: 'bold',
                },
            }}
        >
            <Stack.Screen
                name="HomeMain"
                component={HomeScreen}
                options={{ title: 'MediFlow' }}
            />
            <Stack.Screen
                name="ScanMedicine"
                component={ScanScreen}
                options={{
                    title: 'Scan Medicine',
                    headerShown: true,
                }}
            />
            <Stack.Screen
                name="AddMedicine"
                component={AddMedicineScreen}
                options={{ title: 'Add Medicine' }}
            />
            <Stack.Screen
                name="MedicineDetail"
                component={MedicineDetailScreen}
                options={{ title: 'Medicine Details' }}
            />
            <Stack.Screen
                name="ReminderSetup"
                component={ReminderSetupScreen}
                options={{ title: 'Set Reminder' }}
            />
        </Stack.Navigator>
    );
};

// Custom Tab Bar Icon Component
const TabIcon = ({ label, focused }) => {
    const icons = {
        Home: focused ? '🏠' : '🏡',
        History: focused ? '📊' : '📈',
        Profile: focused ? '👤' : '👥',
    };

    return (
        <Text style={{ fontSize: 24, marginBottom: 4 }}>
            {icons[label] || '•'}
        </Text>
    );
};

// Main Tab Navigator with Safe Area Fix
const TabNavigator = () => {
    const insets = useSafeAreaInsets();

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused }) => (
                    <TabIcon label={route.name} focused={focused} />
                ),
                tabBarActiveTintColor: COLORS.primary,
                tabBarInactiveTintColor: COLORS.textSecondary,
                tabBarStyle: {
                    paddingBottom: Math.max(insets.bottom, 8), // Safe area padding
                    paddingTop: 8,
                    height: 60 + Math.max(insets.bottom, 8), // Adjust height for safe area
                    backgroundColor: COLORS.white,
                    borderTopWidth: 1,
                    borderTopColor: COLORS.borderLight,
                    elevation: 8,
                    shadowColor: COLORS.shadow.medium,
                    shadowOffset: {
                        width: 0,
                        height: -2,
                    },
                    shadowOpacity: 1,
                    shadowRadius: 8,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '600',
                    marginBottom: Platform.OS === 'android' ? 4 : 0,
                },
                headerShown: false,
            })}
        >
            <Tab.Screen name="Home" component={HomeStack} />
            <Tab.Screen name="History" component={HistoryScreen} />
            <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
    );
};

// Main App Navigator
const AppNavigator = () => {
    return (
        <NavigationContainer>
            <TabNavigator />
        </NavigationContainer>
    );
};

export default AppNavigator;
