import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 🔹 Screens
import OnboardingScreen from '../screens/OnboardingScreen';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import NotificationsScreen from '../screens/NotificationScreen';

import CustomerScreen from '../screens/CustomerScreen';
import AppointmentScreen from '../screens/AppointmentScreen';
import CatalogScreen from '../screens/CatalogScreen';
import CategoryStylesScreen from '../screens/CategoryStylesScreen';
import SavedStylesScreen from '../screens/SavedStylesScreen';
import OrderScreen from '../screens/OrderScreen';
import CostEstimator from '../screens/CostEstimator';

import TailorScreen from '../screens/TailorScreen';
import AppointmentCalendar from '../screens/AppointmentCalendar';
import TailorChatScreen from '../screens/TailorChatScreen';
import TailorChatListScreen from '../screens/TailorChatListScreen';
import TailorTaskManager from '../screens/TailorTaskManager';
import TailorMeasurementBook from '../screens/TailorMeasurementBook';
import OrderManagement from '../screens/OrderManagement';
import CustomerList from '../screens/CustomerList';
import CustomerMeasurmentDetail from '../screens/CustomerMeasurementDetail';
import ChatScreen from '../screens/ChatScreen';
import ProfileScreen from '../screens/ProfileScreen';
import PaymentScreen from '../screens/PaymentScreen';
import PaymentTailorScreen from '../screens/PaymentTailorScreen';
import FinalPaymentScreen from '../screens/FinalPaymentScreen';
import OTPScreen from '../screens/OTPScreen';
const Stack = createNativeStackNavigator();

const AppNavigator = ({ showOnboarding }) => {
  const [initialRoute, setInitialRoute] = useState(null); // start as null
  const [loading, setLoading] = useState(true); // loading state

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const isLoggedIn = await AsyncStorage.getItem('isLoggedIn');
        const role = await AsyncStorage.getItem('userRole');

        if (showOnboarding) {
          setInitialRoute('Onboarding');
        } else if (isLoggedIn === 'true') {
          setInitialRoute(role === 'tailor' ? 'TailorScreen' : 'CustomerScreen');
        } else {
          setInitialRoute('Login');
        }
      } catch (error) {
        console.error('AsyncStorage error:', error);
        setInitialRoute('Login');
      } finally {
        setLoading(false);
      }
    };

    checkLogin();
  }, [showOnboarding]);

  // show nothing (or a splash screen) while checking AsyncStorage
  if (loading || !initialRoute) {
    return null;
  }

  return (
    <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
      
      {/* Auth & Onboarding */}
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />

      {/* Customer */}
      <Stack.Screen name="CustomerScreen" component={CustomerScreen} />
      <Stack.Screen name="AppointmentScreen" component={AppointmentScreen} />
      <Stack.Screen name="CatalogScreen" component={CatalogScreen} />
      <Stack.Screen name="CategoryStylesScreen" component={CategoryStylesScreen} />
      <Stack.Screen name="SavedStyles" component={SavedStylesScreen} />
      <Stack.Screen name="CustomerMeasurementDetail" component={CustomerMeasurmentDetail} />
      <Stack.Screen name="OrderScreen" component={OrderScreen} />
      <Stack.Screen name="CostEstimator" component={CostEstimator} />

      {/* Tailor */}
      <Stack.Screen name="TailorScreen" component={TailorScreen} />
      <Stack.Screen name="AppointmentCalendar" component={AppointmentCalendar} />
      <Stack.Screen name="TailorChatScreen" component={TailorChatScreen} />
      <Stack.Screen name="TailorChatListScreen" component={TailorChatListScreen} />
      <Stack.Screen name="TailorTaskManager" component={TailorTaskManager} />
      <Stack.Screen name="TailorMeasurementBook" component={TailorMeasurementBook} />
      <Stack.Screen name="OrderManagement" component={OrderManagement} />
      <Stack.Screen name="CustomerList" component={CustomerList} />

      {/* Shared */}
      <Stack.Screen name="ChatScreen" component={ChatScreen} />
      <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="PaymentScreen" component={PaymentScreen} />
      <Stack.Screen name="PaymentTailorScreen" component={PaymentTailorScreen} />
      <Stack.Screen name="FinalPaymentScreen" component={FinalPaymentScreen} />
      <Stack.Screen name="OTPScreen" component={OTPScreen} />

    </Stack.Navigator>
  );
};

export default AppNavigator;
