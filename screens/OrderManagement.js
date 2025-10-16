import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import {
  collection,
  query,
  onSnapshot,
  doc,
  updateDoc,
  where,
  getDoc,
  setDoc,
} from "firebase/firestore";
import { db, auth } from "../firebase/firebaseConfig";
import { sendNotification } from "../utils/notificationService";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

const TAILOR_UID = "YvjGOga1CDWJhJfoxAvL7c7Z5sG2";

const OrderManagement = ({ navigation }) => {
  const [orders, setOrders] = useState([]);
  const [tasks, setTasks] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setLoading(false);
      return;
    }

    let q;
    if (user.uid === TAILOR_UID) {
      q = query(collection(db, "orders"));
    } else {
      q = collection(db, "users", user.uid, "orders");
    }

    const unsubscribeOrders = onSnapshot(
      q,
      (snapshot) => {
        const orderData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setOrders(orderData);
        setLoading(false);

        orderData.forEach((order) => {
          if (
            auth.currentUser?.uid === TAILOR_UID ||
            order.userId === auth.currentUser?.uid
          ) {
            const tq = query(
              collection(db, "taskManager"),
              where("orderId", "==", order.id)
            );

            onSnapshot(tq, (taskSnap) => {
              const taskData = taskSnap.docs.map((d) => ({
                id: d.id,
                ...d.data(),
              }));
              setTasks((prev) => ({ ...prev, [order.id]: taskData }));
            });
          }
        });
      },
      (err) => {
        console.error("❌ Firestore order listener failed:", err);
        setLoading(false);
      }
    );

    return () => unsubscribeOrders();
  }, [auth.currentUser]);

  const updateOrderStatus = async (orderId, newStatus, userId) => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser || currentUser.uid !== TAILOR_UID) return;

      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, { status: newStatus });

      if (userId) {
        const userOrderRef = doc(db, "users", userId, "orders", orderId);
        const snap = await getDoc(userOrderRef);

        if (snap.exists()) {
          await updateDoc(userOrderRef, { status: newStatus });
        } else {
          await setDoc(
            userOrderRef,
            { status: newStatus, orderId, userId },
            { merge: true }
          );
        }

        const fullSnap = await getDoc(orderRef);
        const orderData = fullSnap.exists() ? fullSnap.data() : null;

        const totalCost = Number(orderData?.totalCost) || 0;
        const advancePaid = Number(orderData?.advancePaid) || 0;
        const balanceDue = totalCost - advancePaid;
        const appointmentId = orderData?.appointmentId || null;

        if (appointmentId) {
          await setDoc(
            doc(db, "appointments", userId, "userAppointments", appointmentId),
            {
              status: newStatus,
              totalCost,
              advancePaid,
              balanceDue,
              updatedAt: new Date().toISOString(),
            },
            { merge: true }
          );
        }

        if (newStatus === "Ready for Delivery") {
          const deepLink = `vastramitra://finalpayment?appointmentId=${appointmentId}&userId=${userId}`;
          await sendNotification(
            userId,
            "Your Order is Ready 🎉",
            `Your outfit is ready! Please pay the remaining ₹${balanceDue} to confirm delivery.`,
            deepLink
          );
        } else if (newStatus === "Completed") {
          await sendNotification(
            userId,
            "Order Completed ✅",
            "Your order has been successfully delivered. Thank you for choosing VastraMitra!"
          );
        } else {
          await sendNotification(
            userId,
            `Order ${newStatus}`,
            `Your order ${orderId} status has been updated to: ${newStatus}`
          );
        }
      }

      Alert.alert("Status Updated", `Order marked as ${newStatus}`);
    } catch (err) {
      console.error("Error updating order:", err);
      Alert.alert("Error", "Failed to update order status.");
    }
  };

  const renderTask = (task) => (
    <View key={task.id} style={styles.taskCard}>
      <Ionicons name="checkmark-done-outline" size={18} color="#3F51B5" />
      <Text style={styles.taskText}>
        {task.stage || task.title} - {task.status}
      </Text>
    </View>
  );

  const renderOrder = ({ item }) => (
    <View style={styles.cardShadow}>
      <LinearGradient colors={["#FFFFFF", "#EAF4FF"]} style={styles.orderCard}>
        <View style={styles.orderHeader}>
          <MaterialCommunityIcons name="hanger" size={24} color="#3F51B5" />
          <Text style={styles.title}>Order #{item.id}</Text>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.subtext}>
            <Text style={styles.label}>Customer: </Text>
            <Text style={styles.value}>{item.customerName || "N/A"}</Text>
          </Text>
          <Text style={styles.subtext}>
            <Text style={styles.label}>Style: </Text>
            <Text style={styles.value}>{item.style || "N/A"}</Text>
          </Text>
          <Text style={styles.subtext}>
            <Text style={styles.label}>Fabric: </Text>
            <Text style={styles.value}>{item.fabric || "Own Cloth"}</Text>
          </Text>
          <Text style={styles.subtext}>
            <Text style={styles.label}>Status: </Text>
            <Text style={styles.statusText}>{item.status}</Text>
          </Text>
        </View>

        {auth.currentUser?.uid !== TAILOR_UID &&
          item.status === "Ready for Delivery" &&
          item.paymentStatus !== "Full Paid" && (
            <TouchableOpacity
              style={styles.payBtn}
              onPress={() =>
                navigation.navigate("FinalPaymentScreen", {
                  appointmentId: item.appointmentId,
                  userId: auth.currentUser.uid,
                  totalCost: item.totalCost,
                  advancePaid: item.advancePaid,
                })
              }
            >
              <Text style={styles.payText}>💳 Pay Remaining 70%</Text>
            </TouchableOpacity>
          )}

        {auth.currentUser?.uid === TAILOR_UID && (
          <View style={styles.buttonGroup}>
            {["Confirmed", "In Progress", "Ready for Delivery", "Completed"].map(
              (status) => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.statusButton,
                    item.status === status && styles.activeButton,
                  ]}
                  onPress={() => updateOrderStatus(item.id, status, item.userId)}
                >
                  <Text
                    style={[
                      styles.statusTextBtn,
                      item.status === status && styles.activeText,
                    ]}
                  >
                    {status}
                  </Text>
                </TouchableOpacity>
              )
            )}
          </View>
        )}

        <Text style={styles.sectionTitle}>Tasks</Text>
        {tasks[item.id]?.length > 0 ? (
          tasks[item.id].map((t) => renderTask(t))
        ) : (
          <Text style={styles.noTask}>No tasks yet.</Text>
        )}
      </LinearGradient>
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#3F51B5", "#03DAC6"]} style={styles.header}>
        <Text style={styles.headerText}>Order Management</Text>
        <Ionicons name="clipboard-outline" size={22} color="#fff" />
      </LinearGradient>

      {loading ? (
        <ActivityIndicator size="large" color="#3F51B5" style={{ marginTop: 30 }} />
      ) : orders.length === 0 ? (
        <Text style={styles.noOrders}>No orders yet.</Text>
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

export default OrderManagement;

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
    elevation: 8,
    shadowColor: "#3F51B5",
  },
  headerText: { fontSize: 21, fontWeight: "800", color: "#fff" },

  cardShadow: {
    marginHorizontal: 10,
    marginVertical: 6,
    borderRadius: 14,
    shadowColor: "#3F51B5",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  orderCard: {
    borderRadius: 14,
    padding: 16,
  },
  orderHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    color: "#3F51B5",
    marginLeft: 8,
  },
  infoSection: { marginBottom: 10 },
  subtext: { fontSize: 14, marginVertical: 2 },
  label: { fontWeight: "600", color: "#555" },
  value: { color: "#333" },
  statusText: { color: "#3F51B5", fontWeight: "700" },

  payBtn: {
    backgroundColor: "#27ae60",
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    alignItems: "center",
  },
  payText: { color: "#fff", fontWeight: "700" },

  buttonGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  statusButton: {
    flex: 1,
    marginHorizontal: 3,
    borderWidth: 1,
    borderColor: "#B0C4DE",
    borderRadius: 8,
    paddingVertical: 6,
    backgroundColor: "#fff",
    alignItems: "center",
  },
  statusTextBtn: { fontSize: 13, color: "#3F51B5", fontWeight: "600" },
  activeButton: { backgroundColor: "#3F51B5" },
  activeText: { color: "#fff" },

  sectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#2c3e50",
    marginTop: 12,
    marginBottom: 6,
  },
  taskCard: {
    backgroundColor: "#f0f4ff",
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
  noTask: { fontSize: 13, color: "#777", marginTop: 4 },
  noOrders: {
    textAlign: "center",
    color: "#777",
    marginTop: 40,
    fontSize: 16,
  },
});
