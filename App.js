import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppNavigator from './navigation/AppNavigator';

const App = () => {
  const [showOnboarding, setShowOnboarding] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(null);

  useEffect(() => {
    const checkStorage = async () => {
      try {
        const onboarding = await AsyncStorage.getItem('hasSeenOnboarding');
        const loggedIn = await AsyncStorage.getItem('isLoggedIn');

        setShowOnboarding(onboarding === null);     // true if not seen
        setIsLoggedIn(loggedIn === 'true');         // true if already logged in
      } catch (error) {
        console.log('Error loading storage', error);
      }
    };

    checkStorage();
  }, []);

  if (showOnboarding === null || isLoggedIn === null) {
    return null; // wait for async check to finish (no flicker)
  }

  return (
    <NavigationContainer>
      <AppNavigator showOnboarding={showOnboarding} isLoggedIn={isLoggedIn} />
    </NavigationContainer>
  );
};

export default App;
