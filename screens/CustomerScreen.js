import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome5,
} from '@expo/vector-icons';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db, auth } from '../firebase/firebaseConfig';
import { LinearGradient } from 'expo-linear-gradient';

const CustomerScreen = ({ navigation }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeTab, setActiveTab] = useState('home');

  useEffect(() => {
    let unsubscribe = null;
    const initListener = async () => {
      if (!auth.currentUser) return;
      const q = query(
        collection(db, 'notifications', auth.currentUser.uid, 'userNotifications'),
        where('read', '==', false)
      );
      unsubscribe = onSnapshot(q, (snapshot) => setUnreadCount(snapshot.size));
    };
    initListener();
    return () => unsubscribe && unsubscribe();
  }, [auth.currentUser]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#3F51B5', '#5C6BC0']} style={styles.headerBox}>
        <Text style={styles.header}>VastraMitra</Text>
        <Text style={styles.subheader}>Your Fashion Assistant</Text>

        <TouchableOpacity
          style={styles.notificationIcon}
          onPress={() => {
            if (!auth.currentUser) {
              Alert.alert('Please Log In', 'You must be logged in to view notifications.');
              return;
            }
            navigation.navigate('Notifications');
          }}>
          <Ionicons name="notifications-outline" size={22} color="#FFFFFF" />
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </LinearGradient>

      {/* Scrollable Content */}
      <ScrollView
        contentContainerStyle={styles.menuContainer}
        showsVerticalScrollIndicator={false}>
        <TouchableOpacity
          style={styles.promoCard}
          onPress={() => navigation.navigate('CatalogScreen')}>
          <LinearGradient colors={['#E8EAF6', '#FFFFFF']} style={styles.promoGradient}>
            <Text style={styles.promoText}>👗 Discover Your Perfect Style</Text>
            <Text style={styles.promoSub}>Browse our latest catalog & inspirations!</Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.row}>
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('CustomerMeasurementDetail')}>
            <MaterialCommunityIcons name="tape-measure" size={30} color="#3F51B5" />
            <Text style={styles.cardText}>My Measurements</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('ChatScreen')}>
            <Ionicons name="chatbubble-ellipses-outline" size={26} color="#303F9F" />
            <Text style={styles.cardText}>Tailor Chat</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.row}>
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('SavedStyles')}>
            <Ionicons name="heart-outline" size={28} color="#1976D2" />
            <Text style={styles.cardText}>Saved Styles</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('CatalogScreen')}>
            <FontAwesome5 name="tshirt" size={24} color="#1E88E5" />
            <Text style={styles.cardText}>Catalog</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 110 }} />
      </ScrollView>

      {/* 🌟 Material Design Bottom Navbar */}
      <View style={styles.navWrapper}>
        <View style={styles.bottomNav}>
          {/* Home */}
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => {
              setActiveTab('home');
              navigation.navigate('CustomerScreen');
            }}>
            <Ionicons
              name={activeTab === 'home' ? 'home' : 'home-outline'}
              size={26}
              color={activeTab === 'home' ? '#3F51B5' : '#000'}
            />
            <Text style={[styles.navText, { color: activeTab === 'home' ? '#3F51B5' : '#000' }]}>
              Home
            </Text>
          </TouchableOpacity>

          {/* AI Tailor */}
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => {
              setActiveTab('ai');
              navigation.navigate('AITailorScreen');
            }}>
            <Ionicons
              name={activeTab === 'ai' ? 'sparkles' : 'sparkles-outline'}
              size={25}
              color={activeTab === 'ai' ? '#3F51B5' : '#000'}
            />
            <Text style={[styles.navText, { color: activeTab === 'ai' ? '#3F51B5' : '#000' }]}>
              AI Tailor
            </Text>
          </TouchableOpacity>

          {/* Floating “+” Button (Book Appointment) */}
          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.bookButton}
            onPress={() => navigation.navigate('AppointmentScreen')}>
            <View style={styles.fab}>
              <Ionicons name="add" size={28} color="#FFFFFF" />
            </View>
          </TouchableOpacity>

          {/* Orders */}
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => {
              setActiveTab('orders');
              navigation.navigate('OrderScreen');
            }}>
            <MaterialCommunityIcons
              name={activeTab === 'orders' ? 'clipboard-list' : 'clipboard-list-outline'}
              size={25}
              color={activeTab === 'orders' ? '#3F51B5' : '#000'}
            />
            <Text style={[styles.navText, { color: activeTab === 'orders' ? '#3F51B5' : '#000' }]}>
              Orders
            </Text>
          </TouchableOpacity>

          {/* Profile */}
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => {
              setActiveTab('profile');
              navigation.navigate('ProfileScreen');
            }}>
            <Ionicons
              name={activeTab === 'profile' ? 'person' : 'person-outline'}
              size={25}
              color={activeTab === 'profile' ? '#3F51B5' : '#000'}
            />
            <Text style={[styles.navText, { color: activeTab === 'profile' ? '#3F51B5' : '#000' }]}>
              Profile
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },

  headerBox: {
    padding: 26,
    paddingTop: 50,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    alignItems: 'center',
    elevation: 4,
  },
  notificationIcon: {
    position: 'absolute',
    top: 52,
    right: 22,
    backgroundColor: '#3F51B5',
    padding: 8,
    borderRadius: 20,
    elevation: 3,
  },
  header: { fontSize: 26, fontWeight: '800', color: '#FFFFFF', letterSpacing: 0.5 },
  subheader: { fontSize: 14, color: '#E8EAF6', marginTop: 6, opacity: 0.9 },

  menuContainer: { padding: 20, paddingBottom: 120 },
  promoCard: { borderRadius: 18, marginBottom: 24, elevation: 3 },
  promoGradient: { padding: 20, borderRadius: 18 },
  promoText: { fontSize: 18, fontWeight: '700', color: '#000000' },
  promoSub: { fontSize: 13, color: '#424242', marginTop: 6, opacity: 0.8 },

  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 18 },
  card: {
    backgroundColor: '#FFFFFF',
    width: '48%',
    borderRadius: 18,
    paddingVertical: 22,
    alignItems: 'center',
    elevation: 3,
    shadowColor: 'rgba(0,0,0,0.08)',
  },
  cardText: { fontSize: 14, marginTop: 8, fontWeight: '600', color: '#000' },

  // Bottom Navbar
  navWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 10,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderTopColor: '#E0E0E0',
    borderTopWidth: 1,
    paddingVertical: 10,
    height: 70,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 6,
  },
  navItem: { alignItems: 'center', justifyContent: 'center', flex: 1 },
  navText: { fontSize: 11, marginTop: 2, fontWeight: '600', textAlign: 'center' },

  // Floating Button
  bookButton: {
    position: 'absolute',
    bottom: 25,
    alignSelf: 'center',
    zIndex: 20,
    elevation: 8,
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#03DAC6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },

  badge: {
    position: 'absolute',
    top: -3,
    right: -3,
    backgroundColor: '#B00020',
    borderRadius: 10,
    paddingHorizontal: 4,
    paddingVertical: 1,
    minWidth: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: '800' },
});

export default CustomerScreen;
