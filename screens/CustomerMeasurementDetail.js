import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { db, auth } from "../firebase/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

const CustomerMeasurementDetail = ({ route }) => {
  const routeUserId = route?.params?.userId || null;
  const currentUser = auth.currentUser;
  const userId = routeUserId || currentUser?.uid;

  const [measurements, setMeasurements] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMeasurements = async () => {
      try {
        if (!userId) {
          Alert.alert("Error", "No user selected or logged in!");
          setLoading(false);
          return;
        }

        const ref = doc(db, "measurements", userId);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          setMeasurements(snap.data());
        } else {
          setMeasurements(null);
        }
      } catch (err) {
        Alert.alert("Error", "Failed to load measurements.");
      } finally {
        setLoading(false);
      }
    };

    fetchMeasurements();
  }, [userId]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3F51B5" />
        <Text style={styles.loadingText}>Loading measurements...</Text>
      </View>
    );
  }

  if (!measurements) {
    return (
      <View style={styles.center}>
        <Ionicons name="ruler-outline" size={40} color="#aaa" />
        <Text style={styles.noDataText}>No measurements recorded yet.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={["#3F51B5", "#03DAC6"]} style={styles.header}>
        <Text style={styles.headerTitle}>Measurement Details</Text>
        <MaterialCommunityIcons name="tape-measure" size={26} color="#fff" />
      </LinearGradient>

      {/* Measurements */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      >
        {Object.entries(measurements).map(([category, values]) => (
          <View key={category} style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="body-outline" size={22} color="#3F51B5" />
              <Text style={styles.categoryTitle}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Text>
            </View>

            <View style={styles.divider} />

            {Object.entries(values).map(([field, val]) => (
              <View key={field} style={styles.measureRow}>
                <Text style={styles.fieldText}>
                  {field.charAt(0).toUpperCase() + field.slice(1)}
                </Text>
                <Text style={styles.valueText}>{val} in</Text>
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default CustomerMeasurementDetail;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fbfd" },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 6,
    shadowColor: "#3F51B5",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#fff",
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    shadowColor: "#3F51B5",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  categoryTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#3F51B5",
    marginLeft: 8,
  },
  divider: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginVertical: 8,
  },
  measureRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  fieldText: { fontSize: 15, color: "#333", fontWeight: "500" },
  valueText: { fontSize: 15, color: "#444" },

  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 10, color: "#666", fontSize: 15 },
  noDataText: { marginTop: 8, color: "#777", fontSize: 16 },
});
