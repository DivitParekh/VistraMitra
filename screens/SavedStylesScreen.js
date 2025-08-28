import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ITEM_WIDTH = Dimensions.get('window').width / 2 - 20;

const SavedStylesScreen = () => {
  const [savedStyles, setSavedStyles] = useState([]);

  useEffect(() => {
    const fetchSavedStyles = async () => {
      try {
        const data = await AsyncStorage.getItem('savedStyles');
        if (data) {
          setSavedStyles(JSON.parse(data));
        }
      } catch (error) {
        console.log('Error loading saved styles:', error);
      }
    };

    fetchSavedStyles();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Saved Styles</Text>
      {savedStyles.length === 0 ? (
        <Text style={styles.emptyText}>You haven't saved any styles yet.</Text>
      ) : (
        <FlatList
          data={savedStyles}
          numColumns={2}
          keyExtractor={(item, index) => item + index}
          renderItem={({ item }) => (
            <Image source={{ uri: item }} style={styles.image} />
          )}
          contentContainerStyle={styles.grid}
        />
      )}
    </View>
  );
};

export default SavedStylesScreen;

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 20, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
  emptyText: { textAlign: 'center', marginTop: 40, fontSize: 16, color: '#777' },
  grid: { paddingHorizontal: 10, paddingBottom: 20 },
  image: {
    width: ITEM_WIDTH,
    height: ITEM_WIDTH * 1.3,
    borderRadius: 10,
    margin: 5,
  },
});
