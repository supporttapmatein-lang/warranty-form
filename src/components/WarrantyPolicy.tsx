import React from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Mail,
  Globe,
  FileText,
  Clock,
  ArrowRight,
} from 'lucide-react';

interface WarrantyPolicyProps {
  onRegisterClick: () => void;
}

export const WarrantyPolicy: React.FC<WarrantyPolicyProps> = ({ onRegisterClick }) => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Policy Hero Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-100/80 border border-sky-200/70 text-xs font-bold text-[#1e6f8d]">
          <ShieldCheck className="w-4 h-4 text-[#399FC5]" />
          <span>Official Tapmate Warranty Guidelines</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Lifetime Warranty Terms & Coverage
        </h2>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
          Tapmate designs and manufactures high-performance consumer technology engineered to endure daily use. Review our comprehensive warranty policy below.
        </p>
      </div>

      {/* Mandatory Official Policy Declaration Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-sky-50 via-white to-sky-50/50 border-2 border-sky-200 shadow-md">
        <div className="flex flex-col sm:flex-row items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#399FC5] text-white flex items-center justify-center shrink-0 shadow-sm shadow-[#399FC5]/20">
            <ShieldCheck className="w-7 h-7 stroke-[2.2]" />
          </div>
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1e6f8d]">
              Official Lifetime Warranty Statement
            </span>
            <blockquote className="text-base sm:text-lg font-medium text-slate-900 italic leading-relaxed">
              &ldquo;Every Tapmate product is built to last. Functional damage may be covered under Tapmate&apos;s applicable lifetime warranty terms and conditions. Warranty eligibility is subject to verification and the official warranty policy.&rdquo;
            </blockquote>
            <p className="text-xs text-slate-500 pt-1">
              Warranty coverage takes effect upon purchase and registration verification. Tapmate reserves the right to verify purchase authenticity and functional defect status.
            </p>
          </div>
        </div>
      </div>

      {/* Coverage Breakdown: What is Covered vs Excluded */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* What is Covered */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">What Is Covered</h3>
              <p className="text-xs text-slate-500">Under applicable lifetime warranty terms</p>
            </div>
          </div>

          <ul className="space-y-3.5 text-xs sm:text-sm text-slate-700">
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
              <span>
                <strong>Functional Hardware Failure:</strong> Total or partial loss of electrical conductivity, magnetic coupling, charging transmission, or mechanical latch failure under normal intended operation.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
              <span>
                <strong>Manufacturing Defects:</strong> Structural flaws in materials, solder joints, internal component failures, or connector detachment arising during standard use.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
              <span>
                <strong>Genuine Replacement or Repair:</strong> If verified as defective, Tapmate provides replacement with an equivalent product or repaired genuine unit.
              </span>
            </li>
          </ul>
        </div>

        {/* What is Excluded */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">What Is Not Covered</h3>
              <p className="text-xs text-slate-500">Exclusions from warranty eligibility</p>
            </div>
          </div>

          <ul className="space-y-3.5 text-xs sm:text-sm text-slate-700">
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-2 shrink-0" />
              <span>
                <strong>Normal Cosmetic Wear & Tear:</strong> Surface scuffs, minor scratches, fabric discoloration, and aesthetic patina that do not impede electrical function.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-2 shrink-0" />
              <span>
                <strong>Unauthorized Alterations:</strong> Disassembly, third-party repairs, tampering, water submersion beyond rated ingress protection, or deliberate destruction.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-2 shrink-0" />
              <span>
                <strong>Counterfeit or Unverified Sources:</strong> Items acquired from unauthorized grey-market sellers without verifiable invoice or proof of purchase.
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* Claim Process Steps */}
      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200/90 shadow-sm space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <h3 className="text-xl font-bold text-slate-900">How to File a Warranty Claim</h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Follow these 3 straightforward steps if your device encounters a functional issue.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-[#399FC5] text-white flex items-center justify-center font-bold text-xs">
              01
            </div>
            <h4 className="font-bold text-sm text-slate-900">Locate Registration ID</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Find your unique Registration ID (e.g., <code className="text-[#1c5d75]">TM-LW-2026-XXXXXX</code>) issued upon online registration or on your printed certificate.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-[#399FC5] text-white flex items-center justify-center font-bold text-xs">
              02
            </div>
            <h4 className="font-bold text-sm text-slate-900">Email Tapmate Support</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Send an email to <a href="mailto:help@tapmate.in" className="text-[#399FC5] font-semibold hover:underline">help@tapmate.in</a> with your Registration ID and a brief description or video of the functional issue.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-[#399FC5] text-white flex items-center justify-center font-bold text-xs">
              03
            </div>
            <h4 className="font-bold text-sm text-slate-900">Verification & Resolution</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Our engineering team reviews distributor logs within 48 hours to issue an RMA approval, repair guidance, or replacement dispatch.
            </p>
          </div>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 bg-sky-50/60 p-4 rounded-2xl border border-sky-100">
          <div className="text-xs text-slate-700">
            Have not registered your product yet? Register now to ensure seamless coverage.
          </div>
          <button
            onClick={onRegisterClick}
            className="px-5 py-2.5 rounded-xl bg-[#399FC5] text-white font-bold text-xs hover:bg-[#2e86a7] transition-all flex items-center gap-1.5 shadow-sm whitespace-nowrap"
          >
            <span>Register Product Now</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Official Contact Card (User Mandate) */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center sm:text-left">
          <span className="text-xs font-bold uppercase tracking-wider text-[#399FC5]">
            Official Support Contacts
          </span>
          <h4 className="text-xl font-bold">Have Questions About Your Warranty?</h4>
          <p className="text-xs text-slate-400">
            Our warranty verification desk is available Monday through Saturday.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 text-xs font-medium">
          <a
            href="mailto:help@tapmate.in"
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center gap-2 transition-colors text-white"
          >
            <Mail className="w-4 h-4 text-[#399FC5]" />
            <span>help@tapmate.in</span>
          </a>

          <a
            href="https://tapmate.in"
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center gap-2 transition-colors text-white"
          >
            <Globe className="w-4 h-4 text-[#399FC5]" />
            <span>https://tapmate.in</span>
          </a>
        </div>
      </div>
    </div>
  );
};
