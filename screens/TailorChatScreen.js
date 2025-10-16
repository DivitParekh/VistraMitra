import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
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
import { SafeAreaView } from 'react-native-safe-area-context';
import { db } from '../firebase/firebaseConfig';
import { Ionicons } from '@expo/vector-icons';

const TailorChatScreen = ({ route }) => {
  const customerId = route?.params?.customerId;

  if (!customerId) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>⚠️ Missing customer ID</Text>
      </View>
    );
  }

  const chatId = [customerId, 'tailor'].sort().join('_');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const flatListRef = useRef(null);

  useEffect(() => {
    const chatRef = doc(db, 'chats', chatId);

    const initChat = async () => {
      const exists = await getDoc(chatRef);
      if (!exists.exists()) {
        await setDoc(chatRef, {
          customerId,
          tailorId: 'tailor',
          lastUpdated: serverTimestamp(),
        });
      }
    };

    initChat();

    const q = query(
      collection(db, 'chats', chatId, 'messages'),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
      scrollToBottom();
    });

    return () => unsubscribe();
  }, []);

  const sendMessage = async () => {
    if (input.trim() === '') return;

    await addDoc(collection(db, 'chats', chatId, 'messages'), {
      senderId: 'tailor',
      message: input,
      createdAt: serverTimestamp(),
    });

    await setDoc(
      doc(db, 'chats', chatId),
      {
        lastMessage: input,
        lastUpdated: serverTimestamp(),
      },
      { merge: true }
    );

    setInput('');
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 70 : 0}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.container}>
            <FlatList
              ref={flatListRef}
              data={messages}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View
                  style={[
                    styles.messageBubble,
                    item.senderId === 'tailor' ? styles.sent : styles.received,
                  ]}>
                  <Text style={styles.messageText}>{item.message}</Text>
                </View>
              )}
              contentContainerStyle={styles.chatContainer}
              showsVerticalScrollIndicator={false}
            />

            <View style={styles.inputContainer}>
              <TextInput
                value={input}
                onChangeText={setInput}
                placeholder="Type a message..."
                style={styles.input}
                multiline
                placeholderTextColor="#999"
              />
              <TouchableOpacity onPress={sendMessage} activeOpacity={0.7}>
                <Ionicons name="send" size={26} color="#4C84FF" />
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f7f9fc' },
  container: {
    flex: 1,
    paddingHorizontal: 12,
    backgroundColor: '#f7f9fc',
  },
  chatContainer: {
    paddingVertical: 10,
  },
  messageBubble: {
    maxWidth: '75%',
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginVertical: 6,
    borderRadius: 18,
    elevation: 1,
  },
  sent: {
    backgroundColor: '#4C84FF20',
    alignSelf: 'flex-end',
    borderTopRightRadius: 4,
  },
  received: {
    backgroundColor: '#ffffff',
    alignSelf: 'flex-start',
    borderTopLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  messageText: {
    fontSize: 15,
    color: '#1f2937',
    lineHeight: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 30,
    marginBottom: 8,
    marginHorizontal: 6,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 4,
    elevation: 3,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#1f2937',
    backgroundColor: '#f1f5f9',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 10,
    maxHeight: 120,
  },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: 'red', fontSize: 18, fontWeight: 'bold' },
});

export default TailorChatScreen;
