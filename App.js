import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
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
    shouldShowBanner: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const App = () => {
  const [showOnboarding, setShowOnboarding] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔹 Load onboarding, login, and role from AsyncStorage
  useEffect(() => {
    const checkStorage = async () => {
      try {
        const onboarding = await AsyncStorage.getItem('hasSeenOnboarding');
        const loggedIn = await AsyncStorage.getItem('isLoggedIn');
        const role = await AsyncStorage.getItem('userRole');

        console.log('📦 Storage values:', { onboarding, loggedIn, role });

        setShowOnboarding(onboarding === null); // show onboarding if not seen
        setIsLoggedIn(loggedIn === 'true');
        setUserRole(role);
      } catch (error) {
        console.log('Error loading storage', error);
      } finally {
        setLoading(false);
      }
    };

    checkStorage();
  }, []);

  // 🔹 Notifications setup
  useEffect(() => {
    registerForPushNotificationsAsync().then(async (token) => {
      if (token && auth.currentUser) {
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
    });

    const subscription = Notifications.addNotificationReceivedListener((notification) => {
      console.log('Notification received:', notification);
    });

    const responseSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log('User tapped notification:', response);
    });

    return () => {
      subscription.remove();
      responseSubscription.remove();
    };
  }, []);

  // 🌀 Show loading screen while waiting for AsyncStorage
  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Loading VastraMitra...</Text>
      </View>
    );
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

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    color: '#555',
    fontSize: 16,
  },
});

export default App;
