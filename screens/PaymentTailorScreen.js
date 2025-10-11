import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  collection,
  onSnapshot,
  updateDoc,
  doc,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

const PaymentTailorScreen = ({ navigation }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const q = query(collection(db, "tailorAppointments"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setAppointments(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 🧮 Calculate totals using useMemo for performance
  const { totalCollected, totalPending } = useMemo(() => {
    let collected = 0;
    let pending = 0;

    appointments.forEach((app) => {
      if (app.paymentStatus === "Advance Paid" || app.paymentStatus === "Full Paid") {
        collected += app.advancePaid || 0;
      }
      if (app.paymentStatus !== "Full Paid") {
        pending += app.balanceDue || 0;
      }
    });

    return { totalCollected: collected, totalPending: pending };
  }, [appointments]);

  const handleFinalPayment = async (id) => {
    try {
      const appointmentRef = doc(db, "tailorAppointments", id);
      await updateDoc(appointmentRef, {
        paymentStatus: "Full Paid",
        balanceDue: 0,
      });
      Alert.alert("✅ Payment Completed", "Marked as fully paid.");
    } catch (err) {
      console.error("Error updating payment:", err);
    }
  };

  const filteredData =
    filter === "all"
      ? appointments
      : appointments.filter((a) =>
          filter === "paid"
            ? a.paymentStatus === "Advance Paid" || a.paymentStatus === "Full Paid"
            : a.paymentStatus === "Pending"
        );

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>💰 Tailor Payment Dashboard</Text>

      {/* 🧾 Summary Bar */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryBox}>
          <Ionicons name="cash-outline" size={22} color="#27ae60" />
          <Text style={styles.summaryLabel}>Collected</Text>
          <Text style={styles.summaryValue}>₹{totalCollected}</Text>
        </View>
        <View style={styles.summaryBox}>
          <Ionicons name="time-outline" size={22} color="#e67e22" />
          <Text style={styles.summaryLabel}>Pending</Text>
          <Text style={styles.summaryValue}>₹{totalPending}</Text>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {["all", "paid", "pending"].map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterBtn, filter === f && styles.filterActive]}
            onPress={() => setFilter(f)}
          >
            <Text
              style={[
                styles.filterText,
                filter === f && styles.filterActiveText,
              ]}
            >
              {f === "all"
                ? "All"
                : f === "paid"
                ? "Paid"
                : "Pending"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {filteredData.length === 0 ? (
        <Text style={styles.noData}>No records found for this filter.</Text>
      ) : (
        <FlatList
          data={filteredData}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.rowBetween}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{item.fullName}</Text>
                  <Text style={styles.subText}>📞 {item.phone}</Text>
                  <Text style={styles.subText}>
                    Advance: ₹{item.advancePaid || 0}
                  </Text>
                  <Text style={styles.subText}>
                    Balance: ₹{item.balanceDue || 0}
                  </Text>
                </View>

                <View
                  style={[
                    styles.statusBadge,
                    item.paymentStatus === "Full Paid"
                      ? styles.fullPaid
                      : item.paymentStatus === "Advance Paid"
                      ? styles.advancePaid
                      : styles.pending,
                  ]}
                >
                  <Ionicons
                    name={
                      item.paymentStatus === "Full Paid"
                        ? "checkmark-done"
                        : item.paymentStatus === "Advance Paid"
                        ? "cash-outline"
                        : "alert-circle-outline"
                    }
                    size={14}
                    color="#fff"
                  />
                  <Text style={styles.statusText}>{item.paymentStatus}</Text>
                </View>
              </View>

              {item.paymentStatus === "Advance Paid" && (
                <TouchableOpacity
                  style={styles.finalBtn}
                  onPress={() =>
                    Alert.alert(
                      "Mark as Fully Paid?",
                      "Confirm that you received the final payment.",
                      [
                        { text: "Cancel", style: "cancel" },
                        { text: "Confirm", onPress: () => handleFinalPayment(item.id) },
                      ]
                    )
                  }
                >
                  <Text style={styles.finalText}>Mark Final Payment Received</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa", padding: 16 },
  header: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2c3e50",
    marginBottom: 10,
    textAlign: "center",
  },

  // 🧾 Summary bar styles
  summaryContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 10,
  },
  summaryBox: {
    backgroundColor: "#fff",
    borderRadius: 12,
    elevation: 2,
    width: "45%",
    alignItems: "center",
    paddingVertical: 10,
  },
  summaryLabel: { fontSize: 13, color: "#555", marginTop: 4 },
  summaryValue: { fontSize: 18, fontWeight: "700", color: "#2c3e50" },

  filterRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 10,
  },
  filterBtn: {
    borderWidth: 1,
    borderColor: "#007bff",
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  filterText: { color: "#007bff", fontWeight: "600" },
  filterActive: { backgroundColor: "#007bff" },
  filterActiveText: { color: "#fff" },
  noData: { textAlign: "center", marginTop: 40, color: "#777", fontSize: 15 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    marginBottom: 12,
  },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  name: { fontSize: 16, fontWeight: "700", color: "#2c3e50" },
  subText: { fontSize: 13, color: "#555", marginTop: 3 },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: { color: "#fff", fontSize: 12, fontWeight: "600", marginLeft: 4 },
  advancePaid: { backgroundColor: "#27ae60" },
  fullPaid: { backgroundColor: "#2ecc71" },
  pending: { backgroundColor: "#f39c12" },
  finalBtn: {
    marginTop: 10,
    backgroundColor: "#007bff",
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  finalText: { color: "#fff", fontWeight: "600" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});

export default PaymentTailorScreen;
