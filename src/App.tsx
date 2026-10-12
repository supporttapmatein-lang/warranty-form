/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { RegistrationForm } from './components/RegistrationForm';
import { SuccessCertificate } from './components/SuccessCertificate';
import { AdminDashboard } from './components/AdminDashboard';
import { WarrantyPolicy } from './components/WarrantyPolicy';
import { LookupModal } from './components/LookupModal';
import { Footer } from './components/Footer';
import { Registration, AdminUser, AppConfig, DEFAULT_PRODUCTS, DEFAULT_PURCHASE_CHANNELS } from './types/warranty';
import { initAuth, logoutAdmin, subscribeAppConfig, DEFAULT_APP_CONFIG } from './lib/firebase';

export default function App() {
  const [currentView, setCurrentView] = useState<'register' | 'admin' | 'policy' | 'lookup'>(
    'register'
  );
  const [activeRegistration, setActiveRegistration] = useState<Registration | null>(null);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [showLookupModal, setShowLookupModal] = useState(false);
  const [appConfig, setAppConfig] = useState<AppConfig>(DEFAULT_APP_CONFIG);

  // Subscribe to dynamic app config (products, purchase channels, card image)
  useEffect(() => {
    const unsubscribeConfig = subscribeAppConfig((cfg) => {
      setAppConfig(cfg);
    });

    return () => {
      if (typeof unsubscribeConfig === 'function') {
        unsubscribeConfig();
      }
    };
  }, []);

  // Initialize Firebase Auth listener on app boot
  useEffect(() => {
    const unsubscribe = initAuth(
      (user) => {
        setAdminUser({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          isAdmin: true,
        });
      },
      () => {
        setAdminUser(null);
      }
    );

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  const handleRegistrationSuccess = (reg: Registration) => {
    setActiveRegistration(reg);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRegisterAnother = () => {
    setActiveRegistration(null);
    setCurrentView('register');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAdminLogout = async () => {
    await logoutAdmin();
    setAdminUser(null);
    setCurrentView('register');
  };

  const handleNavigation = (view: 'register' | 'admin' | 'policy' | 'lookup') => {
    if (view === 'lookup') {
      setShowLookupModal(true);
      return;
    }
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-800 selection:bg-[#399FC5] selection:text-white">
      {/* Top Navigation */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigation}
        adminUser={adminUser}
        onLogoutAdmin={handleAdminLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentView === 'admin' ? (
          <AdminDashboard
            adminUser={adminUser}
            onAdminLoginSuccess={(u) => setAdminUser(u)}
            onAdminLogout={handleAdminLogout}
            appConfig={appConfig}
            onConfigUpdated={(cfg) => setAppConfig(cfg)}
          />
        ) : currentView === 'policy' ? (
          <WarrantyPolicy onRegisterClick={() => handleNavigation('register')} />
        ) : activeRegistration ? (
          <SuccessCertificate
            registration={activeRegistration}
            onRegisterAnother={handleRegisterAnother}
            cardImageUrl={appConfig.cardImageUrl}
          />
        ) : (
          <>
            <HeroBanner cardImageUrl={appConfig.cardImageUrl} />
            <RegistrationForm
              onSuccess={handleRegistrationSuccess}
              products={appConfig.products}
              purchaseChannels={appConfig.purchaseChannels}
            />
          </>
        )}
      </main>

      {/* Global Lookup Modal */}
      {showLookupModal && (
        <LookupModal
          onSelectRegistration={(reg) => {
            setActiveRegistration(reg);
            setCurrentView('register');
          }}
          onClose={() => setShowLookupModal(false)}
        />
      )}

      {/* Footer */}
      <Footer onNavigate={handleNavigation} />
    </div>
  );
}
