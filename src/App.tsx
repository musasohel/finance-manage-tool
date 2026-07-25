/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar, ActiveTab } from './components/layout/Sidebar';
import { Navbar } from './components/layout/Navbar';
import { DashboardView } from './components/dashboard/DashboardView';
import { ProjectsView } from './components/projects/ProjectsView';
import { ClientsView } from './components/clients/ClientsView';
import { InvoicesView } from './components/invoices/InvoicesView';
import { SettingsView } from './components/settings/SettingsView';
import { AuthModal } from './components/auth/AuthModal';
import { AddClientModal } from './components/clients/AddClientModal';
import { AddProjectModal } from './components/projects/AddProjectModal';
import { AddPaymentModal } from './components/payments/AddPaymentModal';
import { ProjectDetailModal } from './components/projects/ProjectDetailModal';
import { InvoicePreviewModal } from './components/invoices/InvoicePreviewModal';

import { Client, ProjectWithFinancials, Project } from './types';
import { getClients, addClient, updateClient, deleteClient } from './services/clientService';
import { getProjectsWithFinancials, addProject, deleteProject } from './services/projectService';
import { addPayment, deletePayment } from './services/paymentService';
import { seedSampleData } from './services/demoDataService';

const MainContent: React.FC = () => {
  const { user, isGuestMode, loading, enableGuestMode } = useAuth();

  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isOpenMobile, setIsOpenMobile] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Data States
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<ProjectWithFinancials[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Modal States
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [isAddProjectOpen, setIsAddProjectOpen] = useState(false);
  const [preselectedClientId, setPreselectedClientId] = useState<string | undefined>(undefined);

  const [selectedProjectDetail, setSelectedProjectDetail] = useState<ProjectWithFinancials | null>(null);
  const [selectedProjectPayment, setSelectedProjectPayment] = useState<ProjectWithFinancials | null>(null);
  const [selectedProjectInvoice, setSelectedProjectInvoice] = useState<ProjectWithFinancials | null>(null);

  const activeUserId = user?.uid || (isGuestMode ? 'demo-guest-user' : null);

  // Load Data
  const loadWorkspaceData = useCallback(async () => {
    if (!activeUserId) {
      setClients([]);
      setProjects([]);
      setIsLoadingData(false);
      return;
    }

    try {
      setIsLoadingData(true);
      const [fetchedClients, fetchedProjects] = await Promise.all([
        getClients(activeUserId),
        getProjectsWithFinancials(activeUserId),
      ]);
      setClients(fetchedClients);
      setProjects(fetchedProjects);
    } catch (error) {
      console.error('Failed to load workspace data:', error);
    } finally {
      setIsLoadingData(false);
    }
  }, [activeUserId]);

  useEffect(() => {
    loadWorkspaceData();
  }, [loadWorkspaceData]);

  // Handle Client Add/Edit/Delete
  const handleSaveClient = async (clientData: Omit<Client, 'id' | 'userId' | 'createdAt'>) => {
    if (!activeUserId) return;
    if (editingClient) {
      await updateClient(editingClient.id, clientData);
    } else {
      await addClient(activeUserId, clientData);
    }
    setEditingClient(null);
    await loadWorkspaceData();
  };

  const handleDeleteClient = async (clientId: string) => {
    if (confirm('Are you sure you want to delete this client? Associated projects will remain in records.')) {
      await deleteClient(clientId);
      await loadWorkspaceData();
    }
  };

  // Handle Project Add/Delete
  const handleSaveProject = async (
    projectData: Omit<Project, 'id' | 'userId' | 'status' | 'createdAt'>
  ) => {
    if (!activeUserId) return;
    await addProject(activeUserId, projectData);
    await loadWorkspaceData();
  };

  const handleDeleteProject = async (projectId: string) => {
    if (confirm('Are you sure you want to delete this project?')) {
      await deleteProject(projectId);
      if (selectedProjectDetail?.id === projectId) {
        setSelectedProjectDetail(null);
      }
      await loadWorkspaceData();
    }
  };

  // Handle Payment Add/Delete
  const handleSavePayment = async (amount: number, date: string, notes?: string) => {
    if (!activeUserId || !selectedProjectPayment) return;
    await addPayment(
      activeUserId,
      selectedProjectPayment.id,
      selectedProjectPayment.clientId,
      selectedProjectPayment.totalPrice,
      amount,
      date,
      notes
    );
    setSelectedProjectPayment(null);
    await loadWorkspaceData();
  };

  const handleDeletePayment = async (paymentId: string) => {
    if (!activeUserId || !selectedProjectDetail) return;
    await deletePayment(activeUserId, paymentId, selectedProjectDetail.id, selectedProjectDetail.totalPrice);
    await loadWorkspaceData();
  };

  // Seed Sample Demo Data
  const handleSeedDemoData = async () => {
    if (!activeUserId) return;
    setIsLoadingData(true);
    await seedSampleData(activeUserId);
    await loadWorkspaceData();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="h-8 w-8 border-2 border-[#111827] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-[#111827]">Loading Client Ledger...</p>
        </div>
      </div>
    );
  }

  // If user is not logged in AND not in guest mode, show Auth Screen
  const showAuthScreen = !user && !isGuestMode;

  return (
    <div className="min-h-screen bg-white text-[#111827] flex font-sans antialiased selection:bg-gray-100">
      {/* Auth Screen Modal if required */}
      <AuthModal isOpen={showAuthScreen || isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

      {/* Main Layout */}
      {!showAuthScreen && (
        <div className="flex w-full min-h-screen">
          {/* Left Sidebar */}
          <Sidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            isOpenMobile={isOpenMobile}
            setIsOpenMobile={setIsOpenMobile}
          />

          {/* Right Main Body */}
          <div className="flex-1 flex flex-col min-w-0 bg-[#FAFAFA]">
            <Navbar
              activeTab={activeTab}
              setIsOpenMobile={setIsOpenMobile}
              onOpenAddClient={() => {
                setEditingClient(null);
                setIsAddClientOpen(true);
              }}
              onOpenAddProject={() => {
                setPreselectedClientId(undefined);
                setIsAddProjectOpen(true);
              }}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onOpenAuth={() => setIsAuthModalOpen(true)}
            />

            <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto">
              {isLoadingData ? (
                <div className="py-20 text-center">
                  <div className="h-6 w-6 border-2 border-[#111827] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-xs text-[#6B7280]">Updating workspace records...</p>
                </div>
              ) : (
                <>
                  {activeTab === 'dashboard' && (
                    <DashboardView
                      clients={clients}
                      projects={projects}
                      onOpenAddClient={() => {
                        setEditingClient(null);
                        setIsAddClientOpen(true);
                      }}
                      onOpenAddProject={() => {
                        setPreselectedClientId(undefined);
                        setIsAddProjectOpen(true);
                      }}
                      onSelectProject={(p) => setSelectedProjectDetail(p)}
                      onSeedDemoData={handleSeedDemoData}
                      searchQuery={searchQuery}
                    />
                  )}

                  {activeTab === 'projects' && (
                    <ProjectsView
                      projects={projects}
                      clients={clients}
                      onOpenAddProject={() => {
                        setPreselectedClientId(undefined);
                        setIsAddProjectOpen(true);
                      }}
                      onSelectProject={(p) => setSelectedProjectDetail(p)}
                      onPreviewInvoice={(p) => setSelectedProjectInvoice(p)}
                      onRecordPayment={(p) => setSelectedProjectPayment(p)}
                      onDeleteProject={handleDeleteProject}
                      searchQuery={searchQuery}
                    />
                  )}

                  {activeTab === 'clients' && (
                    <ClientsView
                      clients={clients}
                      projects={projects}
                      onOpenAddClient={() => {
                        setEditingClient(null);
                        setIsAddClientOpen(true);
                      }}
                      onEditClient={(client) => {
                        setEditingClient(client);
                        setIsAddClientOpen(true);
                      }}
                      onDeleteClient={handleDeleteClient}
                      onAddProjectForClient={(client) => {
                        setPreselectedClientId(client.id);
                        setIsAddProjectOpen(true);
                      }}
                      onSelectProject={(p) => setSelectedProjectDetail(p)}
                      searchQuery={searchQuery}
                    />
                  )}

                  {activeTab === 'invoices' && (
                    <InvoicesView
                      projects={projects}
                      clients={clients}
                      onOpenAddProject={() => {
                        setPreselectedClientId(undefined);
                        setIsAddProjectOpen(true);
                      }}
                      onSelectProject={(p) => setSelectedProjectDetail(p)}
                      onPreviewInvoice={(p) => setSelectedProjectInvoice(p)}
                      onRecordPayment={(p) => setSelectedProjectPayment(p)}
                      onDeleteProject={handleDeleteProject}
                      searchQuery={searchQuery}
                    />
                  )}

                  {activeTab === 'settings' && <SettingsView />}
                </>
              )}
            </main>
          </div>
        </div>
      )}

      {/* Global Modals */}
      <AddClientModal
        isOpen={isAddClientOpen}
        onClose={() => {
          setIsAddClientOpen(false);
          setEditingClient(null);
        }}
        onSubmit={handleSaveClient}
        initialData={editingClient}
      />

      <AddProjectModal
        isOpen={isAddProjectOpen}
        onClose={() => setIsAddProjectOpen(false)}
        clients={clients}
        onSubmit={handleSaveProject}
        preselectedClientId={preselectedClientId}
      />

      {selectedProjectPayment && (
        <AddPaymentModal
          isOpen={!!selectedProjectPayment}
          onClose={() => setSelectedProjectPayment(null)}
          project={selectedProjectPayment}
          onSubmit={handleSavePayment}
        />
      )}

      {selectedProjectDetail && (
        <ProjectDetailModal
          isOpen={!!selectedProjectDetail}
          onClose={() => setSelectedProjectDetail(null)}
          project={selectedProjectDetail}
          client={clients.find((c) => c.id === selectedProjectDetail.clientId)}
          onRecordPayment={(p) => setSelectedProjectPayment(p)}
          onDeletePayment={handleDeletePayment}
          onGenerateInvoice={(p) => setSelectedProjectInvoice(p)}
          onDeleteProject={handleDeleteProject}
        />
      )}

      {selectedProjectInvoice && (
        <InvoicePreviewModal
          isOpen={!!selectedProjectInvoice}
          onClose={() => setSelectedProjectInvoice(null)}
          project={selectedProjectInvoice}
          client={clients.find((c) => c.id === selectedProjectInvoice.clientId)}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainContent />
      <Analytics />
    </AuthProvider>
  );
}
