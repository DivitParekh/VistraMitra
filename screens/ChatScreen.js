import React, { useEffect, useState, useRef } from 'react';
import {
  View, TextInput, TouchableOpacity, FlatList, Text, StyleSheet
} from 'react-native';
import {
  collection, addDoc, onSnapshot, orderBy, query,
  doc, getDoc, setDoc, serverTimestamp
} from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '../firebase/firebaseConfig';
import { Ionicons } from '@expo/vector-icons';

const ChatScreen = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [customerId, setCustomerId] = useState(null);
  const flatListRef = useRef(null);

  useEffect(() => {
    const fetchUID = async () => {
      try {
        const uid = await AsyncStorage.getItem('uid');
        if (!uid) {
          console.warn('⛔ UID not found in AsyncStorage');
        } else {
          console.log('✅ Got UID from AsyncStorage:', uid);
          setCustomerId(uid);
        }
      } catch (e) {
        console.error('❌ Error reading UID from AsyncStorage:', e);
      }
    };

    fetchUID();
  }, []);

  const chatId = customerId ? [`customer_${customerId}`, 'tailor'].sort().join('_') : '';

  useEffect(() => {
    console.log('💬 Current Chat ID:', chatId);
  }, [chatId]);

  useEffect(() => {
    if (!customerId || !chatId) return;

    const chatRef = doc(db, 'chats', chatId);

    const setupChat = async () => {
      try {
        const chatDoc = await getDoc(chatRef);
        if (!chatDoc.exists()) {
          await setDoc(chatRef, {
            customerId: `customer_${customerId}`,
            tailorId: 'tailor',
            lastUpdated: serverTimestamp(),
            lastMessage: '',
          });
          console.log('✅ Chat document created');
        }
      } catch (err) {
        console.error('❌ Error creating chat doc:', err);
      }
    };

    setupChat();

    const q = query(
      collection(db, 'chats', chatId, 'messages'),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(msgs);
      scrollToBottom();
    });

    return () => unsubscribe();
  }, [customerId, chatId]);

  const sendMessage = async () => {
    if (input.trim() === '') return;
    if (!customerId || !chatId) {
      console.warn('⛔ Cannot send message - UID or ChatID missing');
      return;
    }

    try {
      console.log('📤 Sending message...');
      await addDoc(collection(db, 'chats', chatId, 'messages'), {
        senderId: `customer_${customerId}`,
        message: input,
        createdAt: serverTimestamp(),
      });

      await setDoc(doc(db, 'chats', chatId), {
        lastUpdated: serverTimestamp(),
        lastMessage: input,
      }, { merge: true });

      console.log('✅ Message sent successfully');
      setInput('');
    } catch (error) {
      console.error('❌ Error sending message:', error);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[
            styles.messageBubble,
            item.senderId === `customer_${customerId}` ? styles.sent : styles.received
          ]}>
            <Text style={styles.messageText}>{item.message}</Text>
          </View>
        )}
      />
      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Type a message..."
          value={input}
          onChangeText={setInput}
          style={styles.input}
        />
        <TouchableOpacity onPress={sendMessage}>
          <Ionicons name="send" size={24} color="#2196F3" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: '#fff' },
  messageBubble: {
    marginVertical: 6,
    padding: 12,
    borderRadius: 10,
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
  messageText: { fontSize: 16 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 6,
    borderTopWidth: 1,
    borderColor: '#ccc',
  },
  input: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f1f1f1',
    borderRadius: 20,
    marginRight: 10,
  },
});

export default ChatScreen;
