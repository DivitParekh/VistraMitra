import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Linking,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { db } from "../firebase/firebaseConfig";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import QRCode from "react-native-qrcode-svg";
import { sendNotification } from "../utils/notificationService";

const UPI_ID = "jethvaakshat3@oksbi"; // ✅ tailor's verified UPI
const NAME = "Akshat Jethva"; // ✅ tailor name

const FinalPaymentScreen = ({ route, navigation }) => {
  // 🧾 Either comes from route or deep link
  const [appointmentId, setAppointmentId] = useState(
    route?.params?.appointmentId || null
  );
  const [userId, setUserId] = useState(route?.params?.userId || null);
  const [totalCost, setTotalCost] = useState(route?.params?.totalCost || 0);
  const [advancePaid, setAdvancePaid] = useState(route?.params?.advancePaid || 0);
  const [balanceAmount, setBalanceAmount] = useState(0);
  const [showQR, setShowQR] = useState(false);

  // 🔹 Listen to deep links from notification
  useEffect(() => {
    const subscription = Linking.addEventListener("url", handleDeepLink);
    checkInitialUrl();
    return () => subscription.remove();
  }, []);

  // When app opens from background via link
  const checkInitialUrl = async () => {
    const initialUrl = await Linking.getInitialURL();
    if (initialUrl) handleDeepLink({ url: initialUrl });
  };

  // 🔹 Handle notification tap (deep link)
  const handleDeepLink = async ({ url }) => {
    try {
      if (url.includes("vastramitra://finalpayment")) {
        const params = new URLSearchParams(url.split("?")[1]);
        const appId = params.get("appointmentId");
        const uid = params.get("userId");

        if (appId && uid) {
          setAppointmentId(appId);
          setUserId(uid);

          const appRef = doc(db, "appointments", uid, "userAppointments", appId);
          const snap = await getDoc(appRef);
          if (snap.exists()) {
            const data = snap.data();
            setTotalCost(data.totalCost);
            setAdvancePaid(data.advancePaid);
            setBalanceAmount(data.totalCost - data.advancePaid);
          }
        }
      }
    } catch (err) {
      console.error("Deep link error:", err);
    }
  };

  useEffect(() => {
    if (totalCost && advancePaid) {
      setBalanceAmount(totalCost - advancePaid);
    }
  }, [totalCost, advancePaid]);

  const upiUrl = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(
    NAME
  )}&am=${balanceAmount}&cu=INR&tn=${encodeURIComponent("Final Payment - VastraMitra")}`;

  const handleUPIPayment = async () => {
    try {
      const supported = await Linking.canOpenURL(upiUrl);
      if (!supported) {
        Alert.alert("No UPI App Found", "Please scan the QR below to complete payment.");
        return;
      }

      await Linking.openURL(upiUrl);

      Alert.alert(
        "Confirm Payment",
        "After completing payment, tap Confirm below.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Confirm", onPress: () => confirmFinalPayment() },
        ]
      );
    } catch (error) {
      console.error("Payment error:", error);
      Alert.alert("Error", "Unable to open UPI app.");
    }
  };

  const confirmFinalPayment = async () => {
    try {
      if (!appointmentId || !userId) {
        Alert.alert("Error", "Missing appointment information.");
        return;
      }

      const appointmentRef = doc(db, "appointments", userId, "userAppointments", appointmentId);
      const tailorRef = doc(db, "tailorAppointments", appointmentId);

      await updateDoc(appointmentRef, {
        paymentStatus: "Full Paid",
        balanceDue: 0,
      });
      await updateDoc(tailorRef, {
        paymentStatus: "Full Paid",
        balanceDue: 0,
      });

      await sendNotification(
        "YvjGOga1CDWJhJfoxAvL7c7Z5sG2",
        "Final Payment Received 💰",
        `The customer has paid the remaining ₹${balanceAmount}. The order is now fully paid.`
      );

      Alert.alert("✅ Payment Successful", "Thank you! Your order is fully paid.");
      navigation.navigate("CustomerScreen");
    } catch (err) {
      console.error("Payment confirm error:", err);
      Alert.alert("Error", "Could not confirm payment.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Final Payment</Text>

      {balanceAmount > 0 ? (
        <>
          <Text style={styles.text}>Remaining Balance: ₹{balanceAmount}</Text>

          {!showQR ? (
            <>
              <TouchableOpacity style={styles.payBtn} onPress={handleUPIPayment}>
                <Text style={styles.payText}>Pay ₹{balanceAmount} via UPI</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.qrBtn} onPress={() => setShowQR(true)}>
                <Text style={styles.qrText}>Show QR Code</Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.qrBox}>
              <QRCode value={upiUrl} size={200} />
              <Text style={styles.note}>Scan this to pay ₹{balanceAmount}</Text>
              <TouchableOpacity onPress={() => setShowQR(false)}>
                <Text style={styles.qrText}>← Back</Text>
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </>
      ) : (
        <Text style={styles.text}>✅ No pending payment. Thank you!</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#f8f9fa" },
  header: { fontSize: 22, fontWeight: "700", marginBottom: 20, color: "#2c3e50" },
  text: { fontSize: 16, color: "#333", marginBottom: 10 },
  payBtn: {
    backgroundColor: "#007bff",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginVertical: 10,
    width: "80%",
  },
  payText: { color: "#fff", fontWeight: "700" },
  qrBtn: {
    borderWidth: 1,
    borderColor: "#007bff",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  qrText: { color: "#007bff", fontWeight: "600", marginTop: 10 },
  qrBox: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    elevation: 2,
  },
  note: { color: "#555", marginTop: 10 },
  cancelBtn: { marginTop: 20 },
  cancelText: { color: "#777" },
});

export default FinalPaymentScreen;
