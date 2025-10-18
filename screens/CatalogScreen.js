import React from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = width / 2 - 24;

const categories = [
  { id: 'blouse', name: 'Blouse', image: require('../assets/catalog/blouse/1.jpg') },
  { id: 'churidar', name: 'Churidar Suit', image: require('../assets/catalog/churidar/1.jpg') },
  { id: 'coatset', name: 'Coat Set', image: require('../assets/catalog/coatset/1.jpg') },
  { id: 'dress', name: 'Dress', image: require('../assets/catalog/dress/1.jpg') },
  { id: 'kurti', name: 'Kurti', image: require('../assets/catalog/kurti/1.jpg') },
  { id: 'lehenga', name: 'Lehenga', image: require('../assets/catalog/lehenga/1.jpg') },
  { id: 'palazzo', name: 'Palazzo', image: require('../assets/catalog/palazzo/1.jpg') },
  { id: 'punjabi', name: 'Punjabi', image: require('../assets/catalog/punjabi/1.jpg') },
  { id: 'saree', name: 'Saree', image: require('../assets/catalog/saree/1.jpg') },
  { id: 'sharara', name: 'Sharara', image: require('../assets/catalog/sharara/1.jpg') },
];

export default function CatalogScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <FlatList
        data={categories}
        numColumns={2}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() =>
              navigation.navigate('CategoryStyles', {
                categoryId: item.id,
                categoryName: item.name,
              })
            }
          >
            <Image source={item.image} style={styles.image} />
            <Text style={styles.title}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF', padding: 10 },
  card: {
    flex: 1,
    margin: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    alignItems: 'center',
    elevation: 4,
  },
  image: {
    width: ITEM_WIDTH,
    height: ITEM_WIDTH,
    borderRadius: 12,
    resizeMode: 'cover',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    paddingVertical: 6,
  },
});
