import {
  collection,
  doc,
  getDocs,
  addDoc,
  deleteDoc,
  query,
  where,
  updateDoc
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { Payment, PaymentStatus } from '../types';

const PAYMENTS_COLLECTION = 'payments';
const PROJECTS_COLLECTION = 'projects';

export const calculateStatus = (totalPrice: number, totalReceived: number): PaymentStatus => {
  if (totalPrice <= 0) return 'Paid';
  if (totalReceived <= 0) return 'Unpaid';
  if (totalReceived >= totalPrice) return 'Paid';
  return 'Partial';
};

export const getPaymentsForProject = async (userId: string, projectId: string): Promise<Payment[]> => {
  try {
    const q = query(
      collection(db, PAYMENTS_COLLECTION),
      where('userId', '==', userId),
      where('projectId', '==', projectId)
    );
    const snap = await getDocs(q);
    const payments: Payment[] = [];
    snap.forEach((docSnap) => {
      payments.push({ id: docSnap.id, ...docSnap.data() } as Payment);
    });
    // Sort chronological (oldest first or newest first)
    return payments.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  } catch (error) {
    console.error('Error fetching payments:', error);
    return [];
  }
};

export const getAllPaymentsForUser = async (userId: string): Promise<Payment[]> => {
  try {
    const q = query(
      collection(db, PAYMENTS_COLLECTION),
      where('userId', '==', userId)
    );
    const snap = await getDocs(q);
    const payments: Payment[] = [];
    snap.forEach((docSnap) => {
      payments.push({ id: docSnap.id, ...docSnap.data() } as Payment);
    });
    return payments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (error) {
    console.error('Error fetching all user payments:', error);
    return [];
  }
};

export const addPayment = async (
  userId: string,
  projectId: string,
  clientId: string,
  totalPrice: number,
  amount: number,
  date: string,
  notes?: string
): Promise<{ payment: Payment; newStatus: PaymentStatus; totalReceived: number }> => {
  // 1. Fetch current payments for project to prevent exceeding total price
  const existingPayments = await getPaymentsForProject(userId, projectId);
  const currentReceived = existingPayments.reduce((sum, p) => sum + p.amount, 0);
  const remaining = Math.max(0, totalPrice - currentReceived);

  if (amount > remaining) {
    throw new Error(`Payment amount (${amount}) cannot exceed remaining amount (${remaining})`);
  }

  // 2. Add payment doc
  const newPaymentData = {
    userId,
    projectId,
    clientId,
    amount,
    date: date || new Date().toISOString().split('T')[0],
    notes: (notes || '').trim(),
    createdAt: new Date().toISOString()
  };

  const docRef = await addDoc(collection(db, PAYMENTS_COLLECTION), newPaymentData);
  const newPayment: Payment = { id: docRef.id, ...newPaymentData };

  // 3. Recalculate status and update project doc
  const totalReceived = currentReceived + amount;
  const newStatus = calculateStatus(totalPrice, totalReceived);

  const projectRef = doc(db, PROJECTS_COLLECTION, projectId);
  await updateDoc(projectRef, {
    status: newStatus,
    updatedAt: new Date().toISOString()
  });

  return { payment: newPayment, newStatus, totalReceived };
};

export const deletePayment = async (
  userId: string,
  paymentId: string,
  projectId: string,
  totalPrice: number
): Promise<{ newStatus: PaymentStatus; totalReceived: number }> => {
  // Delete payment document
  await deleteDoc(doc(db, PAYMENTS_COLLECTION, paymentId));

  // Recalculate remaining payments
  const remainingPayments = await getPaymentsForProject(userId, projectId);
  const totalReceived = remainingPayments.reduce((sum, p) => sum + p.amount, 0);
  const newStatus = calculateStatus(totalPrice, totalReceived);

  const projectRef = doc(db, PROJECTS_COLLECTION, projectId);
  await updateDoc(projectRef, {
    status: newStatus,
    updatedAt: new Date().toISOString()
  });

  return { newStatus, totalReceived };
};
