import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

import OnboardingScreen from '../screens/OnboardingScreen';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import CustomerScreen from '../screens/CustomerScreen';
import AppointmentScreen from '../screens/AppointmentScreen';
import TailorScreen from '../screens/TailorScreen'
import AppointmentCalendar from '../screens/AppointmentCalendar';

const Stack = createNativeStackNavigator();

const AppNavigator = ({ showOnboarding }) => {
  const [initialRoute, setInitialRoute] = useState('Onboarding');

  useEffect(() => {
    const checkLogin = async () => {
      const isLoggedIn = await AsyncStorage.getItem('isLoggedIn');
      const role = await AsyncStorage.getItem('userRole');

      if (showOnboarding) {
        setInitialRoute('Onboarding');
      } else if (isLoggedIn === 'true') {
        if (role === 'tailor') {
          setInitialRoute('TailorScreen');
        } else {
          setInitialRoute('CustomerScreen');
        }
      } else {
        setInitialRoute('Login');
      }
    };

    checkLogin();
  }, [showOnboarding]);

  return (
    <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="CustomerScreen" component={CustomerScreen} />
      <Stack.Screen name="TailorScreen" component={TailorScreen} />
      <Stack.Screen name="AppointmentScreen" component={AppointmentScreen} />
      <Stack.Screen name="AppointmentCalendar" component={AppointmentCalendar}/>
    </Stack.Navigator>
  );
};
export default AppNavigator;
