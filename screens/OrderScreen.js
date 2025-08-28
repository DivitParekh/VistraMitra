import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

const createOrder = async (orderData) => {
  try {
    // 1. Save the order
    const orderRef = await addDoc(collection(db, 'orders'), {
      ...orderData,
      status: 'Confirmed',
      createdAt: serverTimestamp(),
    });

    const orderId = orderRef.id;

    // 2. Auto-generate tasks for this order
    const stages = ['Cutting', 'Stitching', 'Handwork', 'Packaging'];

    for (const stage of stages) {
      await addDoc(collection(db, 'taskManager'), {
        title: stage,
        customerName: orderData.customerName,
        orderId: orderId,
        status: 'Pending',
        createdAt: serverTimestamp(),
      });
    }

    console.log('✅ Order & tasks created successfully');
  } catch (error) {
    console.error('❌ Error creating order & tasks:', error);
  }
};
    