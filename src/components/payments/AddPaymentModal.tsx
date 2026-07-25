import React, { useState } from 'react';
import { X, DollarSign, Calendar, FileText, AlertCircle, ShieldCheck } from 'lucide-react';
import { ProjectWithFinancials } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';

interface AddPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: ProjectWithFinancials;
  onSubmit: (amount: number, date: string, notes?: string) => Promise<void>;
}

export const AddPaymentModal: React.FC<AddPaymentModalProps> = ({
  isOpen,
  onClose,
  project,
  onSubmit,
}) => {
  const { settings } = useAuth();
  const remaining = Math.max(0, project.remainingAmount);
  const [amount, setAmount] = useState<number | ''>('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const numAmount = Number(amount);

    if (numAmount <= 0) {
      setError('Payment amount must be greater than 0');
      return;
    }

    if (numAmount > remaining) {
      setError(
        `Payment amount (${formatCurrency(numAmount, settings?.currencySymbol)}) cannot exceed remaining balance (${formatCurrency(remaining, settings?.currencySymbol)})`
      );
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(numAmount, date, notes);
      setAmount('');
      setNotes('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to record payment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickPercent = (percent: number) => {
    const calc = Math.min(remaining, Math.round((project.totalPrice * percent) / 100));
    setAmount(calc);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-[#E5E7EB] p-6 transition-all">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E5E7EB]">
          <div>
            <h3 className="text-lg font-semibold text-[#111827]">Record Partial Payment</h3>
            <p className="text-xs text-[#6B7280]">
              {project.projectName} • {project.clientName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#6B7280] hover:text-[#111827] hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Project Financial Overview Pill */}
        <div className="my-4 p-3.5 rounded-xl bg-gray-50 border border-[#E5E7EB] space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-[#6B7280]">Total Project Price:</span>
            <span className="font-semibold text-[#111827]">
              {formatCurrency(project.totalPrice, settings?.currencySymbol)}
            </span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-[#6B7280]">Already Received:</span>
            <span className="font-semibold text-[#16A34A]">
              {formatCurrency(project.totalReceived, settings?.currencySymbol)}
            </span>
          </div>
          <div className="pt-2 border-t border-[#E5E7EB] flex justify-between items-center text-xs font-semibold">
            <span className="text-[#111827]">Maximum Remaining Due:</span>
            <span className="text-[#DC2626]">
              {formatCurrency(remaining, settings?.currencySymbol)}
            </span>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Quick Shortcuts */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-semibold text-[#111827]">
                Payment Amount ({settings?.currencySymbol || 'BDT'}) <span className="text-rose-500">*</span>
              </label>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => handleQuickPercent(25)}
                  className="text-[10px] bg-gray-100 hover:bg-gray-200 text-[#111827] font-medium px-2 py-0.5 rounded-md"
                >
                  25%
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickPercent(50)}
                  className="text-[10px] bg-gray-100 hover:bg-gray-200 text-[#111827] font-medium px-2 py-0.5 rounded-md"
                >
                  50%
                </button>
                <button
                  type="button"
                  onClick={() => setAmount(remaining)}
                  className="text-[10px] bg-gray-100 hover:bg-gray-200 text-[#111827] font-medium px-2 py-0.5 rounded-md"
                >
                  Full Due
                </button>
              </div>
            </div>

            <div className="relative">
              <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-[#6B7280]" />
              <input
                type="number"
                min="1"
                max={remaining}
                step="any"
                placeholder={`Max ${remaining}`}
                value={amount}
                onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : '')}
                className="w-full pl-9 pr-3 py-2 border border-[#E5E7EB] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#111827]/20 focus:border-[#111827]"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#111827] mb-1">
              Payment Date <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-[#6B7280]" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-[#E5E7EB] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#111827]/20 focus:border-[#111827]"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#111827] mb-1">
              Note / Reference <span className="text-[#6B7280] font-normal">(optional)</span>
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-2.5 h-4 w-4 text-[#6B7280]" />
              <input
                type="text"
                placeholder="e.g. Bank Transfer, Bkash, Upfront Retainer"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-[#E5E7EB] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#111827]/20 focus:border-[#111827]"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-[#E5E7EB] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-[#E5E7EB] text-[#111827] hover:bg-gray-50 rounded-xl text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || remaining <= 0}
              className="px-5 py-2 bg-[#111827] hover:bg-gray-800 text-white rounded-xl text-sm font-medium transition-all shadow-xs disabled:opacity-50"
            >
              {isSubmitting ? 'Recording...' : 'Record Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
