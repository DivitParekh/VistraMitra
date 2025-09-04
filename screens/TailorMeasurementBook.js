import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

const TailorMeasurementBook = ({ navigation }) => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMeasurements = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'measurements'));
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCustomers(data);
      } catch (err) {
        console.error('Error fetching measurements:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMeasurements();
  }, []);

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#5DA3FA" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Customer Measurements</Text>

      {customers.length === 0 ? (
        <Text style={styles.empty}>No measurements saved yet.</Text>
      ) : (
        customers.map((cust) => (
          <TouchableOpacity
            key={cust.id}
            style={styles.card}
            onPress={() => navigation.navigate('CustomerMeasurementDetail', { customer: cust })}
          >
            <Ionicons name="person-circle-outline" size={28} color="#4e4e4e" />
            <View style={{ marginLeft: 12 }}>
              <Text style={styles.name}>{cust.fullName || 'Unnamed Customer'}</Text>
              <Text style={styles.sub}>📞 {cust.phone || 'N/A'}</Text>
              <Text style={styles.sub}>✉️ {cust.email || 'N/A'}</Text>
            </View>
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fafafa', padding: 20 },
  header: { fontSize: 20, fontWeight: '700', marginBottom: 16, color: '#2c3e50' },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { textAlign: 'center', marginTop: 30, fontSize: 16, color: '#888' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 3,
  },
  name: { fontSize: 16, fontWeight: '600', color: '#2c3e50' },
  sub: { fontSize: 13, color: '#555', marginTop: 2 },
});

export default TailorMeasurementBook;
