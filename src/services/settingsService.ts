import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { BusinessSettings } from '../types';

export const DEFAULT_SETTINGS: Omit<BusinessSettings, 'userId'> = {
  businessName: 'Studio Design Co.',
  phone: '+880 1712 345678',
  email: 'designer@studio.com',
  address: 'Level 4, Creative Hub, Dhaka, Bangladesh',
  businessLogoUrl: '',
  authorizedSignatureUrl: '',
  signatoryName: 'Authorized Representative',
  signatoryTitle: 'Authorized Signatory',
  showSignatureOnInvoice: true,
  invoicePrefix: 'INV',
  nextInvoiceNumber: 1,
  currencySymbol: 'BDT'
};

export const getBusinessSettings = async (userId: string): Promise<BusinessSettings> => {
  try {
    const docRef = doc(db, 'settings', userId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as BusinessSettings;
    }
    // Return default settings if none saved yet
    const newSettings: BusinessSettings = {
      userId,
      ...DEFAULT_SETTINGS
    };
    await setDoc(docRef, newSettings);
    return newSettings;
  } catch (error) {
    console.error('Error getting business settings:', error);
    return { userId, ...DEFAULT_SETTINGS };
  }
};

export const updateBusinessSettings = async (userId: string, settings: Partial<BusinessSettings>): Promise<void> => {
  try {
    const docRef = doc(db, 'settings', userId);
    await setDoc(docRef, { ...settings, userId, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (error) {
    console.error('Error updating business settings:', error);
    throw error;
  }
};
