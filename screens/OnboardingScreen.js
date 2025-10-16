import React from 'react';
import {
  View,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import Onboarding from 'react-native-onboarding-swiper';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const OnboardingScreen = ({ navigation }) => {
  const GradientButton = ({ title, onPress }) => (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
      <LinearGradient
        colors={['#3F51B5', '#03DAC6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.buttonContainer}>
        <Text style={styles.buttonText}>{title}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderImage = (source) => (
    <View style={styles.imageCard}>
      <Image source={source} style={styles.image} resizeMode="contain" />
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <Onboarding
        showPagination
        bottomBarHighlight={false}
        onSkip={() => navigation.replace('Login')}
        onDone={() => navigation.navigate('Login')}
        SkipButtonComponent={(props) => <GradientButton {...props} title="Skip" />}
        NextButtonComponent={(props) => <GradientButton {...props} title="Next" />}
        DoneButtonComponent={(props) => <GradientButton {...props} title="Done" />}
        titleStyles={styles.title}
        subTitleStyles={styles.subtitle}
        pages={[
          {
            backgroundColor: '#FAFAFA',
            image: (
              <View style={styles.logoSection}>
                <Image
                  source={require('../assets/logo.jpg')}
                  style={styles.logo}
                  resizeMode="contain"
                />
                {renderImage(require('../assets/home.png'))}
              </View>
            ),
            title: 'Welcome to VastraMitra',
            subtitle: 'Your trusted partner for smart tailoring and style.',
          },
          {
            backgroundColor: '#FFFFFF',
            image: renderImage(require('../assets/appointment.png')),
            title: 'Book Home Visit',
            subtitle: 'Let our tailor come to your home for perfect fitting.',
          },
          {
            backgroundColor: '#FAFAFA',
            image: renderImage(require('../assets/catalog.png')),
            title: 'Explore Catalog',
            subtitle: 'Choose fabrics, designs, and styles with confidence.',
          },
          {
            backgroundColor: '#FFFFFF',
            image: renderImage(require('../assets/track.png')),
            title: 'Track Your Orders',
            subtitle: 'Stay updated on every step of your stitching journey.',
          },
        ]}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  logoSection: {
    alignItems: 'center',
  },
  logo: {
    width: width * 0.4,
    height: height * 0.12,
    marginBottom: 12,
    borderRadius: 20,
  },
  imageCard: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    width: width * 0.85,
    height: height * 0.45, // ⬆ Increased image height
    marginVertical: 15,
    elevation: 10,
    shadowColor: 'rgba(0,0,0,0.1)',
    shadowOpacity: 0.25,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 8 },
  },
  image: {
    width: '90%',
    height: '90%',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1A237E',
    textAlign: 'center',
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  subtitle: {
    fontSize: 17,
    color: '#424242',
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 23,
  },
  buttonContainer: {
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 25,
    marginHorizontal: 8,
    elevation: 4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
});

export default OnboardingScreen;
