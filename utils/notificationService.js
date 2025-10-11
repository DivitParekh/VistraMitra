// utils/notificationService.js
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

/**
 * Save a notification in Firestore for a specific user.
 * @param {string} userId - The UID of the user who should receive the notification
 * @param {string} title - Short title for the notification
 * @param {string} message - Detailed message for the notification
 */
export async function sendNotification(userId, title, message) {
  try {
    if (!userId) {
      console.error("❌ No userId provided for notification");
      return;
    }

    if (!title || !message) {
      console.error("❌ Notification must have a title and message");
      return;
    }

    // ✅ Always create new doc with auto-generated ID
    await addDoc(collection(db, 'notifications', userId, 'userNotifications'), {
      title,
      message,
      timestamp: serverTimestamp(), // 🔹 use Firestore server time
      read: false,
    });

    console.log("✅ Notification created:", { userId, title, message });
  } catch (error) {
    console.error("❌ Error sending notification:", error);
  }
}
