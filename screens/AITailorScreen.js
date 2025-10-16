import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator, 
  ScrollView, 
  Alert 
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

const AITailorScreen = () => {
  const [imageUri, setImageUri] = useState(null);
  const [measurements, setMeasurements] = useState(null);
  const [styleAdvice, setStyleAdvice] = useState('');
  const [loading, setLoading] = useState(false);

  // 📸 Pick image from gallery
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please allow gallery access.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      setMeasurements(null);
      setStyleAdvice('');
      simulateAIProcessing();
    }
  };

  // 🧠 Simulate AI processing (offline)
  const simulateAIProcessing = () => {
    setLoading(true);
    setTimeout(() => {
      // Generate random realistic measurements
      const chest = (38 + Math.random() * 10).toFixed(1);
      const waist = (30 + Math.random() * 8).toFixed(1);
      const hips = (36 + Math.random() * 8).toFixed(1);
      const sleeve = (22 + Math.random() * 4).toFixed(1);
      const inseam = (30 + Math.random() * 4).toFixed(1);

      const fakeMeasurements = { chest, waist, hips, sleeve, inseam };
      setMeasurements(fakeMeasurements);

      // Generate advice
      const advice = generateStyleAdvice(fakeMeasurements);
      setStyleAdvice(advice);

      setLoading(false);
      Alert.alert("✅ Scan Complete", "Measurements and style advice generated!");
    }, 3000); // simulate 3-sec AI scan
  };

  // ✨ Generate Style Advice (based on body ratio logic)
  const generateStyleAdvice = ({ chest, waist, hips }) => {
    const chestNum = parseFloat(chest);
    const waistNum = parseFloat(waist);
    const hipsNum = parseFloat(hips);

    let advice = "Based on your proportions:\n";

    if (chestNum - waistNum > 8) {
      advice += "• You have a V-shaped body. Try slim-fit shirts and tapered pants.\n";
    } else if (hipsNum > chestNum) {
      advice += "• You have a pear shape. Darker lowers and structured jackets will balance your look.\n";
    } else if (Math.abs(chestNum - hipsNum) < 3) {
      advice += "• You have a balanced shape. Most regular fits will suit you well.\n";
    } else {
      advice += "• A classic fit style with soft fabrics will complement your proportions.\n";
    }

    advice += "\n👔 Recommended: Cotton or linen fabrics for daily wear.";
    return advice;
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>🤖 AI Tailor (Offline Mode)</Text>
      <Text style={styles.subtitle}>Upload your photo to simulate AI measurement & style advice.</Text>

      <TouchableOpacity style={styles.uploadBox} onPress={pickImage}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.image} />
        ) : (
          <>
            <Ionicons name="cloud-upload-outline" size={50} color="#999" />
            <Text style={styles.uploadText}>Tap to upload photo</Text>
          </>
        )}
      </TouchableOpacity>

      {loading && (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={styles.loadingText}>Analyzing your image...</Text>
        </View>
      )}

      {measurements && (
        <View style={styles.resultBox}>
          <Text style={styles.sectionTitle}>📏 Measurements (Estimated)</Text>
          {Object.entries(measurements).map(([key, val]) => (
            <Text key={key} style={styles.measureText}>
              {key}: <Text style={{ fontWeight: '700' }}>{val}"</Text>
            </Text>
          ))}
        </View>
      )}

      {styleAdvice !== '' && (
        <View style={styles.adviceBox}>
          <Text style={styles.sectionTitle}>💬 Style Advice</Text>
          <Text style={styles.adviceText}>{styleAdvice}</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#fff', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '700', color: '#2c3e50', marginTop: 10 },
  subtitle: { fontSize: 14, color: '#555', textAlign: 'center', marginBottom: 20 },
  uploadBox: {
    width: '90%',
    height: 220,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#ccc',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9f9f9',
  },
  uploadText: { color: '#888', marginTop: 10 },
  image: { width: '100%', height: '100%', borderRadius: 10 },
  loadingBox: { alignItems: 'center', marginTop: 20 },
  loadingText: { color: '#555', marginTop: 8 },
  resultBox: {
    width: '90%',
    marginTop: 20,
    backgroundColor: '#ecf5ff',
    padding: 15,
    borderRadius: 10,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#2c3e50', marginBottom: 8 },
  measureText: { fontSize: 15, color: '#333', marginBottom: 4 },
  adviceBox: {
    width: '90%',
    backgroundColor: '#f7f9fc',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  adviceText: { color: '#444', fontSize: 15, lineHeight: 22 },
});

export default AITailorScreen;
