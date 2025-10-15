// screens/AppointmentCalendar.js
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
              ? '#27ae60'
              : app.status === 'Pending'
              ? '#f39c12'
              : '#c0392b',
        };
      }
    });
    setMarkedDates(marks);
  };

  // 🔹 Confirm or Reject Appointment
  const updateStatus = async (id, newStatus, userId, appointment) => {
    try {
      if (!userId) {
        Alert.alert("Error", "Cannot confirm — missing customer info.");
        return;
      }

      // ✅ Confirm only: Create order + tasks
      if (newStatus === "Confirmed") {
        const orderId = id;

        const orderData = {
          orderId,
          appointmentId: id,
          userId,
          customerName: appointment.fullName || "Customer",
          styleCategory: appointment.styleCategory || "Custom Style",
          styleImage: appointment.styleImage || null,
          fabric: appointment.fabric || "Customer Fabric",
          address: appointment.address || "",
          date: appointment.date,
          time: appointment.time,
          totalCost: appointment.totalCost || 0,
          advancePaid: appointment.advancePaid || 0,
          balanceDue:
            (appointment.totalCost || 0) - (appointment.advancePaid || 0),
          paymentStatus: appointment.paymentStatus || "Advance Paid",
          status: "Confirmed",
          createdAt: serverTimestamp(),
        };

        // 🟢 Create order in Firestore
        await setDoc(doc(db, "orders", orderId), orderData);
        await setDoc(doc(db, "users", userId, "orders", orderId), orderData);

        // 🧵 Create default task stages
        const stages = ["Cutting", "Stitching", "Handwork", "Packaging"];
        for (const stage of stages) {
          await addDoc(collection(db, "taskManager"), {
            orderId,
            userId,
            customerName: appointment.fullName,
            stage,
            status: "Pending",
            createdAt: serverTimestamp(),
          });
        }

        // 🔔 Auto-send payment reminder if delivery within 2 days
        const today = new Date();
        const deliveryDate = new Date(appointment.date);
        const diffInDays = (deliveryDate - today) / (1000 * 60 * 60 * 24);

        if (diffInDays <= 2 && !appointment.reminderSent) {
          await sendFinalPaymentReminder(appointment);
        }
      }

      // ✅ Update status globally
      await setDoc(
        doc(db, "tailorAppointments", id),
        { ...appointment, status: newStatus },
        { merge: true }
      );
      await setDoc(
        doc(db, "appointments", userId, "userAppointments", id),
        { ...appointment, status: newStatus },
        { merge: true }
      );

      // 🔔 Send appointment status notification
      await sendNotification(
        userId,
        newStatus === "Confirmed"
          ? "Appointment Confirmed ✅"
          : "Appointment Rejected ❌",
        newStatus === "Confirmed"
          ? `Your appointment on ${appointment.date} at ${appointment.time} has been confirmed.`
          : `Sorry, your appointment on ${appointment.date} at ${appointment.time} was rejected.`
      );

      Alert.alert("Success", `Appointment marked as ${newStatus}`);
    } catch (err) {
      console.error("Error updating status:", err);
      Alert.alert("Error", "Could not update appointment status");
    }
  };

  // 🚀 Auto Final Payment Reminder
  const sendFinalPaymentReminder = async (appointment) => {
    try {
      const { userId, id, totalCost, advancePaid } = appointment;

      const remaining = (Number(totalCost) || 0) - (Number(advancePaid) || 0);
      const link = `vastramitra://finalpayment?appointmentId=${id}&userId=${userId}`;

      await sendNotification(
        userId,
        "Your Order is Ready 🎉",
        `Your outfit is ready! Please pay the remaining ₹${remaining} to confirm delivery.`,
        link
      );

      await updateDoc(doc(db, "appointments", userId, "userAppointments", id), {
        reminderSent: true,
        deliveryStatus: "Ready for Delivery",
      });

      console.log(`✅ Auto reminder sent for ${appointment.fullName}`);
    } catch (error) {
      console.error("Reminder Error:", error);
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
              <Text style={styles.cardText}>📅 {item.date} — 🕒 {item.time}</Text>
              <Text style={styles.cardText}>👤 {item.fullName}</Text>
              <Text style={styles.cardText}>📞 {item.phone}</Text>
              <Text style={styles.cardText}>📌 Fabric: {item.fabric || 'N/A'}</Text>
              <Text style={styles.cardText}>🎨 Style: {item.styleCategory || 'N/A'}</Text>
              {item.styleImage && (
                <Image
                  source={{ uri: item.styleImage }}
                  style={{ width: 80, height: 80, borderRadius: 6, marginVertical: 6 }}
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
                ]}
              >
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
                ]}
              >
                {item.status}
              </Text>

              {item.status === 'Pending' && (
                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={styles.confirmBtn}
                    onPress={() => updateStatus(item.id, 'Confirmed', item.userId, item)}
                  >
                    <Text style={styles.btnText}>Confirm</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.declineBtn}
                    onPress={() => updateStatus(item.id, 'Rejected', item.userId, item)}
                  >
                    <Text style={styles.btnText}>Reject</Text>
                  </TouchableOpacity>
                </View>
              )}

              {item.status === 'Confirmed' && (
                <TouchableOpacity
                  style={styles.paymentBtn}
                  onPress={() => navigation.navigate('PaymentTailorScreen')}
                >
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
  container: { flex: 1, backgroundColor: '#fafafa' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 10,
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#2c3e50' },
  appointmentsList: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 80 },
  dateHeading: { fontSize: 16, fontWeight: '600', marginBottom: 16, color: '#2c3e50' },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    borderLeftWidth: 5,
    borderLeftColor: '#5DA3FA',
  },
  cardText: { fontSize: 14, color: '#34495e', marginBottom: 6 },
  paymentBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
  },
  paymentText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  paid: { backgroundColor: '#27ae60' },
  fullPaid: { backgroundColor: '#2ecc71' },
  pendingPay: { backgroundColor: '#f39c12' },
  statusBadge: {
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginTop: 6,
    fontSize: 12,
    alignSelf: 'flex-start',
  },
  pending: { backgroundColor: '#fce4b3', color: '#e67e22' },
  confirmed: { backgroundColor: '#d4edda', color: '#27ae60' },
  rejected: { backgroundColor: '#f8d7da', color: '#c0392b' },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
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
  btnText: { color: '#fff', fontWeight: '600' },
  paymentBtn: {
    backgroundColor: '#007bff',
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
