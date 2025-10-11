import React from 'react';
import Onboarding from 'react-native-onboarding-swiper';
import { Image, StyleSheet, View } from 'react-native';



const OnboardingScreen = ({ navigation }) => {
  // Reusable render function for image (without logo)
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
          image: (
            <View style={styles.imageWrapper}>
              <Image source={require('../assets/logo.jpg')} style={styles.logo} />
              <Image source={require('../assets/home.png')} style={styles.image} />
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
    resizeMode: 'contain',
    marginBottom: 20,
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
