import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { Project, ProjectWithFinancials, Payment } from '../types';
import { getPaymentsForProject, calculateStatus } from './paymentService';
import { getBusinessSettings, updateBusinessSettings } from './settingsService';
import { formatInvoiceNumber } from '../utils/formatters';

const COLLECTION = 'projects';

export const getProjects = async (userId: string): Promise<Project[]> => {
  try {
    const q = query(
      collection(db, COLLECTION),
      where('userId', '==', userId)
    );
    const snap = await getDocs(q);
    const projects: Project[] = [];
    snap.forEach((docSnap) => {
      projects.push({ id: docSnap.id, ...docSnap.data() } as Project);
    });
    return projects.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
  } catch (error) {
    console.error('Error fetching projects:', error);
    return [];
  }
};

export const getProjectsWithFinancials = async (userId: string): Promise<ProjectWithFinancials[]> => {
  try {
    const projects = await getProjects(userId);
    const paymentsSnap = await getDocs(
      query(collection(db, 'payments'), where('userId', '==', userId))
    );
    const allPayments: Payment[] = [];
    paymentsSnap.forEach((doc) => {
      allPayments.push({ id: doc.id, ...doc.data() } as Payment);
    });

    return projects.map((p) => {
      const pPayments = allPayments.filter((pay) => pay.projectId === p.id);
      const totalReceived = pPayments.reduce((sum, pay) => sum + pay.amount, 0);
      const remainingAmount = Math.max(0, p.totalPrice - totalReceived);
      const calculatedStatus = calculateStatus(p.totalPrice, totalReceived);

      return {
        ...p,
        status: calculatedStatus,
        totalReceived,
        remainingAmount,
        payments: pPayments.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      };
    });
  } catch (error) {
    console.error('Error fetching projects with financials:', error);
    return [];
  }
};

export const addProject = async (
  userId: string,
  projectData: Omit<Project, 'id' | 'userId' | 'status' | 'createdAt'>
): Promise<Project> => {
  // Get business settings to auto-generate invoice number
  const settings = await getBusinessSettings(userId);
  const invoiceNum = settings.nextInvoiceNumber || 1;
  const invoiceNumber = formatInvoiceNumber(settings.invoicePrefix || 'INV', invoiceNum);

  const newProjectData = {
    userId,
    clientId: projectData.clientId,
    clientName: projectData.clientName,
    projectName: projectData.projectName.trim(),
    service: projectData.service.trim(),
    totalPrice: Number(projectData.totalPrice) || 0,
    createdDate: projectData.createdDate || new Date().toISOString().split('T')[0],
    status: 'Unpaid' as const,
    invoiceNumber,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const docRef = await addDoc(collection(db, COLLECTION), newProjectData);

  // Increment nextInvoiceNumber in settings
  await updateBusinessSettings(userId, { nextInvoiceNumber: invoiceNum + 1 });

  return { id: docRef.id, ...newProjectData };
};

export const updateProject = async (
  id: string,
  projectData: Partial<Project>
): Promise<void> => {
  const docRef = doc(db, COLLECTION, id);
  await updateDoc(docRef, {
    ...projectData,
    updatedAt: new Date().toISOString()
  });
};

export const deleteProject = async (id: string): Promise<void> => {
  const docRef = doc(db, COLLECTION, id);
  await deleteDoc(docRef);
};

export const deleteInvoice = async (projectId: string): Promise<void> => {
  const docRef = doc(db, COLLECTION, projectId);
  await updateDoc(docRef, {
    invoiceDeleted: true,
    invoiceNumber: '',
    updatedAt: new Date().toISOString()
  });
};

export const ensureProjectInvoice = async (
  userId: string,
  project: ProjectWithFinancials
): Promise<string> => {
  if (project.invoiceNumber && !project.invoiceDeleted) {
    return project.invoiceNumber;
  }
  const settings = await getBusinessSettings(userId);
  const invoiceNum = settings.nextInvoiceNumber || 1;
  const invoiceNumber = formatInvoiceNumber(settings.invoicePrefix || 'INV', invoiceNum);

  const docRef = doc(db, COLLECTION, project.id);
  await updateDoc(docRef, {
    invoiceNumber,
    invoiceDeleted: false,
    updatedAt: new Date().toISOString()
  });
  await updateBusinessSettings(userId, { nextInvoiceNumber: invoiceNum + 1 });
  return invoiceNumber;
};
