import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';

const TailorScreen = ({ navigation }) => {
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
        </TouchableOpacity>
      </View>

      {/* Dashboard Grid */}
      <ScrollView contentContainerStyle={styles.menuContainer}>
        <Text style={styles.sectionTitle}>Quick Access</Text>

        <View style={styles.row}>
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('AppointmentCalendar')}
          >
            <Ionicons name="calendar-outline" size={26} color="#4e4e4e" />
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
            onPress={() => navigation.navigate('PaymentScreen')}
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
            <Ionicons name="chatbubbles-outline" size={26} color="#4e4e4e" />
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

        <View style={{ height: 80 }} />
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
  headerBox: {
    backgroundColor: '#fcdedc',
    padding: 24,
    paddingTop: 40,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    alignItems: 'center',
    position: 'relative',
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
    color: '#2c3e50',
  },
  menuContainer: {
    padding: 20,
    paddingBottom: 100,
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
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
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
    borderTopColor: '#ccc',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  navText: {
    fontSize: 10,
    color: '#333',
    textAlign: 'center',
    marginTop: 4,
  },
});

export default TailorScreen;
