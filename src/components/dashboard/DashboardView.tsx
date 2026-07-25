import React, { useState, useMemo } from 'react';
import {
  Users,
  DollarSign,
  Clock,
  CalendarCheck,
  Search,
  ArrowUpDown,
  Plus,
  Sparkles,
  ChevronRight,
  TrendingUp,
  CreditCard
} from 'lucide-react';
import { ProjectWithFinancials, Client, Payment } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Badge } from '../common/Badge';
import { Pagination } from '../common/Pagination';
import { useAuth } from '../../context/AuthContext';

interface DashboardViewProps {
  clients: Client[];
  projects: ProjectWithFinancials[];
  onOpenAddClient: () => void;
  onOpenAddProject: () => void;
  onSelectProject: (project: ProjectWithFinancials) => void;
  onSeedDemoData?: () => void;
  searchQuery: string;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  clients,
  projects,
  onOpenAddClient,
  onOpenAddProject,
  onSelectProject,
  onSeedDemoData,
  searchQuery,
}) => {
  const { settings } = useAuth();
  const [sortField, setSortField] = useState<'date' | 'amount' | 'clientName'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Calculate 4 summary metrics
  const totalClients = clients.length;

  const totalIncome = useMemo(() => {
    return projects.reduce((sum, p) => sum + p.totalReceived, 0);
  }, [projects]);

  const pendingAmount = useMemo(() => {
    return projects.reduce((sum, p) => sum + p.remainingAmount, 0);
  }, [projects]);

  const receivedThisMonth = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    let monthSum = 0;
    projects.forEach((p) => {
      p.payments?.forEach((pay) => {
        const payDate = new Date(pay.date);
        if (payDate.getFullYear() === currentYear && payDate.getMonth() === currentMonth) {
          monthSum += pay.amount;
        }
      });
    });
    return monthSum;
  }, [projects]);

  // Flatten all recent payments for display in recent payments table
  const recentPayments = useMemo(() => {
    const list: {
      id: string;
      clientName: string;
      projectName: string;
      amount: number;
      date: string;
      status: 'Paid' | 'Partial' | 'Unpaid';
      project: ProjectWithFinancials;
    }[] = [];

    projects.forEach((p) => {
      if (p.payments && p.payments.length > 0) {
        p.payments.forEach((pay) => {
          list.push({
            id: pay.id,
            clientName: p.clientName,
            projectName: p.projectName,
            amount: pay.amount,
            date: pay.date,
            status: p.status,
            project: p,
          });
        });
      }
    });

    return list;
  }, [projects]);

  // Filter & Sort recent payments
  const filteredPayments = useMemo(() => {
    return recentPayments
      .filter((pay) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          pay.clientName.toLowerCase().includes(q) ||
          pay.projectName.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        if (sortField === 'date') {
          return sortOrder === 'desc'
            ? new Date(b.date).getTime() - new Date(a.date).getTime()
            : new Date(a.date).getTime() - new Date(b.date).getTime();
        } else if (sortField === 'amount') {
          return sortOrder === 'desc' ? b.amount - a.amount : a.amount - b.amount;
        } else {
          return sortOrder === 'desc'
            ? b.clientName.localeCompare(a.clientName)
            : a.clientName.localeCompare(b.clientName);
        }
      });
  }, [recentPayments, searchQuery, sortField, sortOrder]);

  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
  const paginatedPayments = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredPayments.slice(start, start + itemsPerPage);
  }, [filteredPayments, currentPage]);

  const toggleSort = (field: 'date' | 'amount' | 'clientName') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="space-y-8">
      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Clients */}
        <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-sm">
          <p className="text-[#6B7280] text-sm font-medium mb-1">Total Clients</p>
          <div className="flex items-end justify-between">
            <span className="text-3xl font-bold text-[#111827]">{totalClients}</span>
            <span className="text-xs font-medium text-[#16A34A] bg-[#DCFCE7] px-2 py-1 rounded-full">Active</span>
          </div>
        </div>

        {/* Total Income */}
        <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-sm">
          <p className="text-[#6B7280] text-sm font-medium mb-1">Total Income</p>
          <div className="flex items-end justify-between">
            <span className="text-3xl font-bold text-[#111827]">
              {formatCurrency(totalIncome, settings?.currencySymbol)}
            </span>
            <span className="text-xs font-medium text-[#6B7280] bg-gray-100 px-2 py-1 rounded-full">Lifetime</span>
          </div>
        </div>

        {/* Pending Amount */}
        <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-sm">
          <p className="text-[#6B7280] text-sm font-medium mb-1">Pending Amount</p>
          <div className="flex items-end justify-between">
            <span className="text-3xl font-bold text-[#F59E0B]">
              {formatCurrency(pendingAmount, settings?.currencySymbol)}
            </span>
            <span className="text-xs font-medium text-[#F59E0B] bg-[#FEF3C7] px-2 py-1 rounded-full">
              {projects.filter(p => p.remainingAmount > 0).length} Active
            </span>
          </div>
        </div>

        {/* Received This Month */}
        <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-sm">
          <p className="text-[#6B7280] text-sm font-medium mb-1">Received (Month)</p>
          <div className="flex items-end justify-between">
            <span className="text-3xl font-bold text-[#16A34A]">
              {formatCurrency(receivedThisMonth, settings?.currencySymbol)}
            </span>
            <span className="text-xs font-medium text-[#16A34A] bg-[#DCFCE7] px-2 py-1 rounded-full">Current</span>
          </div>
        </div>
      </div>

      {/* Quick Action & Demo Seeding Callout if workspace is empty */}
      {clients.length === 0 && (
        <div className="p-6 rounded-2xl bg-gray-50 border border-[#E5E7EB] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-[#111827]">Welcome to your workspace!</h3>
            <p className="text-xs text-[#6B7280]">
              Start by adding your first client or populate sample designer projects with 1-click.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {onSeedDemoData && (
              <button
                onClick={onSeedDemoData}
                className="flex items-center gap-1.5 bg-white border border-[#E5E7EB] hover:bg-gray-100 text-[#111827] font-medium py-2 px-3.5 rounded-xl text-xs transition-all shadow-2xs"
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                <span>Load Sample Data</span>
              </button>
            )}
            <button
              onClick={onOpenAddClient}
              className="flex items-center gap-1.5 bg-[#111827] hover:bg-gray-800 text-white font-medium py-2 px-3.5 rounded-xl text-xs transition-all shadow-2xs"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add First Client</span>
            </button>
          </div>
        </div>
      )}

      {/* Recent Payments Section */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-[#E5E7EB] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold text-[#111827]">Recent Payments</h3>
            <p className="text-xs text-[#6B7280]">Chronological history of recorded partial payments</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenAddProject}
              className="flex items-center gap-1.5 bg-[#111827] hover:bg-gray-800 text-white font-medium py-1.5 px-3 rounded-xl text-xs transition-all shadow-2xs"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>New Project</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/80 border-b border-[#E5E7EB] text-[#6B7280] font-semibold uppercase tracking-wider">
              <tr>
                <th
                  onClick={() => toggleSort('clientName')}
                  className="px-5 py-3.5 cursor-pointer hover:text-[#111827] transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Client</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="px-5 py-3.5">Project</th>
                <th
                  onClick={() => toggleSort('amount')}
                  className="px-5 py-3.5 cursor-pointer hover:text-[#111827] transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Amount</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('date')}
                  className="px-5 py-3.5 cursor-pointer hover:text-[#111827] transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Date</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {paginatedPayments.length > 0 ? (
                paginatedPayments.map((pay) => (
                  <tr
                    key={pay.id}
                    className="hover:bg-gray-50/80 transition-colors group"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold shrink-0">
                          {pay.clientName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                        </div>
                        <span className="font-semibold text-[#111827]">{pay.clientName}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-[#6B7280] font-medium">
                      {pay.projectName}
                    </td>
                    <td className="px-5 py-4 font-bold text-[#16A34A]">
                      + {formatCurrency(pay.amount, settings?.currencySymbol)}
                    </td>
                    <td className="px-5 py-4 text-[#6B7280]">
                      {formatDate(pay.date)}
                    </td>
                    <td className="px-5 py-4">
                      <Badge status={pay.status} size="sm" />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => onSelectProject(pay.project)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#111827] hover:underline"
                      >
                        <span>Manage</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-[#6B7280]">
                    <CreditCard className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                    <p className="font-medium text-sm text-[#111827]">No payments recorded yet</p>
                    <p className="text-xs mt-1">
                      {searchQuery
                        ? 'No payments match your search query.'
                        : 'Record partial payments inside projects to see history here.'}
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
          totalItems={filteredPayments.length}
          itemsPerPage={itemsPerPage}
        />
      </div>
    </div>
  );
};
