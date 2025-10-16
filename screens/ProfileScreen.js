import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/firebaseConfig';

let activeListeners = [];

export const addListener = (unsubscribe) => {
  if (unsubscribe && typeof unsubscribe === 'function') {
    activeListeners.push(unsubscribe);
  }
};

export const removeAllListeners = () => {
  activeListeners.forEach((unsub) => {
    try {
      unsub && unsub();
    } catch (e) {
      console.warn('⚠️ Listener cleanup failed:', e);
    }
  });
  activeListeners = [];
  console.log('🧹 All Firestore listeners unsubscribed.');
};

const ProfileScreen = ({ navigation }) => {
  const [role, setRole] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const storedRole = await AsyncStorage.getItem('userRole');
        const storedName = await AsyncStorage.getItem('userName');
        const storedEmail = await AsyncStorage.getItem('userEmail');

        setRole(storedRole);
        setName(storedName || '');
        setEmail(storedEmail || '');
      } catch (err) {
        console.error('Error reading profile from storage:', err);
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = async () => {
    try {
      removeAllListeners();
      await signOut(auth);
      await AsyncStorage.clear();
      navigation.replace('Login');
    } catch (err) {
      console.error('Logout Error:', err);
      Alert.alert('Logout Error', err.message);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 50 }}
      showsVerticalScrollIndicator={false}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#f7f9fc" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatarCircle}>
          <Ionicons name="person-circle-outline" size={100} color="#4C84FF" />
        </View>
        <Text style={styles.name}>{name || 'User'}</Text>
        <Text style={styles.email}>{email}</Text>
        <View style={styles.roleBadge}>
          <Ionicons
            name={role === 'tailor' ? 'briefcase-outline' : 'shirt-outline'}
            size={14}
            color="#fff"
          />
          <Text style={styles.roleText}>{role || '—'}</Text>
        </View>
      </View>

      {/* Customer Section */}
      {role === 'customer' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Preferences</Text>

          <TouchableOpacity
            style={styles.option}
            onPress={() => navigation.navigate('SavedStyles')}
          >
            <Ionicons name="heart-outline" size={22} color="#4C84FF" />
            <Text style={styles.optionText}>Saved Styles</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.option}
            onPress={() => navigation.navigate('AppointmentScreen')}
          >
            <Ionicons name="calendar-outline" size={22} color="#4C84FF" />
            <Text style={styles.optionText}>My Appointments</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.option}
            onPress={() => navigation.navigate('OrderScreen')}
          >
            <Ionicons name="cube-outline" size={22} color="#4C84FF" />
            <Text style={styles.optionText}>My Orders</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Tailor Section */}
      {role === 'tailor' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Business Tools</Text>

          <TouchableOpacity
            style={styles.option}
            onPress={() => navigation.navigate('AppointmentCalendar')}
          >
            <Ionicons name="time-outline" size={22} color="#4C84FF" />
            <Text style={styles.optionText}>Appointment Calendar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.option}
            onPress={() => navigation.navigate('OrderManagement')}
          >
            <Ionicons name="briefcase-outline" size={22} color="#4C84FF" />
            <Text style={styles.optionText}>Order Management</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.option}
            onPress={() => navigation.navigate('TailorTaskManager')}
          >
            <Ionicons name="bar-chart-outline" size={22} color="#4C84FF" />
            <Text style={styles.optionText}>Task Manager</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Common Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>

        {/* Removed Change Password */}

        <TouchableOpacity style={styles.option} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color="#E63946" />
          <Text style={[styles.optionText, { color: '#E63946' }]}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f9fc' },

  header: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  avatarCircle: {
    borderWidth: 3,
    borderColor: '#E0E6F8',
    borderRadius: 60,
    padding: 5,
    backgroundColor: '#F5F8FF',
  },
  name: { fontSize: 22, fontWeight: '700', marginTop: 12, color: '#1f2937' },
  email: { fontSize: 14, color: '#6b7280', marginTop: 4 },
  roleBadge: {
    flexDirection: 'row',
    backgroundColor: '#4C84FF',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginTop: 10,
    alignItems: 'center',
    gap: 6,
  },
  roleText: { color: '#fff', fontSize: 13, fontWeight: '600' },

  section: { marginTop: 25, paddingHorizontal: 20 },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 12,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
  },
  optionText: {
    marginLeft: 14,
    fontSize: 15,
    fontWeight: '500',
    color: '#1f2937',
  },
});

export default ProfileScreen;
