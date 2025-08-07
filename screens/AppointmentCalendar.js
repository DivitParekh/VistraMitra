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
import { Calendar } from 'react-native-calendars';
import {
  collection,
  onSnapshot,
  updateDoc,
  doc,
} from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

const AppointmentCalendar = () => {
  const [appointments, setAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [markedDates, setMarkedDates] = useState({});

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'tailorAppointments'), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAppointments(data);
      generateMarkedDates(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const generateMarkedDates = (appointments) => {
    const marks = {};
    appointments.forEach((app) => {
      if (app.date) {
        marks[app.date] = {
          marked: true,
          dotColor:
            app.status === 'Confirmed'
              ? '#27ae60'
              : app.status === 'Pending'
              ? '#f39c12'
              : '#c0392b',
        };
      }
    });
    setMarkedDates(marks);
  };

  const updateStatus = async (id, newStatus, userId) => {
    try {
      await updateDoc(doc(db, 'tailorAppointments', id), { status: newStatus });
      await updateDoc(doc(db, 'appointments', userId, 'userAppointments', id), { status: newStatus });
      Alert.alert('Success', `Appointment marked as ${newStatus}`);
    } catch (err) {
      console.error('Error updating status:', err);
      Alert.alert('Error', 'Could not update appointment status');
    }
  };

  const filteredAppointments = selectedDate
    ? appointments.filter((app) => app.date === selectedDate)
    : [];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#5DA3FA" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Appointment Calendar</Text>
        <Ionicons name="calendar-outline" size={24} color="#2c3e50" />
      </View>

      <Calendar
        markedDates={{
          ...markedDates,
          ...(selectedDate && {
            [selectedDate]: {
              selected: true,
              selectedColor: '#5DA3FA',
              ...markedDates[selectedDate],
            },
          }),
        }}
        onDayPress={(day) => setSelectedDate(day.dateString)}
        theme={{
          backgroundColor: '#ffffff',
          calendarBackground: '#ffffff',
          textSectionTitleColor: '#2c3e50',
          selectedDayBackgroundColor: '#5DA3FA',
          todayTextColor: '#5DA3FA',
          dayTextColor: '#2c3e50',
          arrowColor: '#5DA3FA',
          monthTextColor: '#2c3e50',
          textMonthFontWeight: 'bold',
          textDayFontSize: 14,
          textMonthFontSize: 16,
          textDayHeaderFontSize: 13,
        }}
      />

      {selectedDate && (
        <View style={styles.appointmentsList}>
          <Text style={styles.dateHeading}>
            {filteredAppointments.length > 0
              ? `Appointments on ${selectedDate}`
              : `No Appointments on ${selectedDate}`}
          </Text>

          {filteredAppointments.map((item) => (
            <View key={item.id} style={styles.card}>
              <Text style={styles.cardText}>
                <Ionicons name="calendar" size={16} /> {item.date} —{' '}
                <Ionicons name="time-outline" size={16} /> {item.time}
              </Text>
              <Text style={styles.cardText}>
                👤 {item.type}{' '}
                <Text
                  style={[
                    styles.statusBadge,
                    item.status === 'Confirmed'
                      ? styles.confirmed
                      : item.status === 'Pending'
                      ? styles.pending
                      : styles.declined,
                  ]}>
                  {item.status}
                </Text>
              </Text>

              {item.status === 'Pending' && (
                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={styles.confirmBtn}
                    onPress={() => updateStatus(item.id, 'Confirmed', item.userId)}>
                    <Text style={styles.btnText}>Confirm</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.declineBtn}
                    onPress={() => updateStatus(item.id, 'Declined', item.userId)}>
                    <Text style={styles.btnText}>Decline</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fafafa' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2c3e50',
  },
  appointmentsList: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 80,
  },
  dateHeading: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
    color: '#2c3e50',
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    borderLeftWidth: 5,
    borderLeftColor: '#5DA3FA',
  },
  cardText: {
    fontSize: 14,
    color: '#34495e',
    marginBottom: 6,
  },
  statusBadge: {
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    overflow: 'hidden',
    marginLeft: 10,
    fontSize: 12,
  },
  pending: {
    backgroundColor: '#fce4b3',
    color: '#e67e22',
  },
  confirmed: {
    backgroundColor: '#d4edda',
    color: '#27ae60',
  },
  declined: {
    backgroundColor: '#f8d7da',
    color: '#c0392b',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  confirmBtn: {
    backgroundColor: '#27ae60',
    padding: 10,
    borderRadius: 8,
    width: '48%',
    alignItems: 'center',
  },
  declineBtn: {
    backgroundColor: '#c0392b',
    padding: 10,
    borderRadius: 8,
    width: '48%',
    alignItems: 'center',
  },
  btnText: {
    color: '#fff',
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AppointmentCalendar;
