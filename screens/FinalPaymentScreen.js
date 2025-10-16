import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import QRCode from "react-native-qrcode-svg";
import { db } from "../firebase/firebaseConfig";
import { doc, setDoc, serverTimestamp, collection } from "firebase/firestore";
import { sendNotification } from "../utils/notificationService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { LinearGradient } from "expo-linear-gradient";

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

  // ✅ Get logged-in Firebase UID
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) setAuthUid(user.uid);
      else {
        const storedUid = await AsyncStorage.getItem("uid");
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
        userId: authUid,
        orderId: appointmentId,
        type: "final",
        amount: Number(remainingAmount),
        status: "submitted",
        txnId,
        createdAt: serverTimestamp(),
      });

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
      Alert.alert(
        "Final Payment Error",
        `FirebaseError: ${error.message || "Unable to create payment record"}`
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <LinearGradient colors={["#3F51B5", "#03DAC6"]} style={styles.header}>
        <Text style={styles.headerTitle}>Final Payment</Text>
        <Ionicons name="cash-outline" size={26} color="#fff" />
      </LinearGradient>

      {/* Summary Card */}
      <View style={styles.summaryCard}>
        <Ionicons name="card-outline" size={30} color="#3F51B5" />
        <Text style={styles.summaryTitle}>Payment Summary</Text>
        <View style={styles.divider} />
        <Text style={styles.summaryText}>Total Amount: ₹{totalCost}</Text>
        <Text style={styles.summaryText}>Advance Paid: ₹{advancePaid}</Text>
        <Text style={[styles.summaryText, { fontWeight: "700", color: "#3F51B5" }]}>
          Remaining: ₹{remainingAmount}
        </Text>
      </View>

      {/* Payment Section */}
      {!showQR ? (
        <TouchableOpacity
          style={[styles.payBtn, isProcessing && { opacity: 0.7 }]}
          onPress={() => setShowQR(true)}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.payText}>Proceed to Pay ₹{remainingAmount}</Text>
          )}
        </TouchableOpacity>
      ) : (
        <View style={styles.qrContainer}>
          <Text style={styles.qrTitle}>Scan & Pay</Text>
          <View style={styles.qrBox}>
            <QRCode value={upiUrl} size={200} />
          </View>
          <Text style={styles.qrNote}>UPI ID: {UPI_ID}</Text>

          <TouchableOpacity
            style={styles.confirmBtn}
            onPress={() =>
              Alert.alert(
                "Confirm Payment",
                "Tap confirm only after completing the payment.",
                [
                  { text: "Cancel" },
                  { text: "Confirm", onPress: () => submitFinalPayment() },
                ]
              )
            }
          >
            <LinearGradient colors={["#03DAC6", "#3F51B5"]} style={styles.confirmGradient}>
              <Text style={styles.confirmText}>✅ I’ve Paid — Submit</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.backBtn} onPress={() => setShowQR(false)}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

export default FinalPaymentScreen;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#f9fbfd",
    alignItems: "center",
    paddingBottom: 40,
  },

  header: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 22,
    paddingHorizontal: 26,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 6,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#fff",
  },

  summaryCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    elevation: 5,
    shadowColor: "#3F51B5",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    padding: 20,
    width: "90%",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 30,
  },
  summaryTitle: { fontSize: 18, fontWeight: "700", color: "#2c3e50", marginTop: 10 },
  summaryText: { fontSize: 16, color: "#444", marginTop: 8 },
  divider: {
    height: 1,
    width: "80%",
    backgroundColor: "#E0E0E0",
    marginVertical: 10,
  },

  payBtn: {
    backgroundColor: "#3F51B5",
    borderRadius: 12,
    width: "90%",
    alignItems: "center",
    paddingVertical: 14,
    elevation: 4,
    shadowColor: "#3F51B5",
  },
  payText: { color: "#fff", fontWeight: "700", fontSize: 16 },

  qrContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    elevation: 5,
    padding: 20,
    alignItems: "center",
    width: "90%",
  },
  qrTitle: { fontSize: 18, fontWeight: "700", color: "#3F51B5", marginBottom: 10 },
  qrBox: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 14,
    elevation: 4,
    shadowColor: "#000",
  },
  qrNote: { marginTop: 10, fontSize: 13, color: "#666" },

  confirmBtn: {
    marginTop: 20,
    width: "100%",
    borderRadius: 10,
    overflow: "hidden",
  },
  confirmGradient: {
    paddingVertical: 14,
    alignItems: "center",
    borderRadius: 10,
  },
  confirmText: { color: "#fff", fontWeight: "700", fontSize: 15 },

  backBtn: { marginTop: 15 },
  backText: { color: "#3F51B5", fontWeight: "700", fontSize: 14 },
});
