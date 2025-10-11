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
  serverTimestamp
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
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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

    await setDoc(doc(db, 'chats', chatId), {
      lastMessage: input,
      lastUpdated: serverTimestamp(),
    }, { merge: true });

    setInput('');
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <View style={[
                styles.bubble,
                item.senderId === 'tailor' ? styles.sent : styles.received
              ]}>
                <Text>{item.message}</Text>
              </View>
            )}
          />
          <View style={styles.inputContainer}>
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="Type a message..."
              style={styles.input}
              multiline
            />
            <TouchableOpacity onPress={sendMessage}>
              <Ionicons name="send" size={24} color="#2196F3" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  bubble: {
    padding: 12,
    marginVertical: 6,
    borderRadius: 12,
    maxWidth: '75%',
  },
  sent: {
    backgroundColor: '#DCF8C6',
    alignSelf: 'flex-end',
  },
  received: {
    backgroundColor: '#eee',
    alignSelf: 'flex-start',
  },
  inputContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 10,
    maxHeight: 100,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 18,
    fontWeight: 'bold'
  },
});

export default TailorChatScreen;
