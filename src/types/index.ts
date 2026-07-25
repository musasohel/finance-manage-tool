export type PaymentStatus = 'Unpaid' | 'Partial' | 'Paid';

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  createdAt?: string;
}

export interface BusinessSettings {
  userId: string;
  businessName: string;
  phone: string;
  email: string;
  address: string;
  businessLogoUrl: string; // Base64 or URL
  invoicePrefix: string; // default "INV"
  nextInvoiceNumber: number; // default 1
  currencySymbol: string; // e.g. "BDT", "$", "€", "£"
  updatedAt?: string;
}

export interface Client {
  id: string;
  userId: string;
  name: string;
  company?: string;
  phone: string;
  email?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Project {
  id: string;
  userId: string;
  clientId: string;
  clientName: string; // Denormalized for fast queries/views
  projectName: string;
  service: string; // e.g., "Logo Design", "Brand Guidelines", "UI/UX Design", "Social Media Graphics"
  totalPrice: number;
  createdDate: string; // YYYY-MM-DD
  status: PaymentStatus;
  invoiceNumber?: string; // e.g. "INV-0001"
  invoiceDeleted?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface Payment {
  id: string;
  userId: string;
  projectId: string;
  clientId: string;
  clientName?: string;
  projectName?: string;
  amount: number;
  date: string; // YYYY-MM-DD
  notes?: string;
  createdAt: string;
}

export interface ProjectWithFinancials extends Project {
  totalReceived: number;
  remainingAmount: number;
  payments: Payment[];
}

export interface RecentPaymentView {
  id: string;
  clientName: string;
  projectName: string;
  amount: number;
  date: string;
  status: PaymentStatus;
}

export interface DashboardStats {
  totalClients: number;
  totalIncome: number;
  pendingAmount: number;
  receivedThisMonth: number;
}
