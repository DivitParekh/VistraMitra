import React, { useEffect, useState } from 'react';
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

const ITEM_WIDTH = Dimensions.get('window').width / 2 - 22;

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

  const renderStyle = ({ item }) => (
    <View style={styles.card}>
      <Image source={{ uri: item }} style={styles.image} />
      <LinearGradient
        colors={['rgba(0,0,0,0.2)', 'transparent']}
        style={styles.overlay}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <LinearGradient
        colors={['#4C84FF', '#70A1FF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Saved Styles</Text>
        <Ionicons name="heart" size={26} color="#fff" />
      </LinearGradient>

      {/* Content */}
      <View style={styles.container}>
        {savedStyles.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="heart-outline" size={60} color="#9ca3af" />
            <Text style={styles.emptyTitle}>No Saved Styles</Text>
            <Text style={styles.emptySubtitle}>
              You haven’t saved any designs yet. Browse the catalog and tap the
              heart icon to add your favorites.
            </Text>
          </View>
        ) : (
          <FlatList
            data={savedStyles}
            numColumns={2}
            keyExtractor={(item, index) => item + index}
            renderItem={renderStyle}
            contentContainerStyle={styles.grid}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default SavedStylesScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f7f9fc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    paddingHorizontal: 22,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 8,
    shadowColor: '#4C84FF',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
  container: {
    flex: 1,
    paddingTop: 10,
    backgroundColor: '#f7f9fc',
  },
  grid: {
    paddingHorizontal: 16,
    paddingBottom: 50,
    justifyContent: 'space-between',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    margin: 6,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    overflow: 'hidden',
  },
  image: {
    width: ITEM_WIDTH,
    height: ITEM_WIDTH * 1.3,
    borderRadius: 16,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 50,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    marginTop: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
});
