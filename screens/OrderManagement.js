import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import {
  collection,
  query,
  onSnapshot,
  doc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db, auth } from '../firebase/firebaseConfig';

const TAILOR_UID = 'YvjGOga1CDWJhJfoxAvL7c7Z5sG2';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [tasks, setTasks] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      console.warn("⚠️ No user logged in, skipping order fetch");
      setLoading(false);
      return;
    }

    let q;
    if (user.uid === TAILOR_UID) {
      // ✅ Tailor: fetch all global orders
      q = query(collection(db, 'orders'));
    } else {
      // ✅ Customer: fetch only their subcollection
      q = collection(db, 'users', user.uid, 'orders');
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const orderData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setOrders(orderData);
      setLoading(false);

      // Fetch tasks per order
      orderData.forEach((order) => {
  if (auth.currentUser?.uid === TAILOR_UID || order.userId === auth.currentUser?.uid) {
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
  }
});
    });

    return () => unsubscribe();
  }, []);

  // 🔹 Update Order Status (tailor only)
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      if (auth.currentUser?.uid !== TAILOR_UID) return; // customers blocked
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, { status: newStatus });
    } catch (err) {
      console.error("Error updating order:", err);
    }
  };

  // 🔹 Render Task
  const renderTask = (task) => (
    <View key={task.id} style={styles.taskCard}>
      <Text style={styles.taskText}>
        {task.stage || task.title} - {task.status}
      </Text>
      {/* Removed task update buttons for customers */}
    </View>
  );

  // 🔹 Render Order
  const renderOrder = ({ item }) => (
    <View style={styles.orderCard}>
      <Text style={styles.title}>Order: {item.id}</Text>
      <Text style={styles.subtext}>Customer: {item.customerName || 'N/A'}</Text>
      <Text style={styles.subtext}>Style: {item.style || 'N/A'}</Text>
      <Text style={styles.subtext}>Fabric: {item.fabric || 'Own Cloth'}</Text>
      <Text style={styles.subtext}>
        Status: <Text style={{ fontWeight: '600' }}>{item.status}</Text>
      </Text>

      {/* Tailor controls order status */}
      {auth.currentUser?.uid === TAILOR_UID && (
        <View style={styles.buttonGroup}>
          {['Confirmed', 'In Progress', 'Completed'].map((status) => (
            <TouchableOpacity
              key={status}
              style={[
                styles.statusButton,
                item.status === status && styles.activeButton,
              ]}
              onPress={() => updateOrderStatus(item.id, status)}
            >
              <Text
                style={[
                  styles.statusText,
                  item.status === status && styles.activeText,
                ]}
              >
                {status}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Render Tasks */}
      <Text style={styles.sectionTitle}>Tasks</Text>
      {tasks[item.id]?.length > 0 ? (
        tasks[item.id].map((t) => renderTask(t))
      ) : (
        <Text style={{ color: '#777', fontSize: 13 }}>No tasks yet.</Text>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Order Management</Text>

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
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  statusButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    marginHorizontal: 2,
  },
  statusText: { fontSize: 14, color: '#444' },
  activeButton: { backgroundColor: '#2196F3', borderColor: '#1976D2' },
  activeText: { color: '#fff', fontWeight: '600' },
  taskCard: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 10,
    marginVertical: 4,
  },
  taskText: { fontSize: 14, fontWeight: '500' },
});

export default OrderManagement;
