import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppNavigator from './navigation/AppNavigator';

// 🚀 Notifications
import * as Notifications from 'expo-notifications';
import { registerForPushNotificationsAsync } from './NotificationHandler';

// 🔐 Firebase
import { auth, db } from './firebase/firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';

// ✅ Configure notifications for SDK 54+
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,   // 👈 replaces shouldShowAlert
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const App = () => {
  const [showOnboarding, setShowOnboarding] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(null);
  const [userRole, setUserRole] = useState(null);

  // 🔹 Load onboarding, login, and role from AsyncStorage
  useEffect(() => {
    const checkStorage = async () => {
      try {
        const onboarding = await AsyncStorage.getItem('hasSeenOnboarding');
        const loggedIn = await AsyncStorage.getItem('isLoggedIn');
        const role = await AsyncStorage.getItem('userRole');

        setShowOnboarding(onboarding === null);
        setIsLoggedIn(loggedIn === 'true');
        setUserRole(role);
      } catch (error) {
        console.log('Error loading storage', error);
      }
    };

    checkStorage();
  }, []);

  // 🔹 Notifications setup
  useEffect(() => {
    registerForPushNotificationsAsync().then(async (token) => {
      if (token) {
        console.log('Expo Push Token:', token);

        // Save to Firestore if user logged in
        if (auth.currentUser) {
          try {
            await setDoc(
              doc(db, 'users', auth.currentUser.uid),
              { expoPushToken: token },
              { merge: true }
            );
            console.log('Token saved to Firestore ✅');
          } catch (error) {
            console.log('Error saving token:', error);
          }
        }
      }
    });

    // Foreground listener
    const subscription = Notifications.addNotificationReceivedListener((notification) => {
      console.log('Notification received:', notification);
    });

    // Tapped notification listener
    const responseSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log('User tapped notification:', response);
    });

    return () => {
      subscription.remove();
      responseSubscription.remove();
    };
  }, []);

  if (showOnboarding === null || isLoggedIn === null || userRole === null) {
    return null; // Wait until AsyncStorage is loaded
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
