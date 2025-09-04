import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import {
  collection,
  query,
  onSnapshot,
  where,
} from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

const OrderScreen = () => {
  const [orders, setOrders] = useState([]);
  const [tasks, setTasks] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      const uid = await AsyncStorage.getItem('userId'); // get logged in customer id

      if (!uid) return;

      // 🔎 Only fetch orders for this customer
      const q = query(collection(db, 'orders'), where('userId', '==', uid));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const orderData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setOrders(orderData);
        setLoading(false);

        // fetch tasks for each order
        orderData.forEach((order) => {
          const tq = query(
            collection(db, 'taskManager'),
            where('orderId', '==', order.id)
          );
          onSnapshot(tq, (taskSnap) => {
            const taskData = taskSnap.docs.map((d) => ({
              id: d.id,
              ...d.data(),
            }));
            setTasks((prev) => ({ ...prev, [order.id]: taskData }));
          });
        });
      });

      return () => unsubscribe();
    };

    fetchOrders();
  }, []);

  const renderTask = (task) => (
  <View key={task.id} style={styles.taskCard}>
    <Text style={styles.taskText}>
      {task.stage || task.title} — <Text style={styles.taskStatus}>{task.status}</Text>
    </Text>
  </View>
);

const renderOrder = ({ item }) => (
  <View style={styles.orderCard}>
    <Text style={styles.title}>Order: {item.id}</Text>
    <Text style={styles.subtext}>Style: {item.style || 'N/A'}</Text>
    <Text style={styles.subtext}>Fabric: {item.fabric || 'Own Cloth'}</Text>
    <Text style={styles.subtext}>
      Status:{' '}
      <Text
        style={[
          styles.statusBadge,
          item.status === 'Confirmed'
            ? styles.confirmed
            : item.status === 'In Progress'
            ? styles.inProgress
            : item.status === 'Completed'
            ? styles.completed
            : styles.pending,
        ]}
      >
        {item.status}
      </Text>
    </Text>

    {/* Show tasks */}
    {tasks[item.id]?.length > 0 ? (
      <>
        <Text style={styles.sectionTitle}>Tasks</Text>
        {tasks[item.id].map((t) => renderTask(t))}
      </>
    ) : (
      <Text style={{ marginTop: 8, color: '#777', fontSize: 13 }}>
        No tasks assigned yet.
      </Text>
    )}
  </View>
);

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>My Orders</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#2196F3" style={{ marginTop: 30 }} />
      ) : orders.length === 0 ? (
        <Text style={{ textAlign: 'center', marginTop: 20, fontSize: 16 }}>
          No orders yet.
        </Text>
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrder}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9', padding: 16 },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
    color: '#333',
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    elevation: 3,
  },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 6 },
  subtext: { fontSize: 14, color: '#555', marginBottom: 4 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 6,
    color: '#333',
  },
  statusBadge: {
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    overflow: 'hidden',
  },
  pending: { backgroundColor: '#fce4b3', color: '#e67e22' },
  confirmed: { backgroundColor: '#d4edda', color: '#27ae60' },
  inProgress: { backgroundColor: '#cce5ff', color: '#007bff' },
  completed: { backgroundColor: '#d4edda', color: '#2c3e50' },

  taskCard: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 10,
    marginVertical: 4,
  },
  taskText: { fontSize: 14, fontWeight: '500' },
  taskStatus: { fontWeight: '600', color: '#007bff' },
});

export default OrderScreen;
