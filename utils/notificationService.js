import { addDoc, collection, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

/**
 * Send real-time push notification + save in Firestore + navigation deep link
 * @param {string} userId - UID of the recipient
 * @param {string} title - Notification title
 * @param {string} message - Body text of notification
 * @param {object} data - Optional data (for navigation, deep links, etc.)
 */
export async function sendNotification(userId, title, message, data = {}) {
  try {
    if (!userId || !title || !message) {
      console.error('❌ Missing parameters for notification');
      return;
    }

    // ✅ Save to Firestore for in-app notifications
    await addDoc(collection(db, 'notifications', userId, 'userNotifications'), {
      title,
      message,
      timestamp: serverTimestamp(),
      read: false,
      ...data,
    });

    // ✅ Fetch user’s Expo push token
    const userDoc = await getDoc(doc(db, 'users', userId));
    const userToken = userDoc.exists() ? userDoc.data().expoPushToken : null;

    if (!userToken) {
      console.warn(`⚠️ No Expo push token found for user: ${userId}`);
      return;
    }

    // ✅ Create push message payload
    const pushMessage = {
      to: userToken,
      sound: 'default',
      title,
      body: message,
      data, // includes { screen: 'ChatScreen', params: {...} }
    };

    // ✅ Send notification via Expo Push API using fetch()
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(pushMessage),
    });

    const result = await response.json();
    console.log('📩 Notification sent successfully:', result);
  } catch (error) {
    console.error('❌ Error sending notification:', error);
  }
}
