import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { collection, getDocs, query, where, onSnapshot } from 'firebase/firestore';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db, auth } from '../firebase/firebaseConfig';

const TailorScreen = ({ navigation }) => {
  const [ordersCount, setOrdersCount] = useState(0);
  const [appointmentsCount, setAppointmentsCount] = useState(0);
  const [sales, setSales] = useState(0);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  // 🔹 Fetch dashboard data (orders, appointments, sales)
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const ordersSnapshot = await getDocs(collection(db, 'orders'));
        let totalSales = 0;

        ordersSnapshot.forEach((doc) => {
          const data = doc.data();
          totalSales += data.advancePaid || 0;
          if (data.paymentStatus === 'paid') {
            totalSales += data.balanceDue || 0;
          }
        });

        setOrdersCount(ordersSnapshot.size);
        setSales(totalSales);

        const apptSnapshot = await getDocs(collection(db, 'tailorAppointments'));
        setAppointmentsCount(apptSnapshot.size);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard:', error);
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  // 🔹 Subscribe to unread notifications for this tailor
  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, 'notifications', auth.currentUser.uid, 'userNotifications'),
      where('read', '==', false)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setUnreadCount(snapshot.size);
    });

    return () => unsubscribe();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.headerBox}>
        <Text style={styles.header}>Hello, Tailor 👋</Text>
        <Text style={styles.subheader}>Your Dashboard</Text>

        <TouchableOpacity
          style={styles.notificationIcon}
          onPress={() => navigation.navigate('Notifications')}
        >
          <Ionicons name="notifications-outline" size={22} color="#2c3e50" />

          {/* 🔴 Badge for unread notifications */}
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Stats Section */}
        {loading ? (
          <ActivityIndicator size="large" color="#000" style={{ marginTop: 20 }} />
        ) : (
          <View style={styles.statsContainer}>
            <View style={styles.statsCard}>
              <Ionicons name="clipboard-outline" size={28} color="#3498db" />
              <Text style={styles.statsValue}>{ordersCount}</Text>
              <Text style={styles.statsLabel}>Orders</Text>
            </View>
            <View style={styles.statsCard}>
              <Ionicons name="calendar-outline" size={28} color="#9b59b6" />
              <Text style={styles.statsValue}>{appointmentsCount}</Text>
              <Text style={styles.statsLabel}>Appointments</Text>
            </View>
            <View style={styles.statsCard}>
              <FontAwesome5 name="rupee-sign" size={24} color="#27ae60" />
              <Text style={styles.statsValue}>₹{sales}</Text>
              <Text style={styles.statsLabel}>Sales</Text>
            </View>
          </View>
        )}

        {/* Quick Access Grid */}
        <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Quick Access</Text>
        <View style={styles.row}>
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('AppointmentCalendar')}
          >
            <Ionicons name="calendar-outline" size={28} color="#4e4e4e" />
            <Text style={styles.cardText}>Appointments</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('TailorTaskManager')}
          >
            <FontAwesome5 name="tasks" size={26} color="#4e4e4e" />
            <Text style={styles.cardText}>Task Manager</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.row}>
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('PaymentTailorScreen')}
          >
            <FontAwesome5 name="wallet" size={24} color="#4e4e4e" />
            <Text style={styles.cardText}>Payments</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('OrderManagement')}
          >
            <Ionicons name="clipboard-outline" size={26} color="#4e4e4e" />
            <Text style={styles.cardText}>Order Management</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.row}>
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('TailorChatListScreen')}
          >
            <Ionicons name="chatbubbles-outline" size={28} color="#4e4e4e" />
            <Text style={styles.cardText}>Customer Chats</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('TailorMeasurementBook')}
          >
            <MaterialCommunityIcons name="tape-measure" size={30} color="#4e4e4e" />
            <Text style={styles.cardText}>Measurements</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNav}>
        <TouchableOpacity onPress={() => navigation.navigate('TailorScreen')}>
          <Ionicons name="home-outline" size={24} color="#333" />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('TailorTaskManager')}>
          <Ionicons name="clipboard-outline" size={24} color="#333" />
          <Text style={styles.navText}>Tasks</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('TailorChatListScreen')}>
          <Ionicons name="chatbubble-ellipses-outline" size={24} color="#333" />
          <Text style={styles.navText}>Chats</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('CustomerList')}>
          <Ionicons name="people-outline" size={24} color="#333" />
          <Text style={styles.navText}>Customers</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('ProfileScreen')}>
          <Ionicons name="person-circle-outline" size={24} color="#333" />
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fafafa' },
  scrollContent: { padding: 16, paddingBottom: 120 },
  headerBox: {
    backgroundColor: '#fcdedc',
    padding: 24,
    paddingTop: 40,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    alignItems: 'center',
    position: 'relative',
    marginBottom: 12,
  },
  notificationIcon: {
    position: 'absolute',
    top: 42,
    right: 20,
    backgroundColor: '#fff',
    padding: 6,
    borderRadius: 20,
    elevation: 3,
  },
  header: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2c3e50',
  },
  subheader: {
    fontSize: 14,
    color: '#34495e',
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 8,
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderRadius: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    marginBottom: 16,
  },
  statsCard: {
    flex: 1,
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#eee',
  },
  statsValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2c3e50',
    marginTop: 6,
  },
  statsLabel: {
    fontSize: 12,
    color: '#555',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#fff',
    width: '48%',
    borderRadius: 16,
    paddingVertical: 22,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  cardText: {
    fontSize: 14,
    marginTop: 10,
    fontWeight: '600',
    color: '#2c3e50',
    textAlign: 'center',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 8,
  },
  navText: {
    fontSize: 10,
    color: '#333',
    textAlign: 'center',
    marginTop: 4,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: 'red',
    borderRadius: 10,
    paddingHorizontal: 5,
    paddingVertical: 1,
    minWidth: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default TailorScreen;
