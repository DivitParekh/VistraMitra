// screens/OrderManagement.js
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

const TAILOR_UID = "YvjGOga1CDWJhJfoxAvL7c7Z5sG2";

const OrderManagement = ({ navigation }) => {
  const [orders, setOrders] = useState([]);
  const [tasks, setTasks] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 🧩 Guard to prevent running when user not logged in
    const user = auth.currentUser;
    if (!user) {
      console.warn("⚠️ No user logged in, skipping order fetch");
      setLoading(false);
      return;
    }

    let q;
    if (user.uid === TAILOR_UID) {
      q = query(collection(db, "orders")); // Tailor sees all orders
    } else {
      q = collection(db, "users", user.uid, "orders"); // Customer sees only their own
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

        // Fetch tasks per order safely
        orderData.forEach((order) => {
          if (
            auth.currentUser?.uid === TAILOR_UID ||
            order.userId === auth.currentUser?.uid
          ) {
            const tq = query(
              collection(db, "taskManager"),
              where("orderId", "==", order.id)
            );

            // Listen for task updates
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

  // 🔹 Update Order Status + Send Notification
  const updateOrderStatus = async (orderId, newStatus, userId) => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser || currentUser.uid !== TAILOR_UID) return; // Customers blocked

      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, { status: newStatus });

      // Mirror update inside customer's subcollection
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

        // 🧩 Fetch full order details
        const fullSnap = await getDoc(orderRef);
        const orderData = fullSnap.exists() ? fullSnap.data() : null;

        const totalCost = Number(orderData?.totalCost) || 0;
        const advancePaid = Number(orderData?.advancePaid) || 0;
        const balanceDue = totalCost - advancePaid;
        const appointmentId = orderData?.appointmentId || null;

        // 🔄 Sync appointment status
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

        // 🔔 Notification logic
        if (newStatus === "Ready for Delivery") {
          const deepLink = `vastramitra://finalpayment?appointmentId=${appointmentId}&userId=${userId}`;
          await sendNotification(
            userId,
            "Your Order is Ready 🎉",
            `Your outfit is ready! Please pay the remaining ₹${balanceDue} to confirm delivery.`,
            deepLink
          );
          console.log(`📩 Final Payment Reminder sent to ${userId}`);
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

      console.log(`✅ Order ${orderId} updated to ${newStatus}`);
      Alert.alert("Status Updated", `Order marked as ${newStatus}`);
    } catch (err) {
      console.error("Error updating order:", err);
      Alert.alert("Error", "Failed to update order status.");
    }
  };

  // 🔹 Render Task
  const renderTask = (task) => (
    <View key={task.id} style={styles.taskCard}>
      <Text style={styles.taskText}>
        {task.stage || task.title} - {task.status}
      </Text>
    </View>
  );

  // 🔹 Render Order Card
  const renderOrder = ({ item }) => (
    <View style={styles.orderCard}>
      <Text style={styles.title}>Order: {item.id}</Text>
      <Text style={styles.subtext}>Customer: {item.customerName || "N/A"}</Text>
      <Text style={styles.subtext}>Style: {item.style || "N/A"}</Text>
      <Text style={styles.subtext}>Fabric: {item.fabric || "Own Cloth"}</Text>
      <Text style={styles.subtext}>
        Status: <Text style={{ fontWeight: "600" }}>{item.status}</Text>
      </Text>

      {/* 💳 Pay Remaining Button (Customer Side) */}
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

      {/* Tailor Only Status Control */}
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
                    styles.statusText,
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

      {/* Tasks Section */}
      <Text style={styles.sectionTitle}>Tasks</Text>
      {tasks[item.id]?.length > 0 ? (
        tasks[item.id].map((t) => renderTask(t))
      ) : (
        <Text style={{ color: "#777", fontSize: 13 }}>No tasks yet.</Text>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Order Management</Text>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#2196F3"
          style={{ marginTop: 30 }}
        />
      ) : orders.length === 0 ? (
        <Text style={{ textAlign: "center", marginTop: 20, fontSize: 16 }}>
          No orders yet.
        </Text>
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrder}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9f9f9", padding: 16 },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
    color: "#333",
  },
  orderCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    elevation: 3,
  },
  title: { fontSize: 18, fontWeight: "bold", marginBottom: 6 },
  subtext: { fontSize: 14, color: "#555", marginBottom: 4 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 10,
    marginBottom: 6,
    color: "#333",
  },
  buttonGroup: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
  },
  statusButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    marginHorizontal: 2,
  },
  statusText: { fontSize: 14, color: "#444" },
  activeButton: { backgroundColor: "#2196F3", borderColor: "#1976D2" },
  activeText: { color: "#fff", fontWeight: "600" },
  payBtn: {
    backgroundColor: "#27ae60",
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    alignItems: "center",
  },
  payText: { color: "#fff", fontWeight: "600" },
  taskCard: {
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
    padding: 10,
    marginVertical: 4,
  },
  taskText: { fontSize: 14, fontWeight: "500" },
});

export default OrderManagement;
