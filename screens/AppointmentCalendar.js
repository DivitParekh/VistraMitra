import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

const AppointmentCalendar = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'tailorAppointments'), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAppointments(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const updateStatus = async (id, newStatus) => {
    try {
      await updateDoc(doc(db, 'tailorAppointments', id), { status: newStatus });
      Alert.alert('Success', `Appointment marked as ${newStatus}`);
    } catch (err) {
      console.error('Error updating status:', err);
      Alert.alert('Error', 'Could not update appointment status');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>All Appointments</Text>
        <Ionicons name="calendar-outline" size={24} color="#2c3e50" />
      </View>

      {appointments.length === 0 ? (
        <Text style={styles.noAppointments}>No appointments yet.</Text>
      ) : (
        appointments.map((item) => (
          <View key={item.id} style={styles.card}>
            <Text style={styles.cardText}>
              📅 {item.date} - ⏰ {item.time}
            </Text>
            <Text style={styles.cardText}>
              🧵 {item.type} | Status: <Text style={[styles.badge, item.status === 'Pending' ? styles.pending : styles.confirmed]}>{item.status}</Text>
            </Text>

            {item.status === 'Pending' && (
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.confirmBtn}
                  onPress={() => updateStatus(item.id, 'Confirmed')}>
                  <Text style={styles.btnText}>Confirm</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.declineBtn}
                  onPress={() => updateStatus(item.id, 'Declined')}>
                  <Text style={styles.btnText}>Decline</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2c3e50',
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 3,
  },
  cardText: {
    fontSize: 14,
    color: '#2c3e50',
    marginBottom: 6,
  },
  badge: {
    fontWeight: 'bold',
  },
  pending: {
    color: '#e67e22',
  },
  confirmed: {
    color: '#27ae60',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  confirmBtn: {
    backgroundColor: '#2ecc71',
    padding: 10,
    borderRadius: 8,
    width: '48%',
    alignItems: 'center',
  },
  declineBtn: {
    backgroundColor: '#e74c3c',
    padding: 10,
    borderRadius: 8,
    width: '48%',
    alignItems: 'center',
  },
  btnText: {
    color: '#fff',
    fontWeight: '600',
  },
  noAppointments: {
    textAlign: 'center',
    color: '#777',
    marginTop: 40,
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AppointmentCalendar;
