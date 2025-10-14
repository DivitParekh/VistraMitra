// screens/FinalPaymentScreen.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import QRCode from "react-native-qrcode-svg";
import { db } from "../firebase/firebaseConfig";
import {
  doc,
  setDoc,
  serverTimestamp,
  collection,
} from "firebase/firestore";
import { sendNotification } from "../utils/notificationService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const FinalPaymentScreen = ({ route, navigation }) => {
  const { appointmentId, userId: routeUserId, totalCost, advancePaid } = route.params;
  const [isProcessing, setIsProcessing] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [authUid, setAuthUid] = useState(null);

  const remainingAmount = Math.max(0, Number(totalCost) - Number(advancePaid));
  const UPI_ID = "jethvaakshat3@oksbi";
  const NAME = "Akshat Jethva";

  const upiUrl = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(
    NAME
  )}&am=${remainingAmount}&cu=INR&tn=${encodeURIComponent(
    "Final Payment - VastraMitra"
  )}`;

  // ✅ Get logged-in Firebase UID (real auth, not just AsyncStorage)
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        console.log("✅ Firebase Auth UID:", user.uid);
        setAuthUid(user.uid);
      } else {
        // fallback to AsyncStorage UID (if app saved it)
        const storedUid = await AsyncStorage.getItem("uid");
        console.log("⚠️ Using AsyncStorage UID:", storedUid);
        setAuthUid(storedUid || null);
      }
    });
    return () => unsubscribe();
  }, []);

  const submitFinalPayment = async (txnId = "FINAL_MANUAL_CONFIRM") => {
    if (!authUid) {
      Alert.alert("Auth Error", "No user logged in. Please re-login and try again.");
      return;
    }

    try {
      setIsProcessing(true);

      const payRef = doc(collection(db, "payments"));
      await setDoc(payRef, {
        paymentId: payRef.id,
        userId: authUid, // ✅ must match Firebase Auth UID
        orderId: appointmentId,
        type: "final",
        amount: Number(remainingAmount),
        status: "submitted", // tailor will verify it
        txnId,
        createdAt: serverTimestamp(),
      });

      console.log("✅ Payment record created:", payRef.id);

      // notify tailor to verify
      await sendNotification(
        "YvjGOga1CDWJhJfoxAvL7c7Z5sG2",
        "Final Payment Submitted 💳",
        `Customer submitted final payment for order ${appointmentId}. Please verify and mark as Full Paid.`
      );

      Alert.alert(
        "Payment Submitted ✅",
        "Your final payment request has been submitted. The tailor will verify and send your invoice."
      );
      navigation.navigate("CustomerScreen");
    } catch (error) {
      console.error("❌ Final Payment Error:", error);
      Alert.alert(
        "Final Payment Error",
        `FirebaseError: ${error.message || "Unable to create payment record"}`
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Final Payment</Text>

      <View style={styles.summary}>
        <Ionicons name="cash-outline" size={26} color="#007bff" />
        <Text style={styles.text}>Total: ₹{totalCost}</Text>
        <Text style={styles.text}>Advance Paid: ₹{advancePaid}</Text>
        <Text style={styles.text}>Remaining: ₹{remainingAmount} (70%)</Text>
      </View>

      {!showQR ? (
        <TouchableOpacity
          style={[styles.payBtn, isProcessing && { opacity: 0.7 }]}
          onPress={() => setShowQR(true)}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.payText}>Pay ₹{remainingAmount} via UPI</Text>
          )}
        </TouchableOpacity>
      ) : (
        <View style={styles.qrContainer}>
          <Text style={styles.qrTitle}>Scan this QR to pay ₹{remainingAmount}</Text>
          <View style={{ backgroundColor: "#fff", padding: 16, borderRadius: 10 }}>
            <QRCode value={upiUrl} size={200} />
          </View>
          <Text style={styles.qrNote}>UPI ID: {UPI_ID}</Text>

          <TouchableOpacity
            style={styles.confirmBtn}
            onPress={() =>
              Alert.alert(
                "Confirm Payment",
                "Tap confirm only after you’ve completed the payment in your UPI app.",
                [
                  { text: "Cancel" },
                  { text: "Confirm", onPress: () => submitFinalPayment() },
                ]
              )
            }
          >
            <Text style={styles.confirmText}>✅ I’ve Paid — Submit for Verification</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.qrBackBtn} onPress={() => setShowQR(false)}>
            <Text style={styles.qrBackText}>← Back</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f8f9fa", padding: 20 },
  header: { fontSize: 22, fontWeight: "700", color: "#2c3e50", marginBottom: 20 },
  summary: { backgroundColor: "#fff", padding: 20, borderRadius: 12, elevation: 2, width: "100%", alignItems: "center", marginBottom: 30 },
  text: { fontSize: 16, fontWeight: "600", color: "#333", marginTop: 8 },
  payBtn: { backgroundColor: "#007bff", paddingVertical: 14, borderRadius: 10, width: "100%", alignItems: "center" },
  payText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  qrContainer: { alignItems: "center", backgroundColor: "#fff", padding: 20, borderRadius: 12, elevation: 3 },
  qrTitle: { fontSize: 16, fontWeight: "600", marginBottom: 10, color: "#2c3e50" },
  qrNote: { marginTop: 10, fontSize: 13, color: "#666" },
  confirmBtn: { marginTop: 20, backgroundColor: "#27ae60", padding: 12, borderRadius: 10, width: "100%", alignItems: "center" },
  confirmText: { color: "#fff", fontWeight: "700" },
  qrBackBtn: { marginTop: 15 },
  qrBackText: { color: "#007bff", fontWeight: "600" },
});

export default FinalPaymentScreen;
