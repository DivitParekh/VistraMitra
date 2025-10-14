import React from 'react';
import { View, Image, StyleSheet, SafeAreaView } from 'react-native';
import Onboarding from 'react-native-onboarding-swiper';

const OnboardingScreen = ({ navigation }) => {
  // ✅ Reusable render function for image
  const renderImage = (source, small = false) => (
    <View style={styles.imageWrapper}>
      <Image
        source={source}
        style={[styles.image, small && { width: 250, height: 250 }]}
        resizeMode="contain"
      />
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <Onboarding
        onSkip={() => {
          try {
            navigation.replace('Login');
          } catch (e) {
            console.log('Navigation error (Skip):', e);
          }
        }}
        onDone={() => {
          try {
            navigation.navigate('Login');
          } catch (e) {
            console.log('Navigation error (Done):', e);
          }
        }}
        titleStyles={styles.title}
        subTitleStyles={styles.subtitle}
        pages={[
          {
            backgroundColor: '#fff',
            image: (
              <View style={styles.imageWrapper}>
                <Image
                  source={require('../assets/logo.jpg')}
                  style={styles.logo}
                  resizeMode="contain"
                />
                {renderImage(require('../assets/home.png'), true)}
              </View>
            ),
            title: 'Welcome to VastraMitra',
            subtitle: 'Your smart tailoring assistant for every need',
          },
          {
            backgroundColor: '#f7f7f7',
            image: renderImage(require('../assets/appointment.png')),
            title: 'Book Home Visit',
            subtitle: 'Tailor comes to your doorstep for measurements',
          },
          {
            backgroundColor: '#fff',
            image: renderImage(require('../assets/catalog.png')),
            title: 'Explore Catalog',
            subtitle: 'Select fabrics, designs, and styles easily',
          },
          {
            backgroundColor: '#f5f5f5',
            image: renderImage(require('../assets/track.png')),
            title: 'Track Your Orders',
            subtitle: 'Get real-time stitching and delivery updates',
          },
        ]}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  imageWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: -10,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  image: {
    width: 300,
    height: 300,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 22,
  },
});

export default OnboardingScreen;
