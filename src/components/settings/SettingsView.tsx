import React, { useState, useEffect } from 'react';
import {
  Building,
  Phone,
  Mail,
  MapPin,
  FileText,
  Upload,
  Check,
  AlertCircle,
  ShieldCheck,
  DollarSign,
  Sparkles,
  Trash2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { updateBusinessSettings } from '../../services/settingsService';
import { formatCurrency, formatDate, formatInvoiceNumber } from '../../utils/formatters';

export const SettingsView: React.FC = () => {
  const { user, isGuestMode, settings, refreshSettings } = useAuth();

  const [businessName, setBusinessName] = useState(settings?.businessName || '');
  const [phone, setPhone] = useState(settings?.phone || '');
  const [email, setEmail] = useState(settings?.email || '');
  const [address, setAddress] = useState(settings?.address || '');
  const [businessLogoUrl, setBusinessLogoUrl] = useState(settings?.businessLogoUrl || '');
  const [invoicePrefix, setInvoicePrefix] = useState(settings?.invoicePrefix || 'INV');
  const [currencySymbol, setCurrencySymbol] = useState(settings?.currencySymbol || 'BDT');

  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (settings) {
      setBusinessName(settings.businessName || '');
      setPhone(settings.phone || '');
      setEmail(settings.email || '');
      setAddress(settings.address || '');
      setBusinessLogoUrl(settings.businessLogoUrl || '');
      setInvoicePrefix(settings.invoicePrefix || 'INV');
      setCurrencySymbol(settings.currencySymbol || 'BDT');
    }
  }, [settings]);

  // Handle Logo File Upload (Compress to base64 Data URL)
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setErrorMessage('Logo image size must be smaller than 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setBusinessLogoUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);

    const targetUserId = user?.uid || 'demo-guest-user';

    try {
      setIsSaving(true);
      await updateBusinessSettings(targetUserId, {
        businessName,
        phone,
        email,
        address,
        businessLogoUrl,
        invoicePrefix: invoicePrefix.trim().toUpperCase() || 'INV',
        currencySymbol: currencySymbol.trim() || 'BDT',
      });

      await refreshSettings();
      setSuccessMessage('Business settings updated successfully! All invoices will now reflect these changes.');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update business settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      {/* Settings Intro Card */}
      <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-2xs space-y-1">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-[#111827]" />
          <h2 className="text-lg font-semibold text-[#111827]">Business Branding & Settings</h2>
        </div>
        <p className="text-xs text-[#6B7280]">
          Configure your studio details, contact info, logo, and invoice numbering prefix.
        </p>
      </div>

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <Check className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Business Logo Upload */}
        <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-2xs space-y-4">
          <h3 className="text-sm font-semibold text-[#111827]">Business Logo</h3>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative group">
              {businessLogoUrl ? (
                <div className="relative">
                  <img
                    src={businessLogoUrl}
                    alt="Logo Preview"
                    className="h-20 w-20 object-cover rounded-2xl border border-[#E5E7EB] shadow-2xs"
                  />
                  <button
                    type="button"
                    onClick={() => setBusinessLogoUrl('')}
                    className="absolute -top-2 -right-2 p-1 bg-rose-600 text-white rounded-full shadow-xs hover:bg-rose-700 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <div className="h-20 w-20 rounded-2xl bg-gray-50 border-2 border-dashed border-[#E5E7EB] flex flex-col items-center justify-center text-[#6B7280]">
                  <Upload className="h-6 w-6 text-gray-400" />
                  <span className="text-[10px] mt-1 font-medium">No Logo</span>
                </div>
              )}
            </div>

            <div className="space-y-2 text-center sm:text-left">
              <label className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-[#E5E7EB] hover:bg-gray-50 text-[#111827] rounded-xl text-xs font-semibold cursor-pointer shadow-2xs transition-all">
                <Upload className="h-3.5 w-3.5 text-[#6B7280]" />
                <span>Upload Logo Image</span>
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </label>
              <p className="text-[11px] text-[#6B7280]">
                PNG or JPG up to 2MB. Appears at the top of generated A4 PDF invoices.
              </p>
            </div>
          </div>
        </div>

        {/* Studio Info Form */}
        <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-2xs space-y-4">
          <h3 className="text-sm font-semibold text-[#111827]">Studio Information</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#111827] mb-1">
                Business / Studio Name
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-2.5 h-4 w-4 text-[#6B7280]" />
                <input
                  type="text"
                  placeholder="e.g. Studio Design Co."
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-[#E5E7EB] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#111827]/20 focus:border-[#111827]"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#111827] mb-1">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 h-4 w-4 text-[#6B7280]" />
                <input
                  type="tel"
                  placeholder="+880 1712 345678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-[#E5E7EB] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#111827]/20 focus:border-[#111827]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#111827] mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-[#6B7280]" />
                <input
                  type="email"
                  placeholder="designer@studio.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-[#E5E7EB] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#111827]/20 focus:border-[#111827]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#111827] mb-1">
                Currency Symbol / Code
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-[#6B7280]" />
                <input
                  type="text"
                  placeholder="e.g. BDT, $, €, £"
                  value={currencySymbol}
                  onChange={(e) => setCurrencySymbol(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-[#E5E7EB] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#111827]/20 focus:border-[#111827]"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#111827] mb-1">
              Studio Address
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-[#6B7280]" />
              <input
                type="text"
                placeholder="Level 4, Creative Hub, Dhaka, Bangladesh"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-[#E5E7EB] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#111827]/20 focus:border-[#111827]"
              />
            </div>
          </div>
        </div>

        {/* Invoice Numbering Format */}
        <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-2xs space-y-4">
          <h3 className="text-sm font-semibold text-[#111827]">Invoice Configuration</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <div>
              <label className="block text-xs font-semibold text-[#111827] mb-1">
                Invoice Prefix
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-2.5 h-4 w-4 text-[#6B7280]" />
                <input
                  type="text"
                  placeholder="INV"
                  value={invoicePrefix}
                  onChange={(e) => setInvoicePrefix(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-[#E5E7EB] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#111827]/20 focus:border-[#111827]"
                />
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-gray-50 border border-[#E5E7EB]">
              <p className="text-xs text-[#6B7280]">Live Invoice Format Example:</p>
              <p className="text-sm font-bold text-[#111827] mt-0.5">
                {formatInvoiceNumber(invoicePrefix, 1)}
              </p>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 bg-[#111827] hover:bg-gray-800 text-white rounded-xl text-sm font-semibold transition-all shadow-xs disabled:opacity-50"
          >
            {isSaving ? 'Saving Settings...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};
