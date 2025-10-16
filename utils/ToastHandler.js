// utils/ToastHandler.js
import Toast from 'react-native-toast-message';
import { Alert } from 'react-native';

export const showInAppNotification = (title, message) => {
  try {
    Toast.show({
      type: 'info',
      text1: title,
      text2: message,
      position: 'top',
      visibilityTime: 3000,
      autoHide: true,
      topOffset: 55,
      text1Style: { fontWeight: 'bold', fontSize: 15 },
      text2Style: { fontSize: 13, color: '#444' },
    });
  } catch (err) {
    Alert.alert(title, message);
  }
};
