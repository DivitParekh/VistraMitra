// screens/MeasurementBook.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "measurements"; // MUST match CustomerScreen

// Category → fields (all in cm)
const measurementFields = {
  Kurti: ["Chest", "Waist", "Hip", "Length"],
  Blouse: ["Bust", "Shoulder", "Armhole", "Sleeve Length"],
  Pant: ["Waist", "Hip", "Inseam", "Thigh"],
};

const MeasurementBook = ({ navigation }) => {
  const [category, setCategory] = useState("Kurti");
  const [allData, setAllData] = useState({});     // whole saved object from storage
  const [inputs, setInputs] = useState({});       // current category fields

  useEffect(() => {
    loadFromStorage();
  }, []);

  // Refresh when screen becomes active (e.g., after Delete All from home)
  useEffect(() => {
    const unsubscribe = navigation?.addListener("focus", loadFromStorage);
    return unsubscribe;
  }, [navigation]);

  const loadFromStorage = async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      setAllData(parsed);
      setInputs(parsed[category] || {}); // load current category values if any
    } catch (e) {
      console.log("Error loading measurements:", e);
      setAllData({});
      setInputs({});
    }
  };

  const onChangeField = (field, val) => {
    // Allow only numbers + dot, strip spaces
    const clean = val.replace(/[^0-9.]/g, "");
    setInputs((prev) => ({ ...prev, [field]: clean }));
  };

  const switchCategory = (next) => {
    setCategory(next);
    setInputs(allData[next] || {});
  };

  const saveCategory = async () => {
    try {
      // Remove empty fields so we store only provided entries
      const compact = Object.fromEntries(
        Object.entries(inputs).filter(([_, v]) => String(v || "").trim() !== "")
      );

      const updated = {
        ...allData,
        [category]: compact,
      };

      // If user cleared all fields, also clear the category
      if (Object.keys(compact).length === 0) {
        delete updated[category];
      }

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setAllData(updated);

      Alert.alert("Saved ✅", `${category} measurements saved`);
    } catch (e) {
      console.log("Error saving measurements:", e);
      Alert.alert("Error", "Could not save measurements. Try again.");
    }
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Measurement Book</Text>

      {/* Category Tabs */}
      <View style={styles.tabRow}>
        {Object.keys(measurementFields).map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.tab, category === cat && styles.tabActive]}
            onPress={() => switchCategory(cat)}
          >
            <Text style={[styles.tabText, category === cat && styles.tabTextActive]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Inputs */}
      <View style={styles.formBox}>
        {measurementFields[category].map((field) => (
          <View key={field} style={styles.group}>
            <Text style={styles.label}>{field} (cm)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={inputs[field] ?? ""}
              onChangeText={(t) => onChangeField(field, t)}
              placeholder={`Enter ${field} in cm`}
              returnKeyType="done"
            />
          </View>
        ))}
      </View>

      {/* Save */}
      <TouchableOpacity style={styles.saveBtn} onPress={saveCategory}>
        <Text style={styles.saveText}>💾 Save {category} Measurements</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 16 },
  title: { fontSize: 22, fontWeight: "700", textAlign: "center", marginBottom: 18 },

  tabRow: { flexDirection: "row", justifyContent: "space-around", marginBottom: 16 },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
  },
  tabActive: { backgroundColor: "#3498db" },
  tabText: { fontSize: 14, fontWeight: "600", color: "#555" },
  tabTextActive: { color: "#fff" },

  formBox: { marginBottom: 14 },
  group: { marginBottom: 12 },
  label: { fontSize: 14, fontWeight: "600", marginBottom: 6, color: "#333" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 10,
    fontSize: 14,
    backgroundColor: "#fafafa",
  },

  saveBtn: {
    backgroundColor: "#27ae60",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 6,
  },
  saveText: { color: "#fff", fontWeight: "700", fontSize: 16 },

  note: {
    marginTop: 10,
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
});

export default MeasurementBook;
