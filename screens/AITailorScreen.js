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
import { LinearGradient } from 'expo-linear-gradient';

const AITailorScreen = () => {
  const [imageUri, setImageUri] = useState(null);
  const [measurements, setMeasurements] = useState(null);
  const [styleAdvice, setStyleAdvice] = useState('');
  const [loading, setLoading] = useState(false);

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

  const simulateAIProcessing = () => {
    setLoading(true);
    setTimeout(() => {
      const chest = (38 + Math.random() * 10).toFixed(1);
      const waist = (30 + Math.random() * 8).toFixed(1);
      const hips = (36 + Math.random() * 8).toFixed(1);
      const sleeve = (22 + Math.random() * 4).toFixed(1);
      const inseam = (30 + Math.random() * 4).toFixed(1);

      const fakeMeasurements = { chest, waist, hips, sleeve, inseam };
      setMeasurements(fakeMeasurements);

      const advice = generateStyleAdvice(fakeMeasurements);
      setStyleAdvice(advice);
      setLoading(false);
      Alert.alert('✅ Scan Complete', 'Measurements and style advice generated!');
    }, 3000);
  };

  const generateStyleAdvice = ({ chest, waist, hips }) => {
    const chestNum = parseFloat(chest);
    const waistNum = parseFloat(waist);
    const hipsNum = parseFloat(hips);

    let advice = 'Based on your proportions:\n';

    if (chestNum - waistNum > 8) {
      advice += '• You have a V-shaped body. Try slim-fit shirts and tapered pants.\n';
    } else if (hipsNum > chestNum) {
      advice += '• You have a pear shape. Darker lowers and structured jackets will balance your look.\n';
    } else if (Math.abs(chestNum - hipsNum) < 3) {
      advice += '• You have a balanced shape. Most regular fits will suit you well.\n';
    } else {
      advice += '• A classic fit style with soft fabrics will complement your proportions.\n';
    }

    advice += '\n👔 Recommended: Cotton or linen fabrics for daily wear.';
    return advice;
  };

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <LinearGradient
        colors={['#4C84FF', '#70A1FF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>AI Tailor Assistant</Text>
        <Ionicons name="color-wand-outline" size={26} color="#fff" />
      </LinearGradient>

      {/* Body */}
      <View style={styles.container}>
        <Text style={styles.subtitle}>
          Upload your photo to generate estimated measurements and personalized style advice.
        </Text>

        <TouchableOpacity style={styles.uploadBox} onPress={pickImage}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.image} />
          ) : (
            <>
              <Ionicons name="cloud-upload-outline" size={54} color="#9ca3af" />
              <Text style={styles.uploadText}>Tap to upload your photo</Text>
            </>
          )}
        </TouchableOpacity>

        {loading && (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#4C84FF" />
            <Text style={styles.loadingText}>Analyzing your image...</Text>
          </View>
        )}

        {measurements && !loading && (
          <View style={styles.resultBox}>
            <Text style={styles.sectionTitle}>📏 Estimated Measurements</Text>
            {Object.entries(measurements).map(([key, val]) => (
              <Text key={key} style={styles.measureText}>
                {key.charAt(0).toUpperCase() + key.slice(1)}:{' '}
                <Text style={styles.valueText}>{val}"</Text>
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
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: { backgroundColor: '#f7f9fc', paddingBottom: 100 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 22,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
    elevation: 5,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
  },
  container: { alignItems: 'center', paddingHorizontal: 20, marginTop: 10 },
  subtitle: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    marginVertical: 12,
  },
  uploadBox: {
    width: '90%',
    height: 240,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#cbd5e1',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
    marginTop: 10,
  },
  uploadText: {
    color: '#6b7280',
    marginTop: 10,
    fontSize: 14,
    fontWeight: '500',
  },
  image: { width: '100%', height: '100%', borderRadius: 14 },
  loadingBox: { alignItems: 'center', marginTop: 20 },
  loadingText: { color: '#555', marginTop: 8, fontWeight: '500' },
  resultBox: {
    width: '90%',
    marginTop: 20,
    backgroundColor: '#ecf5ff',
    padding: 18,
    borderRadius: 14,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 10,
  },
  measureText: { fontSize: 15, color: '#333', marginBottom: 5 },
  valueText: { fontWeight: '700', color: '#1E40AF' },
  adviceBox: {
    width: '90%',
    backgroundColor: '#F4F8FF',
    padding: 16,
    borderRadius: 14,
    marginTop: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#4C84FF',
  },
  adviceText: { color: '#374151', fontSize: 15, lineHeight: 22 },
});

export default AITailorScreen;
