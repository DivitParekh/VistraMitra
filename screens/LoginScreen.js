import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  Image,
} from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebase/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';

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
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        Alert.alert('Login Error', 'User data not found in Firestore');
        return;
      }

      const userData = userSnap.data();
      await AsyncStorage.setItem('isLoggedIn', 'true');
      await AsyncStorage.setItem('uid', user.uid);
      await AsyncStorage.setItem('userName', userData.name || '');
      await AsyncStorage.setItem('userEmail', userData.emailOrPhone || '');

      if (email.toLowerCase() === 'tailor@vastra.com') {
        await AsyncStorage.setItem('userRole', 'tailor');
        navigation.replace('TailorScreen');
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
      <View style={styles.headerSection}>
        <Image
          source={require('../assets/logo.jpg')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>Welcome Back 👋</Text>
        <Text style={styles.subtitle}>Login to continue with VastraMitra</Text>
      </View>

      <View style={styles.formSection}>
        <TextInput
          placeholder="Email"
          placeholderTextColor="#757575"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />
        <TextInput
          placeholder="Password"
          placeholderTextColor="#757575"
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

        <LinearGradient
          colors={['#3F51B5', '#03DAC6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.loginButton}>
          <TouchableOpacity onPress={handleLogin} activeOpacity={0.85}>
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>
        </LinearGradient>

        <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
          <Text style={styles.registerText}>
            Don’t have an account? <Text style={styles.registerLink}>Sign up</Text>
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
    marginBottom: 40,
  },
  logo: {
    width: 110,
    height: 110,
    borderRadius: 20,
    marginBottom: 14,
    elevation: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1A237E',
  },
  subtitle: {
    fontSize: 15,
    color: '#424242',
    textAlign: 'center',
    marginTop: 4,
  },
  formSection: {
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
    marginBottom: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  togglePassword: {
    alignSelf: 'flex-end',
    color: '#3F51B5',
    marginBottom: 20,
    fontSize: 14,
    fontWeight: '500',
  },
  loginButton: {
    borderRadius: 12,
    marginBottom: 18,
  },
  loginButtonText: {
    textAlign: 'center',
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    paddingVertical: 12,
    letterSpacing: 0.3,
  },
  registerText: {
    textAlign: 'center',
    color: '#424242',
    fontSize: 14,
  },
  registerLink: {
    color: '#03DAC6',
    fontWeight: '700',
  },
});

export default LoginScreen;
