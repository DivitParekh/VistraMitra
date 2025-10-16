import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
  Alert,
} from 'react-native';
import {
  collection,
  query,
  onSnapshot,
  doc,
  updateDoc,
  addDoc,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db, auth } from '../firebase/firebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { LinearGradient } from 'expo-linear-gradient';

const TAILOR_UID = 'YvjGOga1CDWJhJfoxAvL7c7Z5sG2';

const TailorTaskManager = () => {
  const [tasks, setTasks] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    customerName: '',
    orderId: '',
  });

  const currentUser = auth.currentUser;

  useEffect(() => {
    const q = query(collection(db, 'taskManager'), orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const taskData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTasks(taskData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'orders'), (snapshot) => {
      const orderData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setOrders(orderData);
    });
    return () => unsubscribe();
  }, []);

  const updateStatus = async (taskId, newStatus) => {
    if (currentUser?.uid !== TAILOR_UID) return;
    const taskRef = doc(db, 'taskManager', taskId);
    await updateDoc(taskRef, { status: newStatus });
  };

  const handleAddTask = async () => {
    if (currentUser?.uid !== TAILOR_UID) return;

    const { title, customerName, orderId } = newTask;
    if (!title || !customerName || !orderId) {
      Alert.alert('Missing Fields', 'Please select an order and enter title.');
      return;
    }

    try {
      await addDoc(collection(db, 'taskManager'), {
        ...newTask,
        status: 'Pending',
        createdAt: serverTimestamp(),
      });
      setModalVisible(false);
      setNewTask({ title: '', customerName: '', orderId: '' });
    } catch (error) {
      console.error('Error adding task:', error);
      Alert.alert('Error', 'Failed to add task.');
    }
  };

  const renderTask = ({ item }) => (
    <View style={styles.taskCard}>
      <View style={styles.cardHeader}>
        <Ionicons name="briefcase-outline" size={22} color="#4C84FF" />
        <Text style={styles.title}>{item.title}</Text>
      </View>

      <Text style={styles.subtext}>👤 {item.customerName}</Text>
      <Text style={styles.subtext}>🧾 Order ID: {item.orderId}</Text>

      <Text
        style={[
          styles.status,
          item.status === 'Pending'
            ? styles.pending
            : item.status === 'In Progress'
            ? styles.inProgress
            : styles.done,
        ]}
      >
        {item.status}
      </Text>

      {currentUser?.uid === TAILOR_UID && (
        <View style={styles.buttonGroup}>
          {['Pending', 'In Progress', 'Done'].map((status) => (
            <TouchableOpacity
              key={status}
              style={[
                styles.statusButton,
                item.status === status && styles.activeButton,
              ]}
              onPress={() => updateStatus(item.id, status)}
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
    </View>
  );

  return (
    <View style={styles.mainContainer}>
      <LinearGradient
        colors={['#4C84FF', '#70A1FF']}
        style={styles.headerContainer}
      >
        <Text style={styles.headerTitle}>Tailor Task Manager</Text>
        <Ionicons name="checkmark-done-outline" size={26} color="#fff" />
      </LinearGradient>

      <View style={styles.container}>
        {loading ? (
          <ActivityIndicator size="large" color="#4C84FF" style={{ marginTop: 30 }} />
        ) : tasks.length === 0 ? (
          <Text style={styles.emptyText}>No tasks yet. Tap ➕ to add one!</Text>
        ) : (
          <FlatList
            data={tasks}
            renderItem={renderTask}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      {/* Add Task Modal */}
      {currentUser?.uid === TAILOR_UID && (
        <>
          <Modal visible={modalVisible} animationType="fade" transparent>
            <View style={styles.modalOverlay}>
              <View style={styles.modalCard}>
                <Text style={styles.modalTitle}>Add New Task</Text>

                <Text style={styles.modalLabel}>Select Order</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={newTask.orderId}
                    onValueChange={(val) => {
                      const order = orders.find((o) => o.id === val);
                      setNewTask({
                        ...newTask,
                        orderId: val,
                        customerName: order?.customerName || '',
                      });
                    }}
                  >
                    <Picker.Item label="Select Order" value="" />
                    {orders.map((o) => (
                      <Picker.Item
                        key={o.id}
                        label={`${o.customerName} (${o.id})`}
                        value={o.id}
                      />
                    ))}
                  </Picker>
                </View>

                <Text style={styles.modalLabel}>Task Type</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={newTask.title}
                    onValueChange={(val) => setNewTask({ ...newTask, title: val })}
                  >
                    <Picker.Item label="Select Task" value="" />
                    <Picker.Item label="Cutting" value="Cutting" />
                    <Picker.Item label="Stitching" value="Stitching" />
                    <Picker.Item label="Handwork" value="Handwork" />
                    <Picker.Item label="Packaging" value="Packaging" />
                  </Picker>
                </View>

                <View style={styles.modalActions}>
                  <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <Text style={styles.cancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleAddTask}>
                    <Text style={styles.addText}>Add Task</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

          <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
            <Ionicons name="add" size={28} color="#fff" />
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

export default TailorTaskManager;

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#f7f9fc' },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 18,
    paddingHorizontal: 22,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 6,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
  },
  container: { flex: 1, padding: 16 },
  listContent: { paddingBottom: 100 },
  taskCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 4,
    borderLeftWidth: 5,
    borderLeftColor: '#4C84FF',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1f2937',
    marginLeft: 8,
  },
  subtext: { fontSize: 14, color: '#6b7280', marginTop: 2 },
  status: {
    alignSelf: 'flex-start',
    marginTop: 8,
    fontWeight: '700',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    fontSize: 13,
  },
  pending: { backgroundColor: '#FFF8E1', color: '#B45309' },
  inProgress: { backgroundColor: '#E0F2FE', color: '#0369A1' },
  done: { backgroundColor: '#DCFCE7', color: '#15803D' },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
  },
  statusButton: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#fff',
  },
  statusText: { fontSize: 14, color: '#374151' },
  activeButton: { backgroundColor: '#4C84FF', borderColor: '#4C84FF' },
  activeText: { color: '#fff', fontWeight: '600' },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    backgroundColor: '#4C84FF',
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 20,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 14,
    textAlign: 'center',
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    backgroundColor: '#fff',
    marginBottom: 14,
    overflow: 'hidden',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  cancelText: { color: '#9ca3af', fontSize: 15, marginRight: 14 },
  addText: { color: '#4C84FF', fontWeight: '700', fontSize: 16 },
  emptyText: {
    textAlign: 'center',
    marginTop: 30,
    color: '#6b7280',
    fontSize: 16,
  },
});
