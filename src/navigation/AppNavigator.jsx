// MediFlow App Navigator
// Navigation structure with auth stack, bottom tabs, and stack navigation

import React from 'react';
import { Text, Platform, View, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Home, History, User, Plus, ScanLine, Pill, Bell, ChevronLeft, Activity } from 'lucide-react-native';

// Theme
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

// Store
import useUserStore from '../store/useUserStore';

// Auth Screens
import WelcomeScreen from '../screens/auth/WelcomeScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

// Main Screens
import HomeScreen from '../screens/HomeScreen';
import HistoryScreen from '../screens/HistoryScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AddMedicineScreen from '../screens/AddMedicineScreen';
import MedicineDetailScreen from '../screens/MedicineDetailScreen';
import ReminderSetupScreen from '../screens/ReminderSetupScreen';
import ScanScreen from '../screens/ScanScreen';
import HealthScreen from '../screens/HealthScreen';

// Services
import notificationService from '../services/notificationService';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const AuthStackNav = createNativeStackNavigator();

const COLORS_WHITE = '#FFFFFF';

// Custom Header Component
const CustomHeader = ({ title, navigation, back }) => {
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();

    return (
        <LinearGradient
            colors={colors.gradientPrimary}
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
                    <ChevronLeft color={COLORS_WHITE} size={28} />
                </TouchableOpacity>
            )}
            <Text style={{
                color: '#FFFFFF',
                fontSize: 20,
                fontWeight: 'bold',
                flex: 1
            }}>
                {title}
            </Text>
        </LinearGradient>
    );
};

// ==================== AUTH STACK ====================
const AuthStack = () => {
    return (
        <AuthStackNav.Navigator
            screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
        >
            <AuthStackNav.Screen name="Welcome" component={WelcomeScreen} />
            <AuthStackNav.Screen name="Login" component={LoginScreen} />
            <AuthStackNav.Screen name="Register" component={RegisterScreen} />
        </AuthStackNav.Navigator>
    );
};

// ==================== MAIN APP STACKS ====================

// Home Stack Navigator (for screens accessible from Home)
const HomeStack = () => {
    const { t } = useLanguage();
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
                options={{ title: t('navigation.addMedicine') }}
            />
            <Stack.Screen
                name="ScanMedicine"
                component={ScanScreen}
                options={{ title: t('navigation.scanMedicine'), headerShown: false }}
            />
            <Stack.Screen
                name="MedicineDetail"
                component={MedicineDetailScreen}
                options={{ title: t('navigation.medicineDetails') }}
            />
            <Stack.Screen
                name="ReminderSetup"
                component={ReminderSetupScreen}
                options={{ title: t('navigation.setReminder') }}
            />
        </Stack.Navigator>
    );
};

// Main Tab Navigator with Safe Area Fix
const TabNavigator = () => {
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const { t } = useLanguage();

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarLabel: t(`tabs.${route.name.toLowerCase()}`),
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
                tabBarActiveTintColor: colors.tabActive,
                tabBarInactiveTintColor: colors.tabInactive,
                tabBarStyle: {
                    paddingBottom: Math.max(insets.bottom, 8),
                    paddingTop: 8,
                    height: 60 + Math.max(insets.bottom, 8),
                    backgroundColor: colors.tabBarBackground,
                    borderTopWidth: 1,
                    borderTopColor: colors.tabBarBorder,
                    elevation: 8,
                    shadowColor: colors.shadow.medium,
                    shadowOffset: { width: 0, height: -2 },
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

// ==================== ROOT NAVIGATOR ====================
const AppNavigator = () => {
    const navigationRef = React.useRef();
    const isAuthenticated = useUserStore(state => state.isAuthenticated);

    React.useEffect(() => {
        // Handle notification tap response
        const subscription = notificationService.addNotificationResponseListener(response => {
            const data = response.notification.request.content.data;

            if (data?.type === 'medicine_reminder' && data?.med_id) {
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
            {isAuthenticated ? <TabNavigator /> : <AuthStack />}
        </NavigationContainer>
    );
};

export default AppNavigator;
