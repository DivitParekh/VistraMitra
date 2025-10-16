import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import {
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome5,
} from "@expo/vector-icons";
import { collection, getDocs, query, where, onSnapshot } from "firebase/firestore";
import { SafeAreaView } from "react-native-safe-area-context";
import { db, auth } from "../firebase/firebaseConfig";
import { LinearGradient } from "expo-linear-gradient";

const TailorScreen = ({ navigation }) => {
  const [ordersCount, setOrdersCount] = useState(0);
  const [appointmentsCount, setAppointmentsCount] = useState(0);
  const [sales, setSales] = useState(0);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        if (!auth.currentUser) return;
        const ordersSnapshot = await getDocs(collection(db, "orders"));
        let totalSales = 0;
        ordersSnapshot.forEach((doc) => {
          const data = doc.data();
          if (data?.totalCost) totalSales += data.totalCost;
        });

        setOrdersCount(ordersSnapshot.size);
        setSales(totalSales);

        const apptSnapshot = await getDocs(collection(db, "tailorAppointments"));
        setAppointmentsCount(apptSnapshot.size);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching dashboard:", error);
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  useEffect(() => {
    if (!auth.currentUser) return;
    const q = query(
      collection(db, "notifications", auth.currentUser.uid, "userNotifications"),
      where("read", "==", false)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => setUnreadCount(snapshot.size));
    return () => unsubscribe();
  }, [auth.currentUser]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient colors={["#3F51B5", "#5C6BC0"]} style={styles.headerBox}>
        <Text style={styles.header}>VastraMitra</Text>
        <Text style={styles.subheader}>Tailor Dashboard</Text>

        <TouchableOpacity
          style={styles.notificationIcon}
          onPress={() => {
            if (!auth.currentUser) {
              Alert.alert("Please Log In", "You must be logged in to view notifications.");
              return;
            }
            navigation.navigate("Notifications");
          }}
        >
          <Ionicons name="notifications-outline" size={22} color="#FFFFFF" />
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {unreadCount > 9 ? "9+" : unreadCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </LinearGradient>

      {/* Scrollable Content */}
      <ScrollView
        contentContainerStyle={styles.menuContainer}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          style={styles.promoCard}
          onPress={() => navigation.navigate("OrderManagement")}
        >
          <LinearGradient
            colors={["#E8EAF6", "#FFFFFF"]}
            style={styles.promoGradient}
          >
            <Text style={styles.promoText}>🧵 Manage Your Orders Seamlessly</Text>
            <Text style={styles.promoSub}>
              Track progress, handle payments & keep clients happy!
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {loading ? (
          <ActivityIndicator
            size="large"
            color="#3F51B5"
            style={{ marginTop: 30 }}
          />
        ) : (
          <View style={styles.statsContainer}>
            <View style={styles.statsCard}>
              <Ionicons name="clipboard-outline" size={30} color="#3F51B5" />
              <Text style={styles.statsValue}>{ordersCount}</Text>
              <Text style={styles.statsLabel}>Total Orders</Text>
            </View>
            <View style={styles.statsCard}>
              <Ionicons name="calendar-outline" size={30} color="#1976D2" />
              <Text style={styles.statsValue}>{appointmentsCount}</Text>
              <Text style={styles.statsLabel}>Appointments</Text>
            </View>
            <View style={styles.statsCard}>
              <FontAwesome5 name="rupee-sign" size={24} color="#1E88E5" />
              <Text style={styles.statsValue}>₹{sales}</Text>
              <Text style={styles.statsLabel}>Total Sales</Text>
            </View>
          </View>
        )}

        <Text style={styles.sectionTitle}>Quick Access</Text>
        <View style={styles.row}>
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate("AppointmentCalendar")}
          >
            <Ionicons name="calendar-outline" size={28} color="#1E88E5" />
            <Text style={styles.cardText}>Appointments</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate("PaymentTailorScreen")}
          >
            <FontAwesome5 name="wallet" size={24} color="#1E88E5" />
            <Text style={styles.cardText}>Payments</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.row}>
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate("OrderManagement")}
          >
            <Ionicons name="clipboard-outline" size={26} color="#1565C0" />
            <Text style={styles.cardText}>Order Management</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate("TailorMeasurementBook")}
          >
            <MaterialCommunityIcons
              name="tape-measure"
              size={30}
              color="#1976D2"
            />
            <Text style={styles.cardText}>Measurements</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 110 }} />
      </ScrollView>

      {/* Keep Bottom Navbar same */}
      <LinearGradient colors={["#E3F2FD", "#BBDEFB"]} style={styles.bottomNav}>
        <TouchableOpacity onPress={() => navigation.navigate("TailorScreen")}>
          <Ionicons name="home-outline" size={24} color="#1E88E5" />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("TailorTaskManager")}>
          <Ionicons name="clipboard-outline" size={24} color="#1E88E5" />
          <Text style={styles.navText}>Tasks</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("TailorChatListScreen")}>
          <Ionicons name="chatbubble-ellipses-outline" size={24} color="#1E88E5" />
          <Text style={styles.navText}>Chats</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("CustomerList")}>
          <Ionicons name="people-outline" size={24} color="#1E88E5" />
          <Text style={styles.navText}>Customers</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("ProfileScreen")}>
          <Ionicons name="person-circle-outline" size={24} color="#1E88E5" />
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FAFAFA" },
  headerBox: {
    padding: 26,
    paddingTop: 50,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    alignItems: "center",
    elevation: 4,
  },
  header: {
    fontSize: 26,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  subheader: { fontSize: 14, color: "#E8EAF6", marginTop: 6, opacity: 0.9 },
  notificationIcon: {
    position: "absolute",
    top: 52,
    right: 22,
    backgroundColor: "#3F51B5",
    padding: 8,
    borderRadius: 20,
    elevation: 3,
  },
  badge: {
    position: "absolute",
    top: -3,
    right: -3,
    backgroundColor: "#B00020",
    borderRadius: 10,
    paddingHorizontal: 4,
    paddingVertical: 1,
    minWidth: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: { color: "#FFFFFF", fontSize: 10, fontWeight: "800" },
  menuContainer: { padding: 20, paddingBottom: 120 },
  promoCard: { borderRadius: 18, marginBottom: 24, elevation: 3 },
  promoGradient: { padding: 20, borderRadius: 18 },
  promoText: { fontSize: 18, fontWeight: "700", color: "#000000" },
  promoSub: { fontSize: 13, color: "#424242", marginTop: 6, opacity: 0.8 },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  statsCard: {
    backgroundColor: "#FFFFFF",
    flex: 1,
    borderRadius: 18,
    marginHorizontal: 6,
    alignItems: "center",
    paddingVertical: 20,
    elevation: 3,
    shadowColor: "rgba(0,0,0,0.08)",
  },
  statsValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E88E5",
    marginTop: 6,
  },
  statsLabel: { fontSize: 13, color: "#555", marginTop: 3 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E88E5",
    marginTop: 20,
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  card: {
    backgroundColor: "#FFFFFF",
    width: "48%",
    borderRadius: 18,
    paddingVertical: 22,
    alignItems: "center",
    elevation: 3,
    shadowColor: "rgba(0,0,0,0.08)",
  },
  cardText: { fontSize: 14, marginTop: 8, fontWeight: "600", color: "#000" },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 10,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 8,
  },
  navText: {
    fontSize: 11,
    color: "#1E88E5",
    textAlign: "center",
    marginTop: 2,
  },
});

export default TailorScreen;
