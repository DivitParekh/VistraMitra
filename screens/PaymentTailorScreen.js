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
import { LinearGradient } from "expo-linear-gradient";
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

              const paymentRef = doc(db, "payments", payment.id);
              await updateDoc(paymentRef, {
                status: "verified",
                verifiedAt: serverTimestamp(),
              });

              await updateDoc(appointmentRef, {
                paymentStatus: "Full Paid",
                balanceDue: 0,
                updatedAt: serverTimestamp(),
              });

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
    <LinearGradient colors={["#FFFFFF", "#EAF4FF"]} style={styles.card}>
      <View style={styles.row}>
        <Ionicons name="cash-outline" size={22} color="#3F51B5" />
        <Text style={styles.title}>Payment #{item.id}</Text>
      </View>

      <View style={styles.detailBox}>
        <Text style={styles.detail}>
          <Text style={styles.bold}>Order ID:</Text> {item.orderId}
        </Text>
        <Text style={styles.detail}>
          <Text style={styles.bold}>Customer:</Text> {item.userId}
        </Text>
        <Text style={styles.detail}>
          <Text style={styles.bold}>Amount:</Text> ₹{item.amount}
        </Text>
        <Text style={styles.detail}>
          <Text style={styles.bold}>Type:</Text> {item.type}
        </Text>
        <Text style={styles.detail}>
          <Text style={styles.bold}>Status:</Text>{" "}
          <Text
            style={[
              styles.status,
              item.status === "submitted"
                ? styles.pending
                : item.status === "verified"
                ? styles.verified
                : {},
            ]}
          >
            {item.status}
          </Text>
        </Text>
      </View>

      <TouchableOpacity
        style={styles.verifyBtn}
        onPress={() => handleFinalPayment(item)}
      >
        <Text style={styles.verifyText}>✅ Mark as Verified (Full Paid)</Text>
      </TouchableOpacity>
    </LinearGradient>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#3F51B5", "#03DAC6"]} style={styles.header}>
        <Text style={styles.headerTitle}>Payment Verification</Text>
        <Ionicons name="wallet-outline" size={24} color="#fff" />
      </LinearGradient>

      {loading ? (
        <ActivityIndicator size="large" color="#3F51B5" style={{ marginTop: 30 }} />
      ) : payments.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="wallet-outline" size={48} color="#ccc" />
          <Text style={styles.empty}>No pending payments found.</Text>
        </View>
      ) : (
        <FlatList
          data={payments}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

export default PaymentTailorScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fbfd" },

  header: {
    paddingVertical: 20,
    paddingHorizontal: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 6,
    shadowColor: "#3F51B5",
  },
  headerTitle: { fontSize: 20, fontWeight: "800", color: "#fff" },

  card: {
    borderRadius: 14,
    padding: 16,
    margin: 10,
    elevation: 4,
    shadowColor: "#3F51B5",
  },
  row: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  title: { fontSize: 16, fontWeight: "700", color: "#3F51B5", marginLeft: 8 },

  detailBox: { marginBottom: 10 },
  detail: { fontSize: 14, color: "#333", marginVertical: 2 },
  bold: { fontWeight: "600", color: "#2c3e50" },

  status: { fontWeight: "700", textTransform: "capitalize" },
  pending: { color: "#f39c12" },
  verified: { color: "#27ae60" },

  verifyBtn: {
    marginTop: 10,
    backgroundColor: "#27ae60",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  verifyText: { color: "#fff", fontWeight: "700", fontSize: 15 },

  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  empty: { color: "#777", fontSize: 16, marginTop: 10 },
});
