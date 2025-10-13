import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import QRCode from "react-native-qrcode-svg";
import { db } from "../firebase/firebaseConfig";
import { doc, setDoc, collection, serverTimestamp } from "firebase/firestore";
import { sendNotification } from "../utils/notificationService";

const UPI_ID = "jethvaakshat3@oksbi";
const NAME = "Akshat Jethva";

const PaymentScreen = ({ route, navigation }) => {
  const { totalCost, userId, appointmentDetails } = route.params;
  const advanceAmount = Math.round(totalCost * 0.3);

  const [isProcessing, setIsProcessing] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const upiUrl = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(
    NAME
  )}&am=${advanceAmount}&cu=INR&tn=${encodeURIComponent(
    "Advance Payment - VastraMitra"
  )}`;

  const handleUPIPayment = async () => {
    try {
      setIsProcessing(true);
      const supported = await Linking.canOpenURL(upiUrl);
      if (!supported) {
        Alert.alert("UPI App Not Found", "Please use the QR code instead.");
        setIsProcessing(false);
        return;
      }
      await Linking.openURL(upiUrl);
      setIsProcessing(false);
      Alert.alert(
        "Complete Payment",
        "After payment, tap 'I’ve Paid' to confirm."
      );
    } catch (e) {
      console.error("Payment Error:", e);
      Alert.alert("Error", "Unable to open UPI app.");
      setIsProcessing(false);
    }
  };

  const confirmAppointment = async (txnId = "MANUAL_CONFIRM") => {
    try {
      // ✅ Ensure the parent document exists
      await setDoc(doc(db, "appointments", userId), { userId }, { merge: true });

      // ✅ Create new appointment under userAppointments subcollection
      const userAppointmentsRef = collection(
        db,
        "appointments",
        userId,
        "userAppointments"
      );
      const userAppDoc = doc(userAppointmentsRef);

      const newApp = {
        ...appointmentDetails,
        userId,
        totalCost: Number(totalCost),
        advancePaid: Number(advanceAmount),
        balanceDue: Number(totalCost - advanceAmount),
        paymentStatus: "Advance Paid",
        status: "Pending", // Tailor will confirm
        paymentTxnId: txnId,
        createdAt: serverTimestamp(),
      };

      // ✅ Save under user's appointment path
      await setDoc(userAppDoc, newApp);

      // ✅ Save same appointment globally for tailor
      await setDoc(doc(collection(db, "tailorAppointments"), userAppDoc.id), {
        ...newApp,
        appointmentId: userAppDoc.id,
      });

      // ✅ Notify tailor
      await sendNotification(
        "YvjGOga1CDWJhJfoxAvL7c7Z5sG2", // tailor UID
        "Advance Payment Received 💰",
        `${newApp.fullName} paid ₹${advanceAmount} advance. Awaiting confirmation.`
      );

      Alert.alert("✅ Payment Successful", "Appointment booked successfully!");
      navigation.navigate("CustomerScreen");
    } catch (error) {
      console.error("Booking Error:", error);
      Alert.alert("Error", "Failed to save appointment.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Advance Payment</Text>

      <View style={styles.summary}>
        <Ionicons name="pricetag-outline" size={24} color="#007bff" />
        <Text style={styles.text}>Total Cost: ₹{totalCost}</Text>
        <Text style={styles.text}>Advance (30%): ₹{advanceAmount}</Text>
        <Text style={styles.note}>
          Remaining ₹{totalCost - advanceAmount} will be paid after completion.
        </Text>
      </View>

      {!showQR ? (
        <>
          <TouchableOpacity
            style={[styles.payBtn, isProcessing && { opacity: 0.7 }]}
            onPress={handleUPIPayment}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.payText}>Pay ₹{advanceAmount} via UPI</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.qrBtn}
            onPress={() => setShowQR(true)}
          >
            <Text style={styles.qrText}>Show QR Code Instead</Text>
          </TouchableOpacity>
        </>
      ) : (
        <View style={styles.qrContainer}>
          <Text style={styles.qrTitle}>Scan this QR to pay ₹{advanceAmount}</Text>
          <View style={{ backgroundColor: "#fff", padding: 16, borderRadius: 10 }}>
            <QRCode value={upiUrl} size={200} />
          </View>
          <Text style={styles.qrNote}>UPI ID: {UPI_ID}</Text>

          <TouchableOpacity
            style={styles.manualBtn}
            onPress={() =>
              Alert.alert("Confirm Payment", "Tap confirm after completing payment.", [
                { text: "Cancel" },
                { text: "Confirm", onPress: () => confirmAppointment() },
              ])
            }
          >
            <Text style={styles.manualText}>✅ I’ve Paid — Confirm Appointment</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.qrBackBtn}
            onPress={() => setShowQR(false)}
          >
            <Text style={styles.qrBackText}>← Back</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity
        style={styles.cancelBtn}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.cancelText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    padding: 20,
  },
  header: { fontSize: 22, fontWeight: "700", color: "#2c3e50", marginBottom: 20 },
  summary: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    elevation: 2,
    width: "100%",
    alignItems: "center",
    marginBottom: 30,
  },
  text: { fontSize: 16, fontWeight: "600", color: "#333", marginTop: 8 },
  note: { fontSize: 13, color: "#666", marginTop: 10, textAlign: "center" },
  payBtn: {
    backgroundColor: "#007bff",
    paddingVertical: 14,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
  },
  payText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  qrBtn: {
    marginTop: 15,
    borderWidth: 1,
    borderColor: "#007bff",
    paddingVertical: 10,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
  },
  qrText: { color: "#007bff", fontWeight: "600" },
  qrContainer: {
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    elevation: 3,
    marginBottom: 20,
  },
  qrTitle: { fontSize: 16, fontWeight: "600", marginBottom: 10, color: "#2c3e50" },
  qrNote: { marginTop: 10, fontSize: 13, color: "#666" },
  manualBtn: {
    marginTop: 20,
    backgroundColor: "#27ae60",
    padding: 12,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
  },
  manualText: { color: "#fff", fontWeight: "700" },
  qrBackBtn: { marginTop: 15 },
  qrBackText: { color: "#007bff", fontWeight: "600" },
  cancelBtn: { marginTop: 20 },
  cancelText: { color: "#555" },
});

export default PaymentScreen;
