// screens/PhoneAuthScreen.js
import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { FirebaseRecaptchaVerifierModal } from "expo-firebase-recaptcha";
import { app, auth, db } from "../firebase/firebaseConfig";
import {
  signInWithPhoneNumber,
  signInWithCredential,
  PhoneAuthProvider,
} from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

const PhoneAuthScreen = ({ navigation }) => {
  const recaptchaVerifier = useRef(null);
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [confirmResult, setConfirmResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // 🔹 Send OTP
  const sendOtp = async () => {
    if (!phone.startsWith("+")) {
      Alert.alert("Invalid format", "Phone must start with +91 etc.");
      return;
    }
    try {
      setLoading(true);
      const confirmation = await signInWithPhoneNumber(
        auth,
        phone,
        recaptchaVerifier.current
      );
      setConfirmResult(confirmation);
      Alert.alert("OTP Sent", `An OTP has been sent to ${phone}.`);
    } catch (error) {
      console.error("Send OTP Error:", error);
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Verify OTP
  const verifyOtp = async () => {
    if (!confirmResult || code.length < 4) {
      Alert.alert("Missing code", "Please enter a valid OTP.");
      return;
    }
    try {
      setLoading(true);
      const result = await confirmResult.confirm(code);
      const user = result.user;

      // 🧾 Create or update user profile in Firestore
      await setDoc(
        doc(db, "users", user.uid),
        {
          phoneNumber: user.phoneNumber,
          createdAt: serverTimestamp(),
        },
        { merge: true }
      );

      // 🧠 Save locally for navigation
      await AsyncStorage.setItem("uid", user.uid);
      await AsyncStorage.setItem("isLoggedIn", "true");

      Alert.alert("Welcome!", "Login successful.");
      navigation.replace("CustomerScreen");
    } catch (error) {
      console.error("Verify OTP Error:", error);
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <FirebaseRecaptchaVerifierModal
        ref={recaptchaVerifier}
        firebaseConfig={app.options}
        attemptInvisibleVerification={true}
      />

      <Text style={styles.title}>Phone Verification</Text>

      <TextInput
        style={styles.input}
        placeholder="+91xxxxxxxxxx"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={sendOtp}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Send OTP</Text>
        )}
      </TouchableOpacity>

      {confirmResult && (
        <>
          <TextInput
            style={[styles.input, { marginTop: 10 }]}
            placeholder="Enter OTP"
            keyboardType="number-pad"
            value={code}
            onChangeText={setCode}
          />

          <TouchableOpacity
            style={[styles.button, { backgroundColor: "#27ae60" }]}
            onPress={verifyOtp}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Verify OTP</Text>
            )}
          </TouchableOpacity>
        </>
      )}

      <TouchableOpacity
        style={{ marginTop: 20 }}
        onPress={() => navigation.navigate("Login")}
      >
        <Text style={{ color: "#007bff" }}>Use Email/Password instead</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#007bff",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 5,
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});

export default PhoneAuthScreen;
