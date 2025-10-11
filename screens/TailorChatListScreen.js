import React, { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { collection, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';


const TailorChatListScreen = () => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'chats'), async (snapshot) => {
      const chatData = await Promise.all(snapshot.docs.map(async (docSnap) => {
        const data = docSnap.data();
        const customerId = data.customerId;

        console.log('Fetching user for ID:', customerId);

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
      }));

      // Optional: sort by lastUpdated descending
      const sortedChats = chatData.sort((a, b) =>
        (b.lastUpdated?.toMillis?.() || 0) - (a.lastUpdated?.toMillis?.() || 0)
      );

      setChats(sortedChats);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        navigation.navigate('TailorChatScreen', { customerId: item.customerId })
      }>
      <Text style={styles.name}>{item.customerName}</Text>
      <Text style={styles.preview}>{item.lastMessage || 'No messages yet'}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return (
    <FlatList
      data={chats}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={styles.list}
      ListEmptyComponent={<Text style={styles.empty}>No chats available.</Text>}
    />
  );
};

const styles = StyleSheet.create({
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 10,
    elevation: 3,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  preview: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
  empty: {
    textAlign: 'center',
    marginTop: 40,
    color: '#888',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default TailorChatListScreen;
