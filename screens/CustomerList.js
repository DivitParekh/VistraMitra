import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

const CustomerList = ({ navigation }) => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 👤 Listen to all user profiles
    const unsubscribe = onSnapshot(collection(db, 'users'), async (snapshot) => {
      const users = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // 🔹 For each user → fetch their latest order (if any)
      const withLastOrder = await Promise.all(
        users.map(async (user) => {
          const ordersRef = collection(db, 'users', user.id, 'orders');
          const q = query(ordersRef, orderBy('createdAt', 'desc'), limit(1));
          let lastOrder = null;

          try {
            const orderSnap = await new Promise((resolve) =>
              onSnapshot(q, (s) => resolve(s), (err) => resolve(null))
            );
            if (orderSnap && !orderSnap.empty) {
              lastOrder = orderSnap.docs[0].data();
            }
          } catch (e) {
            console.log('Error fetching last order:', e);
          }

          return { ...user, lastOrder };
        })
      );

      setCustomers(withLastOrder);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('MeasurementBook', { userId: item.id })}
    >
      <Text style={styles.name}>{item.name || 'Unnamed User'}</Text>
      <Text style={styles.detail}>📞 {item.phone || 'N/A'}</Text>
      <Text style={styles.detail}>📧 {item.emailOrPhone || 'N/A'}</Text>

      {item.lastOrder ? (
        <Text style={styles.order}>
          📌 Last Order: {item.lastOrder.style || 'N/A'} — {item.lastOrder.status}
        </Text>
      ) : (
        <Text style={styles.order}>📌 No orders yet</Text>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <FlatList
      data={customers}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={{ padding: 16 }}
      ListEmptyComponent={<Text style={styles.empty}>No customers yet.</Text>}
    />
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
  },
  name: { fontSize: 16, fontWeight: '600', marginBottom: 4, color: '#333' },
  detail: { fontSize: 14, color: '#555', marginBottom: 2 },
  order: { fontSize: 13, color: '#888', marginTop: 6 },
  empty: { textAlign: 'center', color: '#777', marginTop: 20, fontSize: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

export default CustomerList;
