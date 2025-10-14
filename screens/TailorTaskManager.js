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
import { View as SafeAreaView } from 'react-native';



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

  // fetch tasks
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

  // fetch orders
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

  // update status (tailor only)
  const updateStatus = async (taskId, newStatus) => {
    if (currentUser?.uid !== TAILOR_UID) return; // stop customers
    const taskRef = doc(db, 'taskManager', taskId);
    await updateDoc(taskRef, { status: newStatus });
  };

  // add task (tailor only)
  const handleAddTask = async () => {
    if (currentUser?.uid !== TAILOR_UID) return; // stop customers

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
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.subtext}>Customer: {item.customerName}</Text>
      <Text style={styles.subtext}>Order ID: {item.orderId}</Text>
      <Text style={styles.subtext}>Status: {item.status}</Text>

      {/* Tailor can update tasks, customers just see */}
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
    <View style={styles.container}>
      <Text style={styles.heading}>Task Manager</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#2196F3" style={{ marginTop: 30 }} />
      ) : tasks.length === 0 ? (
        <Text style={{ textAlign: 'center', marginTop: 20, fontSize: 16 }}>
          No tasks yet.
        </Text>
      ) : (
        <FlatList
          data={tasks}
          renderItem={renderTask}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}

      {/* Add Task - Tailor only */}
      {currentUser?.uid === TAILOR_UID && (
        <>
          <Modal visible={modalVisible} animationType="slide" transparent>
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Add New Task</Text>

                <Text style={{ marginBottom: 6 }}>Select Order</Text>
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
                  style={styles.picker}
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

                <Text style={{ marginBottom: 6 }}>Task Title</Text>
                <Picker
                  selectedValue={newTask.title}
                  onValueChange={(val) => setNewTask({ ...newTask, title: val })}
                  style={styles.picker}
                >
                  <Picker.Item label="Select Task" value="" />
                  <Picker.Item label="Cutting" value="Cutting" />
                  <Picker.Item label="Stitching" value="Stitching" />
                  <Picker.Item label="Handwork" value="Handwork" />
                  <Picker.Item label="Packaging" value="Packaging" />
                </Picker>

                <View style={styles.modalActions}>
                  <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <Text style={styles.cancelBtn}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleAddTask}>
                    <Text style={styles.saveBtn}>Add</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

          <TouchableOpacity
            style={styles.fab}
            onPress={() => setModalVisible(true)}
          >
            <Ionicons name="add" size={28} color="#fff" />
          </TouchableOpacity>
        </>
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
  taskCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    elevation: 3,
  },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 6 },
  subtext: { fontSize: 14, color: '#555' },
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
  },
  statusText: { fontSize: 14, color: '#444' },
  activeButton: { backgroundColor: '#2196F3', borderColor: '#1976D2' },
  activeText: { color: '#fff', fontWeight: '600' },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    backgroundColor: '#2196F3',
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  picker: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    marginBottom: 12,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  cancelBtn: { marginRight: 16, color: '#888', fontSize: 16 },
  saveBtn: { color: '#2196F3', fontWeight: 'bold', fontSize: 16 },
});

export default TailorTaskManager;
