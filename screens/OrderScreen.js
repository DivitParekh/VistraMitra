import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import {
  collection,
  query,
  onSnapshot,
  where,
  getDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { generateInvoice } from "../utils/invoiceGenerator";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

const OrderScreen = () => {
  const [orders, setOrders] = useState([]);
  const [tasks, setTasks] = useState({});
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    let taskUnsubscribers = [];
    let unsubscribeOrders = null;

    const fetchOrders = async () => {
      try {
        const uid = await AsyncStorage.getItem("uid");
        if (!uid) {
          console.warn("⚠️ No user logged in, skipping order fetch");
          setLoading(false);
          return;
        }

        const userOrdersRef = collection(db, "users", uid, "orders");
        unsubscribeOrders = onSnapshot(userOrdersRef, (snapshot) => {
          const orderData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          setOrders(orderData);
          setLoading(false);
          setupTaskListeners(orderData, uid);
        });
      } catch (err) {
        console.error("Error fetching orders:", err);
        setLoading(false);
      }
    };

    const setupTaskListeners = (orderData, uid) => {
      taskUnsubscribers.forEach((fn) => fn && fn());
      taskUnsubscribers = [];

      orderData.forEach((order) => {
        const tq = query(
          collection(db, "taskManager"),
          where("orderId", "==", order.id),
          where("userId", "==", uid)
        );

        const taskUnsub = onSnapshot(tq, (taskSnap) => {
          const taskData = taskSnap.docs.map((d) => ({
            id: d.id,
            ...d.data(),
          }));
          setTasks((prev) => ({ ...prev, [order.id]: taskData }));
        });
        taskUnsubscribers.push(taskUnsub);
      });
    };

    fetchOrders();

    return () => {
      if (unsubscribeOrders) unsubscribeOrders();
      taskUnsubscribers.forEach((fn) => fn && fn());
    };
  }, []);

  const handlePayRemaining = async (item) => {
    try {
      const uid = await AsyncStorage.getItem("uid");
      let totalCost = item.totalCost;
      let advancePaid = item.advancePaid;

      if (!totalCost || !advancePaid) {
        const refs = [
          doc(db, "users", uid, "orders", item.id),
          doc(db, "orders", item.id),
          doc(db, "tailorAppointments", item.appointmentId || item.id),
        ];

        for (const ref of refs) {
          const snap = await getDoc(ref);
          if (snap.exists()) {
            const data = snap.data();
            totalCost = data.totalCost || totalCost;
            advancePaid = data.advancePaid || advancePaid;
          }
        }
      }

      if (!totalCost || !advancePaid) {
        Alert.alert(
          "Missing Payment Info",
          "Unable to find payment details for this order. Please contact your tailor."
        );
        return;
      }

      navigation.navigate("FinalPaymentScreen", {
        appointmentId: item.appointmentId || item.id,
        userId: item.userId || uid,
        totalCost: Number(totalCost),
        advancePaid: Number(advancePaid),
      });
    } catch (err) {
      console.error("Error navigating to payment:", err);
      Alert.alert("Error", "Unable to open payment screen.");
    }
  };

  const handleDownloadInvoice = async (item) => {
    try {
      const invoiceData = {
        orderId: item.id,
        customerName: item.customerName || "Customer",
        fabric: item.fabric || "Own Fabric",
        styleCategory: item.style || "Custom Stitch",
        totalCost: item.totalCost || 0,
        advancePaid: item.advancePaid || 0,
        balanceDue: 0,
        date: new Date().toISOString(),
        address: item.address || "N/A",
      };

      await generateInvoice(invoiceData);
      Alert.alert("📄 Invoice Generated", "Invoice opened for sharing.");
    } catch (error) {
      console.error("❌ Error generating invoice:", error);
      Alert.alert("Error", "Unable to generate invoice.");
    }
  };

  const renderTask = (task) => (
    <View key={task.id} style={styles.taskCard}>
      <Ionicons name="checkmark-circle-outline" size={18} color="#3F51B5" />
      <Text style={styles.taskText}>
        {task.stage || task.title} —{" "}
        <Text style={styles.taskStatus}>{task.status}</Text>
      </Text>
    </View>
  );

  const renderOrder = ({ item }) => (
    <LinearGradient colors={["#FFFFFF", "#EAF4FF"]} style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <Ionicons name="receipt-outline" size={22} color="#3F51B5" />
        <Text style={styles.title}>Order #{item.id}</Text>
      </View>

      <Text style={styles.subtext}>Style: {item.style || "N/A"}</Text>
      <Text style={styles.subtext}>Fabric: {item.fabric || "Own Cloth"}</Text>
      <Text style={styles.subtext}>
        Status:{" "}
        <Text
          style={[
            styles.statusBadge,
            item.status === "Confirmed"
              ? styles.confirmed
              : item.status === "In Progress"
              ? styles.inProgress
              : item.status === "Completed"
              ? styles.completed
              : styles.pending,
          ]}
        >
          {item.status}
        </Text>
      </Text>

      {item.status === "Ready for Delivery" &&
        item.paymentStatus !== "Full Paid" && (
          <TouchableOpacity
            style={styles.payBtn}
            onPress={() => handlePayRemaining(item)}
          >
            <Text style={styles.payText}>💳 Pay Remaining 70%</Text>
          </TouchableOpacity>
        )}

      {item.paymentStatus === "Full Paid" && (
        <TouchableOpacity
          style={styles.invoiceBtn}
          onPress={() => handleDownloadInvoice(item)}
        >
          <Text style={styles.invoiceText}>📥 Download Invoice</Text>
        </TouchableOpacity>
      )}

      {tasks[item.id]?.length > 0 ? (
        <>
          <Text style={styles.sectionTitle}>Tasks</Text>
          {tasks[item.id].map((t) => renderTask(t))}
        </>
      ) : (
        <Text style={styles.noTask}>No tasks assigned yet.</Text>
      )}
    </LinearGradient>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#3F51B5", "#03DAC6"]} style={styles.header}>
        <Text style={styles.headerTitle}>My Orders</Text>
        <Ionicons name="bag-handle-outline" size={24} color="#fff" />
      </LinearGradient>

      {loading ? (
        <ActivityIndicator size="large" color="#3F51B5" style={{ marginTop: 30 }} />
      ) : orders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="cube-outline" size={48} color="#ccc" />
          <Text style={styles.emptyText}>No orders yet</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrder}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

export default OrderScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fbfd" },

  header: {
    paddingVertical: 22,
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

  orderCard: {
    borderRadius: 14,
    padding: 16,
    margin: 10,
    elevation: 4,
    shadowColor: "#3F51B5",
  },
  orderHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#3F51B5",
    marginLeft: 6,
  },
  subtext: { fontSize: 14, color: "#333", marginVertical: 2 },

  statusBadge: {
    fontWeight: "700",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    overflow: "hidden",
  },
  pending: { backgroundColor: "#fce4b3", color: "#e67e22" },
  confirmed: { backgroundColor: "#d4edda", color: "#27ae60" },
  inProgress: { backgroundColor: "#cce5ff", color: "#007bff" },
  completed: { backgroundColor: "#d4edda", color: "#2c3e50" },

  payBtn: {
    backgroundColor: "#27ae60",
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 10,
    alignItems: "center",
  },
  payText: { color: "#fff", fontWeight: "700", fontSize: 15 },

  invoiceBtn: {
    backgroundColor: "#3F51B5",
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 10,
    alignItems: "center",
  },
  invoiceText: { color: "#fff", fontWeight: "700", fontSize: 15 },

  sectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#2c3e50",
    marginTop: 12,
  },
  taskCard: {
    backgroundColor: "#f2f6ff",
    borderRadius: 8,
    padding: 8,
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
  },
  taskText: {
    fontSize: 14,
    marginLeft: 6,
    color: "#3F51B5",
    fontWeight: "500",
  },
  taskStatus: { fontWeight: "700", color: "#03A9F4" },
  noTask: { fontSize: 13, color: "#777", marginTop: 4 },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: { color: "#777", fontSize: 16, marginTop: 10 },
});
