import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  collection,
  query,
  onSnapshot,
  where,
  getDoc,
  doc,
} from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { generateInvoice } from '../utils/invoiceGenerator'; // ✅ NEW IMPORT

const OrderScreen = () => {
  const [orders, setOrders] = useState([]);
  const [tasks, setTasks] = useState({});
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    let taskUnsubscribers = [];
    let unsubscribeOrders = null;

    const fetchOrders = async () => {
      try {
        const uid = await AsyncStorage.getItem('uid');
        if (!uid) {
          console.warn('⚠️ No user logged in, skipping order fetch');
          setLoading(false);
          return;
        }

        const userOrdersRef = collection(db, 'users', uid, 'orders');
        unsubscribeOrders = onSnapshot(userOrdersRef, (snapshot) => {
          const orderData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          setOrders(orderData);
          setLoading(false);
          setupTaskListeners(orderData, uid);
        });
      } catch (err) {
        console.error('Error fetching orders:', err);
        setLoading(false);
      }
    };

    const setupTaskListeners = (orderData, uid) => {
      taskUnsubscribers.forEach((fn) => fn && fn());
      taskUnsubscribers = [];

      orderData.forEach((order) => {
        const tq = query(
          collection(db, 'taskManager'),
          where('orderId', '==', order.id),
          where('userId', '==', uid)
        );

        const taskUnsub = onSnapshot(tq, (taskSnap) => {
          const taskData = taskSnap.docs.map((d) => ({
            id: d.id,
            ...d.data(),
          }));
          setTasks((prev) => ({ ...prev, [order.id]: taskData }));
        });
        taskUnsubscribers.push(taskUnsub);
      });
    };

    fetchOrders();

    return () => {
      if (unsubscribeOrders) unsubscribeOrders();
      taskUnsubscribers.forEach((fn) => fn && fn());
    };
  }, []);

  // 🔹 Task Renderer
  const renderTask = (task) => (
    <View key={task.id} style={styles.taskCard}>
      <Text style={styles.taskText}>
        {task.stage || task.title} —{' '}
        <Text style={styles.taskStatus}>{task.status}</Text>
      </Text>
    </View>
  );

  // ✅ Payment Button Handler
  const handlePayRemaining = async (item) => {
    try {
      const uid = await AsyncStorage.getItem('uid');
      let totalCost = item.totalCost;
      let advancePaid = item.advancePaid;

      console.log('🟡 Checking payment info for order:', item.id);

      if (!totalCost || !advancePaid) {
        const userOrderRef = doc(db, 'users', uid, 'orders', item.id);
        const userSnap = await getDoc(userOrderRef);
        if (userSnap.exists()) {
          const data = userSnap.data();
          totalCost = data.totalCost || totalCost;
          advancePaid = data.advancePaid || advancePaid;
        }
      }

      if (!totalCost || !advancePaid) {
        const globalOrderRef = doc(db, 'orders', item.id);
        const globalSnap = await getDoc(globalOrderRef);
        if (globalSnap.exists()) {
          const data = globalSnap.data();
          totalCost = data.totalCost || totalCost;
          advancePaid = data.advancePaid || advancePaid;
        }
      }

      if (!totalCost || !advancePaid) {
        const tailorAppRef = doc(db, 'tailorAppointments', item.appointmentId || item.id);
        const tailorSnap = await getDoc(tailorAppRef);
        if (tailorSnap.exists()) {
          const data = tailorSnap.data();
          totalCost = data.totalCost || totalCost;
          advancePaid = data.advancePaid || advancePaid;
        }
      }

      if (!totalCost || !advancePaid) {
        Alert.alert(
          'Missing Payment Info',
          'Unable to find payment details for this order. Please contact your tailor.'
        );
        return;
      }

      navigation.navigate('FinalPaymentScreen', {
        appointmentId: item.appointmentId || item.id,
        userId: item.userId || uid,
        totalCost: Number(totalCost),
        advancePaid: Number(advancePaid),
      });
    } catch (err) {
      console.error('Error navigating to payment:', err);
      Alert.alert('Error', 'Unable to open payment screen.');
    }
  };

  // ✅ Generate & Share Invoice
  const handleDownloadInvoice = async (item) => {
    try {
      const invoiceData = {
        orderId: item.id,
        customerName: item.customerName || 'Customer',
        fabric: item.fabric || 'Own Fabric',
        styleCategory: item.style || 'Custom Stitch',
        totalCost: item.totalCost || 0,
        advancePaid: item.advancePaid || 0,
        balanceDue: 0,
        date: new Date().toISOString(),
        address: item.address || 'N/A',
      };

      await generateInvoice(invoiceData);
      Alert.alert('📄 Invoice Generated', 'Invoice opened for sharing.');
    } catch (error) {
      console.error('❌ Error generating invoice:', error);
      Alert.alert('Error', 'Unable to generate invoice.');
    }
  };

  // 🔹 Render Orders
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

      {item.status === 'Ready for Delivery' &&
        item.paymentStatus !== 'Full Paid' && (
          <TouchableOpacity
            style={styles.payBtn}
            onPress={() => handlePayRemaining(item)}
          >
            <Text style={styles.payText}>💳 Pay Remaining 70%</Text>
          </TouchableOpacity>
        )}

      {item.paymentStatus === 'Full Paid' && (
        <TouchableOpacity
          style={styles.invoiceBtn}
          onPress={() => handleDownloadInvoice(item)}
        >
          <Text style={styles.invoiceText}>📥 Download Invoice</Text>
        </TouchableOpacity>
      )}

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

// 🧾 Styles
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
  payBtn: {
    backgroundColor: '#27ae60',
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
  },
  payText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  invoiceBtn: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
  },
  invoiceText: { color: '#fff', fontWeight: '600', fontSize: 15 },
});

export default OrderScreen;
