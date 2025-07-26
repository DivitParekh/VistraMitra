import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';

const AppointmentScreen = () => {
  const [appointments, setAppointments] = useState([]);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(null);
  const [visitType, setVisitType] = useState('Home Visit');

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const formatDate = (date) => {
    return date.toDateString(); // Example: "Mon Jul 29 2025"
  };

  const formatTime = (date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHour = hours % 12 || 12;
    return `${formattedHour}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  };

  const handleBookAppointment = () => {
    if (!selectedTime) {
      alert('Please select time');
      return;
    }

    const newAppointment = {
      id: Date.now().toString(),
      date: formatDate(selectedDate),
      time: formatTime(selectedTime),
      type: visitType,
      status: 'Pending',
    };

    setAppointments([...appointments, newAppointment]);
    setSelectedTime(null);
    setVisitType('Home Visit');
    setSelectedDate(new Date());
    alert('Appointment booked!');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Book Appointment</Text>
        <Ionicons name="calendar-outline" size={24} color="#2c3e50" />
      </View>

      {/* Appointments */}
      {appointments.length === 0 ? (
        <Text style={styles.noAppointment}>No appointments booked yet.</Text>
      ) : (
        <View style={styles.appointmentsList}>
          <Text style={styles.subheading}>Your Appointments</Text>
          {appointments.map((item) => (
            <View key={item.id} style={styles.appointmentCard}>
              <Text style={styles.appointmentText}>
                {item.date} at {item.time} ({item.type})
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Form */}
      <View style={styles.form}>
        <Text style={styles.label}>Select Date</Text>
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

        <Text style={styles.label}>Select Time</Text>
        <TouchableOpacity style={styles.input} onPress={() => setShowTimePicker(true)}>
          <Text>{selectedTime ? formatTime(selectedTime) : 'Select Time'}</Text>
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

        <Text style={styles.label}>Visit Type</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={visitType}
            onValueChange={(value) => setVisitType(value)}
            style={styles.picker}>
            <Picker.Item label="Home Visit" value="Home Visit" />
            <Picker.Item label="Studio Visit" value="Studio Visit" />
          </Picker>
        </View>

        <TouchableOpacity style={styles.bookBtn} onPress={handleBookAppointment}>
          <Text style={styles.bookBtnText}>Book Appointment</Text>
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
    marginBottom: 24,
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
  },
  bookBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default AppointmentScreen;
