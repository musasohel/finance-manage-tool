import React, { useState } from 'react';
import { X, User, Building, Phone, Mail, FileText, AlertCircle } from 'lucide-react';
import { Client } from '../../types';
import { validateEmail, validatePhone } from '../../utils/formatters';

interface AddClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (clientData: Omit<Client, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
  initialData?: Client | null;
}

export const AddClientModal: React.FC<AddClientModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const [name, setName] = useState(initialData?.name || '');
  const [company, setCompany] = useState(initialData?.company || '');
  const [phone, setPhone] = useState(initialData?.phone || '');
  const [email, setEmail] = useState(initialData?.email || '');
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Client name is required');
      return;
    }

    if (!phone.trim()) {
      setError('Phone number is required');
      return;
    }

    if (!validatePhone(phone)) {
      setError('Please enter a valid phone number (7-20 digits)');
      return;
    }

    if (email.trim() && !validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit({
        name,
        company,
        phone,
        email,
        notes,
      });
      // Reset & close
      setName('');
      setCompany('');
      setPhone('');
      setEmail('');
      setNotes('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save client');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-[#E5E7EB] p-6 transition-all">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E5E7EB]">
          <div>
            <h3 className="text-lg font-semibold text-[#111827]">
              {initialData ? 'Edit Client Details' : 'Add New Client'}
            </h3>
            <p className="text-xs text-[#6B7280]">
              Store contact details for invoices and project management
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#6B7280] hover:text-[#111827] hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#111827] mb-1">
              Client Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 h-4 w-4 text-[#6B7280]" />
              <input
                type="text"
                placeholder="e.g. Sarah Jenkins"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-[#E5E7EB] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#111827]/20 focus:border-[#111827]"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#111827] mb-1">
                Company Name <span className="text-[#6B7280] font-normal">(optional)</span>
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-2.5 h-4 w-4 text-[#6B7280]" />
                <input
                  type="text"
                  placeholder="Apex Brand Labs"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-[#E5E7EB] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#111827]/20 focus:border-[#111827]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#111827] mb-1">
                Phone Number <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 h-4 w-4 text-[#6B7280]" />
                <input
                  type="tel"
                  placeholder="+880 1711 000000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-[#E5E7EB] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#111827]/20 focus:border-[#111827]"
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#111827] mb-1">
              Email Address <span className="text-[#6B7280] font-normal">(optional)</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-[#6B7280]" />
              <input
                type="email"
                placeholder="sarah@apexbrand.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-[#E5E7EB] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#111827]/20 focus:border-[#111827]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#111827] mb-1">
              Notes <span className="text-[#6B7280] font-normal">(optional)</span>
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-2.5 h-4 w-4 text-[#6B7280]" />
              <textarea
                rows={3}
                placeholder="Special notes or preferred design requirements..."
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
              disabled={isSubmitting}
              className="px-5 py-2 bg-[#111827] hover:bg-gray-800 text-white rounded-xl text-sm font-medium transition-all shadow-xs disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : initialData ? 'Update Client' : 'Save Client'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
