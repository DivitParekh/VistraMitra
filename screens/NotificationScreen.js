import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { collection, query, orderBy, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { db, auth } from '../firebase/firebaseConfig';
import { useNavigation } from '@react-navigation/native';

const NotificationScreen = () => {
  const [notifications, setNotifications] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, 'notifications', auth.currentUser.uid, 'userNotifications'),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setNotifications(notifList);

      const unreadCount = notifList.filter((n) => !n.read).length;
      navigation.setParams({ unreadCount });
    });

    return () => unsubscribe();
  }, []);

  const markAsRead = async (id) => {
    try {
      const notifRef = doc(db, 'notifications', auth.currentUser.uid, 'userNotifications', id);
      await updateDoc(notifRef, { read: true });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // 🔹 When user taps a notification
  const handleNotificationPress = async (item) => {
    await markAsRead(item.id);

    // 🚀 If notification is for final payment
    if (item.title?.includes('Ready for Delivery')) {
      navigation.navigate('FinalPaymentScreen', {
        appointmentId: item.appointmentId || item.orderId,  // supports both
        userId: auth.currentUser.uid,
        totalCost: item.totalCost || 0,
        advancePaid: item.advancePaid || 0,
      });
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.card, item.read && styles.readCard]}
      onPress={() => handleNotificationPress(item)}
    >
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.message}>{item.message}</Text>
      <Text style={styles.time}>
        {item.timestamp ? new Date(item.timestamp).toLocaleString() : ''}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {notifications.length === 0 ? (
        <Text style={styles.empty}>No notifications yet</Text>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fafafa', padding: 16 },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
  },
  readCard: { opacity: 0.6 },
  title: { fontSize: 16, fontWeight: '700', color: '#2c3e50' },
  message: { fontSize: 14, color: '#555', marginVertical: 4 },
  time: { fontSize: 12, color: '#888' },
  empty: { textAlign: 'center', color: '#666', marginTop: 20 },
});

export default NotificationScreen;
