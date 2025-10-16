import { addDoc, collection, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase/firebaseConfig';

/**
 * Send push + in-app notification
 * Works for:
 *  ✅ Customer → Tailor
 *  ✅ Tailor → Customer
 */
export async function sendNotification(userId, title, message, data = {}) {
  try {
    const sender = auth.currentUser?.uid;
    if (!sender) {
      console.warn('🚫 No logged-in user found.');
      return;
    }

    // ✅ Store in Firestore (for in-app notifications)
    await addDoc(collection(db, 'notifications', userId, 'userNotifications'), {
      title,
      message,
      timestamp: serverTimestamp(),
      read: false,
      senderId: sender,
      ...data,
    });

    // ✅ Fetch recipient’s Expo push token
    const userDoc = await getDoc(doc(db, 'users', userId));
    const token = userDoc.exists() ? userDoc.data().expoPushToken : null;

    if (!token) {
      console.warn(`⚠️ No push token for recipient ${userId}`);
      return;
    }

    // ✅ Send via Expo push API
    const payload = {
      to: token,
      sound: 'default',
      title,
      body: message,
      data,
    };

    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    console.log('📩 Notification sent successfully:', result);
  } catch (error) {
    console.error('❌ Error sending notification:', error);
  }
}
