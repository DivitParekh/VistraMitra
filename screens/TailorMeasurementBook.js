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
import { db } from "../firebase/firebaseConfig";
import { collection, doc, setDoc, getDocs } from "firebase/firestore";
import { Picker } from "@react-native-picker/picker";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

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
    <SafeAreaView style={styles.safeArea}>
      {/* Gradient Header */}
      <LinearGradient
        colors={["#4C84FF", "#70A1FF"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Measurement Book</Text>
        <Ionicons name="resize-outline" size={24} color="#fff" />
      </LinearGradient>

      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Tailor Measurement Book</Text>

        {/* Customer Picker */}
        <Text style={styles.label}>Select Customer</Text>
        <View style={styles.pickerBox}>
          <Picker
            selectedValue={selectedCustomer}
            onValueChange={setSelectedCustomer}
            style={styles.picker}
          >
            <Picker.Item label="-- Select Customer --" value={null} />
            {customers.map((c) => (
              <Picker.Item
                key={c.id}
                label={c.name || c.email || c.id}
                value={c.id}
              />
            ))}
          </Picker>
        </View>

        {/* Category Picker */}
        <Text style={styles.label}>Select Category</Text>
        <View style={styles.pickerBox}>
          <Picker
            selectedValue={category}
            onValueChange={setCategory}
            style={styles.picker}
          >
            {Object.keys(measurementFields).map((cat) => (
              <Picker.Item key={cat} label={cat} value={cat} />
            ))}
          </Picker>
        </View>

        {/* Input Fields */}
        {measurementFields[category].map((field) => (
          <View key={field} style={styles.group}>
            <Text style={styles.fieldLabel}>{field} (inches)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={inputs[field] ?? ""}
              onChangeText={(t) => onChangeField(field, t)}
              placeholder={`Enter ${field}`}
              placeholderTextColor="#9ca3af"
            />
          </View>
        ))}

        {/* Save Button */}
        <TouchableOpacity style={styles.saveBtn} onPress={saveMeasurements}>
          <Ionicons name="save-outline" size={20} color="#fff" />
          <Text style={styles.saveText}> Save Measurements</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default TailorMeasurementBook;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f7f9fc" },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 22,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 6,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
  },

  container: {
    flex: 1,
    backgroundColor: "#f7f9fc",
    paddingHorizontal: 18,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 20,
    color: "#1f2937",
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
    marginTop: 16,
    marginBottom: 6,
  },
  pickerBox: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    backgroundColor: "#fff",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 2,
  },
  picker: { height: 50, width: "100%" },
  group: { marginBottom: 14 },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 15,
    color: "#111827",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 1,
  },
  saveBtn: {
    flexDirection: "row",
    backgroundColor: "#4C84FF",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 4,
  },
  saveText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
    marginLeft: 5,
  },
});
