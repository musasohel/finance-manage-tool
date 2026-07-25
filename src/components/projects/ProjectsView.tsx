import React, { useState, useMemo } from 'react';
import {
  FolderKanban,
  Search,
  Plus,
  CreditCard,
  Download,
  Trash2,
  Edit3,
  ExternalLink,
  DollarSign,
  User,
  Calendar,
  Layers
} from 'lucide-react';
import { ProjectWithFinancials, Client, PaymentStatus } from '../../types';
import { formatCurrency, formatDate, formatInvoiceNumber } from '../../utils/formatters';
import { Badge } from '../common/Badge';
import { Pagination } from '../common/Pagination';
import { useAuth } from '../../context/AuthContext';

interface ProjectsViewProps {
  projects: ProjectWithFinancials[];
  clients: Client[];
  onOpenAddProject: () => void;
  onSelectProject: (project: ProjectWithFinancials) => void;
  onPreviewInvoice: (project: ProjectWithFinancials) => void;
  onRecordPayment: (project: ProjectWithFinancials) => void;
  onDeleteProject: (projectId: string) => void;
  onEditProject?: (project: ProjectWithFinancials) => void;
  searchQuery: string;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  projects,
  clients,
  onOpenAddProject,
  onSelectProject,
  onPreviewInvoice,
  onRecordPayment,
  onDeleteProject,
  onEditProject,
  searchQuery,
}) => {
  const { settings } = useAuth();
  const [statusFilter, setStatusFilter] = useState<'ALL' | PaymentStatus>('ALL');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Filter projects by search query and status filter
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      // Status filter
      if (statusFilter !== 'ALL' && p.status !== statusFilter) {
        return false;
      }
      // Search filter
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const formattedNum = formatInvoiceNumber(settings?.invoicePrefix, p.invoiceNumber).toLowerCase();
      return (
        p.projectName.toLowerCase().includes(q) ||
        p.clientName.toLowerCase().includes(q) ||
        p.service.toLowerCase().includes(q) ||
        formattedNum.includes(q) ||
        (p.invoiceNumber && p.invoiceNumber.toLowerCase().includes(q))
      );
    });
  }, [projects, searchQuery, statusFilter]);

  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
  const paginatedProjects = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProjects.slice(start, start + itemsPerPage);
  }, [filteredProjects, currentPage]);

  return (
    <div className="space-y-6">
      {/* Header Bar with Filters and Actions */}
      <div className="bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(['ALL', 'Unpaid', 'Partial', 'Paid'] as const).map((status) => (
            <button
              key={status}
              onClick={() => {
                setStatusFilter(status);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                statusFilter === status
                  ? 'bg-[#111827] text-white shadow-xs'
                  : 'bg-gray-100/80 text-[#6B7280] hover:text-[#111827] hover:bg-gray-200'
              }`}
            >
              {status === 'ALL' ? 'All Projects' : status}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="hidden sm:flex border border-[#E5E7EB] rounded-xl p-0.5 bg-gray-50">
            <button
              onClick={() => setViewMode('cards')}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors ${
                viewMode === 'cards' ? 'bg-white shadow-2xs text-[#111827]' : 'text-[#6B7280]'
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors ${
                viewMode === 'table' ? 'bg-white shadow-2xs text-[#111827]' : 'text-[#6B7280]'
              }`}
            >
              List
            </button>
          </div>

          <button
            onClick={onOpenAddProject}
            className="flex items-center justify-center gap-1.5 bg-[#111827] hover:bg-gray-800 text-white font-medium py-2 px-4 rounded-xl text-xs shadow-xs transition-all shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>New Project</span>
          </button>
        </div>
      </div>

      {/* Projects Container */}
      {paginatedProjects.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-12 text-center text-[#6B7280]">
          <Layers className="h-10 w-10 mx-auto text-gray-300 mb-3" />
          <p className="font-semibold text-base text-[#111827]">No projects found</p>
          <p className="text-xs mt-1 max-w-sm mx-auto">
            {searchQuery || statusFilter !== 'ALL'
              ? 'No projects match your active search or filters. Try clearing them.'
              : 'Add your first project to start tracking design deliverables and partial payments.'}
          </p>
          <button
            onClick={onOpenAddProject}
            className="mt-4 inline-flex items-center gap-1.5 bg-[#111827] text-white font-medium py-2 px-4 rounded-xl text-xs"
          >
            <Plus className="h-4 w-4" />
            <span>Create First Project</span>
          </button>
        </div>
      ) : viewMode === 'cards' ? (
        /* Card Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
          {paginatedProjects.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-2xs hover:border-gray-300 transition-all flex flex-col justify-between space-y-4"
            >
              {/* Top Row: Title & Badge */}
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider bg-gray-100 px-2 py-0.5 rounded-md">
                      {p.invoiceNumber && !p.invoiceDeleted ? formatInvoiceNumber(settings?.invoicePrefix, p.invoiceNumber) : 'No Invoice'}
                    </span>
                    <span className="text-xs text-[#6B7280]">• {p.service}</span>
                  </div>
                  <h3
                    onClick={() => onSelectProject(p)}
                    className="font-bold text-base text-[#111827] truncate hover:underline cursor-pointer"
                  >
                    {p.projectName}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-[#6B7280]">
                    <User className="h-3.5 w-3.5" />
                    <span className="font-medium text-[#111827]">{p.clientName}</span>
                  </div>
                </div>

                <Badge status={p.status} size="sm" />
              </div>

              {/* Middle Financial Bar */}
              <div className="bg-gray-50 border border-[#E5E7EB] rounded-xl p-3 grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-[10px] uppercase font-bold text-[#6B7280]">Total</p>
                  <p className="text-sm font-bold text-[#111827] mt-0.5">
                    {formatCurrency(p.totalPrice, settings?.currencySymbol)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-[#6B7280]">Received</p>
                  <p className="text-sm font-bold text-[#16A34A] mt-0.5">
                    {formatCurrency(p.totalReceived, settings?.currencySymbol)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-[#6B7280]">Remaining</p>
                  <p
                    className={`text-sm font-bold mt-0.5 ${
                      p.remainingAmount > 0 ? 'text-[#DC2626]' : 'text-[#16A34A]'
                    }`}
                  >
                    {formatCurrency(p.remainingAmount, settings?.currencySymbol)}
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-medium text-[#6B7280]">
                  <span>Payment Progress</span>
                  <span>
                    {Math.round((p.totalReceived / p.totalPrice) * 100 || 0)}% Paid
                  </span>
                </div>
                <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      p.status === 'Paid'
                        ? 'bg-[#16A34A]'
                        : p.status === 'Partial'
                        ? 'bg-[#F59E0B]'
                        : 'bg-gray-300'
                    }`}
                    style={{
                      width: `${Math.min(
                        100,
                        Math.round((p.totalReceived / p.totalPrice) * 100 || 0)
                      )}%`,
                    }}
                  />
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-2 border-t border-[#E5E7EB] flex items-center justify-between gap-2">
                <button
                  onClick={() => onSelectProject(p)}
                  className="text-xs font-semibold text-[#111827] hover:underline flex items-center gap-1"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>View Details</span>
                </button>

                <div className="flex items-center gap-1.5">
                  {p.remainingAmount > 0 && (
                    <button
                      onClick={() => onRecordPayment(p)}
                      title="Record Payment"
                      className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-[#16A34A] rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                    >
                      <CreditCard className="h-3.5 w-3.5" />
                      <span>Pay</span>
                    </button>
                  )}

                  <button
                    onClick={() => onPreviewInvoice(p)}
                    title="Invoice PDF"
                    className="px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-[#111827] rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>PDF</span>
                  </button>

                  {onEditProject && (
                    <button
                      onClick={() => onEditProject(p)}
                      title="Edit Project Info"
                      className="p-1.5 text-gray-500 hover:text-[#111827] hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                  )}

                  <button
                    onClick={() => onDeleteProject(p.id)}
                    title="Delete Project"
                    className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/80 border-b border-[#E5E7EB] text-[#6B7280] font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Project</th>
                  <th className="px-5 py-3.5">Client</th>
                  <th className="px-5 py-3.5">Service</th>
                  <th className="px-5 py-3.5">Date</th>
                  <th className="px-5 py-3.5">Total</th>
                  <th className="px-5 py-3.5">Received</th>
                  <th className="px-5 py-3.5">Remaining</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {paginatedProjects.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/80 transition-colors">
                    <td
                      onClick={() => onSelectProject(p)}
                      className="px-5 py-4 font-bold text-[#111827] cursor-pointer hover:underline"
                    >
                      {p.projectName}
                    </td>
                    <td className="px-5 py-4 text-[#111827] font-medium">{p.clientName}</td>
                    <td className="px-5 py-4 text-[#6B7280]">{p.service}</td>
                    <td className="px-5 py-4 text-[#6B7280]">{formatDate(p.createdDate)}</td>
                    <td className="px-5 py-4 font-bold text-[#111827]">
                      {formatCurrency(p.totalPrice, settings?.currencySymbol)}
                    </td>
                    <td className="px-5 py-4 font-semibold text-[#16A34A]">
                      {formatCurrency(p.totalReceived, settings?.currencySymbol)}
                    </td>
                    <td
                      className={`px-5 py-4 font-bold ${
                        p.remainingAmount > 0 ? 'text-[#DC2626]' : 'text-[#16A34A]'
                      }`}
                    >
                      {formatCurrency(p.remainingAmount, settings?.currencySymbol)}
                    </td>
                    <td className="px-5 py-4">
                      <Badge status={p.status} size="sm" />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {p.remainingAmount > 0 && (
                          <button
                            onClick={() => onRecordPayment(p)}
                            title="Record Payment"
                            className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-[#16A34A] rounded-md text-xs font-semibold"
                          >
                            Pay
                          </button>
                        )}
                        <button
                          onClick={() => onPreviewInvoice(p)}
                          title="Generate Invoice PDF"
                          className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-[#111827] rounded-md text-xs font-semibold"
                        >
                          PDF
                        </button>
                        {onEditProject && (
                          <button
                            onClick={() => onEditProject(p)}
                            title="Edit Project Info"
                            className="p-1 text-gray-500 hover:text-[#111827] hover:bg-gray-100 rounded-md"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => onDeleteProject(p.id)}
                          className="p-1 text-gray-400 hover:text-rose-600 rounded-md"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {filteredProjects.length > itemsPerPage && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={filteredProjects.length}
          itemsPerPage={itemsPerPage}
        />
      )}
    </div>
  );
};
