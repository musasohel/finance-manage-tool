import React, { useState, useMemo } from 'react';
import {
  FileText,
  Search,
  Plus,
  ArrowUpDown,
  Download,
  CreditCard,
  ChevronRight,
  Filter,
  CheckCircle2,
  Trash2
} from 'lucide-react';
import { ProjectWithFinancials, Client, PaymentStatus } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Badge } from '../common/Badge';
import { Pagination } from '../common/Pagination';
import { useAuth } from '../../context/AuthContext';

interface InvoicesViewProps {
  projects: ProjectWithFinancials[];
  clients: Client[];
  onOpenAddProject: () => void;
  onSelectProject: (project: ProjectWithFinancials) => void;
  onPreviewInvoice: (project: ProjectWithFinancials) => void;
  onRecordPayment: (project: ProjectWithFinancials) => void;
  onDeleteProject: (projectId: string) => void;
  searchQuery: string;
}

export const InvoicesView: React.FC<InvoicesViewProps> = ({
  projects,
  clients,
  onOpenAddProject,
  onSelectProject,
  onPreviewInvoice,
  onRecordPayment,
  onDeleteProject,
  searchQuery,
}) => {
  const { settings } = useAuth();
  const [statusFilter, setStatusFilter] = useState<'ALL' | PaymentStatus>('ALL');
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
      return (
        p.projectName.toLowerCase().includes(q) ||
        p.clientName.toLowerCase().includes(q) ||
        p.service.toLowerCase().includes(q) ||
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
      {/* Filters & Action Header */}
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
              {status === 'ALL' ? 'All Invoices' : status}
            </button>
          ))}
        </div>

        <button
          onClick={onOpenAddProject}
          className="flex items-center justify-center gap-1.5 bg-[#111827] hover:bg-gray-800 text-white font-medium py-2 px-4 rounded-xl text-xs shadow-xs transition-all shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>New Project Invoice</span>
        </button>
      </div>

      {/* Invoices List Table */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/80 border-b border-[#E5E7EB] text-[#6B7280] font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Invoice #</th>
                <th className="px-5 py-3.5">Client & Project</th>
                <th className="px-5 py-3.5">Date</th>
                <th className="px-5 py-3.5">Total Price</th>
                <th className="px-5 py-3.5">Received</th>
                <th className="px-5 py-3.5">Remaining</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {paginatedProjects.length > 0 ? (
                paginatedProjects.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-5 py-4 font-bold text-[#111827]">
                      {p.invoiceNumber || 'INV-0001'}
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-[#111827]">{p.projectName}</p>
                      <p className="text-[11px] text-[#6B7280]">{p.clientName} • {p.service}</p>
                    </td>
                    <td className="px-5 py-4 text-[#6B7280]">
                      {formatDate(p.createdDate)}
                    </td>
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
                            className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-[#16A34A] rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                          >
                            <CreditCard className="h-3.5 w-3.5" />
                            <span>Pay</span>
                          </button>
                        )}

                        <button
                          onClick={() => onPreviewInvoice(p)}
                          title="Generate Invoice PDF"
                          className="px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-[#111827] rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                        >
                          <Download className="h-3.5 w-3.5 text-[#111827]" />
                          <span>PDF</span>
                        </button>

                        <button
                          onClick={() => onDeleteProject(p.id)}
                          title="Delete Project"
                          className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-[#6B7280]">
                    <FileText className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                    <p className="font-semibold text-sm text-[#111827]">No invoices found</p>
                    <p className="text-xs mt-1">
                      {searchQuery || statusFilter !== 'ALL'
                        ? 'Try clearing active filters or search terms.'
                        : 'Create a project to automatically generate project invoices.'}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={filteredProjects.length}
          itemsPerPage={itemsPerPage}
        />
      </div>
    </div>
  );
};
