import React, { useState, useMemo } from 'react';
import {
  User,
  Building,
  Phone,
  Mail,
  Plus,
  Search,
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
  FolderPlus,
  Trash2,
  Edit2,
  DollarSign,
  FileText,
  Clock,
  ShieldCheck,
  CreditCard
} from 'lucide-react';
import { Client, ProjectWithFinancials } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Badge } from '../common/Badge';
import { Pagination } from '../common/Pagination';
import { useAuth } from '../../context/AuthContext';

interface ClientsViewProps {
  clients: Client[];
  projects: ProjectWithFinancials[];
  onOpenAddClient: () => void;
  onEditClient: (client: Client) => void;
  onDeleteClient: (clientId: string) => void;
  onAddProjectForClient: (client: Client) => void;
  onSelectProject: (project: ProjectWithFinancials) => void;
  searchQuery: string;
}

export const ClientsView: React.FC<ClientsViewProps> = ({
  clients,
  projects,
  onOpenAddClient,
  onEditClient,
  onDeleteClient,
  onAddProjectForClient,
  onSelectProject,
  searchQuery,
}) => {
  const { settings } = useAuth();
  const [expandedClientId, setExpandedClientId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Filter clients by search query
  const filteredClients = useMemo(() => {
    return clients.filter((c) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        (c.company && c.company.toLowerCase().includes(q)) ||
        c.phone.includes(q) ||
        (c.email && c.email.toLowerCase().includes(q))
      );
    });
  }, [clients, searchQuery]);

  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);
  const paginatedClients = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredClients.slice(start, start + itemsPerPage);
  }, [filteredClients, currentPage]);

  const toggleExpand = (clientId: string) => {
    setExpandedClientId(expandedClientId === clientId ? null : clientId);
  };

  return (
    <div className="space-y-6">
      {/* Search Header & Action */}
      <div className="bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex-1 max-w-md relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#6B7280]" />
          <input
            type="text"
            placeholder="Search by client name, company, phone..."
            value={searchQuery}
            onChange={(e) => {}}
            className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-[#E5E7EB] rounded-xl text-xs text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#111827]/20 focus:bg-white"
          />
        </div>

        <button
          onClick={onOpenAddClient}
          className="flex items-center justify-center gap-1.5 bg-[#111827] hover:bg-gray-800 text-white font-medium py-2 px-4 rounded-xl text-xs shadow-xs transition-all shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Add Client</span>
        </button>
      </div>

      {/* Clients Cards Grid */}
      <div className="grid grid-cols-1 gap-4">
        {paginatedClients.length > 0 ? (
          paginatedClients.map((client) => {
            const clientProjects = projects.filter((p) => p.clientId === client.id);
            const totalClientPrice = clientProjects.reduce((sum, p) => sum + p.totalPrice, 0);
            const totalClientReceived = clientProjects.reduce((sum, p) => sum + p.totalReceived, 0);
            const totalClientRemaining = clientProjects.reduce((sum, p) => sum + p.remainingAmount, 0);
            const isExpanded = expandedClientId === client.id;

            return (
              <div
                key={client.id}
                className="bg-white rounded-2xl border border-[#E5E7EB] shadow-2xs transition-all overflow-hidden"
              >
                {/* Client Summary Header */}
                <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div className="h-10 w-10 rounded-xl bg-[#111827] text-white flex items-center justify-center font-bold text-sm shrink-0">
                      {client.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-[#111827] text-base truncate">
                          {client.name}
                        </h3>
                        {client.company && (
                          <span className="px-2 py-0.5 rounded-md bg-gray-100 text-[#6B7280] text-[11px] font-medium truncate">
                            {client.company}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#6B7280]">
                        <span className="flex items-center gap-1">
                          <Phone className="h-3.5 w-3.5 text-gray-400" />
                          {client.phone}
                        </span>
                        {client.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="h-3.5 w-3.5 text-gray-400" />
                            {client.email}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Financial Stats for Client */}
                  <div className="flex items-center justify-between md:justify-end gap-6 pt-3 md:pt-0 border-t md:border-0 border-[#E5E7EB]">
                    <div className="text-left md:text-right">
                      <p className="text-[10px] uppercase font-bold text-[#6B7280] tracking-wider">
                        Total / Received
                      </p>
                      <p className="text-xs font-semibold text-[#111827]">
                        {formatCurrency(totalClientReceived, settings?.currencySymbol)} /{' '}
                        <span className="text-[#6B7280]">
                          {formatCurrency(totalClientPrice, settings?.currencySymbol)}
                        </span>
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-[10px] uppercase font-bold text-[#6B7280] tracking-wider">
                        Due
                      </p>
                      <p
                        className={`text-xs font-bold ${
                          totalClientRemaining > 0 ? 'text-[#DC2626]' : 'text-[#16A34A]'
                        }`}
                      >
                        {formatCurrency(totalClientRemaining, settings?.currencySymbol)}
                      </p>
                    </div>

                    {/* Quick Action Menu */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onAddProjectForClient(client)}
                        title="New Project for Client"
                        className="p-2 text-[#111827] hover:bg-gray-100 rounded-xl transition-colors border border-[#E5E7EB]"
                      >
                        <FolderPlus className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => onEditClient(client)}
                        title="Edit Client"
                        className="p-2 text-[#6B7280] hover:text-[#111827] hover:bg-gray-100 rounded-xl transition-colors"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => onDeleteClient(client.id)}
                        title="Delete Client"
                        className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => toggleExpand(client.id)}
                        className="p-2 text-[#111827] bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors ml-1"
                      >
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Project Details Drawer */}
                {isExpanded && (
                  <div className="p-5 bg-gray-50/90 border-t border-[#E5E7EB] space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-[#111827] uppercase tracking-wider">
                        Projects & Payment Tracking ({clientProjects.length})
                      </h4>
                      <button
                        onClick={() => onAddProjectForClient(client)}
                        className="text-xs font-semibold text-[#111827] hover:underline flex items-center gap-1"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Add Project</span>
                      </button>
                    </div>

                    {clientProjects.length > 0 ? (
                      <div className="space-y-3">
                        {clientProjects.map((p) => (
                          <div
                            key={p.id}
                            className="p-4 bg-white rounded-xl border border-[#E5E7EB] shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-sm text-[#111827]">
                                  {p.projectName}
                                </span>
                                <Badge status={p.status} size="sm" />
                              </div>
                              <p className="text-xs text-[#6B7280]">
                                Service: <span className="text-[#111827] font-medium">{p.service}</span> • Date: {formatDate(p.createdDate)}
                              </p>
                            </div>

                            <div className="flex items-center justify-between md:justify-end gap-6">
                              <div className="text-left md:text-right">
                                <p className="text-[10px] text-[#6B7280]">Received / Total</p>
                                <p className="text-xs font-semibold text-[#111827]">
                                  {formatCurrency(p.totalReceived, settings?.currencySymbol)} /{' '}
                                  {formatCurrency(p.totalPrice, settings?.currencySymbol)}
                                </p>
                              </div>

                              <button
                                onClick={() => onSelectProject(p)}
                                className="px-3.5 py-1.5 bg-[#111827] hover:bg-gray-800 text-white rounded-xl text-xs font-medium transition-all shadow-2xs"
                              >
                                Manage Project
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-6 text-center text-[#6B7280] border border-dashed border-[#E5E7EB] rounded-xl bg-white">
                        <p className="text-xs">No projects created for this client yet.</p>
                        <button
                          onClick={() => onAddProjectForClient(client)}
                          className="mt-2 text-xs font-semibold text-[#111827] hover:underline inline-flex items-center gap-1"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          <span>Create First Project</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-12 text-center text-[#6B7280]">
            <User className="h-10 w-10 mx-auto text-gray-300 mb-2" />
            <h3 className="text-base font-semibold text-[#111827]">No Clients Found</h3>
            <p className="text-xs mt-1">
              {searchQuery
                ? 'No clients match your search filter.'
                : 'Get started by creating your first client account.'}
            </p>
            <button
              onClick={onOpenAddClient}
              className="mt-4 inline-flex items-center gap-1.5 bg-[#111827] hover:bg-gray-800 text-white font-medium py-2 px-4 rounded-xl text-xs shadow-xs transition-all"
            >
              <Plus className="h-4 w-4" />
              <span>Add New Client</span>
            </button>
          </div>
        )}
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        totalItems={filteredClients.length}
        itemsPerPage={itemsPerPage}
      />
    </div>
  );
};
