// screens/CatalogScreen.js
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  FlatList,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const categories = [
  { id: 'blouse', name: 'Blouse', image: require('../assets/catalog/blouse/1.jpg') },
  { id: 'churidar', name: 'Churidar Suit', image: require('../assets/catalog/churidar/1.jpg') },
  { id: 'coatset', name: 'Coat Set', image: require('../assets/catalog/coatset/1.jpg') },
  { id: 'dress', name: 'Dress', image: require('../assets/catalog/dress/1.jpg') },
  { id: 'kurti', name: 'Kurti', image: require('../assets/catalog/kurti/1.jpg') },
  { id: 'lehenga', name: 'Lehenga', image: require('../assets/catalog/lehenga/1.jpg') },
  { id: 'palazzo', name: 'Palazzo Suit', image: require('../assets/catalog/palazzo/1.jpg') },
  { id: 'punjabi', name: 'Punjabi Dress', image: require('../assets/catalog/punjabi/1.jpg') },
  { id: 'saree', name: 'Saree', image: require('../assets/catalog/saree/1.jpg') },
  { id: 'sharara', name: 'Sharara', image: require('../assets/catalog/sharara/1.jpg') },
];

const CatalogScreen = ({ navigation }) => {
  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.9}
      onPress={() =>
        navigation.navigate('CategoryStylesScreen', {
          categoryId: item.id,
          categoryName: item.name,
        })
      }>
      <Image source={item.image} style={styles.image} />
      <View style={styles.cardFooter}>
        <Text style={styles.name}>{item.name}</Text>
        <Ionicons name="chevron-forward" size={18} color="#3F51B5" />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#3F51B5', '#03DAC6']} style={styles.header}>
        <Text style={styles.headerTitle}>Catalog</Text>
        <Ionicons name="shirt-outline" size={26} color="#fff" />
      </LinearGradient>

      {/* Catalog Grid */}
      <FlatList
        data={categories}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default CatalogScreen;

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
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
    elevation: 6,
    shadowColor: '#3F51B5',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
  },
  list: {
    paddingHorizontal: 10,
    paddingBottom: 100,
    paddingTop: 20,
  },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    margin: 8,
    borderRadius: 14,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#3F51B5',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  image: {
    width: '100%',
    height: width / 2.2,
    resizeMode: 'cover',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#f9f9f9',
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A237E',
  },
});
