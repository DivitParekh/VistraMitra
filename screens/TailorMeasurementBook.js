import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from "react-native";
import { db, auth } from "../firebase/firebaseConfig";
import { collection, doc, setDoc, getDocs } from "firebase/firestore";
import { Picker } from "@react-native-picker/picker"; // ✅ FIXED
import { SafeAreaView } from 'react-native-safe-area-context';

const measurementFields = {
  Kurti: ["Chest", "Waist", "Hip", "Length"],
  Blouse: ["Bust", "Shoulder", "Armhole", "Sleeve Length"],
  Pant: ["Waist", "Hip", "Inseam", "Thigh"],
};

const TailorMeasurementBook = () => {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [category, setCategory] = useState("Kurti");
  const [inputs, setInputs] = useState({});

  // 🔹 Load customers list
  useEffect(() => {
    const fetchUsers = async () => {
      const snap = await getDocs(collection(db, "users"));
      const users = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setCustomers(users);
    };
    fetchUsers();
  }, []);

  const onChangeField = (field, val) => {
    const clean = val.replace(/[^0-9.]/g, "");
    setInputs((prev) => ({ ...prev, [field]: clean }));
  };

  const saveMeasurements = async () => {
    if (!selectedCustomer) {
      return Alert.alert("Error", "Please select a customer first.");
    }

    try {
      const compact = Object.fromEntries(
        Object.entries(inputs).filter(([_, v]) => String(v || "").trim() !== "")
      );

      const ref = doc(db, "measurements", selectedCustomer);
      await setDoc(ref, { [category]: compact }, { merge: true });

      Alert.alert("✅ Saved", `${category} measurements for ${selectedCustomer}`);
    } catch (e) {
      console.error("Error saving:", e);
      Alert.alert("Error", "Could not save measurements.");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Tailor Measurement Book</Text>

      {/* Customer Picker */}
      <Text style={styles.label}>Select Customer</Text>
      <View style={styles.pickerBox}>
        <Picker selectedValue={selectedCustomer} onValueChange={setSelectedCustomer}>
          <Picker.Item label="-- Select Customer --" value={null} />
          {customers.map((c) => (
            <Picker.Item key={c.id} label={c.name || c.email || c.id} value={c.id} />
          ))}
        </Picker>
      </View>

      {/* Category Picker */}
      <Text style={styles.label}>Select Category</Text>
      <View style={styles.pickerBox}>
        <Picker selectedValue={category} onValueChange={setCategory}>
          {Object.keys(measurementFields).map((cat) => (
            <Picker.Item key={cat} label={cat} value={cat} />
          ))}
        </Picker>
      </View>

      {/* Fields */}
      {measurementFields[category].map((field) => (
        <View key={field} style={styles.group}>
          <Text style={styles.label}>{field} (inches)</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={inputs[field] ?? ""}
            onChangeText={(t) => onChangeField(field, t)}
            placeholder={`Enter ${field} in inches`}
          />
        </View>
      ))}

      <TouchableOpacity style={styles.saveBtn} onPress={saveMeasurements}>
        <Text style={styles.saveText}>💾 Save Measurements</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 16 },
  title: { fontSize: 22, fontWeight: "700", textAlign: "center", marginBottom: 18 },
  label: { fontSize: 14, fontWeight: "600", marginBottom: 6, color: "#333" },
  pickerBox: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: "#fafafa",
  },
  group: { marginBottom: 12 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    backgroundColor: "#fafafa",
  },
  saveBtn: {
    backgroundColor: "#27ae60",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  saveText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});

export default TailorMeasurementBook;
