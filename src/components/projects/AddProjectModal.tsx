import React, { useState } from 'react';
import { X, Folder, Layers, DollarSign, Calendar, User, AlertCircle } from 'lucide-react';
import { Client, Project } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface AddProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  clients: Client[];
  onSubmit: (projectData: Omit<Project, 'id' | 'userId' | 'status' | 'createdAt'>) => Promise<void>;
  preselectedClientId?: string;
}

const COMMON_SERVICES = [
  'Logo & Brand Identity',
  'UI/UX Design & Prototyping',
  'Social Media Graphics & Campaign',
  'Packaging & Merchandise Design',
  'Print & Brochure Design',
  'Website Design & Layout',
  'Vector Illustration',
  'Motion Graphics & Video Assets'
];

export const AddProjectModal: React.FC<AddProjectModalProps> = ({
  isOpen,
  onClose,
  clients,
  onSubmit,
  preselectedClientId,
}) => {
  const { settings } = useAuth();
  const [clientId, setClientId] = useState(preselectedClientId || clients[0]?.id || '');
  const [projectName, setProjectName] = useState('');
  const [service, setService] = useState('Logo & Brand Identity');
  const [totalPrice, setTotalPrice] = useState<number | ''>('');
  const [createdDate, setCreatedDate] = useState(new Date().toISOString().split('T')[0]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!clientId) {
      setError('Please select a client');
      return;
    }

    if (!projectName.trim()) {
      setError('Project name is required');
      return;
    }

    if (!service.trim()) {
      setError('Service type is required');
      return;
    }

    if (totalPrice === '' || Number(totalPrice) <= 0) {
      setError('Total price must be greater than 0');
      return;
    }

    const selectedClient = clients.find((c) => c.id === clientId);
    if (!selectedClient) {
      setError('Selected client not found');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit({
        clientId,
        clientName: selectedClient.name,
        projectName,
        service,
        totalPrice: Number(totalPrice),
        createdDate,
      });

      // Reset
      setProjectName('');
      setTotalPrice('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create project');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-[#E5E7EB] p-6 transition-all">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E5E7EB]">
          <div>
            <h3 className="text-lg font-semibold text-[#111827]">Create New Project</h3>
            <p className="text-xs text-[#6B7280]">
              Assign design project details, services, and agreed pricing
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

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Client Select */}
          <div>
            <label className="block text-xs font-semibold text-[#111827] mb-1">
              Select Client <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 h-4 w-4 text-[#6B7280]" />
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-[#E5E7EB] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#111827]/20 focus:border-[#111827] bg-white"
                required
              >
                <option value="" disabled>
                  -- Select a Client --
                </option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.company ? `(${c.company})` : ''}
                  </option>
                ))}
              </select>
            </div>
            {clients.length === 0 && (
              <p className="mt-1 text-[11px] text-amber-600">
                No clients found. Please create a client first!
              </p>
            )}
          </div>

          {/* Project Name */}
          <div>
            <label className="block text-xs font-semibold text-[#111827] mb-1">
              Project Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Folder className="absolute left-3 top-2.5 h-4 w-4 text-[#6B7280]" />
              <input
                type="text"
                placeholder="e.g. Brand Identity Refresh 2026"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-[#E5E7EB] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#111827]/20 focus:border-[#111827]"
                required
              />
            </div>
          </div>

          {/* Service Dropdown/Custom Input */}
          <div>
            <label className="block text-xs font-semibold text-[#111827] mb-1">
              Service <span className="text-rose-500">*</span>
            </label>
            <div className="relative mb-2">
              <Layers className="absolute left-3 top-2.5 h-4 w-4 text-[#6B7280]" />
              <select
                value={service}
                onChange={(e) => setService(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-[#E5E7EB] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#111827]/20 focus:border-[#111827] bg-white"
              >
                {COMMON_SERVICES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Price & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#111827] mb-1">
                Total Price ({settings?.currencySymbol || 'BDT'}) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-[#6B7280]" />
                <input
                  type="number"
                  min="1"
                  step="any"
                  placeholder="20000"
                  value={totalPrice}
                  onChange={(e) => setTotalPrice(e.target.value ? Number(e.target.value) : '')}
                  className="w-full pl-9 pr-3 py-2 border border-[#E5E7EB] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#111827]/20 focus:border-[#111827]"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#111827] mb-1">
                Created Date <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-[#6B7280]" />
                <input
                  type="date"
                  value={createdDate}
                  onChange={(e) => setCreatedDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-[#E5E7EB] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#111827]/20 focus:border-[#111827]"
                  required
                />
              </div>
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
              disabled={isSubmitting || clients.length === 0}
              className="px-5 py-2 bg-[#111827] hover:bg-gray-800 text-white rounded-xl text-sm font-medium transition-all shadow-xs disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
