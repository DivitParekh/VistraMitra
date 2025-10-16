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
        <LinearGradient colors={['#B2DFDB', '#E3F2FD']} style={styles.headerBox}>
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
            <Ionicons name="notifications-outline" size={22} color="#1565C0" />
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
            <LinearGradient colors={['#E0F7FA', '#E3F2FD']} style={styles.promoGradient}>
              <Text style={styles.promoText}>👗 Discover Your Perfect Style</Text>
              <Text style={styles.promoSub}>Browse our latest catalog & inspirations!</Text>
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.row}>
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate('CustomerMeasurementDetail')}>
              <MaterialCommunityIcons name="tape-measure" size={30} color="#1E88E5" />
              <Text style={styles.cardText}>My Measurements</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate('ChatScreen')}>
              <Ionicons name="chatbubble-ellipses-outline" size={26} color="#4DB6AC" />
              <Text style={styles.cardText}>Tailor Chat</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.row}>
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate('SavedStyles')}>
              <Ionicons name="heart-outline" size={28} color="#81C784" />
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

        {/* 🌟 Modern Professional Bottom Navbar */}
        <View style={styles.navWrapper}>
          <LinearGradient
            colors={['#E0F7FA', '#E3F2FD']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.bottomNav}>

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
                color={activeTab === 'home' ? '#1565C0' : '#424242'}
              />
              <Text style={[styles.navText, { color: activeTab === 'home' ? '#1565C0' : '#424242' }]}>
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
                color={activeTab === 'ai' ? '#4DB6AC' : '#424242'}
              />
              <Text style={[styles.navText, { color: activeTab === 'ai' ? '#4DB6AC' : '#424242' }]}>
                AI Tailor
              </Text>
            </TouchableOpacity>

            {/* Floating “+” Button (Book Appointment) */}
            <TouchableOpacity
              activeOpacity={0.9}
              style={styles.bookButton}
              onPress={() => navigation.navigate('AppointmentScreen')}>
              <LinearGradient
                colors={['#4DB6AC', '#1565C0']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.bookGradient}>
                <Ionicons name="add" size={28} color="#fff" />
              </LinearGradient>
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
                color={activeTab === 'orders' ? '#1E88E5' : '#424242'}
              />
              <Text style={[styles.navText, { color: activeTab === 'orders' ? '#1E88E5' : '#424242' }]}>
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
                color={activeTab === 'profile' ? '#81C784' : '#424242'}
              />
              <Text style={[styles.navText, { color: activeTab === 'profile' ? '#81C784' : '#424242' }]}>
                Profile
              </Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </SafeAreaView>
    );
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },

    headerBox: {
      padding: 26,
      paddingTop: 50,
      borderBottomLeftRadius: 30,
      borderBottomRightRadius: 30,
      alignItems: 'center',
      elevation: 6,
    },
    notificationIcon: {
      position: 'absolute',
      top: 52,
      right: 22,
      backgroundColor: '#E0F7FA',
      padding: 8,
      borderRadius: 20,
      elevation: 3,
    },
    header: { fontSize: 26, fontWeight: '800', color: '#0D47A1', letterSpacing: 0.5 },
    subheader: { fontSize: 14, color: '#1976D2', marginTop: 6, opacity: 0.9 },

    menuContainer: { padding: 20, paddingBottom: 120 },
    promoCard: { borderRadius: 18, marginBottom: 24, elevation: 3 },
    promoGradient: { padding: 20, borderRadius: 18 },
    promoText: { fontSize: 18, fontWeight: '700', color: '#0D47A1' },
    promoSub: { fontSize: 13, color: '#333', marginTop: 6, opacity: 0.8 },

    row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 18 },
    card: {
      backgroundColor: '#fff',
      width: '48%',
      borderRadius: 18,
      paddingVertical: 22,
      alignItems: 'center',
      elevation: 4,
      shadowColor: 'rgba(0,0,0,0.1)',
    },
    cardText: { fontSize: 14, marginTop: 8, fontWeight: '600', color: '#212121' },

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
      borderTopLeftRadius: 25,
      borderTopRightRadius: 25,
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
      shadowColor: '#4DB6AC',
      shadowOpacity: 0.3,
      shadowRadius: 10,
      elevation: 10,
    },
    bookGradient: {
      width: 60,
      height: 60,
      borderRadius: 30,
      justifyContent: 'center',
      alignItems: 'center',
    },

    badge: {
      position: 'absolute',
      top: -3,
      right: -3,
      backgroundColor: '#1E88E5',
      borderRadius: 10,
      paddingHorizontal: 4,
      paddingVertical: 1,
      minWidth: 18,
      alignItems: 'center',
      justifyContent: 'center',
    },
    badgeText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  });

  export default CustomerScreen;
