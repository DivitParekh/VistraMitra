import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const CustomerMeasurementDetail = ({ route }) => {
  const { customer } = route.params;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Measurements</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Name</Text>
        <Text style={styles.value}>{customer.fullName}</Text>

        <Text style={styles.label}>Phone</Text>
        <Text style={styles.value}>{customer.phone}</Text>

        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>{customer.email}</Text>

        <Text style={styles.label}>Height</Text>
        <Text style={styles.value}>{customer.height || 'N/A'}</Text>

        <Text style={styles.label}>Chest</Text>
        <Text style={styles.value}>{customer.chest || 'N/A'}</Text>

        <Text style={styles.label}>Waist</Text>
        <Text style={styles.value}>{customer.waist || 'N/A'}</Text>

        <Text style={styles.label}>Hips</Text>
        <Text style={styles.value}>{customer.hips || 'N/A'}</Text>

        {/* Add other measurement fields */}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fafafa', padding: 20 },
  header: { fontSize: 20, fontWeight: '700', marginBottom: 16, color: '#2c3e50' },
  card: { backgroundColor: '#fff', padding: 16, borderRadius: 12, elevation: 2 },
  label: { fontSize: 14, fontWeight: '600', color: '#555', marginTop: 10 },
  value: { fontSize: 16, color: '#2c3e50', marginTop: 4 },
});

export default CustomerMeasurementDetail;
