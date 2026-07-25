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
  Trash2,
  PenTool,
  UserCheck
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
  const [authorizedSignatureUrl, setAuthorizedSignatureUrl] = useState(settings?.authorizedSignatureUrl || '');
  const [signatoryName, setSignatoryName] = useState(settings?.signatoryName || 'Authorized Representative');
  const [signatoryTitle, setSignatoryTitle] = useState(settings?.signatoryTitle || 'Authorized Signatory');
  const [showSignatureOnInvoice, setShowSignatureOnInvoice] = useState(settings?.showSignatureOnInvoice ?? true);
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
      setAuthorizedSignatureUrl(settings.authorizedSignatureUrl || '');
      setSignatoryName(settings.signatoryName || 'Authorized Representative');
      setSignatoryTitle(settings.signatoryTitle || 'Authorized Signatory');
      setShowSignatureOnInvoice(settings.showSignatureOnInvoice ?? true);
      setInvoicePrefix(settings.invoicePrefix || 'INV');
      setCurrencySymbol(settings.currencySymbol || 'BDT');
    }
  }, [settings]);

  // Handle Logo File Upload
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

  // Handle Authorized Signature File Upload
  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setErrorMessage('Signature image size must be smaller than 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setAuthorizedSignatureUrl(reader.result as string);
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
        authorizedSignatureUrl,
        signatoryName,
        signatoryTitle,
        showSignatureOnInvoice,
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

        {/* Authorized Signature Configuration */}
        <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PenTool className="h-4 w-4 text-[#111827]" />
              <h3 className="text-sm font-semibold text-[#111827]">Authorized Signature</h3>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showSignatureOnInvoice}
                onChange={(e) => setShowSignatureOnInvoice(e.target.checked)}
                className="rounded border-gray-300 text-[#111827] focus:ring-[#111827]"
              />
              <span className="text-xs font-semibold text-[#111827]">Show on Invoices</span>
            </label>
          </div>

          <p className="text-xs text-[#6B7280]">
            Upload a transparent digital signature image or enter signatory details to appear at the bottom of generated invoices.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Left: Inputs */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#111827] mb-1">
                  Signature Image (Optional)
                </label>
                <div className="flex items-center gap-3">
                  <label className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-[#E5E7EB] hover:bg-gray-50 text-[#111827] rounded-xl text-xs font-semibold cursor-pointer shadow-2xs transition-all">
                    <Upload className="h-3.5 w-3.5 text-[#6B7280]" />
                    <span>Upload Signature</span>
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/webp"
                      onChange={handleSignatureUpload}
                      className="hidden"
                    />
                  </label>
                  {authorizedSignatureUrl && (
                    <button
                      type="button"
                      onClick={() => setAuthorizedSignatureUrl('')}
                      className="px-2.5 py-2 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-medium transition-colors border border-rose-200"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <p className="text-[10px] text-[#6B7280] mt-1">PNG with transparent background recommended (Max 2MB)</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#111827] mb-1">
                  Signatory Name
                </label>
                <div className="relative">
                  <UserCheck className="absolute left-3 top-2.5 h-4 w-4 text-[#6B7280]" />
                  <input
                    type="text"
                    placeholder="e.g. M. Husain"
                    value={signatoryName}
                    onChange={(e) => setSignatoryName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-[#E5E7EB] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#111827]/20 focus:border-[#111827]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#111827] mb-1">
                  Signatory Designation / Title
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-2.5 h-4 w-4 text-[#6B7280]" />
                  <input
                    type="text"
                    placeholder="e.g. Authorized Signatory / Lead Designer"
                    value={signatoryTitle}
                    onChange={(e) => setSignatoryTitle(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-[#E5E7EB] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#111827]/20 focus:border-[#111827]"
                  />
                </div>
              </div>
            </div>

            {/* Right: Signature Preview */}
            <div className="p-4 rounded-xl bg-gray-50 border border-[#E5E7EB] space-y-2">
              <p className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">
                Invoice Signature Preview
              </p>
              <div className="p-4 bg-white rounded-lg border border-gray-200 text-center min-h-[110px] flex flex-col justify-end items-center">
                {authorizedSignatureUrl ? (
                  <img
                    src={authorizedSignatureUrl}
                    alt="Authorized Signature"
                    className="h-12 max-w-[160px] object-contain mb-1"
                  />
                ) : (
                  <div className="w-36 border-b border-gray-400 mb-1 h-8 flex items-end justify-center">
                    <span className="text-[10px] italic text-gray-400 pb-0.5">(Physical Signature Line)</span>
                  </div>
                )}
                <p className="text-xs font-bold text-[#111827]">{signatoryName || 'Signatory Name'}</p>
                <p className="text-[11px] text-[#6B7280]">{signatoryTitle || 'Authorized Signatory'}</p>
              </div>
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
