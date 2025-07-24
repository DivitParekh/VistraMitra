import React from 'react';
import Onboarding from 'react-native-onboarding-swiper';
import { Image, StyleSheet, View, Text } from 'react-native';

const OnboardingScreen = ({ navigation }) => {
  const renderImage = (source) => (
    <View style={styles.imageWrapper}>
      <Image source={source} style={styles.image} />
    </View>
  );

  return (
    <Onboarding
      onSkip={() => navigation.replace('Login')}
      onDone={() => navigation.navigate('Login')}
      titleStyles={styles.title}
      subTitleStyles={styles.subtitle}
      pages={[
        {
          backgroundColor: '#fff',
          image: renderImage(require('../assets/home.png')),
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
  );
};

const styles = StyleSheet.create({
  imageWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: -10,
  },
  image: {
    width: 500,
    height: 500,
    resizeMode: 'contain',
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
