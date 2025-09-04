import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/firebaseConfig';

const ProfileScreen = ({ navigation }) => {
  const [role, setRole] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      const storedRole = await AsyncStorage.getItem('userRole');
      const storedName = await AsyncStorage.getItem('userName');
      const storedEmail = await AsyncStorage.getItem('userEmail');

      setRole(storedRole);
      setName(storedName || '');
      setEmail(storedEmail || '');
    };
    fetchProfile();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      await AsyncStorage.clear();
      navigation.replace('Login');
    } catch (err) {
      Alert.alert('Logout Error', err.message);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="person-circle-outline" size={80} color="#5DA3FA" />
        <Text style={styles.name}>{name || 'User'}</Text>
        <Text style={styles.email}>{email}</Text>
        <Text style={styles.role}>Role: {role}</Text>
      </View>

      {/* Customer Section */}
      {role === 'customer' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Preferences</Text>
          <TouchableOpacity style={styles.option}>
            <Ionicons name="shirt-outline" size={20} color="#5DA3FA" />
            <Text style={styles.optionText}>Saved Styles</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.option}>
            <Ionicons name="calendar-outline" size={20} color="#5DA3FA" />
            <Text style={styles.optionText}>My Appointments</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.option}>
            <Ionicons name="cube-outline" size={20} color="#5DA3FA" />
            <Text style={styles.optionText}>My Orders</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Tailor Section */}
      {role === 'tailor' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Business Settings</Text>
          <TouchableOpacity style={styles.option}>
            <Ionicons name="time-outline" size={20} color="#5DA3FA" />
            <Text style={styles.optionText}>Work Hours & Deadlines</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.option}>
            <Ionicons name="briefcase-outline" size={20} color="#5DA3FA" />
            <Text style={styles.optionText}>Manage Services</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.option}>
            <Ionicons name="bar-chart-outline" size={20} color="#5DA3FA" />
            <Text style={styles.optionText}>Workload Insights</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Common Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <TouchableOpacity style={styles.option}>
          <Ionicons name="lock-closed-outline" size={20} color="#5DA3FA" />
          <Text style={styles.optionText}>Change Password</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.option} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="red" />
          <Text style={[styles.optionText, { color: 'red' }]}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fafafa' },
  header: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: '#eaf4ff',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  name: { fontSize: 20, fontWeight: '700', marginTop: 10, color: '#2c3e50' },
  email: { fontSize: 14, color: '#555' },
  role: { marginTop: 6, fontSize: 14, fontWeight: '600', color: '#5DA3FA' },
  section: { marginTop: 20, paddingHorizontal: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 10, color: '#2c3e50' },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 1,
  },
  optionText: { marginLeft: 12, fontSize: 15, color: '#333' },
});

export default ProfileScreen;
