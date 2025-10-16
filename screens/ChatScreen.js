import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  Text,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import {
  collection,
  addDoc,
  onSnapshot,
  orderBy,
  query,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '../firebase/firebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const ChatScreen = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [customerId, setCustomerId] = useState(null);
  const flatListRef = useRef(null);

  useEffect(() => {
    const fetchUID = async () => {
      try {
        const uid = await AsyncStorage.getItem('uid');
        if (!uid) console.warn('⛔ UID not found in AsyncStorage');
        else setCustomerId(uid);
      } catch (e) {
        console.error('❌ Error reading UID from AsyncStorage:', e);
      }
    };
    fetchUID();
  }, []);

  const chatId = customerId ? [`customer_${customerId}`, 'tailor'].sort().join('_') : '';

  useEffect(() => {
    if (!customerId || !chatId) return;

    const chatRef = doc(db, 'chats', chatId);
    const setupChat = async () => {
      const chatDoc = await getDoc(chatRef);
      if (!chatDoc.exists()) {
        await setDoc(chatRef, {
          customerId: `customer_${customerId}`,
          tailorId: 'tailor',
          lastUpdated: serverTimestamp(),
          lastMessage: '',
        });
      }
    };
    setupChat();

    const q = query(collection(db, 'chats', chatId, 'messages'), orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
      scrollToBottom();
    });

    return () => unsubscribe();
  }, [customerId, chatId]);

  const sendMessage = async () => {
    if (input.trim() === '') return;
    if (!customerId || !chatId) return;

    await addDoc(collection(db, 'chats', chatId, 'messages'), {
      senderId: `customer_${customerId}`,
      message: input,
      createdAt: serverTimestamp(),
    });

    await setDoc(
      doc(db, 'chats', chatId),
      {
        lastUpdated: serverTimestamp(),
        lastMessage: input,
      },
      { merge: true }
    );

    setInput('');
  };

  const scrollToBottom = () => {
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <LinearGradient
        colors={['#4F46E5', '#03DAC6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}>
        <Text style={styles.headerTitle}>Chat with Tailor</Text>
        <Ionicons name="chatbubbles-outline" size={24} color="#fff" />
      </LinearGradient>

      {/* Chat + Input (Keyboard Safe) */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 70}>
        <LinearGradient
          colors={['#F9FBFD', '#FFFFFF']}
          style={{ flex: 1, paddingHorizontal: 12 }}>
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View
                style={[
                  styles.messageBubble,
                  item.senderId === `customer_${customerId}` ? styles.sent : styles.received,
                ]}>
                <Text
                  style={[
                    styles.messageText,
                    item.senderId === `customer_${customerId}`
                      ? styles.sentText
                      : styles.receivedText,
                  ]}>
                  {item.message}
                </Text>
              </View>
            )}
            contentContainerStyle={{ paddingVertical: 10, paddingBottom: 80 }}
            showsVerticalScrollIndicator={false}
          />
        </LinearGradient>

        {/* Input Bar */}
        <View style={styles.inputWrapper}>
          <View style={styles.inputContainer}>
            <TextInput
              placeholder="Type your message..."
              value={input}
              onChangeText={setInput}
              style={styles.input}
              placeholderTextColor="#999"
              multiline
            />
            <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
              <LinearGradient
                colors={['#4F46E5', '#03DAC6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.sendGradient}>
                <Ionicons name="send" size={20} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ChatScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F9FBFD' },
  flex: { flex: 1 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 8,
    shadowColor: '#4F46E5',
  },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#fff', letterSpacing: 0.3 },

  // Message Bubbles
  messageBubble: {
    marginVertical: 6,
    padding: 12,
    borderRadius: 18,
    maxWidth: width * 0.75,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
  },
  sent: {
    backgroundColor: '#E1E6FF',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 2,
  },
  received: {
    backgroundColor: '#E0F7FA',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 2,
  },
  messageText: { fontSize: 15, lineHeight: 20 },
  sentText: { color: '#1A1A1A' },
  receivedText: { color: '#333' },

  // Input Bar
  inputWrapper: {
    position: 'absolute',
    bottom: 10,
    width: '100%',
    paddingHorizontal: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 30,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 3 },
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 15,
    color: '#212121',
    maxHeight: 120,
  },
  sendButton: {
    borderRadius: 50,
    overflow: 'hidden',
    marginLeft: 6,
  },
  sendGradient: {
    padding: 10,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
