import React, { useState } from 'react';
import { X, Download, Printer, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { ProjectWithFinancials, Client } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { generateInvoicePDF, downloadPDF } from '../../services/pdfService';
import { Badge } from '../common/Badge';

interface InvoicePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: ProjectWithFinancials;
  client?: Client;
}

export const InvoicePreviewModal: React.FC<InvoicePreviewModalProps> = ({
  isOpen,
  onClose,
  project,
  client,
}) => {
  const { settings } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const currentSettings = settings || {
    userId: '',
    businessName: 'Studio Design Co.',
    phone: '+880 1712 345678',
    email: 'designer@studio.com',
    address: 'Creative Hub, Dhaka',
    businessLogoUrl: '',
    invoicePrefix: 'INV',
    nextInvoiceNumber: 1,
    currencySymbol: 'BDT',
  };

  const handleDownloadPDF = async () => {
    try {
      setIsGenerating(true);
      const pdfBytes = await generateInvoicePDF(project, client, currentSettings);
      const filename = `Invoice_${project.invoiceNumber || 'INV-0001'}_${project.clientName.replace(/\s+/g, '_')}.pdf`;
      downloadPDF(pdfBytes, filename);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      alert('Failed to generate PDF invoice. Please check logo format or try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-[#E5E7EB] overflow-hidden my-6 transition-all">
        {/* Top Action Bar */}
        <div className="bg-[#111827] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-400" />
            <span className="font-semibold text-sm">
              Invoice Preview • {project.invoiceNumber || 'INV-0001'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="hidden sm:flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white font-medium py-1.5 px-3 rounded-lg text-xs transition-all"
            >
              <Printer className="h-4 w-4" />
              <span>Print</span>
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={isGenerating}
              className="flex items-center gap-1.5 bg-white text-[#111827] hover:bg-gray-100 font-semibold py-1.5 px-4 rounded-lg text-xs shadow-xs transition-all disabled:opacity-50"
            >
              <Download className="h-4 w-4 text-[#111827]" />
              <span>{isGenerating ? 'Generating PDF...' : 'Download PDF'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-white rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Invoice Printable Sheet */}
        <div className="p-8 sm:p-12 space-y-8 bg-white font-sans text-[#111827] selection:bg-gray-100 print:p-0">
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-8 border-b border-[#E5E7EB]">
            <div className="flex items-start gap-4">
              {currentSettings.businessLogoUrl ? (
                <img
                  src={currentSettings.businessLogoUrl}
                  alt="Business Logo"
                  className="h-14 w-14 object-cover rounded-xl border border-[#E5E7EB] shrink-0"
                />
              ) : (
                <div className="h-12 w-12 rounded-xl bg-[#111827] text-white font-bold flex items-center justify-center text-xl shrink-0">
                  {currentSettings.businessName.charAt(0)}
                </div>
              )}
              <div>
                <h2 className="text-xl font-bold text-[#111827] tracking-tight">
                  {currentSettings.businessName}
                </h2>
                <p className="text-xs text-[#6B7280] mt-1 space-x-2">
                  <span>{currentSettings.email}</span>
                  {currentSettings.phone && <span>• {currentSettings.phone}</span>}
                </p>
                {currentSettings.address && (
                  <p className="text-xs text-[#6B7280]">{currentSettings.address}</p>
                )}
              </div>
            </div>

            <div className="text-left sm:text-right">
              <span className="inline-block text-2xl font-extrabold tracking-tight text-[#111827]">
                INVOICE
              </span>
              <p className="text-sm font-semibold text-[#6B7280] mt-0.5">
                {project.invoiceNumber || 'INV-0001'}
              </p>
              <div className="mt-2">
                <Badge status={project.status} size="md" />
              </div>
            </div>
          </div>

          {/* Billed To & Invoice Meta */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-6 rounded-2xl bg-gray-50/80 border border-[#E5E7EB]">
            <div>
              <p className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider mb-2">
                Billed To
              </p>
              <h3 className="text-base font-bold text-[#111827]">
                {client?.name || project.clientName}
              </h3>
              {client?.company && (
                <p className="text-xs font-medium text-[#111827]">{client.company}</p>
              )}
              {client?.email && <p className="text-xs text-[#6B7280] mt-1">{client.email}</p>}
              {client?.phone && <p className="text-xs text-[#6B7280]">{client.phone}</p>}
            </div>

            <div className="sm:text-right space-y-1">
              <p className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider mb-2">
                Invoice Details
              </p>
              <p className="text-xs text-[#6B7280]">
                Date Issued:{' '}
                <span className="font-semibold text-[#111827]">
                  {formatDate(project.createdDate)}
                </span>
              </p>
              <p className="text-xs text-[#6B7280]">
                Payment Status:{' '}
                <span className="font-semibold text-[#111827]">{project.status}</span>
              </p>
            </div>
          </div>

          {/* Service Line Item Table */}
          <div className="overflow-x-auto rounded-xl border border-[#E5E7EB]">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-[#E5E7EB] text-[#6B7280] uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-4 py-3">Project & Service</th>
                  <th className="px-4 py-3 text-right">Total Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                <tr>
                  <td className="px-4 py-4">
                    <p className="font-bold text-sm text-[#111827]">{project.projectName}</p>
                    <p className="text-xs text-[#6B7280] mt-0.5">Service: {project.service}</p>
                  </td>
                  <td className="px-4 py-4 text-right font-bold text-sm text-[#111827]">
                    {formatCurrency(project.totalPrice, currentSettings.currencySymbol)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Payment History breakdown if present */}
          {project.payments && project.payments.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold text-[#111827] uppercase tracking-wider">
                  Partial Payment Breakdown ({project.payments.length} {project.payments.length === 1 ? 'Installment' : 'Separate Installments'})
                </h4>
                <span className="text-[11px] font-medium text-[#6B7280]">
                  Itemized by Date Paid
                </span>
              </div>
              <div className="overflow-x-auto rounded-xl border border-[#E5E7EB]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 border-b border-[#E5E7EB] text-[#6B7280] uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="px-4 py-2.5">Installment</th>
                      <th className="px-4 py-2.5">Date Paid</th>
                      <th className="px-4 py-2.5">Notes</th>
                      <th className="px-4 py-2.5 text-right">Amount Received</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E7EB]">
                    {project.payments.map((p, idx) => (
                      <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-2.5 font-bold text-[#111827]">
                          Payment #{idx + 1}
                        </td>
                        <td className="px-4 py-2.5 font-semibold text-[#111827]">
                          {formatDate(p.date)}
                        </td>
                        <td className="px-4 py-2.5 text-[#6B7280]">
                          {p.notes || `Partial Payment #${idx + 1}`}
                        </td>
                        <td className="px-4 py-2.5 text-right font-bold text-[#16A34A]">
                          + {formatCurrency(p.amount, currentSettings.currencySymbol)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Total Financial Summary Box */}
          <div className="flex justify-end pt-2">
            <div className="w-full sm:w-72 rounded-2xl bg-gray-50 border border-[#E5E7EB] p-4 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#6B7280]">Total Project Price</span>
                <span className="font-semibold text-[#111827]">
                  {formatCurrency(project.totalPrice, currentSettings.currencySymbol)}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#6B7280]">Total Received</span>
                <span className="font-semibold text-[#16A34A]">
                  {formatCurrency(project.totalReceived, currentSettings.currencySymbol)}
                </span>
              </div>
              <div className="pt-2 border-t border-[#E5E7EB] flex justify-between items-center text-sm font-bold">
                <span className="text-[#111827]">Amount Due</span>
                <span className={project.remainingAmount > 0 ? 'text-[#DC2626]' : 'text-[#16A34A]'}>
                  {formatCurrency(project.remainingAmount, currentSettings.currencySymbol)}
                </span>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="pt-8 border-t border-[#E5E7EB] text-center space-y-1">
            <p className="text-sm font-semibold text-[#111827]">
              Thank you for your business!
            </p>
            <p className="text-xs text-[#6B7280]">
              Please direct all payment inquiries to {currentSettings.email || currentSettings.phone}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
