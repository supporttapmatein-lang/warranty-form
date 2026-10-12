import React, { useState, useRef } from 'react';
import {
  ShieldCheck,
  User,
  Mail,
  Phone,
  MapPin,
  Package,
  Calendar,
  Store,
  FileText,
  UploadCloud,
  CheckCircle,
  AlertCircle,
  X,
  Loader2,
  HelpCircle,
} from 'lucide-react';
import { PurchaseSource, Registration, FormValidationErrors, DEFAULT_PRODUCTS, DEFAULT_PURCHASE_CHANNELS } from '../types/warranty';
import { createRegistration } from '../lib/firebase';

interface RegistrationFormProps {
  onSuccess: (registration: Registration) => void;
  products?: string[];
  purchaseChannels?: string[];
}

export const RegistrationForm: React.FC<RegistrationFormProps> = ({
  onSuccess,
  products = DEFAULT_PRODUCTS,
  purchaseChannels = DEFAULT_PURCHASE_CHANNELS,
}) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobile: '',
    address: '',
    productName: '',
    customProductName: '',
    modelVariant: '',
    serialNumber: '',
    purchaseDate: '',
    purchasedFrom: '' as PurchaseSource | '',
    orderId: '',
    invoiceFileName: '',
    invoiceFileData: '',
    agreedToTerms: false,
  });

  const [errors, setErrors] = useState<FormValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showSerialHelp, setShowSerialHelp] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Today's date in YYYY-MM-DD format for max date constraint
  const todayStr = new Date().toISOString().split('T')[0];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
      if (errors[name as keyof FormValidationErrors]) {
        setErrors((prev) => ({ ...prev, [name]: undefined }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
      if (errors[name as keyof FormValidationErrors]) {
        setErrors((prev) => ({ ...prev, [name]: undefined }));
      }
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormValidationErrors = {};

    // 1. Full Name
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full Name is required.';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Full Name must be at least 2 characters.';
    }

    // 2. Email Address
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email Address is required.';
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address (e.g., name@example.com).';
    }

    // 3. Mobile Number
    const mobileDigits = formData.mobile.replace(/\D/g, '');
    if (!formData.mobile.trim()) {
      newErrors.mobile = 'Mobile Number is required.';
    } else if (mobileDigits.length < 8 || mobileDigits.length > 15) {
      newErrors.mobile = 'Please enter a valid mobile number (8 to 15 digits).';
    }

    // 4. Product Name
    const effectiveProductName =
      formData.productName === 'Other Tapmate Product'
        ? formData.customProductName.trim()
        : formData.productName.trim();

    if (!effectiveProductName) {
      newErrors.productName = 'Please select or specify the Product Name.';
    }

    // 5. Purchase Date
    if (!formData.purchaseDate) {
      newErrors.purchaseDate = 'Purchase Date is required.';
    } else if (formData.purchaseDate > todayStr) {
      newErrors.purchaseDate = 'Purchase Date cannot be in the future.';
    }

    // 6. Purchased From
    if (!formData.purchasedFrom) {
      newErrors.purchasedFrom = 'Please select where you purchased the product.';
    }

    // 7. Agreed to Terms
    if (!formData.agreedToTerms) {
      newErrors.agreedToTerms = 'You must confirm the details and accept the warranty terms.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileSelection = (file: File) => {
    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        invoiceFile: 'Only PDF, JPG, PNG, or WEBP files are accepted.',
      }));
      return;
    }

    // Validate size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setErrors((prev) => ({
        ...prev,
        invoiceFile: 'Invoice file size must be less than 5MB.',
      }));
      return;
    }

    setErrors((prev) => ({ ...prev, invoiceFile: undefined }));

    const reader = new FileReader();
    reader.onload = () => {
      setFormData((prev) => ({
        ...prev,
        invoiceFileName: file.name,
        invoiceFileData: reader.result as string,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setFormData((prev) => ({
      ...prev,
      invoiceFileName: '',
      invoiceFileData: '',
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return; // Prevent duplicate submission

    if (!validateForm()) {
      // Scroll to the first error
      const firstErrorEl = document.querySelector('[data-error="true"]');
      if (firstErrorEl) {
        firstErrorEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setIsSubmitting(true);

    try {
      const finalProductName =
        formData.productName === 'Other Tapmate Product'
          ? formData.customProductName.trim()
          : formData.productName.trim();

      const payload: Parameters<typeof createRegistration>[0] = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        mobile: formData.mobile.trim(),
        productName: finalProductName,
        purchaseDate: formData.purchaseDate,
        purchasedFrom: formData.purchasedFrom as PurchaseSource,
        agreedToTerms: true,
      };

      if (formData.address.trim()) payload.address = formData.address.trim();
      if (formData.modelVariant.trim()) payload.modelVariant = formData.modelVariant.trim();
      if (formData.serialNumber.trim()) payload.serialNumber = formData.serialNumber.trim();
      if (formData.orderId.trim()) payload.orderId = formData.orderId.trim();
      if (formData.invoiceFileName.trim()) payload.invoiceFileName = formData.invoiceFileName.trim();
      if (formData.invoiceFileData) payload.invoiceFileData = formData.invoiceFileData;

      const registrationRecord = await createRegistration(payload);

      onSuccess(registrationRecord);
    } catch (err: any) {
      console.error('Registration failed:', err);
      setErrors((prev) => ({
        ...prev,
        general:
          err.message ||
          'Failed to record your registration. Please check your connection and try again.',
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200/80 overflow-hidden">
        {/* Form Header */}
        <div className="bg-slate-900 text-white px-6 sm:px-10 py-8 relative">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-[#399FC5] text-xs font-bold tracking-wider uppercase mb-1">
                <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
                Official Product Registration
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Register Your Tapmate Warranty
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                Complete the fields below to record your ownership in the Tapmate database.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-xs text-slate-300 self-start sm:self-auto">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              Secure Form
            </div>
          </div>
        </div>

        {/* Global Error Banner */}
        {errors.general && (
          <div className="mx-6 sm:mx-10 mt-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Registration Issue: </span>
              {errors.general}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="px-6 sm:px-10 py-8 space-y-10">
          {/* SECTION 1: Customer Information */}
          <section className="space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <User className="w-4 h-4 text-[#399FC5]" />
                1. Customer Information
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Primary contact details for warranty claims and notifications.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Full Name */}
              <div data-error={!!errors.fullName}>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="e.g. Rahul Sharma"
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#399FC5] ${
                      errors.fullName
                        ? 'border-rose-400 bg-rose-50/30'
                        : 'border-slate-300 hover:border-slate-400 bg-white'
                    }`}
                  />
                </div>
                {errors.fullName && (
                  <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.fullName}
                  </p>
                )}
              </div>

              {/* Email Address */}
              <div data-error={!!errors.email}>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="e.g. rahul@example.com"
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#399FC5] ${
                      errors.email
                        ? 'border-rose-400 bg-rose-50/30'
                        : 'border-slate-300 hover:border-slate-400 bg-white'
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Mobile Number */}
              <div data-error={!!errors.mobile}>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Mobile Number <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleInputChange}
                    placeholder="e.g. +91 98765 43210"
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#399FC5] ${
                      errors.mobile
                        ? 'border-rose-400 bg-rose-50/30'
                        : 'border-slate-300 hover:border-slate-400 bg-white'
                    }`}
                  />
                </div>
                {errors.mobile && (
                  <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.mobile}
                  </p>
                )}
              </div>

              {/* Full Address (Optional) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Full Address <span className="text-slate-400 font-normal lowercase">(optional)</span>
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Street, City, State, PIN / Postal Code"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 hover:border-slate-400 bg-white text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#399FC5]"
                />
              </div>
            </div>
          </section>

          {/* SECTION 2: Product Information */}
          <section className="space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Package className="w-4 h-4 text-[#399FC5]" />
                2. Product Information
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Specify your Tapmate item to link warranty coverage to the exact model.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Product Name */}
              <div className="sm:col-span-2" data-error={!!errors.productName}>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Product Name <span className="text-rose-500">*</span>
                </label>
                <select
                  name="productName"
                  value={formData.productName}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#399FC5] bg-white ${
                    errors.productName
                      ? 'border-rose-400 bg-rose-50/30'
                      : 'border-slate-300 hover:border-slate-400'
                  }`}
                >
                  <option value="">-- Select Your Tapmate Product --</option>
                  {products.map((prod) => (
                    <option key={prod} value={prod}>
                      {prod}
                    </option>
                  ))}
                  <option value="Other Tapmate Product">Other Tapmate Product</option>
                </select>

                {formData.productName === 'Other Tapmate Product' && (
                  <div className="mt-3">
                    <input
                      type="text"
                      name="customProductName"
                      value={formData.customProductName}
                      onChange={handleInputChange}
                      placeholder="Type your Tapmate product model name here..."
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#399FC5]"
                    />
                  </div>
                )}

                {errors.productName && (
                  <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.productName}
                  </p>
                )}
              </div>

              {/* Model / Variant (Optional) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Model / Variant <span className="text-slate-400 font-normal lowercase">(optional)</span>
                </label>
                <input
                  type="text"
                  name="modelVariant"
                  value={formData.modelVariant}
                  onChange={handleInputChange}
                  placeholder="e.g. Space Grey / 2 Meter / Pro Edition"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 hover:border-slate-400 bg-white text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#399FC5]"
                />
              </div>

              {/* Serial Number / Batch Number (Optional) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Serial / Batch Number{' '}
                    <span className="text-slate-400 font-normal lowercase">(optional)</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowSerialHelp(!showSerialHelp)}
                    className="text-xs text-[#399FC5] hover:underline flex items-center gap-1"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    Where to find?
                  </button>
                </div>
                <input
                  type="text"
                  name="serialNumber"
                  value={formData.serialNumber}
                  onChange={handleInputChange}
                  placeholder="e.g. TM-SN-982183 or Batch 24B"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 hover:border-slate-400 bg-white text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#399FC5]"
                />
                {showSerialHelp && (
                  <p className="text-xs text-slate-500 mt-1.5 p-2 rounded-lg bg-sky-50 border border-sky-100">
                    💡 The serial number or batch code is printed on the barcode sticker of your Tapmate retail box, on the included warranty card, or laser-etched onto the underside of the product.
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* SECTION 3: Purchase Information */}
          <section className="space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Store className="w-4 h-4 text-[#399FC5]" />
                3. Purchase Information
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Authenticates purchase eligibility and timeline for coverage verification.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Purchase Date */}
              <div data-error={!!errors.purchaseDate}>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Purchase Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  name="purchaseDate"
                  max={todayStr}
                  value={formData.purchaseDate}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#399FC5] bg-white ${
                    errors.purchaseDate
                      ? 'border-rose-400 bg-rose-50/30'
                      : 'border-slate-300 hover:border-slate-400'
                  }`}
                />
                {errors.purchaseDate && (
                  <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.purchaseDate}
                  </p>
                )}
              </div>

              {/* Purchased From */}
              <div data-error={!!errors.purchasedFrom}>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Purchased From <span className="text-rose-500">*</span>
                </label>
                <select
                  name="purchasedFrom"
                  value={formData.purchasedFrom}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#399FC5] bg-white ${
                    errors.purchasedFrom
                      ? 'border-rose-400 bg-rose-50/30'
                      : 'border-slate-300 hover:border-slate-400'
                  }`}
                >
                  <option value="">-- Select Channel --</option>
                  {purchaseChannels.map((channel) => (
                    <option key={channel} value={channel}>
                      {channel}
                    </option>
                  ))}
                </select>
                {errors.purchasedFrom && (
                  <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.purchasedFrom}
                  </p>
                )}
              </div>

              {/* Order ID / Invoice Number */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Order ID / Invoice Number{' '}
                  <span className="text-slate-400 font-normal lowercase">(optional)</span>
                </label>
                <input
                  type="text"
                  name="orderId"
                  value={formData.orderId}
                  onChange={handleInputChange}
                  placeholder="e.g. 402-892182-1928312 or INV-2026-098"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 hover:border-slate-400 bg-white text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#399FC5]"
                />
              </div>

              {/* Upload Purchase Invoice (Optional) */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Upload Purchase Invoice{' '}
                  <span className="text-slate-400 font-normal lowercase">
                    (optional · PDF, JPG, PNG up to 5MB)
                  </span>
                </label>

                {formData.invoiceFileName ? (
                  <div className="p-4 rounded-2xl bg-sky-50/80 border border-sky-200 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-10 h-10 rounded-xl bg-[#399FC5] text-white flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="truncate">
                        <p className="text-sm font-semibold text-slate-800 truncate">
                          {formData.invoiceFileName}
                        </p>
                        <p className="text-xs text-slate-500">Invoice attached successfully</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-white transition-colors"
                      title="Remove file"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                      isDragging
                        ? 'border-[#399FC5] bg-sky-50/60'
                        : 'border-slate-300 hover:border-[#399FC5] hover:bg-slate-50/60'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,image/png,image/jpeg,image/webp"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFileSelection(e.target.files[0]);
                        }
                      }}
                    />
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-2xl bg-sky-50 text-[#399FC5] flex items-center justify-center">
                        <UploadCloud className="w-6 h-6 stroke-[2]" />
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-slate-800 hover:text-[#399FC5]">
                          Click to browse invoice
                        </span>{' '}
                        <span className="text-sm text-slate-500">or drag and drop here</span>
                      </div>
                      <p className="text-xs text-slate-400">PDF, JPG, PNG or WEBP (Max 5MB)</p>
                    </div>
                  </div>
                )}

                {errors.invoiceFile && (
                  <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.invoiceFile}
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* SECTION 4: Warranty Declaration */}
          <section className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="agreedToTerms"
                name="agreedToTerms"
                checked={formData.agreedToTerms}
                onChange={handleInputChange}
                className="mt-1 w-4 h-4 rounded text-[#399FC5] focus:ring-[#399FC5] border-slate-300 cursor-pointer"
              />
              <label
                htmlFor="agreedToTerms"
                className="text-xs sm:text-sm text-slate-700 leading-relaxed cursor-pointer"
              >
                <span className="font-semibold text-slate-900">Warranty Declaration: </span>
                I confirm that I have provided accurate information and agree to the applicable Tapmate lifetime warranty terms and conditions. I understand that registration records my ownership in the official warranty system, and actual warranty eligibility is subject to verification.
              </label>
            </div>
            {errors.agreedToTerms && (
              <p className="text-xs text-rose-600 pl-7 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.agreedToTerms}
              </p>
            )}
          </section>

          {/* Submission Button & Disclaimer */}
          <div className="pt-2 flex flex-col items-center gap-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full sm:w-auto min-w-[280px] px-8 py-4 rounded-xl text-white font-bold text-base shadow-lg shadow-[#399FC5]/25 transition-all flex items-center justify-center gap-2 ${
                isSubmitting
                  ? 'bg-slate-400 cursor-not-allowed'
                  : 'bg-[#399FC5] hover:bg-[#2e86a7] active:scale-98'
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Validating & Recording...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
                  <span>Submit Warranty Registration</span>
                </>
              )}
            </button>

            <p className="text-xs text-slate-500 text-center max-w-lg">
              Upon submission, a unique Warranty Registration ID will be issued. Submitting this form initiates the verification process and does not represent immediate claim approval.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
