import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 🔹 Screens
import OnboardingScreen from '../screens/OnboardingScreen';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';

import CustomerScreen from '../screens/CustomerScreen';
import AppointmentScreen from '../screens/AppointmentScreen';
import CatalogScreen from '../screens/CatalogScreen';
import CategoryStylesScreen from '../screens/CategoryStylesScreen';
import SavedStylesScreen from '../screens/SavedStylesScreen';
import MeasurementBook from '../screens/MeasurementBook';
import OrderScreen from '../screens/OrderScreen';

import TailorScreen from '../screens/TailorScreen';
import AppointmentCalendar from '../screens/AppointmentCalendar';
import TailorChatScreen from '../screens/TailorChatScreen';
import TailorTaskManager from '../screens/TailorTaskManager';
import TailorMeasurementBook from '../screens/TailorMeasurementBook';
import CustomerMeasurementDetail from '../screens/CustomerMeasurementDetail';
import OrderManagement from '../screens/OrderManagement';

import ChatScreen from '../screens/ChatScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = ({ showOnboarding }) => {
  const [initialRoute, setInitialRoute] = useState('Onboarding');

  // ✅ Check login & role when app starts
  useEffect(() => {
    const checkLogin = async () => {
      const isLoggedIn = await AsyncStorage.getItem('isLoggedIn');
      const role = await AsyncStorage.getItem('userRole');

      if (showOnboarding) {
        setInitialRoute('Onboarding');
      } else if (isLoggedIn === 'true') {
        setInitialRoute(role === 'tailor' ? 'TailorScreen' : 'CustomerScreen');
      } else {
        setInitialRoute('Login');
      }
    };

    checkLogin();
  }, [showOnboarding]);

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
      <Stack.Screen name="MeasurementBook" component={MeasurementBook} />
      <Stack.Screen name="Orders" component={OrderScreen} />

      {/* Tailor */}
      <Stack.Screen name="TailorScreen" component={TailorScreen} />
      <Stack.Screen name="AppointmentCalendar" component={AppointmentCalendar} />
      <Stack.Screen name="TailorChatScreen" component={TailorChatScreen} />
      <Stack.Screen name="TailorTaskManager" component={TailorTaskManager} />
      <Stack.Screen name="TailorMeasurementBook" component={TailorMeasurementBook} />
      <Stack.Screen name="CustomerMeasurementDetail" component={CustomerMeasurementDetail} />
      <Stack.Screen name="OrderManagement" component={OrderManagement} />

      {/* Shared */}
      <Stack.Screen name="ChatScreen" component={ChatScreen} />
      <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
    </Stack.Navigator>
  );
};

export default AppNavigator;