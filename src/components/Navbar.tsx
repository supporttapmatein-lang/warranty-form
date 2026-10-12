import React, { useState } from 'react';
import { ShieldCheck, Shield, Lock, Menu, X, FileText, CheckCircle2 } from 'lucide-react';
import { AdminUser } from '../types/warranty';

interface NavbarProps {
  currentView: 'register' | 'admin' | 'policy' | 'lookup';
  onNavigate: (view: 'register' | 'admin' | 'policy' | 'lookup') => void;
  adminUser: AdminUser | null;
  onLogoutAdmin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  adminUser,
  onLogoutAdmin,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 gap-8">
          {/* Zone 1: Brand Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => {
                onNavigate('register');
                setMobileMenuOpen(false);
              }}
              className="group flex items-center gap-2.5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#399FC5] rounded-lg"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#399FC5] to-[#1e6f8d] flex items-center justify-center text-white shadow-sm shadow-[#399FC5]/20 group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-5.5 h-5.5 stroke-[2.2]" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-extrabold tracking-tight text-slate-900 group-hover:text-[#399FC5] transition-colors leading-none">
                  TAPMATE
                </span>
                <span className="text-[11px] font-semibold tracking-wider uppercase text-slate-600 mt-0.5">
                  Lifetime Warranty
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: Navigation Links (Single-line, unboxed text) */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
            <button
              onClick={() => onNavigate('register')}
              className={`whitespace-nowrap transition-colors hover:text-[#399FC5] ${
                currentView === 'register' ? 'text-[#399FC5] font-semibold' : ''
              }`}
            >
              Register Product
            </button>
            <button
              onClick={() => onNavigate('lookup')}
              className={`whitespace-nowrap transition-colors hover:text-[#399FC5] ${
                currentView === 'lookup' ? 'text-[#399FC5] font-semibold' : ''
              }`}
            >
              Check Status
            </button>
            <button
              onClick={() => onNavigate('policy')}
              className={`whitespace-nowrap transition-colors hover:text-[#399FC5] ${
                currentView === 'policy' ? 'text-[#399FC5] font-semibold' : ''
              }`}
            >
              Warranty Policy
            </button>
            <a
              href="mailto:help@tapmate.in"
              className="whitespace-nowrap transition-colors hover:text-[#399FC5]"
            >
              Support
            </a>
          </nav>

          {/* Zone 3: Primary Action */}
          <div className="hidden md:flex items-center gap-3 shrink-0">
            {adminUser ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onNavigate('admin')}
                  className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
                    currentView === 'admin'
                      ? 'bg-[#399FC5] text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5" />
                  Admin Dashboard
                </button>
                <button
                  onClick={onLogoutAdmin}
                  className="px-3 py-2 text-xs font-medium text-slate-500 hover:text-rose-600 transition-colors whitespace-nowrap"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => onNavigate('admin')}
                className={`px-4 py-2 text-xs font-semibold rounded-lg border transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  currentView === 'admin'
                    ? 'bg-[#399FC5] text-white border-[#399FC5]'
                    : 'border-slate-300 text-slate-700 hover:border-[#399FC5] hover:text-[#399FC5] bg-white'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                Staff Portal
              </button>
            )}
          </div>

          {/* Mobile hamburger button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Navigation Menu"
              className="p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-3 pb-5 space-y-3 shadow-lg">
          <div className="flex flex-col space-y-2 text-sm font-medium">
            <button
              onClick={() => {
                onNavigate('register');
                setMobileMenuOpen(false);
              }}
              className={`text-left px-3 py-2 rounded-lg transition-colors ${
                currentView === 'register'
                  ? 'bg-sky-50 text-[#399FC5] font-semibold'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              Register Product
            </button>
            <button
              onClick={() => {
                onNavigate('lookup');
                setMobileMenuOpen(false);
              }}
              className={`text-left px-3 py-2 rounded-lg transition-colors ${
                currentView === 'lookup'
                  ? 'bg-sky-50 text-[#399FC5] font-semibold'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              Check Warranty Status
            </button>
            <button
              onClick={() => {
                onNavigate('policy');
                setMobileMenuOpen(false);
              }}
              className={`text-left px-3 py-2 rounded-lg transition-colors ${
                currentView === 'policy'
                  ? 'bg-sky-50 text-[#399FC5] font-semibold'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              Warranty Policy & Terms
            </button>
            <a
              href="mailto:help@tapmate.in"
              className="text-left px-3 py-2 text-slate-700 hover:bg-slate-50 rounded-lg"
            >
              Support (help@tapmate.in)
            </a>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={() => {
                onNavigate('admin');
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
            >
              <Lock className="w-3.5 h-3.5" />
              {adminUser ? 'Open Admin Dashboard' : 'Staff Portal Login'}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
