import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db, auth } from "../firebase/firebaseConfig";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const NotificationScreen = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

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
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setLoading(false);
    }
  }, []);

  // ✅ Mark as read
  const markAsRead = async (id) => {
    try {
      if (!auth.currentUser || !id) return;
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

  const handleNotificationPress = async (item) => {
    await markAsRead(item.id);
  };

  const renderItem = ({ item }) => {
    const formattedTime =
      item.timestamp && item.timestamp.toDate
        ? new Date(item.timestamp.toDate()).toLocaleString()
        : "";

    return (
      <TouchableOpacity
        style={[styles.card, item.read && styles.readCard]}
        onPress={() => handleNotificationPress(item)}
        activeOpacity={0.85}
      >
        <LinearGradient
          colors={item.read ? ["#E0E0E0", "#f9fbfd"] : ["#3F51B5", "#03DAC6"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.iconCircle}
        >
          <Ionicons
            name={item.read ? "notifications-outline" : "notifications-sharp"}
            size={22}
            color={item.read ? "#555" : "#fff"}
          />
        </LinearGradient>

        <View style={styles.cardBody}>
          <Text style={[styles.title, item.read && styles.readTitle]}>
            {item.title}
          </Text>
          <Text style={[styles.message, item.read && styles.readMessage]}>
            {item.message}
          </Text>
          <Text style={styles.time}>{formattedTime}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient colors={["#3F51B5", "#03DAC6"]} style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
        <Ionicons name="notifications-outline" size={24} color="#fff" />
      </LinearGradient>

      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#3F51B5" />
          <Text style={styles.loaderText}>Loading Notifications...</Text>
        </View>
      ) : notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="notifications-off-outline" size={48} color="#ccc" />
          <Text style={styles.empty}>No notifications yet</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

export default NotificationScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fbfd" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 6,
    shadowColor: "#3F51B5",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#fff",
  },

  listContainer: {
    padding: 16,
    paddingBottom: 50,
  },

  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 14,
    elevation: 3,
    shadowColor: "#3F51B5",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    marginBottom: 14,
    padding: 14,
    alignItems: "center",
  },
  readCard: {
    backgroundColor: "#f2f3f5",
    shadowOpacity: 0,
  },

  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
  },
  cardBody: { flex: 1, marginLeft: 12 },

  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2c3e50",
  },
  readTitle: {
    color: "#555",
    fontWeight: "600",
  },
  message: {
    fontSize: 14,
    color: "#555",
    marginTop: 4,
  },
  readMessage: {
    color: "#777",
  },
  time: {
    fontSize: 12,
    color: "#999",
    textAlign: "right",
    marginTop: 6,
  },

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loaderText: {
    color: "#666",
    marginTop: 10,
    fontSize: 15,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  empty: {
    color: "#777",
    marginTop: 10,
    fontSize: 16,
  },
});
