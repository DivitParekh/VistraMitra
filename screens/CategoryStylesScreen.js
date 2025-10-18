import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = width / 2 - 22;

/**
 * ✅ NOTE:
 * Folder structure must be:
 * VastraMitra/
 * ├── assets/
 * │    └── catalog/
 * │         ├── blouse/
 * │         ├── churidar/
 * │         ├── coatset/
 * │         ├── dress/
 * │         └── kurti/
 * └── screens/
 *      └── CategoryStylesScreen.js
 *
 * And all file names must be lowercase: 1.jpg, 2.jpg, etc.
 */

const categoryImages = {
  blouse: [
    require('../assets/catalog/blouse/1.jpg'),
    require('../assets/catalog/blouse/2.jpg'),
    require('../assets/catalog/blouse/3.jpg'),
    require('../assets/catalog/blouse/4.jpg'),
    require('../assets/catalog/blouse/5.jpg'),
    require('../assets/catalog/blouse/6.jpg'),
    require('../assets/catalog/blouse/7.jpg'),
    require('../assets/catalog/blouse/8.jpg'),
    require('../assets/catalog/blouse/9.jpg'),
  ],
  churidar: [
    require('../assets/catalog/churidar/1.jpg'),
    require('../assets/catalog/churidar/2.jpg'),
    require('../assets/catalog/churidar/3.jpg'),
    require('../assets/catalog/churidar/4.jpg'),
    require('../assets/catalog/churidar/5.jpg'),
    require('../assets/catalog/churidar/6.jpg'),
    require('../assets/catalog/churidar/7.jpg'),
    require('../assets/catalog/churidar/8.jpg'),
    require('../assets/catalog/churidar/9.jpg'),
  ],
  coatset: [
    require('../assets/catalog/coatset/1.jpg'),
    require('../assets/catalog/coatset/2.jpg'),
    require('../assets/catalog/coatset/3.jpg'),
    require('../assets/catalog/coatset/4.jpg'),
    require('../assets/catalog/coatset/5.jpg'),
    require('../assets/catalog/coatset/6.jpg'),
    require('../assets/catalog/coatset/7.jpg'),
    require('../assets/catalog/coatset/8.jpg'),
    require('../assets/catalog/coatset/9.jpg'),
  ],
  dress: [
    require('../assets/catalog/dress/1.jpg'),
    require('../assets/catalog/dress/2.jpg'),
    require('../assets/catalog/dress/3.jpg'),
    require('../assets/catalog/dress/4.jpg'),
    require('../assets/catalog/dress/5.jpg'),
    require('../assets/catalog/dress/6.jpg'),
    require('../assets/catalog/dress/7.jpg'),
    require('../assets/catalog/dress/8.jpg'),
    require('../assets/catalog/dress/9.jpg'),
  ],
  kurti: [
    require('../assets/catalog/kurti/1.jpg'),
    require('../assets/catalog/kurti/2.jpg'),
    require('../assets/catalog/kurti/3.jpg'),
    require('../assets/catalog/kurti/4.jpg'),
    require('../assets/catalog/kurti/5.jpg'),
    require('../assets/catalog/kurti/6.jpg'),
    require('../assets/catalog/kurti/7.jpg'),
    require('../assets/catalog/kurti/8.jpg'),
    require('../assets/catalog/kurti/9.jpg'),
  ],
};

const CategoryStylesScreen = ({ route }) => {
  const { categoryId, categoryName } = route.params;
  const images = categoryImages[categoryId] || [];
  const [savedStyles, setSavedStyles] = useState([]);

  // 🔹 Load saved styles from local storage
  useEffect(() => {
    (async () => {
      try {
        const data = await AsyncStorage.getItem('savedStyles');
        if (data) setSavedStyles(JSON.parse(data));
      } catch (error) {
        console.log('Failed to load saved styles:', error);
      }
    })();
  }, []);

  // 🔹 Save / Unsave an image style
  const toggleSaveStyle = async (img) => {
    const uri = Image.resolveAssetSource(img).uri;
    const updated = savedStyles.includes(uri)
      ? savedStyles.filter((item) => item !== uri)
      : [...savedStyles, uri];
    try {
      await AsyncStorage.setItem('savedStyles', JSON.stringify(updated));
      setSavedStyles(updated);
    } catch (error) {
      console.log('Failed to toggle save style:', error);
    }
  };

  const isSaved = (img) => {
    const uri = Image.resolveAssetSource(img).uri;
    return savedStyles.includes(uri);
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Image source={item} style={styles.image} />
      <TouchableOpacity
        style={styles.heartIcon}
        onPress={() => toggleSaveStyle(item)}
      >
        <Ionicons
          name={isSaved(item) ? 'heart' : 'heart-outline'}
          size={22}
          color={isSaved(item) ? '#E53935' : '#555'}
        />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#3F51B5', '#03DAC6']} style={styles.header}>
        <Text style={styles.headerTitle}>{categoryName} Styles</Text>
        <Ionicons name="color-palette-outline" size={24} color="#fff" />
      </LinearGradient>

      {/* Image Grid */}
      <FlatList
        data={images}
        numColumns={2}
        keyExtractor={(_, index) => index.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

export default CategoryStylesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    paddingVertical: 40,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 6,
    shadowColor: '#3F51B5',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
  },
  grid: {
    paddingHorizontal: 10,
    paddingTop: 20,
    paddingBottom: 80,
  },
  card: {
    flex: 1,
    margin: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  image: {
    width: '100%',
    height: ITEM_WIDTH * 1.3,
    borderRadius: 14,
  },
  heartIcon: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#FFFFFF',
    padding: 6,
    borderRadius: 20,
    elevation: 6,
    shadowColor: '#3F51B5',
  },
});
