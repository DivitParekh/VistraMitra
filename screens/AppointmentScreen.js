import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
  Image,
  LayoutAnimation,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { db } from '../firebase/firebaseConfig';
import { collection, doc, getDocs, query, setDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { catalog } from '../assets/catalogData';
import { sendNotification } from '../utils/notificationService';
import CostEstimator from '../screens/CostEstimator';
import { LinearGradient } from 'expo-linear-gradient';

const AppointmentScreen = ({ navigation }) => {
  const [appointments, setAppointments] = useState([]);
  const [expandedId, setExpandedId] = useState(null);

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedStyle, setSelectedStyle] = useState(null);
  const [fabricOption, setFabricOption] = useState('Own Fabric');
  const [complexity, setComplexity] = useState('Simple');

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
  const [estimatedCost, setEstimatedCost] = useState({
    totalCost: 0,
    advance: 0,
    balance: 0,
  });

  useEffect(() => {
    const fetchAppointments = async () => {
      const uid = await AsyncStorage.getItem('uid');
      if (!uid) return;
      setUserId(uid);
      const q = query(collection(db, 'appointments', uid, 'userAppointments'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setAppointments(data);
    };
    fetchAppointments();
  }, []);

  const formatDate = (date) => date.toISOString().split('T')[0];
  const formatTime = (date) => {
    const h = date.getHours();
    const m = date.getMinutes();
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hr = h % 12 || 12;
    return `${hr}:${m.toString().padStart(2, '0')} ${ampm}`;
  };

  const resetForm = () => {
    setSelectedTime(null);
    setVisitType('Home Visit');
    setSelectedDate(new Date());
    setName('');
    setPhone('');
    setEmail('');
    setAddress('');
    setNote('');
    setFabricOption('Own Fabric');
    setSelectedCategory(null);
    setSelectedStyle(null);
    setComplexity('Simple');
    setEstimatedCost({ totalCost: 0, advance: 0, balance: 0 });
  };

  // 🟢 Booking Function with Tailor Notification
  const handleBookAppointment = async () => {
    if (!selectedTime || !name || !phone || !email || !address || !selectedStyle) {
      return Alert.alert('Error', 'Please fill all fields and select style/fabric.');
    }
    if (!userId) return Alert.alert('User not logged in');

    const appointmentId = Date.now().toString();
    const appointmentDetails = {
      fullName: name,
      phone,
      email,
      address,
      note,
      date: formatDate(selectedDate),
      time: formatTime(selectedTime),
      type: visitType,
      fabric: fabricOption,
      styleCategory: selectedCategory,
      styleImage: selectedStyle?.uri || null,
      complexity,
      totalCost: estimatedCost.totalCost,
      advancePaid: estimatedCost.advance,
      balanceDue: estimatedCost.balance,
      status: 'Pending',
      userId,
      createdAt: new Date().toISOString(),
    };

    try {
      // ✅ Save appointment to customer's subcollection
      await setDoc(doc(db, 'appointments', userId, 'userAppointments', appointmentId), appointmentDetails);

      // ✅ Save globally for tailor view
      await setDoc(doc(db, 'tailorAppointments', appointmentId), appointmentDetails);

      // ✅ Notify tailor (real-time)
      await sendNotification(
        'YvjGOga1CDWJhJfoxAvL7c7Z5sG2',
        '📅 New Appointment Booked',
        `${appointmentDetails.fullName} booked an appointment on ${appointmentDetails.date} at ${appointmentDetails.time}.`
      );

      // ✅ Navigate to PaymentScreen
      navigation.navigate('PaymentScreen', {
        totalCost: estimatedCost.totalCost,
        userId,
        appointmentDetails,
      });

      resetForm();
      Alert.alert('Success', 'Appointment booked successfully! The tailor has been notified.');

    } catch (error) {
      console.error('❌ Error booking appointment:', error);
      Alert.alert('Error', 'Failed to book appointment. Please try again.');
    }
  };

  const toggleExpand = (id) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
      {/* Header */}
      <LinearGradient colors={['#3F51B5', '#03DAC6']} style={styles.header}>
        <Text style={styles.headerTitle}>Book Appointment</Text>
        <Ionicons name="calendar-outline" size={26} color="#fff" />
      </LinearGradient>

      {/* Appointments */}
      {appointments.length === 0 ? (
        <Text style={styles.noAppointment}>No appointments booked yet.</Text>
      ) : (
        <View style={styles.appointmentsList}>
          <Text style={styles.subheading}>Your Appointments</Text>
          {appointments.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.appointmentCard}
              onPress={() => toggleExpand(item.id)}
              activeOpacity={0.9}>
              <View style={styles.appointmentHeader}>
                <View>
                  <Text style={styles.appointmentText}>
                    {item.date} at {item.time} ({item.type})
                  </Text>
                  <Text style={styles.appointmentName}>{item.fullName}</Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    item.status === 'Confirmed'
                      ? styles.statusConfirmed
                      : item.status === 'Rejected'
                      ? styles.statusRejected
                      : styles.statusPending,
                  ]}>
                  <Text style={styles.statusText}>{item.status}</Text>
                </View>
              </View>

              {expandedId === item.id && (
                <View style={styles.expandedInfo}>
                  <Text style={styles.infoText}>Fabric: {item.fabric}</Text>
                  <Text style={styles.infoText}>Style: {item.styleCategory}</Text>
                  <Text style={styles.infoText}>Complexity: {item.complexity}</Text>
                  <Text style={styles.infoText}>💰 Total: ₹{item.totalCost}</Text>
                  <Text style={styles.infoText}>Advance: ₹{item.advancePaid}</Text>
                  <Text style={styles.infoText}>Balance: ₹{item.balanceDue}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Booking Form */}
      <View style={styles.form}>
        <Text style={styles.sectionTitle}>Appointment Details</Text>

        <Text style={styles.label}>Your Full Name</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="John Doe" />

        <Text style={styles.label}>Phone Number</Text>
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          placeholder="+91 98765 43210"
        />

        <Text style={styles.label}>Email Address</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          placeholder="you@example.com"
        />

        <Text style={styles.label}>Address</Text>
        <TextInput
          style={styles.input}
          value={address}
          onChangeText={setAddress}
          placeholder="123, Street Name, City"
        />

        <Text style={styles.label}>Fabric Option</Text>
        <View style={styles.pickerContainer}>
          <Picker selectedValue={fabricOption} onValueChange={setFabricOption} style={styles.picker}>
            <Picker.Item label="Own Fabric" value="Own Fabric" />
            <Picker.Item label="Tailor's Fabric" value="Tailor's Fabric" />
          </Picker>
        </View>

        <Text style={styles.label}>Select Category</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedCategory}
            onValueChange={(value) => {
              setSelectedCategory(value);
              setSelectedStyle(null);
              setComplexity('Simple');
            }}
            style={styles.picker}>
            <Picker.Item label="-- Select Category --" value={null} />
            {Object.keys(catalog).map((cat) => (
              <Picker.Item key={cat} label={cat.charAt(0).toUpperCase() + cat.slice(1)} value={cat} />
            ))}
          </Picker>
        </View>

        {selectedCategory && (
          <>
            <Text style={styles.label}>Choose Style</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.styleScroll}>
              {catalog[selectedCategory].map((item, idx) => (
                <TouchableOpacity
                  key={idx}
                  onPress={() => {
                    setSelectedStyle({ uri: Image.resolveAssetSource(item.image).uri });
                    setComplexity(item.complexity);
                  }}
                  style={[
                    styles.imageOption,
                    selectedStyle?.uri === Image.resolveAssetSource(item.image).uri && styles.imageSelected,
                  ]}>
                  <Image source={item.image} style={styles.image} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        )}

        <Text style={styles.label}>Preferred Date</Text>
        <TouchableOpacity style={styles.input} onPress={() => setShowDatePicker(true)}>
          <Text>{formatDate(selectedDate)}</Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            mode="date"
            value={selectedDate}
            minimumDate={new Date()}
            onChange={(e, d) => {
              setShowDatePicker(false);
              if (d) setSelectedDate(d);
            }}
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

        <CostEstimator
          fabricOption={fabricOption}
          styleCategory={selectedCategory}
          complexity={complexity}
          onEstimate={setEstimatedCost}
        />

        <LinearGradient colors={['#3F51B5', '#03DAC6']} style={styles.bookBtn}>
          <TouchableOpacity onPress={handleBookAppointment}>
            <Text style={styles.bookBtnText}>Submit Appointment Request</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  header: {
    padding: 26,
    paddingTop: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 6,
    backgroundColor: '#3F51B5',
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#fff' },
  noAppointment: { textAlign: 'center', color: '#757575', marginTop: 40, fontSize: 16 },
  appointmentsList: { paddingHorizontal: 20, marginTop: 24 },
  subheading: { fontSize: 16, fontWeight: '700', color: '#1A237E', marginBottom: 12 },
  appointmentCard: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 3,
  },
  appointmentHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  appointmentText: { fontSize: 14, fontWeight: '600', color: '#212121' },
  appointmentName: { fontSize: 13, color: '#666' },
  expandedInfo: { marginTop: 10 },
  infoText: { color: '#555', fontSize: 13 },
  form: { marginTop: 30, paddingHorizontal: 20, paddingBottom: 100 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1A237E', marginBottom: 14 },
  label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 5 },
  input: {
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  pickerContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 16,
  },
  picker: { height: 50, width: '100%' },
  styleScroll: { marginBottom: 16 },
  imageOption: {
    marginRight: 10,
    borderWidth: 2,
    borderColor: 'transparent',
    borderRadius: 8,
    backgroundColor: '#fff',
    elevation: 2,
  },
  imageSelected: { borderColor: '#03DAC6' },
  image: { width: 80, height: 80, borderRadius: 8 },
  bookBtn: { borderRadius: 12, marginTop: 20, elevation: 6 },
  bookBtnText: { textAlign: 'center', color: '#fff', fontWeight: '700', fontSize: 16, paddingVertical: 14 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, alignSelf: 'flex-start' },
  statusText: { fontSize: 12, fontWeight: '600', color: '#fff' },
  statusPending: { backgroundColor: '#03DAC6' },
  statusConfirmed: { backgroundColor: '#4CAF50' },
  statusRejected: { backgroundColor: '#E53935' },
});

export default AppointmentScreen;
