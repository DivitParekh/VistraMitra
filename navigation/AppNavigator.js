import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import OnboardingScreen from '../screens/OnboardingScreen';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen'; // optional
import HomeScreen from '../screens/HomeScreen';     // tailor or customer dashboard

const Stack = createNativeStackNavigator();

const AppNavigator = ({ showOnboarding, isLoggedIn }) => {
  let initialRoute = 'Onboarding';

  if (!showOnboarding) {
    initialRoute = isLoggedIn ? 'Home' : 'Login';
  }

  return (
    <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="Home" component={HomeScreen} />
    </Stack.Navigator>
  );
};


export default AppNavigator;
