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
import { db } from '../firebase/firebaseConfig';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [tasks, setTasks] = useState({});
  const [loading, setLoading] = useState(true);

  // 🔹 Fetch ALL orders (tailor has access to everything)
  useEffect(() => {
    const q = query(collection(db, 'orders'));
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
  }, []);

  // 🔹 Update Order Status
  const updateOrderStatus = async (orderId, newStatus) => {
    const orderRef = doc(db, 'orders', orderId);
    await updateDoc(orderRef, { status: newStatus });
  };

  // 🔹 Update Task Status
  const updateTaskStatus = async (taskId, newStatus) => {
    const taskRef = doc(db, 'taskManager', taskId);
    await updateDoc(taskRef, { status: newStatus });
  };

  // 🔹 Render Task
  const renderTask = (task) => (
    <View key={task.id} style={styles.taskCard}>
      <Text style={styles.taskText}>
        {task.stage || task.title} - {task.status}
      </Text>
      <View style={styles.taskButtons}>
        {['Pending', 'In Progress', 'Done'].map((status) => (
          <TouchableOpacity
            key={status}
            style={[
              styles.statusButton,
              task.status === status && styles.activeButton,
            ]}
            onPress={() => updateTaskStatus(task.id, status)}
          >
            <Text
              style={[
                styles.statusText,
                task.status === status && styles.activeText,
              ]}
            >
              {status}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
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

      {/* Order Status Buttons */}
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

      {/* Render Tasks */}
      <Text style={styles.sectionTitle}>Tasks</Text>
      {tasks[item.id]?.map((t) => renderTask(t))}
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
  taskText: { fontSize: 14, fontWeight: '500', marginBottom: 4 },
  taskButtons: { flexDirection: 'row', justifyContent: 'space-around' },
});

export default OrderManagement;
