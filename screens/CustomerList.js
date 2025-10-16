import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

const CustomerList = ({ navigation }) => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        // ✅ Fetch only users with role = "customer"
        const q = query(collection(db, "users"), where("role", "==", "customer"));
        const querySnapshot = await getDocs(q);

        const list = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setCustomers(list);
      } catch (error) {
        console.error("Error fetching customers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  if (customers.length === 0) {
    return (
      <View style={styles.center}>
        <Ionicons name="people-outline" size={50} color="#ccc" />
        <Text style={styles.emptyText}>No customers found yet.</Text>
      </View>
    );
  }

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        navigation.navigate("CustomerMeasurementDetail", { userId: item.id })
      }
    >
      <Ionicons name="person-circle-outline" size={40} color="#007bff" />
      <View style={{ marginLeft: 10 }}>
        <Text style={styles.name}>{item.name || "Unnamed"}</Text>
        <Text style={styles.email}>{item.emailOrPhone || "No contact info"}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>👥 Customer List</Text>
      <FlatList
        data={customers}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#333",
    marginBottom: 15,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e3e6ea",
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2c3e50",
  },
  email: {
    fontSize: 13,
    color: "#7f8c8d",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    marginTop: 10,
    fontSize: 15,
    color: "#999",
  },
});

export default CustomerList;
