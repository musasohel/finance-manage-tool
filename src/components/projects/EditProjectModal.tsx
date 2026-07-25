import React, { useState, useEffect } from 'react';
import { X, Folder, Layers, DollarSign, Calendar, User, AlertCircle, Edit3 } from 'lucide-react';
import { Client, Project, ProjectWithFinancials } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface EditProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: ProjectWithFinancials | null;
  clients: Client[];
  onSubmit: (projectId: string, updates: Partial<Project>) => Promise<void>;
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

export const EditProjectModal: React.FC<EditProjectModalProps> = ({
  isOpen,
  onClose,
  project,
  clients,
  onSubmit,
}) => {
  const { settings } = useAuth();
  const [clientId, setClientId] = useState('');
  const [projectName, setProjectName] = useState('');
  const [service, setService] = useState('');
  const [totalPrice, setTotalPrice] = useState<number | ''>('');
  const [createdDate, setCreatedDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (project) {
      setClientId(project.clientId || '');
      setProjectName(project.projectName || '');
      setService(project.service || COMMON_SERVICES[0]);
      setTotalPrice(project.totalPrice || '');
      setCreatedDate(project.createdDate || new Date().toISOString().split('T')[0]);
      setDueDate(project.dueDate || '');
      setError(null);
    }
  }, [project]);

  if (!isOpen || !project) return null;

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
      await onSubmit(project.id, {
        clientId,
        clientName: selectedClient.name,
        projectName,
        service,
        totalPrice: Number(totalPrice),
        createdDate,
        dueDate: dueDate || undefined,
      });

      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update project information');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-[#E5E7EB] p-6 transition-all my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E5E7EB]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gray-100 text-[#111827] rounded-xl">
              <Edit3 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#111827]">Edit Project Information</h3>
              <p className="text-xs text-[#6B7280]">Update project details, client, service, and budget</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#6B7280] hover:text-[#111827] hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-xs">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Client Selector */}
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
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name} {client.company ? `(${client.company})` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Project Name */}
          <div>
            <label className="block text-xs font-semibold text-[#111827] mb-1">
              Project Name / Title <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Folder className="absolute left-3 top-2.5 h-4 w-4 text-[#6B7280]" />
              <input
                type="text"
                placeholder="e.g. Brand Refresh & Logo Redesign"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-[#E5E7EB] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#111827]/20 focus:border-[#111827]"
                required
              />
            </div>
          </div>

          {/* Service Category */}
          <div>
            <label className="block text-xs font-semibold text-[#111827] mb-1">
              Design Service <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
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
                {!COMMON_SERVICES.includes(service) && service && (
                  <option value={service}>{service}</option>
                )}
              </select>
            </div>
          </div>

          {/* Price, Created Date & Due Date */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#111827] mb-1">
                Total Price ({settings?.currencySymbol || 'BDT'}) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-[#6B7280]" />
                <input
                  type="number"
                  min="1"
                  placeholder="20000"
                  value={totalPrice}
                  onChange={(e) => setTotalPrice(e.target.value ? Number(e.target.value) : '')}
                  className="w-full pl-9 pr-2 py-2 border border-[#E5E7EB] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#111827]/20 focus:border-[#111827]"
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
                  className="w-full pl-9 pr-2 py-2 border border-[#E5E7EB] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#111827]/20 focus:border-[#111827]"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#111827] mb-1">
                Target Deadline
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-[#6B7280]" />
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full pl-9 pr-2 py-2 border border-[#E5E7EB] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#111827]/20 focus:border-[#111827]"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E5E7EB]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-[#E5E7EB] hover:bg-gray-50 text-[#111827] font-semibold text-xs rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-[#111827] hover:bg-gray-800 text-white font-semibold text-xs rounded-xl transition-all shadow-2xs disabled:opacity-50"
            >
              {isSubmitting ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
