import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  Edit,
  Download,
  CreditCard,
  Calendar,
  Clock,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import { ProjectWithFinancials, Client } from '../../types';
import { formatCurrency, formatDate, formatInvoiceNumber } from '../../utils/formatters';
import { Badge } from '../common/Badge';
import { useAuth } from '../../context/AuthContext';

interface ProjectDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: ProjectWithFinancials;
  client?: Client;
  onRecordPayment: (project: ProjectWithFinancials) => void;
  onDeletePayment: (paymentId: string) => Promise<void>;
  onGenerateInvoice: (project: ProjectWithFinancials) => void;
  onDeleteProject: (projectId: string) => void;
  onEditProject?: (project: ProjectWithFinancials) => void;
}

export const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({
  isOpen,
  onClose,
  project,
  client,
  onRecordPayment,
  onDeletePayment,
  onGenerateInvoice,
  onDeleteProject,
  onEditProject,
}) => {
  const { settings } = useAuth();
  const [deletingPaymentId, setDeletingPaymentId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDeletePayment = async (paymentId: string) => {
    try {
      setDeletingPaymentId(paymentId);
      await onDeletePayment(paymentId);
    } catch (err) {
      console.error('Failed to delete payment:', err);
    } finally {
      setDeletingPaymentId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-[#E5E7EB] p-6 space-y-6 my-6 transition-all">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[#E5E7EB]">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <h3 className="text-xl font-bold text-[#111827]">{project.projectName}</h3>
              <Badge status={project.status} size="md" />
            </div>
            <p className="text-xs text-[#6B7280]">
              Invoice #: <span className="font-semibold text-[#111827]">{project.invoiceNumber && !project.invoiceDeleted ? formatInvoiceNumber(settings?.invoicePrefix, project.invoiceNumber) : 'No Active Invoice'}</span> • Client: <span className="font-semibold text-[#111827]">{project.clientName}</span> • Service: {project.service} • Date: {formatDate(project.createdDate)}
              {project.dueDate && <> • Deadline: <span className="font-semibold text-[#111827]">{formatDate(project.dueDate)}</span></>}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#6B7280] hover:text-[#111827] hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Financial Summary Cards */}
        <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-gray-50 border border-[#E5E7EB]">
          <div>
            <p className="text-[10px] uppercase font-bold text-[#6B7280]">Total Price</p>
            <p className="text-base font-bold text-[#111827] mt-0.5">
              {formatCurrency(project.totalPrice, settings?.currencySymbol)}
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-[#6B7280]">Received</p>
            <p className="text-base font-bold text-[#16A34A] mt-0.5">
              {formatCurrency(project.totalReceived, settings?.currencySymbol)}
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-[#6B7280]">Remaining Due</p>
            <p
              className={`text-base font-bold mt-0.5 ${
                project.remainingAmount > 0 ? 'text-[#DC2626]' : 'text-[#16A34A]'
              }`}
            >
              {formatCurrency(project.remainingAmount, settings?.currencySymbol)}
            </p>
          </div>
        </div>

        {/* Payment History Breakdown */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-[#111827] uppercase tracking-wider">
              Payment History ({project.payments?.length || 0})
            </h4>

            {project.remainingAmount > 0 && (
              <button
                onClick={() => onRecordPayment(project)}
                className="flex items-center gap-1.5 bg-[#111827] hover:bg-gray-800 text-white font-medium py-1.5 px-3 rounded-xl text-xs transition-all shadow-xs"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Record Payment</span>
              </button>
            )}
          </div>

          <div className="border border-[#E5E7EB] rounded-xl overflow-hidden bg-white">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-[#E5E7EB] text-[#6B7280] font-semibold uppercase">
                <tr>
                  <th className="px-4 py-2.5">Date</th>
                  <th className="px-4 py-2.5">Note</th>
                  <th className="px-4 py-2.5 text-right">Amount</th>
                  <th className="px-4 py-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {project.payments && project.payments.length > 0 ? (
                  project.payments.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-4 py-3 font-medium text-[#111827]">
                        {formatDate(p.date)}
                      </td>
                      <td className="px-4 py-3 text-[#6B7280]">{p.notes || 'Partial Payment'}</td>
                      <td className="px-4 py-3 text-right font-bold text-[#16A34A]">
                        + {formatCurrency(p.amount, settings?.currencySymbol)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleDeletePayment(p.id)}
                          disabled={deletingPaymentId === p.id}
                          className="p-1 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                          title="Delete Payment"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-[#6B7280]">
                      No payments recorded yet for this project.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Footer */}
        <div className="pt-4 border-t border-[#E5E7EB] flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => {
              onClose();
              onDeleteProject(project.id);
            }}
            className="flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Delete Project</span>
          </button>

          <div className="flex items-center gap-2">
            {onEditProject && (
              <button
                onClick={() => {
                  onClose();
                  onEditProject(project);
                }}
                className="flex items-center gap-1.5 border border-[#E5E7EB] hover:bg-gray-100 text-[#111827] font-semibold py-2 px-3.5 rounded-xl text-xs transition-all"
              >
                <Edit className="h-3.5 w-3.5" />
                <span>Edit Project</span>
              </button>
            )}

            <button
              onClick={() => {
                onClose();
                onGenerateInvoice(project);
              }}
              className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-[#111827] font-semibold py-2 px-4 rounded-xl text-xs transition-all"
            >
              <Download className="h-4 w-4" />
              <span>Generate PDF Invoice</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
