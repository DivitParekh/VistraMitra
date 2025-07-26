import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebase/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secureText, setSecureText] = useState(true);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Login Error', 'Please enter both email and password');
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Firestore user data
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        Alert.alert('Login Error', 'User data not found in Firestore');
        return;
      }

      const userData = userSnap.data();

      // Save session info
      await AsyncStorage.setItem('isLoggedIn', 'true');
      await AsyncStorage.setItem('userId', user.uid);
      await AsyncStorage.setItem('userName', userData.name || '');
      await AsyncStorage.setItem('userEmail', userData.emailOrPhone || '');

      // 👉 Tailor vs Customer redirect
      if (email.toLowerCase() === 'tailor@vastra.com') {
        await AsyncStorage.setItem('userRole', 'tailor');
        navigation.replace('TailorScreen'); // Update to match your navigator
      } else {
        await AsyncStorage.setItem('userRole', 'customer');
        navigation.replace('CustomerScreen');
      }

    } catch (error) {
      console.error('Login Error:', error);
      Alert.alert('Login Failed', error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Welcome Back 👋</Text>
      <Text style={styles.subtitle}>Login to VastraMitra</Text>

      <TextInput
        placeholder="Email"
        placeholderTextColor="#999"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />

      <TextInput
        placeholder="Password"
        placeholderTextColor="#999"
        secureTextEntry={secureText}
        style={styles.input}
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity onPress={() => setSecureText(!secureText)}>
        <Text style={styles.togglePassword}>
          {secureText ? 'Show' : 'Hide'} Password
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginButtonText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
        <Text style={styles.registerText}>
          Don't have an account? <Text style={styles.registerLink}>Sign up</Text>
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

// 💅 Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
  },
  input: {
    backgroundColor: '#f2f2f2',
    padding: 14,
    borderRadius: 10,
    marginBottom: 16,
    fontSize: 16,
  },
  togglePassword: {
    alignSelf: 'flex-end',
    color: '#007bff',
    marginBottom: 24,
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: '#007bff',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 16,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  registerText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
  },
  registerLink: {
    color: '#007bff',
    fontWeight: '600',
  },
});

export default LoginScreen;
