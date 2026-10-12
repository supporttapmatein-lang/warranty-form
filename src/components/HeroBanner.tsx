import React from 'react';
import { ShieldCheck, CheckCircle2, Clock, Sparkles } from 'lucide-react';
import warrantyCardImg from '../assets/images/tapmate_warranty_card_1791734734137.jpg';

interface HeroBannerProps {
  cardImageUrl?: string;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ cardImageUrl }) => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-sky-50/70 via-white to-[#f8fafc] pt-10 pb-12 sm:pt-14 sm:pb-16 border-b border-slate-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Heading, Subtitle & Value Proposition */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sky-100/80 border border-sky-200/70 text-xs font-semibold text-[#1e6f8d]">
              <ShieldCheck className="w-4 h-4 text-[#399FC5]" />
              <span>Official Product Protection Portal</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15] text-balance">
                Lifetime Warranty Registration
              </h1>
              <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
                Register your authentic Tapmate product to activate warranty tracking, expedited technical support, and genuine replacement coverage.
              </p>
            </div>

            {/* Official Warranty Policy Excerpt Block (Skill and User Mandate) */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm shadow-slate-100">
              <div className="flex items-start gap-3.5">
                <div className="p-2 rounded-xl bg-sky-50 text-[#399FC5] shrink-0 mt-0.5">
                  <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Official Warranty Notice
                  </h4>
                  <p className="text-sm text-slate-700 italic leading-relaxed">
                    &ldquo;Every Tapmate product is built to last. Functional damage may be covered under Tapmate&apos;s applicable lifetime warranty terms and conditions. Warranty eligibility is subject to verification and the official warranty policy.&rdquo;
                  </p>
                </div>
              </div>
            </div>

            {/* 3 Proof Pillars */}
            <div className="grid grid-cols-3 gap-3 pt-1">
              <div className="p-3 rounded-xl bg-white/70 border border-slate-200/60">
                <div className="text-slate-900 font-bold text-sm sm:text-base flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#399FC5] shrink-0" />
                  <span>2 Mins</span>
                </div>
                <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">Fast Registration</p>
              </div>

              <div className="p-3 rounded-xl bg-white/70 border border-slate-200/60">
                <div className="text-slate-900 font-bold text-sm sm:text-base flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#399FC5] shrink-0" />
                  <span>Verified</span>
                </div>
                <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">Official Registry</p>
              </div>

              <div className="p-3 rounded-xl bg-white/70 border border-slate-200/60">
                <div className="text-slate-900 font-bold text-sm sm:text-base flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#399FC5] shrink-0" />
                  <span>Lifetime</span>
                </div>
                <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">Quality Assurance</p>
              </div>
            </div>
          </div>

          {/* Right Column: Physical Tapmate Warranty Card Showcase */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative group w-full max-w-md">
              {/* Soft ambient aura */}
              <div className="absolute -inset-2 bg-gradient-to-r from-[#399FC5]/20 to-sky-300/30 rounded-3xl blur-xl opacity-75 group-hover:opacity-100 transition duration-500" />
              
              <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-slate-900/10 border border-slate-200/80 bg-slate-950 aspect-[4/3]">
                <img
                  src={cardImageUrl || warrantyCardImg}
                  alt="Tapmate Official Physical Lifetime Warranty Card"
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                
                {/* Floating Micro Badge */}
                <div className="absolute bottom-3 left-3 right-3 bg-slate-900/85 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-white/10 flex items-center justify-between text-xs text-white">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#399FC5]" />
                    <span className="font-semibold tracking-wide">Tapmate Genuine Card</span>
                  </div>
                  <span className="text-slate-300 font-mono text-[11px]">Serial Protected</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
