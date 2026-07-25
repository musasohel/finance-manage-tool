import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { Client } from '../types';

const COLLECTION = 'clients';

export const getClients = async (userId: string): Promise<Client[]> => {
  try {
    const q = query(
      collection(db, COLLECTION),
      where('userId', '==', userId)
    );
    const snap = await getDocs(q);
    const clients: Client[] = [];
    snap.forEach((docSnap) => {
      clients.push({ id: docSnap.id, ...docSnap.data() } as Client);
    });
    // Sort in memory by name or createdAt to avoid index requirements
    return clients.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
  } catch (error) {
    console.error('Error fetching clients:', error);
    return [];
  }
};

export const addClient = async (
  userId: string,
  clientData: Omit<Client, 'id' | 'userId' | 'createdAt'>
): Promise<Client> => {
  const newClient = {
    userId,
    name: clientData.name.trim(),
    company: (clientData.company || '').trim(),
    phone: clientData.phone.trim(),
    email: (clientData.email || '').trim(),
    notes: (clientData.notes || '').trim(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const docRef = await addDoc(collection(db, COLLECTION), newClient);
  return { id: docRef.id, ...newClient };
};

export const updateClient = async (
  id: string,
  clientData: Partial<Client>
): Promise<void> => {
  const docRef = doc(db, COLLECTION, id);
  await updateDoc(docRef, {
    ...clientData,
    updatedAt: new Date().toISOString()
  });
};

export const deleteClient = async (id: string): Promise<void> => {
  const docRef = doc(db, COLLECTION, id);
  await deleteDoc(docRef);
};
