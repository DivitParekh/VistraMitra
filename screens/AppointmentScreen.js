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
  Image,
  LayoutAnimation,
  UIManager,
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
  serverTimestamp,
} from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 🔹 Import local catalog (with categories & images)
import { catalog } from '../assets/catalogData';

// ✅ Enable smooth animations on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const AppointmentScreen = () => {
  const [appointments, setAppointments] = useState([]);
  const [expandedId, setExpandedId] = useState(null);

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedStyle, setSelectedStyle] = useState(null);
  const [fabricOption, setFabricOption] = useState('Own Fabric');

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

  // 🔹 Fetch user's existing appointments
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
  };

  const handleBookAppointment = async () => {
    if (!selectedTime || !name || !phone || !email || !address || !selectedStyle) {
      return Alert.alert('Error', 'Please fill all fields and select style/fabric.');
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
      fabric: fabricOption,
      styleCategory: selectedCategory,
      styleImage: selectedStyle.uri || null, // ✅ store URI string if available
      status: 'Pending',
      createdAt: serverTimestamp(),
    };

    try {
      const userAppointmentsRef = collection(db, 'appointments', userId, 'userAppointments');
      const userAppDoc = doc(userAppointmentsRef);
      await setDoc(userAppDoc, newApp);

      const tailorAppointmentsRef = doc(collection(db, 'tailorAppointments'), userAppDoc.id);
      await setDoc(tailorAppointmentsRef, newApp);

      setAppointments([...appointments, { ...newApp, id: userAppDoc.id }]);
      resetForm();
      Alert.alert('Success', 'Appointment booked!');
    } catch (err) {
      console.error('Booking Error:', err);
      Alert.alert('Error', 'Something went wrong while booking');
    }
  };

  const toggleExpand = (id) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Book Appointment</Text>
        <Ionicons name="calendar-outline" size={24} color="#2c3e50" />
      </View>

      {/* Existing Appointments */}
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
              activeOpacity={0.8}
            >
              {/* Summary */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <View>
                  <Text style={styles.appointmentText}>
                    {item.date} at {item.time} ({item.type})
                  </Text>
                  <Text style={{ fontSize: 13, color: '#555' }}>{item.fullName}</Text>
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

              {/* Expanded details */}
              {expandedId === item.id && (
                <View style={{ marginTop: 10 }}>
                  <Text style={{ color: '#777', fontSize: 12 }}>Fabric: {item.fabric}</Text>
                  <Text style={{ color: '#777', fontSize: 12 }}>Style: {item.styleCategory}</Text>
                  {item.styleImage && (
                    <Image
                      source={{ uri: item.styleImage }}
                      style={{ width: 80, height: 80, borderRadius: 6, marginVertical: 6 }}
                    />
                  )}
                  {item.note ? (
                    <Text style={{ fontSize: 12, color: '#666' }}>📝 {item.note}</Text>
                  ) : null}
                  <Text style={{ fontSize: 12, color: '#666' }}>📧 {item.email}</Text>
                  <Text style={{ fontSize: 12, color: '#666' }}>📞 {item.phone}</Text>
                  <Text style={{ fontSize: 12, color: '#666' }}>🏠 {item.address}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Booking Form */}
      <View style={styles.form}>
        <Text style={styles.label}>Your Full Name</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="John Doe" />
        <Text style={styles.label}>Phone Number</Text>
        <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="+91 98765 43210" />
        <Text style={styles.label}>Email Address</Text>
        <TextInput style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" placeholder="you@example.com" />
        <Text style={styles.label}>Address</Text>
        <TextInput style={styles.input} value={address} onChangeText={setAddress} placeholder="123, Street Name, City" />

        {/* Fabric Option */}
        <Text style={styles.label}>Fabric Option</Text>
        <View style={styles.pickerContainer}>
          <Picker selectedValue={fabricOption} onValueChange={(value) => setFabricOption(value)} style={styles.picker}>
            <Picker.Item label="Own Fabric" value="Own Fabric" />
            <Picker.Item label="Tailor's Fabric" value="Tailor's Fabric" />
          </Picker>
        </View>

        {/* Catalog Category Picker */}
        <Text style={styles.label}>Select Category</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedCategory}
            onValueChange={(value) => {
              setSelectedCategory(value);
              setSelectedStyle(null);
            }}
            style={styles.picker}
          >
            <Picker.Item label="-- Select Category --" value={null} />
            {Object.keys(catalog).map((cat) => (
              <Picker.Item key={cat} label={cat.charAt(0).toUpperCase() + cat.slice(1)} value={cat} />
            ))}
          </Picker>
        </View>

        {/* Style Selection */}
        {selectedCategory && (
          <>
            <Text style={styles.label}>Choose Style</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
              {catalog[selectedCategory].map((img, idx) => (
                <TouchableOpacity
                  key={idx}
                  onPress={() => setSelectedStyle({ uri: Image.resolveAssetSource(img).uri })}
                  style={[
                    styles.imageOption,
                    selectedStyle?.uri === Image.resolveAssetSource(img).uri && styles.imageSelected
                  ]}
                >
                  <Image source={img} style={{ width: 80, height: 80, borderRadius: 8 }} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        )}

        {/* Date & Time */}
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

        {/* Notes */}
        <Text style={styles.label}>Special Note</Text>
        <TextInput
          style={[styles.input, { height: 80 }]}
          multiline
          value={note}
          onChangeText={setNote}
          placeholder="e.g. Looking for a slim-fit navy suit..."
        />

        {/* Submit */}
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
  noAppointment: { textAlign: 'center', color: '#999', marginTop: 40, fontSize: 16 },
  appointmentsList: { paddingHorizontal: 20, marginTop: 24 },
  subheading: { fontSize: 16, fontWeight: '600', color: '#2c3e50', marginBottom: 12 },
  appointmentCard: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
    elevation: 2,
  },
  appointmentText: { fontSize: 14, color: '#333' },
  form: { marginTop: 30, paddingHorizontal: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 6 },
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
  picker: { height: 50, width: '100%' },
  bookBtn: {
    backgroundColor: '#007bff',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  bookBtnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: { fontSize: 12, fontWeight: '600', color: '#fff' },
  statusPending: { backgroundColor: '#f39c12' },
  statusConfirmed: { backgroundColor: '#27ae60' },
  statusRejected: { backgroundColor: '#e74c3c' },
  imageOption: { marginRight: 10, borderWidth: 2, borderColor: 'transparent', borderRadius: 8 },
  imageSelected: { borderColor: '#007bff' },
});

export default AppointmentScreen;
