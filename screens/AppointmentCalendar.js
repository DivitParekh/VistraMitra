import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';
import {
  collection,
  onSnapshot,
  setDoc,
  doc,
  addDoc,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { sendNotification } from '../utils/notificationService';
import { LinearGradient } from 'expo-linear-gradient';

const AppointmentCalendar = ({ navigation }) => {
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
              ? '#4CAF50'
              : app.status === 'Pending'
              ? '#03DAC6'
              : '#E53935',
        };
      }
    });
    setMarkedDates(marks);
  };

  const updateStatus = async (id, newStatus, userId, appointment) => {
    try {
      if (!userId) {
        Alert.alert('Error', 'Cannot confirm — missing customer info.');
        return;
      }

      if (newStatus === 'Confirmed') {
        const orderId = id;
        const orderData = {
          orderId,
          appointmentId: id,
          userId,
          customerName: appointment.fullName || 'Customer',
          styleCategory: appointment.styleCategory || 'Custom Style',
          styleImage: appointment.styleImage || null,
          fabric: appointment.fabric || 'Customer Fabric',
          address: appointment.address || '',
          date: appointment.date,
          time: appointment.time,
          totalCost: appointment.totalCost || 0,
          advancePaid: appointment.advancePaid || 0,
          balanceDue:
            (appointment.totalCost || 0) - (appointment.advancePaid || 0),
          paymentStatus: appointment.paymentStatus || 'Advance Paid',
          status: 'Confirmed',
          createdAt: serverTimestamp(),
        };

        await setDoc(doc(db, 'orders', orderId), orderData);
        await setDoc(doc(db, 'users', userId, 'orders', orderId), orderData);

        const stages = ['Cutting', 'Stitching', 'Handwork', 'Packaging'];
        for (const stage of stages) {
          await addDoc(collection(db, 'taskManager'), {
            orderId,
            userId,
            customerName: appointment.fullName,
            stage,
            status: 'Pending',
            createdAt: serverTimestamp(),
          });
        }
      }

      await setDoc(
        doc(db, 'tailorAppointments', id),
        { ...appointment, status: newStatus },
        { merge: true }
      );
      await setDoc(
        doc(db, 'appointments', userId, 'userAppointments', id),
        { ...appointment, status: newStatus },
        { merge: true }
      );

      await sendNotification(
        userId,
        newStatus === 'Confirmed'
          ? 'Appointment Confirmed ✅'
          : 'Appointment Rejected ❌',
        newStatus === 'Confirmed'
          ? `Your appointment on ${appointment.date} at ${appointment.time} has been confirmed.`
          : `Sorry, your appointment on ${appointment.date} at ${appointment.time} was rejected.`
      );

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
        <ActivityIndicator size="large" color="#3F51B5" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#3F51B5', '#03DAC6']} style={styles.header}>
        <Text style={styles.headerTitle}>Appointment Calendar</Text>
        <Ionicons name="calendar-outline" size={24} color="#fff" />
      </LinearGradient>

      {/* Calendar */}
      <Calendar
        markedDates={{
          ...markedDates,
          ...(selectedDate && {
            [selectedDate]: {
              selected: true,
              selectedColor: '#3F51B5',
              ...markedDates[selectedDate],
            },
          }),
        }}
        onDayPress={(day) => setSelectedDate(day.dateString)}
        theme={{
          backgroundColor: '#fff',
          calendarBackground: '#fff',
          textSectionTitleColor: '#1A237E',
          selectedDayBackgroundColor: '#3F51B5',
          todayTextColor: '#03DAC6',
          dayTextColor: '#2c3e50',
          arrowColor: '#3F51B5',
          monthTextColor: '#1A237E',
          textMonthFontWeight: 'bold',
        }}
        style={styles.calendar}
      />

      {/* Appointment Cards */}
      {selectedDate && (
        <View style={styles.appointmentsList}>
          <Text style={styles.dateHeading}>
            {filteredAppointments.length > 0
              ? `Appointments on ${selectedDate}`
              : `No Appointments on ${selectedDate}`}
          </Text>

          {filteredAppointments.map((item) => (
            <View key={item.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="person-outline" size={16} color="#3F51B5" />
                <Text style={styles.cardTitle}>{item.fullName}</Text>
              </View>

              <Text style={styles.cardText}>📅 {item.date} — 🕒 {item.time}</Text>
              <Text style={styles.cardText}>📞 {item.phone}</Text>
              <Text style={styles.cardText}>📌 Fabric: {item.fabric || 'N/A'}</Text>
              <Text style={styles.cardText}>🎨 Style: {item.styleCategory || 'N/A'}</Text>

              {item.styleImage && (
                <Image
                  source={{ uri: item.styleImage }}
                  style={styles.imagePreview}
                />
              )}

              <View
                style={[
                  styles.paymentBadge,
                  item.paymentStatus === 'Advance Paid'
                    ? styles.paid
                    : item.paymentStatus === 'Full Paid'
                    ? styles.fullPaid
                    : styles.pendingPay,
                ]}>
                <Text style={styles.paymentText}>
                  {item.paymentStatus || 'Pending Payment'}
                </Text>
              </View>

              <Text
                style={[
                  styles.statusBadge,
                  item.status === 'Confirmed'
                    ? styles.confirmed
                    : item.status === 'Pending'
                    ? styles.pending
                    : styles.rejected,
                ]}>
                {item.status}
              </Text>

              {item.status === 'Pending' && (
                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={styles.confirmBtn}
                    onPress={() => updateStatus(item.id, 'Confirmed', item.userId, item)}>
                    <Text style={styles.btnText}>Confirm</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.declineBtn}
                    onPress={() => updateStatus(item.id, 'Rejected', item.userId, item)}>
                    <Text style={styles.btnText}>Reject</Text>
                  </TouchableOpacity>
                </View>
              )}

              {item.status === 'Confirmed' && (
                <TouchableOpacity
                  style={styles.paymentBtn}
                  onPress={() => navigation.navigate('PaymentTailorScreen')}>
                  <Ionicons name="wallet-outline" size={16} color="#fff" />
                  <Text style={styles.paymentBtnText}>View Payment</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    elevation: 6,
    shadowColor: '#3F51B5',
  },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#fff' },
  calendar: {
    borderRadius: 20,
    marginHorizontal: 16,
    marginTop: 16,
    elevation: 3,
    shadowColor: 'rgba(0,0,0,0.1)',
    overflow: 'hidden',
  },
  appointmentsList: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 80 },
  dateHeading: { fontSize: 17, fontWeight: '700', color: '#1A237E', marginBottom: 12 },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 14,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#90CAF9',
    borderLeftWidth: 3,
    borderLeftColor: '#03DAC6',
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#3F51B5', marginLeft: 6 },
  cardText: { fontSize: 14, color: '#333', marginBottom: 4 },
  imagePreview: {
    width: 90,
    height: 90,
    borderRadius: 10,
    marginVertical: 6,
  },
  paymentBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
    marginTop: 4,
  },
  paymentText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  paid: { backgroundColor: '#03DAC6' },
  fullPaid: { backgroundColor: '#4CAF50' },
  pendingPay: { backgroundColor: '#FFB300' },
  statusBadge: {
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 6,
    fontSize: 12,
    alignSelf: 'flex-start',
  },
  pending: { backgroundColor: '#fff4e0', color: '#d68910' },
  confirmed: { backgroundColor: '#eafbea', color: '#27ae60' },
  rejected: { backgroundColor: '#fbeaea', color: '#c0392b' },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  confirmBtn: {
    backgroundColor: '#03DAC6',
    paddingVertical: 10,
    borderRadius: 10,
    width: '48%',
    alignItems: 'center',
  },
  declineBtn: {
    backgroundColor: '#E53935',
    paddingVertical: 10,
    borderRadius: 10,
    width: '48%',
    alignItems: 'center',
  },
  btnText: { color: '#fff', fontWeight: '600' },
  paymentBtn: {
    backgroundColor: '#3F51B5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 10,
  },
  paymentBtnText: { color: '#fff', marginLeft: 6, fontWeight: '600' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

export default AppointmentCalendar;
