// screens/CatalogScreen.js

import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, FlatList } from 'react-native';

const categories = [
  {
    id: 'blouse',
    name: 'Blouse',
    image: require('../assets/catalog/blouse/1.jpg'),
  },
  {
    id: 'churidar',
    name: 'Churidar Suit',
    image: require('../assets/catalog/churidar/1.jpg'),
  },
  {
    id: 'coatset',
    name: 'Coat Set',
    image: require('../assets/catalog/coatset/1.jpg'),
  },
  {
    id: 'dress',
    name: 'Dress',
    image: require('../assets/catalog/dress/1.jpg'),
  },
  {
    id: 'kurti',
    name: 'Kurti',
    image: require('../assets/catalog/kurti/1.jpg'),
  },
  {
    id: 'lehenga',
    name: 'Lehenga',
    image: require('../assets/catalog/lehenga/1.jpg'),
  },
  {
    id: 'palazzo',
    name: 'Palazzo Suit',
    image: require('../assets/catalog/palazzo/1.jpg'),
  },
  {
    id: 'punjabi',
    name: 'Punjabi Dress',
    image: require('../assets/catalog/punjabi/1.jpg'),
  },
  {
    id: 'saree',
    name: 'Saree',
    image: require('../assets/catalog/saree/1.jpg'),
  },
  {
    id: 'sharara',
    name: 'Sharara',
    image: require('../assets/catalog/sharara/1.jpg'),
  },
];

const CatalogScreen = ({ navigation }) => {
  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        navigation.navigate('CategoryStylesScreen', {
          categoryId: item.id,
          categoryName: item.name,
        })
      }
    >
      <Image source={item.image} style={styles.image} />
      <Text style={styles.name}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Catalog</Text>
      <FlatList
        data={categories}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

export default CatalogScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  list: {
    paddingHorizontal: 10,
  },
  card: {
    flex: 1,
    margin: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#f9f9f9',
  },
  image: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    padding: 10,
    textAlign: 'center',
  },
});
