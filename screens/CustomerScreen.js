import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import {
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome5,
} from '@expo/vector-icons';

const CustomerScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.headerBox}>
        <Text style={styles.header}>VastraMitra</Text>
        <Text style={styles.subheader}>Your Fashion Assistant</Text>

        {/* Notification Icon */}
        <TouchableOpacity
          style={styles.notificationIcon}
          onPress={() => navigation.navigate('Notifications')}
        >
          <Ionicons name="notifications-outline" size={22} color="#2c3e50" />
        </TouchableOpacity>
      </View>

      {/* Scrollable Content */}
      <ScrollView contentContainerStyle={styles.menuContainer}>

        {/* Promo Banner */}
        <TouchableOpacity
          style={styles.promoCard}
          onPress={() => navigation.navigate('Promotions')}
        >
          <Text style={styles.promoText}>🎉 10% OFF on first stitching</Text>
          <Text style={styles.promoSub}>Tap to claim offer</Text>
        </TouchableOpacity>

        {/* Quick Actions Row 1 */}
        <View style={styles.row}>
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('CustomerMeasurementDetail')}
          >
            <MaterialCommunityIcons name="tape-measure" size={30} color="#4e4e4e" />
            <Text style={styles.cardText}>My Measurements</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('ChatScreen')}
          >
            <Ionicons name="chatbubble-ellipses-outline" size={26} color="#4e4e4e" />
            <Text style={styles.cardText}>Tailor Chat</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Actions Row 2 */}
        <View style={styles.row}>
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('SavedStyles')}
          >
            <Ionicons name="heart-outline" size={28} color="#4e4e4e" />
            <Text style={styles.cardText}>Saved Styles</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('CatalogScreen')}
          >
            <FontAwesome5 name="tshirt" size={24} color="#4e4e4e" />
            <Text style={styles.cardText}>Catalog</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity onPress={() => navigation.navigate('CustomerScreen')}>
          <Ionicons name="home-outline" size={24} color="#333" />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('AppointmentScreen')}>
          <Ionicons name="calendar-outline" size={24} color="#333" />
          <Text style={styles.navText}>Appointment</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('CatalogScreen')}>
          <FontAwesome5 name="tshirt" size={22} color="#333" />
          <Text style={styles.navText}>Catalog</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('OrderScreen')}>
          <MaterialCommunityIcons name="clipboard-list-outline" size={24} color="#333" />
          <Text style={styles.navText}>Orders</Text>
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
    backgroundColor: '#c1e1ec',
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
    fontSize: 24,
    fontWeight: '700',
    color: '#2c3e50',
  },
  subheader: {
    fontSize: 14,
    color: '#34495e',
    marginTop: 6,
  },

  menuContainer: {
    padding: 20,
    paddingBottom: 100,
  },

  promoCard: {
    backgroundColor: '#ffeedd',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    elevation: 3,
  },
  promoText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#d35400',
  },
  promoSub: {
    fontSize: 13,
    marginTop: 6,
    color: '#a04000',
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
    shadowOpacity: 0.2,
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

export default CustomerScreen;
