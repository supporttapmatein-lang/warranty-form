import React, { useState } from 'react';
import {
  ShieldCheck,
  Printer,
  Copy,
  Check,
  RotateCcw,
  ExternalLink,
  Mail,
  Calendar,
  User,
  Package,
  FileCheck2,
  Clock,
  Sparkles,
  Download,
} from 'lucide-react';
import { Registration } from '../types/warranty';
import defaultCardImg from '../assets/images/tapmate_warranty_card_1791734734137.jpg';

interface SuccessCertificateProps {
  registration: Registration;
  onRegisterAnother: () => void;
  cardImageUrl?: string;
}

export const SuccessCertificate: React.FC<SuccessCertificateProps> = ({
  registration,
  onRegisterAnother,
  cardImageUrl,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyId = () => {
    navigator.clipboard.writeText(registration.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Top Action & Notice Bar (Hidden on print) */}
      <div className="no-print mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-emerald-50 border border-emerald-200/80 p-4 sm:p-5 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <FileCheck2 className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-emerald-950">
              Registration Recorded Successfully
            </h3>
            <p className="text-xs text-emerald-800">
              Your official Tapmate Lifetime Warranty Certificate has been generated.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={handlePrint}
            className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-white border border-slate-300 text-slate-800 text-xs font-semibold hover:bg-slate-50 flex items-center justify-center gap-1.5 shadow-sm transition-all"
          >
            <Printer className="w-4 h-4 text-[#399FC5]" />
            <span>Print Certificate</span>
          </button>
          <button
            onClick={onRegisterAnother}
            className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-emerald-700 text-white text-xs font-semibold hover:bg-emerald-800 flex items-center justify-center gap-1.5 shadow-sm transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Register Another</span>
          </button>
        </div>
      </div>

      {/* Official Printable Certificate Card */}
      <div className="print-only-container bg-white rounded-3xl shadow-2xl shadow-slate-200/80 border-2 border-slate-200/90 overflow-hidden relative">
        {/* Holographic Top Accent Bar */}
        <div className="h-2.5 bg-gradient-to-r from-[#399FC5] via-[#2481a5] to-emerald-500" />

        <div className="p-6 sm:p-10 space-y-8">
          {/* Certificate Header Lockup */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-slate-200 gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#399FC5] to-[#1c5d75] flex items-center justify-center text-white shadow-md shadow-[#399FC5]/20">
                <ShieldCheck className="w-8 h-8 stroke-[2.2]" />
              </div>
              <div>
                <span className="text-2xl font-black tracking-tight text-slate-900 block leading-tight">
                  TAPMATE
                </span>
                <span className="text-xs font-bold tracking-widest text-[#399FC5] uppercase">
                  Certificate of Ownership & Warranty Record
                </span>
              </div>
            </div>

            {/* Official Serial ID Badge with Copy Button */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 sm:text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                Registration ID
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="font-mono font-bold text-base sm:text-lg text-slate-900 tracking-wide tabular-nums">
                  {registration.id}
                </span>
                <button
                  onClick={handleCopyId}
                  className="no-print p-1.5 rounded-lg text-slate-500 hover:text-[#399FC5] hover:bg-white border border-transparent hover:border-slate-200 transition-colors"
                  title="Copy Registration ID"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Verification Status Warning (Strict Rule: Do not claim approved) */}
          <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex items-start gap-3">
            <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-900">
                  Current Status:
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                  Pending Verification
                </span>
              </div>
              <p className="text-xs text-amber-800/90 leading-relaxed">
                Your registration has been securely logged into Tapmate's central database. Please retain this certificate and your original purchase invoice. Warranty claims and functional replacement requests will be verified against official distributor records.
              </p>
            </div>
          </div>

          {/* Registered Details Summary Matrix & Warranty Card Visual */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Registration Summary Details
            </h4>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              {/* Warranty Card Visual (Col 1-4 on desktop) */}
              <div className="lg:col-span-4 p-4 rounded-2xl bg-slate-50/70 border border-slate-200/70 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
                  <ShieldCheck className="w-4 h-4 text-[#399FC5]" />
                  <span>Tapmate Card Issued</span>
                </div>
                <div className="relative rounded-xl overflow-hidden shadow-md border border-slate-300 bg-slate-900 aspect-[4/3]">
                  <img
                    src={cardImageUrl || defaultCardImg}
                    alt="Tapmate Official Warranty Card"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-1.5 left-1.5 right-1.5 bg-slate-900/85 backdrop-blur-sm px-2 py-1 rounded-lg border border-white/10 flex items-center justify-between text-[10px] text-white">
                    <span className="font-semibold truncate">Tapmate Official Card</span>
                    <span className="text-[#399FC5] font-mono shrink-0 ml-1">{registration.id}</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 text-center italic mt-1">
                  Valid with original dealer invoice
                </p>
              </div>

              {/* Customer Particulars & Product Matrix (Col 5-12 on desktop) */}
              <div className="lg:col-span-8 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Customer Box */}
                  <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/70 space-y-2.5">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
                      <User className="w-4 h-4 text-[#399FC5]" />
                      <span>Customer Particulars</span>
                    </div>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between py-1 border-b border-slate-200/50">
                        <span className="text-slate-500">Full Name</span>
                        <span className="font-semibold text-slate-800">{registration.fullName}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-200/50">
                        <span className="text-slate-500">Email Address</span>
                        <span className="font-semibold text-slate-800">{registration.email}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-200/50">
                        <span className="text-slate-500">Mobile Number</span>
                        <span className="font-semibold text-slate-800">{registration.mobile}</span>
                      </div>
                      {registration.address && (
                        <div className="flex justify-between py-1">
                          <span className="text-slate-500">Address</span>
                          <span className="font-semibold text-slate-800 text-right max-w-[200px] truncate">
                            {registration.address}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Product Box */}
                  <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/70 space-y-2.5">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
                      <Package className="w-4 h-4 text-[#399FC5]" />
                      <span>Product Particulars</span>
                    </div>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between py-1 border-b border-slate-200/50">
                        <span className="text-slate-500">Product Name</span>
                        <span className="font-semibold text-slate-800 text-right max-w-[200px] truncate">
                          {registration.productName}
                        </span>
                      </div>
                      {registration.modelVariant && (
                        <div className="flex justify-between py-1 border-b border-slate-200/50">
                          <span className="text-slate-500">Variant</span>
                          <span className="font-semibold text-slate-800">{registration.modelVariant}</span>
                        </div>
                      )}
                      <div className="flex justify-between py-1 border-b border-slate-200/50">
                        <span className="text-slate-500">Serial / Batch</span>
                        <span className="font-semibold text-slate-800 font-mono">
                          {registration.serialNumber || 'Not specified'}
                        </span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-slate-500">Purchase Date</span>
                        <span className="font-semibold text-slate-800">{registration.purchaseDate}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Purchase Channel Details */}
                <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/70">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div>
                      <span className="text-slate-500 block">Purchased From</span>
                      <span className="font-semibold text-slate-900 mt-0.5 block">
                        {registration.purchasedFrom}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Order / Invoice ID</span>
                      <span className="font-semibold text-slate-900 mt-0.5 block font-mono">
                        {registration.orderId || 'Not provided'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Invoice Upload</span>
                      <span className="font-semibold text-slate-900 mt-0.5 block">
                        {registration.invoiceFileName ? 'Attached (Secured)' : 'None provided'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mandatory Official Warranty Policy Section (Exact Text Required) */}
          <div className="p-5 rounded-2xl bg-sky-50/80 border border-sky-200/90">
            <h5 className="text-xs font-bold uppercase tracking-wider text-[#1c5d75] mb-1.5 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#399FC5]" />
              Tapmate Official Warranty Policy
            </h5>
            <p className="text-xs sm:text-sm text-slate-700 italic leading-relaxed">
              &ldquo;Every Tapmate product is built to last. Functional damage may be covered under Tapmate&apos;s applicable lifetime warranty terms and conditions. Warranty eligibility is subject to verification and the official warranty policy.&rdquo;
            </p>
          </div>

          {/* Official Contact & Verification Footer */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-slate-500 gap-3">
            <div className="space-y-0.5">
              <p className="font-semibold text-slate-700">Official Tapmate Customer Support</p>
              <p>Email: <a href="mailto:help@tapmate.in" className="text-[#399FC5] hover:underline">help@tapmate.in</a> · Web: <a href="https://tapmate.in" target="_blank" rel="noreferrer" className="text-[#399FC5] hover:underline">https://tapmate.in</a></p>
            </div>
            <div className="text-left sm:text-right font-mono text-[11px] text-slate-400">
              Generated: {new Date(registration.createdAt).toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action Footer (Hidden on print) */}
      <div className="no-print mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
        <button
          onClick={handlePrint}
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-900 text-white font-semibold text-sm hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-md"
        >
          <Printer className="w-4 h-4" />
          <span>Print or Save as PDF</span>
        </button>

        <button
          onClick={onRegisterAnother}
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-all flex items-center justify-center gap-2 shadow-sm"
        >
          <RotateCcw className="w-4 h-4 text-[#399FC5]" />
          <span>Register Another Product</span>
        </button>
      </div>
    </div>
  );
};
