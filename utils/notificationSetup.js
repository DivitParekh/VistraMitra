import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { db } from '../firebase/firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';

// 🧩 Register for push notifications and store token in Firestore
export async function registerForPushNotificationsAsync(userId) {
  try {
    if (!Device.isDevice) {
      alert('Push notifications require a physical device.');
      return;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      alert('Permission denied for push notifications.');
      return;
    }

    const token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log('📱 Expo Push Token:', token);

    // Save token to Firestore for later use
    await setDoc(
      doc(db, 'users', userId),
      { expoPushToken: token },
      { merge: true }
    );

    // Android channel setup
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#007bff',
      });
    }

    return token;
  } catch (err) {
    console.error('🔴 Notification registration error:', err);
  }
}
