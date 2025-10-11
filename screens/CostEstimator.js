// components/CostEstimator.js
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { db } from "../firebase/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

const CostEstimator = ({ fabricOption, styleCategory, complexity = "Simple", onEstimate }) => {
  const [totalCost, setTotalCost] = useState(0);
  const [advance, setAdvance] = useState(0);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPricing = async () => {
      try {
        if (!styleCategory) {
          setLoading(false);
          return;
        }

        // Try both lowercase and capitalized document names
        const tryFetchPricing = async (category) => {
          const ref = doc(db, "pricing", category);
          const snap = await getDoc(ref);
          return snap.exists() ? snap.data() : null;
        };

        let data =
          (await tryFetchPricing(styleCategory)) ||
          (await tryFetchPricing(styleCategory.charAt(0).toUpperCase() + styleCategory.slice(1)));

        if (data) {
          // Read fields from Firestore document
          let base = data.basePrice || 0;
          let add = 0;

          if (complexity === "Simple") add = data.simpleAdd || 0;
          else if (complexity === "Medium") add = data.mediumAdd || 0;
          else if (complexity === "Heavy") add = data.heavyAdd || 0;

          const fabricExtra =
            fabricOption === "Tailor's Fabric" ? data.tailorFabricExtra || 0 : 0;

          const total = base + add + fabricExtra;
          const adv = Math.round(total * 0.3);
          const bal = total - adv;

          setTotalCost(total);
          setAdvance(adv);
          setBalance(bal);

          // Send result to parent component (AppointmentScreen)
          onEstimate?.({ totalCost: total, advance: adv, balance: bal });
        } else {
          console.warn(`⚠️ No pricing found for ${styleCategory}`);
          setTotalCost(0);
          setAdvance(0);
          setBalance(0);
        }
      } catch (error) {
        console.error("❌ Error fetching pricing:", error);
        setTotalCost(0);
        setAdvance(0);
        setBalance(0);
      } finally {
        setLoading(false);
      }
    };

    fetchPricing();
  }, [styleCategory, complexity, fabricOption]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="small" color="#5DA3FA" />
        <Text style={styles.label}>Fetching cost...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>💰 Estimated Cost</Text>

      <View style={styles.row}>
        <Ionicons name="pricetag-outline" size={18} color="#2c3e50" />
        <Text style={styles.label}>Total: ₹{totalCost}</Text>
      </View>

      <View style={styles.row}>
        <Ionicons name="cash-outline" size={18} color="#27ae60" />
        <Text style={styles.label}>Advance (30%): ₹{advance}</Text>
      </View>

      <View style={styles.row}>
        <Ionicons name="card-outline" size={18} color="#e67e22" />
        <Text style={styles.label}>Balance: ₹{balance}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    elevation: 2,
  },
  heading: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2c3e50",
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  label: {
    marginLeft: 8,
    fontSize: 14,
    color: "#333",
    fontWeight: "600",
  },
});

export default CostEstimator;
