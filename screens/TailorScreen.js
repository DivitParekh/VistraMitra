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
import { LinearGradient } from 'expo-linear-gradient';

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

        const ordersSnapshot = await getDocs(collection(db, 'orders'));
        let totalSales = 0;
        ordersSnapshot.forEach((doc) => {
          const data = doc.data();
          if (data?.totalCost) totalSales += data.totalCost;
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

  useEffect(() => {
    if (!auth.currentUser) return;
    const q = query(
      collection(db, 'notifications', auth.currentUser.uid, 'userNotifications'),
      where('read', '==', false)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => setUnreadCount(snapshot.size));
    return () => unsubscribe();
  }, [auth.currentUser]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#E3F2FD', '#BBDEFB']} style={styles.headerBox}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.header}>Hello, Tailor 👋</Text>
            <Text style={styles.subheader}>Your Smart Dashboard</Text>
          </View>

          <TouchableOpacity
            style={styles.notificationIcon}
            onPress={() => navigation.navigate('Notifications')}>
            <Ionicons name="notifications-outline" size={22} color="#1E88E5" />
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {loading ? (
          <ActivityIndicator size="large" color="#1E88E5" style={{ marginTop: 20 }} />
        ) : (
          <View style={styles.statsContainer}>
            <View style={styles.statsCard}>
              <Ionicons name="clipboard-outline" size={30} color="#1E88E5" />
              <Text style={styles.statsValue}>{ordersCount}</Text>
              <Text style={styles.statsLabel}>Total Orders</Text>
            </View>
            <View style={styles.statsCard}>
              <Ionicons name="calendar-outline" size={30} color="#1976D2" />
              <Text style={styles.statsValue}>{appointmentsCount}</Text>
              <Text style={styles.statsLabel}>Appointments</Text>
            </View>
            <View style={styles.statsCard}>
              <FontAwesome5 name="rupee-sign" size={26} color="#1565C0" />
              <Text style={styles.statsValue}>₹{sales}</Text>
              <Text style={styles.statsLabel}>Total Sales</Text>
            </View>
          </View>
        )}

        <Text style={styles.sectionTitle}>Quick Access</Text>
        <View style={styles.row}>
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('AppointmentCalendar')}>
            <Ionicons name="calendar-outline" size={28} color="#1E88E5" />
            <Text style={styles.cardText}>Appointments</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('TailorTaskManager')}>
            <FontAwesome5 name="tasks" size={26} color="#1976D2" />
            <Text style={styles.cardText}>Task Manager</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.row}>
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('PaymentTailorScreen')}>
            <FontAwesome5 name="wallet" size={24} color="#1E88E5" />
            <Text style={styles.cardText}>Payments</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('OrderManagement')}>
            <Ionicons name="clipboard-outline" size={26} color="#1565C0" />
            <Text style={styles.cardText}>Order Management</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.row}>
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('TailorChatListScreen')}>
            <Ionicons name="chatbubbles-outline" size={28} color="#1E88E5" />
            <Text style={styles.cardText}>Customer Chats</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('TailorMeasurementBook')}>
            <MaterialCommunityIcons name="tape-measure" size={30} color="#1976D2" />
            <Text style={styles.cardText}>Measurements</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Navbar */}
      <LinearGradient colors={['#E3F2FD', '#BBDEFB']} style={styles.bottomNav}>
        <TouchableOpacity onPress={() => navigation.navigate('TailorScreen')}>
          <Ionicons name="home-outline" size={24} color="#1E88E5" />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('TailorTaskManager')}>
          <Ionicons name="clipboard-outline" size={24} color="#1E88E5" />
          <Text style={styles.navText}>Tasks</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('TailorChatListScreen')}>
          <Ionicons name="chatbubble-ellipses-outline" size={24} color="#1E88E5" />
          <Text style={styles.navText}>Chats</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('CustomerList')}>
          <Ionicons name="people-outline" size={24} color="#1E88E5" />
          <Text style={styles.navText}>Customers</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('ProfileScreen')}>
          <Ionicons name="person-circle-outline" size={24} color="#1E88E5" />
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  scrollContent: { padding: 16, paddingBottom: 120 },
  headerBox: {
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingVertical: 35,
    paddingHorizontal: 24,
    elevation: 6,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  header: { fontSize: 22, fontWeight: '800', color: '#0D47A1' },
  subheader: { fontSize: 14, color: '#1565C0', marginTop: 4 },
  notificationIcon: {
    backgroundColor: '#E3F2FD',
    padding: 8,
    borderRadius: 20,
    elevation: 2,
  },
  badge: {
    position: 'absolute',
    top: -3,
    right: -3,
    backgroundColor: '#1976D2',
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  statsCard: {
    backgroundColor: '#fff',
    flex: 1,
    marginHorizontal: 5,
    borderRadius: 18,
    alignItems: 'center',
    paddingVertical: 18,
    elevation: 3,
    shadowColor: 'rgba(0,0,0,0.08)',
  },
  statsValue: { fontSize: 18, fontWeight: '700', color: '#1E88E5', marginTop: 6 },
  statsLabel: { fontSize: 12, color: '#555', marginTop: 3 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1E88E5', marginTop: 30, marginBottom: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  card: {
    backgroundColor: '#fff',
    width: '48%',
    borderRadius: 18,
    paddingVertical: 22,
    alignItems: 'center',
    elevation: 3,
    shadowColor: 'rgba(0,0,0,0.08)',
  },
  cardText: { fontSize: 14, marginTop: 8, fontWeight: '600', color: '#212121' },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 8,
  },
  navText: { fontSize: 11, color: '#1E88E5', textAlign: 'center', marginTop: 2 },
});

export default TailorScreen;
