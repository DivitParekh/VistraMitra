import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
  TextInput,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { db } from '../firebase/firebaseConfig';
import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
} from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AppointmentScreen = () => {
  const [appointments, setAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(null);
  const [visitType, setVisitType] = useState('Home Visit');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [userId, setUserId] = useState(null);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    const fetchAppointments = async () => {
      const uid = await AsyncStorage.getItem('userId');
      if (!uid) return;
      setUserId(uid);
      const q = query(collection(db, 'appointments', uid, 'userAppointments'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAppointments(data);
    };
    fetchAppointments();
  }, []);

  const formatDate = (date) => date.toDateString();
  const formatTime = (date) => {
    const h = date.getHours();
    const m = date.getMinutes();
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hr = h % 12 || 12;
    return `${hr}:${m.toString().padStart(2, '0')} ${ampm}`;
  };

  const handleBookAppointment = async () => {
    if (!selectedTime || !name || !phone || !email || !address) {
      return Alert.alert('Error', 'Please fill all fields and select time');
    }
    if (!userId) return Alert.alert('User not logged in');

    const newApp = {
      userId,
      fullName: name,
      phone,
      email,
      address,
      note,
      date: formatDate(selectedDate),
      time: formatTime(selectedTime),
      type: visitType,
      status: 'Pending',
      createdAt: new Date().toISOString(),
    };

    try {
      // 1. Save under userAppointments (Customer-specific)
      const userAppointmentsRef = collection(db, 'appointments', userId, 'userAppointments');
      const userAppDoc = doc(userAppointmentsRef); // auto-ID
      await setDoc(userAppDoc, newApp);

      // 2. Also save under tailorAppointments (Global for Tailor)
      const tailorAppointmentsRef = doc(collection(db, 'tailorAppointments'), userAppDoc.id);
      await setDoc(tailorAppointmentsRef, newApp);

      setAppointments([...appointments, { ...newApp, id: userAppDoc.id }]);
      setSelectedTime(null);
      setVisitType('Home Visit');
      setSelectedDate(new Date());
      setName(''); setPhone(''); setEmail(''); setAddress(''); setNote('');
      Alert.alert('Success', 'Appointment booked!');
    } catch (err) {
      console.error('Booking Error:', err);
      Alert.alert('Error', 'Something went wrong while booking');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Book Appointment</Text>
        <Ionicons name="calendar-outline" size={24} color="#2c3e50" />
      </View>

      {appointments.length === 0 ? (
        <Text style={styles.noAppointment}>No appointments booked yet.</Text>
      ) : (
        <View style={styles.appointmentsList}>
          <Text style={styles.subheading}>Your Appointments</Text>
          {appointments.map((item) => (
            <View key={item.id} style={styles.appointmentCard}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.appointmentText}>
                    {item.date} at {item.time} ({item.type})
                  </Text>
                  <Text style={{ color: '#555', fontSize: 13 }}>{item.fullName}</Text>
                </View>
                <View style={[
                  styles.statusBadge,
                  item.status === 'Confirmed' ? styles.statusConfirmed :
                  item.status === 'Rejected' ? styles.statusRejected :
                  styles.statusPending
                ]}>
                  <Text style={styles.statusText}>{item.status}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Form */}
      <View style={styles.form}>
        <Text style={styles.label}>Your Full Name</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="John Doe" />
        <Text style={styles.label}>Phone Number</Text>
        <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="+91 98765 43210" />
        <Text style={styles.label}>Email Address</Text>
        <TextInput style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" placeholder="you@example.com" />
        <Text style={styles.label}>Address</Text>
        <TextInput style={styles.input} value={address} onChangeText={setAddress} placeholder="123, Street Name, City" />
        <Text style={styles.label}>Service Type</Text>
        <View style={styles.pickerContainer}>
          <Picker selectedValue={visitType} onValueChange={(value) => setVisitType(value)} style={styles.picker}>
            <Picker.Item label="Home Visit" value="Home Visit" />
            <Picker.Item label="Studio Visit" value="Studio Visit" />
          </Picker>
        </View>
        <Text style={styles.label}>Preferred Date</Text>
        <TouchableOpacity style={styles.input} onPress={() => setShowDatePicker(true)}>
          <Text>{formatDate(selectedDate)}</Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            mode="date"
            value={selectedDate}
            onChange={(e, d) => {
              setShowDatePicker(false);
              if (d) setSelectedDate(d);
            }}
            display={Platform.OS === 'ios' ? 'inline' : 'default'}
          />
        )}
        <Text style={styles.label}>Preferred Time</Text>
        <TouchableOpacity style={styles.input} onPress={() => setShowTimePicker(true)}>
          <Text>{selectedTime ? formatTime(selectedTime) : 'Tap to pick time'}</Text>
        </TouchableOpacity>
        {showTimePicker && (
          <DateTimePicker
            mode="time"
            value={new Date()}
            onChange={(e, t) => {
              setShowTimePicker(false);
              if (t) setSelectedTime(t);
            }}
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          />
        )}
        <Text style={styles.label}>Special Note</Text>
        <TextInput
          style={[styles.input, { height: 80 }]}
          multiline
          value={note}
          onChangeText={setNote}
          placeholder="e.g. Looking for a slim-fit navy suit..."
        />
        <TouchableOpacity style={styles.bookBtn} onPress={handleBookAppointment}>
          <Text style={styles.bookBtnText}>Submit Appointment Request</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fafafa' },
  header: {
    padding: 24,
    paddingTop: 50,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#c1e1ec',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    justifyContent: 'space-between',
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#2c3e50' },
  noAppointment: {
    textAlign: 'center',
    color: '#999',
    marginTop: 40,
    fontSize: 16,
  },
  appointmentsList: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  subheading: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 12,
  },
  appointmentCard: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
    elevation: 2,
  },
  appointmentText: {
    fontSize: 14,
    color: '#333',
  },
  form: {
    marginTop: 30,
    paddingHorizontal: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 16,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  bookBtn: {
    backgroundColor: '#007bff',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  bookBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  statusPending: {
    backgroundColor: '#f39c12',
  },
  statusConfirmed: {
    backgroundColor: '#27ae60',
  },
  statusRejected: {
    backgroundColor: '#e74c3c',
  },
});

export default AppointmentScreen;
