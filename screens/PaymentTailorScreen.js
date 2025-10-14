// screens/PaymentTailorScreen.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  setDoc,
  getDoc,
  serverTimestamp,
  query,
  where,
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { Ionicons } from "@expo/vector-icons";
import { sendNotification } from "../utils/notificationService";

const PaymentTailorScreen = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "payments"), where("status", "==", "submitted"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const paymentData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPayments(paymentData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // ✅ Handle final payment verification by tailor
  const handleFinalPayment = async (payment) => {
    try {
      Alert.alert(
        "Confirm Payment Verification",
        `Mark payment for Order ID: ${payment.orderId} as verified?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Confirm",
            onPress: async () => {
              setLoading(true);

              const { userId, orderId } = payment;
              const appointmentRef = doc(db, "tailorAppointments", orderId);
              const snap = await getDoc(appointmentRef);
              if (!snap.exists()) {
                Alert.alert("Error", "Appointment not found.");
                setLoading(false);
                return;
              }

              const ap = snap.data();
              const { totalCost = 0, advancePaid = 0, fullName } = ap;

              // ✅ 1) Update payment record to verified
              const paymentRef = doc(db, "payments", payment.id);
              await updateDoc(paymentRef, {
                status: "verified",
                verifiedAt: serverTimestamp(),
              });

              // ✅ 2) Update appointment
              await updateDoc(appointmentRef, {
                paymentStatus: "Full Paid",
                balanceDue: 0,
                updatedAt: serverTimestamp(),
              });

              // ✅ 3) Update global order
              const orderRef = doc(db, "orders", orderId);
              await setDoc(
                orderRef,
                {
                  paymentStatus: "Full Paid",
                  balanceDue: 0,
                  totalCost,
                  advancePaid,
                  updatedAt: serverTimestamp(),
                },
                { merge: true }
              );

              // ✅ 4) Update user's order
              const userOrderRef = doc(db, "users", userId, "orders", orderId);
              await setDoc(
                userOrderRef,
                {
                  paymentStatus: "Full Paid",
                  balanceDue: 0,
                  totalCost,
                  advancePaid,
                  updatedAt: serverTimestamp(),
                },
                { merge: true }
              );

              // ✅ 5) Notify customer
              await sendNotification(
                userId,
                "Final Payment Verified ✅",
                `Hi ${fullName || "Customer"}, your final payment has been verified. You can now download your invoice.`
              );

              Alert.alert("✅ Verified", "Payment marked as Full Paid successfully.");
              setLoading(false);
            },
          },
        ]
      );
    } catch (err) {
      console.error("Error verifying payment:", err);
      Alert.alert("Error", "Failed to verify final payment.");
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.row}>
        <Ionicons name="cash-outline" size={20} color="#007bff" />
        <Text style={styles.title}>Payment ID: {item.id}</Text>
      </View>

      <Text style={styles.detail}>Order ID: {item.orderId}</Text>
      <Text style={styles.detail}>Customer ID: {item.userId}</Text>
      <Text style={styles.detail}>Amount: ₹{item.amount}</Text>
      <Text style={styles.detail}>Type: {item.type}</Text>
      <Text style={styles.detail}>Status: {item.status}</Text>

      <TouchableOpacity
        style={styles.verifyBtn}
        onPress={() => handleFinalPayment(item)}
      >
        <Text style={styles.verifyText}>✅ Mark as Verified (Full Paid)</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Pending Payments</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#007bff" style={{ marginTop: 30 }} />
      ) : payments.length === 0 ? (
        <Text style={styles.empty}>No pending payments found.</Text>
      ) : (
        <FlatList
          data={payments}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 80 }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9f9f9", padding: 16 },
  heading: {
    fontSize: 22,
    fontWeight: "700",
    color: "#2c3e50",
    textAlign: "center",
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 14,
    elevation: 3,
    borderLeftWidth: 5,
    borderLeftColor: "#007bff",
  },
  row: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  title: { fontSize: 16, fontWeight: "600", marginLeft: 6 },
  detail: { fontSize: 14, color: "#555", marginTop: 2 },
  verifyBtn: {
    marginTop: 12,
    backgroundColor: "#27ae60",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  verifyText: { color: "#fff", fontWeight: "700" },
  empty: { textAlign: "center", fontSize: 16, color: "#888", marginTop: 30 },
});

export default PaymentTailorScreen;
