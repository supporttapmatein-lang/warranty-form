import React from 'react';
import { ShieldCheck, Mail, Globe, ExternalLink } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: 'register' | 'admin' | 'policy' | 'lookup') => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-slate-900 text-white border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
          {/* Brand Info */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#399FC5] to-[#1c5d75] flex items-center justify-center text-white">
                <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
              </div>
              <span className="text-xl font-extrabold tracking-tight">TAPMATE</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm">
              Official customer registration and lifetime warranty protection infrastructure for premium Tapmate smart charging and connectivity gear.
            </p>
            <div className="space-y-1 text-xs text-slate-400">
              <p className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#399FC5]" />
                <a href="mailto:help@tapmate.in" className="hover:text-white transition-colors">
                  help@tapmate.in
                </a>
              </p>
              <p className="flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-[#399FC5]" />
                <a
                  href="https://tapmate.in"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition-colors flex items-center gap-1"
                >
                  <span>https://tapmate.in</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Warranty Services
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button
                  onClick={() => onNavigate('register')}
                  className="hover:text-[#399FC5] transition-colors"
                >
                  Register New Product
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('lookup')}
                  className="hover:text-[#399FC5] transition-colors"
                >
                  Verify Registration Status
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('policy')}
                  className="hover:text-[#399FC5] transition-colors"
                >
                  Warranty Coverage Terms
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('admin')}
                  className="hover:text-[#399FC5] transition-colors"
                >
                  Administrative Staff Login
                </button>
              </li>
            </ul>
          </div>

          {/* Official Policy Quote */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Official Policy Notice
            </h4>
            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300 leading-relaxed italic">
              &ldquo;Every Tapmate product is built to last. Functional damage may be covered under Tapmate&apos;s applicable lifetime warranty terms and conditions. Warranty eligibility is subject to verification and the official warranty policy.&rdquo;
            </div>
          </div>
        </div>

        {/* Bottom Copyright & Disclaimer */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} Tapmate Technologies. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <button
              onClick={() => onNavigate('policy')}
              className="hover:text-slate-300 transition-colors"
            >
              Warranty Policy
            </button>
            <a
              href="https://tapmate.in"
              target="_blank"
              rel="noreferrer"
              className="hover:text-slate-300 transition-colors"
            >
              tapmate.in
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
