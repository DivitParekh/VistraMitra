import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { collection, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { Ionicons } from '@expo/vector-icons';

const TailorChatListScreen = () => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'chats'), async (snapshot) => {
      const chatData = await Promise.all(
        snapshot.docs.map(async (docSnap) => {
          const data = docSnap.data();
          const customerId = data.customerId;
          let customerName = 'Customer';

          if (customerId && typeof customerId === 'string' && customerId.includes('_')) {
            try {
              const cleanId = customerId.replace('customer_', '').trim();
              if (cleanId.length > 0) {
                const userRef = doc(db, 'users', cleanId);
                const userSnap = await getDoc(userRef);
                if (userSnap.exists()) {
                  const userData = userSnap.data();
                  customerName = userData?.name || customerName;
                }
              }
            } catch (err) {
              console.error('Error fetching customer:', err);
            }
          }

          return {
            id: docSnap.id,
            ...data,
            customerName,
          };
        })
      );

      const sortedChats = chatData.sort(
        (a, b) => (b.lastUpdated?.toMillis?.() || 0) - (a.lastUpdated?.toMillis?.() || 0)
      );

      setChats(sortedChats);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('TailorChatScreen', { customerId: item.customerId })}
      activeOpacity={0.8}>
      <View style={styles.cardHeader}>
        <Ionicons name="chatbubbles-outline" size={26} color="#4C84FF" />
        <View style={styles.textContainer}>
          <Text style={styles.name}>{item.customerName}</Text>
          <Text style={styles.preview}>{item.lastMessage || 'No messages yet'}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#A0AEC0" />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#4C84FF" />
        <Text style={{ color: '#6B7280', marginTop: 10 }}>Loading Chats...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Tailor Chats</Text>
      <FlatList
        data={chats}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubble-ellipses-outline" size={60} color="#A0AEC0" />
            <Text style={styles.emptyText}>No chats available yet.</Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f9fc' },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    color: '#1f2937',
    marginVertical: 16,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  textContainer: { marginLeft: 12, flexShrink: 1 },
  name: { fontSize: 16, fontWeight: '600', color: '#1f2937' },
  preview: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 3,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    marginTop: 80,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 10,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default TailorChatListScreen;
