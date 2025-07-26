import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppNavigator from './navigation/AppNavigator';

const App = () => {
  const [showOnboarding, setShowOnboarding] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(null);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const checkStorage = async () => {
      try {
        const onboarding = await AsyncStorage.getItem('hasSeenOnboarding');
        const loggedIn = await AsyncStorage.getItem('isLoggedIn');
        const role = await AsyncStorage.getItem('userRole');

        setShowOnboarding(onboarding === null);        // true if first time
        setIsLoggedIn(loggedIn === 'true');            // logged in status
        setUserRole(role);                             // "tailor" or "customer"
      } catch (error) {
        console.log('Error loading storage', error);
      }
    };

    checkStorage();
  }, []);

  if (showOnboarding === null || isLoggedIn === null || userRole === null) {
    return null; // Wait for async to complete before rendering anything
  }

  return (
    <NavigationContainer>
      <AppNavigator
        showOnboarding={showOnboarding}
        isLoggedIn={isLoggedIn}
        userRole={userRole}
      />
    </NavigationContainer>
  );
};

export default App;
