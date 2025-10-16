import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
  SafeAreaView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase/firebaseConfig';
import { LinearGradient } from 'expo-linear-gradient';

const SignupScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!name || !emailOrPhone || !password) {
      Alert.alert('Missing Fields', 'Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      const userCredential = await createUserWithEmailAndPassword(auth, emailOrPhone, password);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        name,
        emailOrPhone,
        role: "customer",
        createdAt: serverTimestamp(),
      });

      await AsyncStorage.setItem('isLoggedIn', 'true');
      await AsyncStorage.setItem('uid', user.uid);
      navigation.replace('CustomerScreen');
    } catch (error) {
      console.error('Signup Error:', error);
      Alert.alert('Signup Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerSection}>
        <Image
          source={require('../assets/logo.jpg')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>Create Your Account</Text>
        <Text style={styles.subtitle}>Join VastraMitra and simplify your tailoring journey</Text>
      </View>

      <View style={styles.formCard}>
        <TextInput
          placeholder="Full Name"
          placeholderTextColor="#757575"
          style={styles.input}
          value={name}
          onChangeText={setName}
        />
        <TextInput
          placeholder="Email"
          placeholderTextColor="#757575"
          style={styles.input}
          value={emailOrPhone}
          onChangeText={setEmailOrPhone}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          placeholder="Password"
          placeholderTextColor="#757575"
          secureTextEntry
          style={styles.input}
          value={password}
          onChangeText={setPassword}
        />

        <LinearGradient
          colors={['#3F51B5', '#03DAC6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.signupButton}>
          <TouchableOpacity onPress={handleSignup} disabled={loading} activeOpacity={0.85}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.signupButtonText}>Sign Up</Text>
            )}
          </TouchableOpacity>
        </LinearGradient>

        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.loginRedirect}>
            Already have an account? <Text style={styles.link}>Login</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 110,
    height: 110,
    borderRadius: 20,
    marginBottom: 12,
    elevation: 6,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1A237E',
  },
  subtitle: {
    fontSize: 14,
    color: '#424242',
    textAlign: 'center',
    marginTop: 6,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 22,
    elevation: 6,
    shadowColor: 'rgba(0,0,0,0.1)',
  },
  input: {
    backgroundColor: '#F5F5F5',
    padding: 14,
    borderRadius: 10,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  signupButton: {
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 18,
  },
  signupButtonText: {
    textAlign: 'center',
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    paddingVertical: 12,
    letterSpacing: 0.3,
  },
  loginRedirect: {
    textAlign: 'center',
    color: '#424242',
    fontSize: 14,
  },
  link: {
    color: '#03DAC6',
    fontWeight: '700',
  },
});

export default SignupScreen;
