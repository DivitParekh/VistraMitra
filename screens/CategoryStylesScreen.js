import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = width / 2 - 20;

// Image data (same as before)
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
    require('../assets/catalog/coatset/10.jpg'),
    require('../assets/catalog/coatset/11.jpg'),
    require('../assets/catalog/coatset/12.jpg'),
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
    require('../assets/catalog/dress/10.jpg'),
    require('../assets/catalog/dress/11.jpg'),
    require('../assets/catalog/dress/12.jpg'),
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
    require('../assets/catalog/kurti/10.jpg'),
    require('../assets/catalog/kurti/11.jpg'),
    require('../assets/catalog/kurti/12.jpg'),
    require('../assets/catalog/kurti/13.jpg'),
  ],
  lehenga: [
    require('../assets/catalog/lehenga/1.jpg'),
    require('../assets/catalog/lehenga/2.jpg'),
    require('../assets/catalog/lehenga/3.jpg'),
    require('../assets/catalog/lehenga/4.jpg'),
    require('../assets/catalog/lehenga/5.jpg'),
    require('../assets/catalog/lehenga/6.jpg'),
    require('../assets/catalog/lehenga/7.jpg'),
    require('../assets/catalog/lehenga/8.jpg'),
    require('../assets/catalog/lehenga/9.jpg'),
  ],
  palazzo: [
    require('../assets/catalog/palazzo/1.jpg'),
    require('../assets/catalog/palazzo/2.jpg'),
    require('../assets/catalog/palazzo/3.jpg'),
    require('../assets/catalog/palazzo/4.jpg'),
    require('../assets/catalog/palazzo/5.jpg'),
    require('../assets/catalog/palazzo/6.jpg'),
    require('../assets/catalog/palazzo/7.jpg'),
    require('../assets/catalog/palazzo/8.jpg'),
    require('../assets/catalog/palazzo/9.jpg'),
  ],
  punjabi: [
    require('../assets/catalog/punjabi/1.jpg'),
    require('../assets/catalog/punjabi/2.jpg'),
    require('../assets/catalog/punjabi/3.jpg'),
    require('../assets/catalog/punjabi/4.jpg'),
    require('../assets/catalog/punjabi/5.jpg'),
    require('../assets/catalog/punjabi/6.jpg'),
    require('../assets/catalog/punjabi/7.jpg'),
    require('../assets/catalog/punjabi/8.jpg'),
    require('../assets/catalog/punjabi/9.jpg'),
  ],
  saree: [
    require('../assets/catalog/saree/1.jpg'),
    require('../assets/catalog/saree/2.jpg'),
    require('../assets/catalog/saree/3.jpg'),
    require('../assets/catalog/saree/4.jpg'),
    require('../assets/catalog/saree/5.jpg'),
    require('../assets/catalog/saree/6.jpg'),
    require('../assets/catalog/saree/7.jpg'),
    require('../assets/catalog/saree/8.jpg'),
    require('../assets/catalog/saree/9.jpg'),
  ],
  sharara: [
    require('../assets/catalog/sharara/1.jpg'),
    require('../assets/catalog/sharara/2.jpg'),
    require('../assets/catalog/sharara/3.jpg'),
    require('../assets/catalog/sharara/4.jpg'),
    require('../assets/catalog/sharara/5.jpg'),
    require('../assets/catalog/sharara/6.jpg'),
    require('../assets/catalog/sharara/7.jpg'),
    require('../assets/catalog/sharara/8.jpg'),
    require('../assets/catalog/sharara/9.jpg'),
  ],
};

const CategoryStylesScreen = ({ route }) => {
  const { categoryId, categoryName } = route.params;
  const images = categoryImages[categoryId] || [];

  const [savedStyles, setSavedStyles] = useState([]);

  useEffect(() => {
    loadSavedStyles();
  }, []);

  const loadSavedStyles = async () => {
    try {
      const data = await AsyncStorage.getItem('savedStyles');
      if (data) {
        setSavedStyles(JSON.parse(data));
      }
    } catch (error) {
      console.log('Failed to load saved styles:', error);
    }
  };

  const toggleSaveStyle = async (img) => {
  const uri = Image.resolveAssetSource(img).uri;

  let updated;
  if (savedStyles.includes(uri)) {
    // 🔴 Remove from saved styles
    updated = savedStyles.filter(item => item !== uri);
  } else {
    // 🟢 Add to saved styles
    updated = [...savedStyles, uri];
  }

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

  const renderItem = ({ item }) => {
    const uri = Image.resolveAssetSource(item).uri;
    return (
      <View style={styles.card}>
        <Image source={item} style={styles.image} />
        <TouchableOpacity
          style={styles.heartIcon}
          onPress={() => toggleSaveStyle(item)}
        >
          <Ionicons
            name={isSaved(item) ? 'heart' : 'heart-outline'}
            size={22}
            color={isSaved(item) ? 'red' : 'black'}
          />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{categoryName} Styles</Text>
      <FlatList
        data={images}
        numColumns={2}
        keyExtractor={(_, index) => index.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.grid}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  grid: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  card: {
    position: 'relative',
    margin: 5,
  },
  image: {
    width: ITEM_WIDTH,
    height: ITEM_WIDTH * 1.3,
    borderRadius: 10,
  },
  heartIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#fff',
    padding: 5,
    borderRadius: 20,
    elevation: 4,
  },
});

export default CategoryStylesScreen;
