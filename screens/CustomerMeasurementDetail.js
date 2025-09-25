import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { db, auth } from "../firebase/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

const CustomerMeasurementDetail = () => {
  const [measurements, setMeasurements] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMeasurements = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        const ref = doc(db, "measurements", user.uid);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          setMeasurements(snap.data());
        }
      } catch (err) {
        console.error("Error fetching measurements:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMeasurements();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  }

  if (!measurements) {
    return (
      <View style={styles.center}>
        <Text style={{ fontSize: 16, color: "#777" }}>No measurements recorded yet.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>📏 My Measurements</Text>
      {Object.entries(measurements).map(([category, fields]) => (
        <View key={category} style={styles.card}>
          <Text style={styles.catTitle}>{category}</Text>
          {Object.entries(fields).map(([field, val]) => (
            <Text key={field} style={styles.item}>
              {field}: {val} in
            </Text>
          ))}
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 16 },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 16, textAlign: "center" },
  card: {
    backgroundColor: "#f9f9f9",
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
    elevation: 2,
  },
  catTitle: { fontSize: 18, fontWeight: "600", marginBottom: 8 },
  item: { fontSize: 14, marginBottom: 4, color: "#333" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});

export default CustomerMeasurementDetail;
