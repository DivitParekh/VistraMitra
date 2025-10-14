import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  updateDoc,
  doc,
  getDoc,
} from "firebase/firestore";
import { db, auth } from "../firebase/firebaseConfig";
import { useNavigation } from "@react-navigation/native";

const NotificationScreen = () => {
  const [notifications, setNotifications] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    if (!auth.currentUser) return;

    try {
      const q = query(
        collection(db, "notifications", auth.currentUser.uid, "userNotifications"),
        orderBy("timestamp", "desc")
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const notifList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setNotifications(notifList);

        const unreadCount = notifList.filter((n) => !n.read).length;
        navigation.setParams({ unreadCount });
      });

      return () => unsubscribe();
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  }, []);

  const markAsRead = async (id) => {
    try {
      if (!auth.currentUser) return;
      const notifRef = doc(
        db,
        "notifications",
        auth.currentUser.uid,
        "userNotifications",
        id
      );
      await updateDoc(notifRef, { read: true });
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // ✅ Safe handling when tapping notifications
  const handleNotificationPress = async (item) => {
    await markAsRead(item.id);

    try {
      if (item.title?.includes("Ready for Delivery")) {
        let paymentData = {
          appointmentId: item.appointmentId || item.orderId,
          totalCost: item.totalCost,
          advancePaid: item.advancePaid,
          userId: auth.currentUser?.uid,
        };

        // 🔍 Fetch missing payment data if not present in notification
        if (!paymentData.totalCost || !paymentData.advancePaid) {
          const orderRef = doc(
            db,
            "users",
            auth.currentUser.uid,
            "orders",
            item.appointmentId || item.orderId
          );
          const snap = await getDoc(orderRef);
          if (snap.exists()) {
            const data = snap.data();
            paymentData.totalCost = data.totalCost;
            paymentData.advancePaid = data.advancePaid;
            paymentData.userId = data.userId || auth.currentUser.uid;
          }
        }

        if (paymentData.totalCost && paymentData.advancePaid) {
          navigation.navigate("FinalPaymentScreen", paymentData);
        } else {
          Alert.alert(
            "Payment Info Missing",
            "Could not find payment details. Please check your Orders section."
          );
        }
      } else {
        Alert.alert("Notice", "This notification is not related to a payment.");
      }
    } catch (error) {
      console.error("Notification navigation error:", error);
      Alert.alert("Error", "Unable to open payment screen.");
    }
  };

  const renderItem = ({ item }) => {
    const formattedTime =
      item.timestamp && item.timestamp.toDate
        ? new Date(item.timestamp.toDate()).toLocaleString()
        : item.timestamp
        ? new Date(item.timestamp).toLocaleString()
        : "";

    return (
      <TouchableOpacity
        style={[styles.card, item.read && styles.readCard]}
        onPress={() => handleNotificationPress(item)}
      >
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.message}>{item.message}</Text>
        <Text style={styles.time}>{formattedTime}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {notifications.length === 0 ? (
        <Text style={styles.empty}>No notifications yet</Text>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fafafa", padding: 16 },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
  },
  readCard: { opacity: 0.6 },
  title: { fontSize: 16, fontWeight: "700", color: "#2c3e50" },
  message: { fontSize: 14, color: "#555", marginVertical: 4 },
  time: { fontSize: 12, color: "#888" },
  empty: { textAlign: "center", color: "#666", marginTop: 20 },
});

export default NotificationScreen;
