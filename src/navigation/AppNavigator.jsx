// MediFlow App Navigator
// Navigation structure with bottom tabs and stack navigation

import React from 'react';
import { Text, Platform, View, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Home, History, User, Plus, ScanLine, Pill, Bell, ChevronLeft, Activity } from 'lucide-react-native';

// Screens
import HomeScreen from '../screens/HomeScreen';
import HistoryScreen from '../screens/HistoryScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AddMedicineScreen from '../screens/AddMedicineScreen';
import MedicineDetailScreen from '../screens/MedicineDetailScreen';
import ReminderSetupScreen from '../screens/ReminderSetupScreen';
import ScanScreen from '../screens/ScanScreen';
import HealthScreen from '../screens/HealthScreen';

// Constants
import COLORS from '../constants/colors';
import notificationService from '../services/notificationService';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Custom Header Component
const CustomHeader = ({ title, navigation, back }) => {
    const insets = useSafeAreaInsets();

    return (
        <LinearGradient
            colors={COLORS.gradientPrimary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
                paddingTop: insets.top,
                paddingBottom: 15,
                paddingHorizontal: 20,
                flexDirection: 'row',
                alignItems: 'center',
                elevation: 4,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            }}
        >
            {back && (
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={{ marginRight: 15 }}
                >
                    <ChevronLeft color={COLORS.white} size={28} />
                </TouchableOpacity>
            )}
            <Text style={{
                color: COLORS.white,
                fontSize: 20,
                fontWeight: 'bold',
                flex: 1
            }}>
                {title}
            </Text>
        </LinearGradient>
    );
};

// Home Stack Navigator (for screens accessible from Home)
const HomeStack = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                header: ({ navigation, route, options, back }) => (
                    <CustomHeader
                        title={options.title}
                        navigation={navigation}
                        back={back}
                    />
                ),
            }}
        >
            <Stack.Screen
                name="HomeScreen"
                component={HomeScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="AddMedicine"
                component={AddMedicineScreen}
                options={{ title: 'Add Medicine' }}
            />
            <Stack.Screen
                name="ScanMedicine"
                component={ScanScreen}
                options={{ title: 'Scan Medicine', headerShown: false }}
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

// Main Tab Navigator with Safe Area Fix
const TabNavigator = () => {
    const insets = useSafeAreaInsets();

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    if (route.name === 'Home') {
                        return <Home size={24} color={color} strokeWidth={focused ? 2.5 : 2} />;
                    } else if (route.name === 'Health') {
                        return <Activity size={24} color={color} strokeWidth={focused ? 2.5 : 2} />;
                    } else if (route.name === 'History') {
                        return <History size={24} color={color} strokeWidth={focused ? 2.5 : 2} />;
                    } else if (route.name === 'Profile') {
                        return <User size={24} color={color} strokeWidth={focused ? 2.5 : 2} />;
                    }
                },
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
            <Tab.Screen name="Health" component={HealthScreen} />
            <Tab.Screen name="History" component={HistoryScreen} />
            <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
    );
};

// Main App Navigator
const AppNavigator = () => {
    const navigationRef = React.useRef();

    React.useEffect(() => {
        // Handle notification tap response
        const subscription = notificationService.addNotificationResponseListener(response => {
            const data = response.notification.request.content.data;

            if (data?.type === 'medicine_reminder' && data?.med_id) {
                // Navigate to medicine details
                if (navigationRef.current) {
                    navigationRef.current.navigate('MedicineDetail', {
                        medId: data.med_id
                    });
                }
            }
        });

        return () => {
            notificationService.removeNotificationListener(subscription);
        };
    }, []);

    return (
        <NavigationContainer ref={navigationRef}>
            <TabNavigator />
        </NavigationContainer>
    );
};

export default AppNavigator;
