import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Lock,
  Search,
  Filter,
  Download,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  Trash2,
  Eye,
  RefreshCw,
  LogOut,
  ExternalLink,
  PlusCircle,
  ShieldCheck,
  AlertTriangle,
  FileSpreadsheet,
  ChevronRight,
  X,
  MessageSquare,
  Save,
  Check,
  Mail,
  Bell,
  Sliders,
  Volume2,
  VolumeX,
  Sparkles,
} from 'lucide-react';
import { Registration, RegistrationStatus, AdminUser, AppConfig } from '../types/warranty';
import {
  getRegistrations,
  updateRegistrationStatus,
  deleteRegistration,
  googleSignIn,
  logoutAdmin,
  subscribeRegistrations,
  updateAppConfig,
} from '../lib/firebase';
import {
  createTapmateGoogleForm,
  syncGoogleFormResponsesToFirestore,
} from '../lib/googleForms';
import { StoreCustomization } from './StoreCustomization';

interface AdminDashboardProps {
  adminUser: AdminUser | null;
  onAdminLoginSuccess: (user: AdminUser) => void;
  onAdminLogout: () => void;
  appConfig: AppConfig;
  onConfigUpdated?: (config: AppConfig) => void;
}

// Synthesize pleasant two-tone chime via Web Audio API
function playNotificationChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(698.46, ctx.currentTime); // F5
    osc.frequency.setValueAtTime(1046.5, ctx.currentTime + 0.12); // C6
    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  } catch (e) {
    // Ignore autoplay or audio context block
  }
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  adminUser,
  onAdminLoginSuccess,
  onAdminLogout,
  appConfig,
  onConfigUpdated,
}) => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | RegistrationStatus>('All');
  const [productFilter, setProductFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedReg, setSelectedReg] = useState<Registration | null>(null);
  const [adminNoteInput, setAdminNoteInput] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [statusFeedback, setStatusFeedback] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Tabs: registrations | customization | googleForms
  const [activeTab, setActiveTab] = useState<'registrations' | 'customization' | 'googleForms'>(
    'registrations'
  );

  // Notification State
  const prevCountRef = useRef<number | null>(null);
  const [recentAlert, setRecentAlert] = useState<Registration | null>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [desktopAlertsEnabled, setDesktopAlertsEnabled] = useState<boolean>(() => {
    return typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted';
  });
  const [showNotificationMenu, setShowNotificationMenu] = useState(false);
  const [notificationHistory, setNotificationHistory] = useState<Registration[]>([]);

  const handleToggleDesktopAlerts = async () => {
    if (!('Notification' in window)) {
      alert('Desktop notifications are not supported in your browser.');
      return;
    }
    if (Notification.permission === 'granted') {
      try {
        new Notification('Tapmate Admin Notifications Active', {
          body: 'You will receive immediate alerts whenever a customer registers product warranty.',
        });
      } catch (e) {}
      setDesktopAlertsEnabled(true);
      return;
    }
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      setDesktopAlertsEnabled(true);
      try {
        new Notification('Tapmate Admin Notifications Active', {
          body: 'You will receive immediate alerts whenever a customer registers product warranty.',
        });
      } catch (e) {}
    } else {
      setDesktopAlertsEnabled(false);
    }
  };

  // Google Forms Integration State
  const [isCreatingForm, setIsCreatingForm] = useState(false);
  const [createdFormUri, setCreatedFormUri] = useState<string | null>(null);
  const [googleFormIdInput, setGoogleFormIdInput] = useState('');
  const [isSyncingResponses, setIsSyncingResponses] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  // Real-time Registrations Subscription
  useEffect(() => {
    if (!adminUser) return;
    setIsLoading(true);

    const unsubscribe = subscribeRegistrations(
      (records) => {
        setRegistrations(records);
        setIsLoading(false);

        // Detect newly submitted registration
        if (prevCountRef.current !== null && records.length > prevCountRef.current) {
          const newest = records[0];
          setRecentAlert(newest);
          setNotificationHistory((prev) => [newest, ...prev.slice(0, 9)]);
          setUnreadCount((c) => c + (records.length - prevCountRef.current!));
          if (soundEnabled) {
            playNotificationChime();
          }
          if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
            try {
              new Notification('New Tapmate Warranty Registration!', {
                body: `${newest.fullName} registered ${newest.productName} [${newest.id}]`,
              });
            } catch (e) {
              console.warn('Could not fire desktop notification:', e);
            }
          }
        }
        prevCountRef.current = records.length;
      },
      (err) => {
        console.warn('Real-time listener warning:', err);
        setIsLoading(false);
      }
    );

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [adminUser, soundEnabled]);

  // Open Details Modal
  const handleOpenDetails = (reg: Registration) => {
    setSelectedReg(reg);
    setAdminNoteInput(reg.adminNotes || '');
    setStatusFeedback(null);
  };

  // Status Change
  const handleStatusChange = async (newStatus: RegistrationStatus) => {
    if (!selectedReg) return;
    setIsUpdatingStatus(true);
    setStatusFeedback(null);
    try {
      await updateRegistrationStatus(selectedReg.id, newStatus, adminNoteInput);
      setSelectedReg((prev) =>
        prev
          ? {
              ...prev,
              status: newStatus,
              adminNotes: adminNoteInput,
              updatedAt: new Date().toISOString(),
            }
          : null
      );
      setRegistrations((prev) =>
        prev.map((r) =>
          r.id === selectedReg.id
            ? { ...r, status: newStatus, adminNotes: adminNoteInput, updatedAt: new Date().toISOString() }
            : r
        )
      );
      setStatusFeedback(`Status updated to ${newStatus}`);
      setTimeout(() => setStatusFeedback(null), 3000);
    } catch (err: any) {
      console.error('Failed to update status:', err);
      setStatusFeedback('Failed to update status in Firestore.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Save Notes Only
  const handleSaveNotes = async () => {
    if (!selectedReg) return;
    setIsUpdatingStatus(true);
    try {
      await updateRegistrationStatus(selectedReg.id, selectedReg.status, adminNoteInput);
      setSelectedReg((prev) => (prev ? { ...prev, adminNotes: adminNoteInput } : null));
      setRegistrations((prev) =>
        prev.map((r) => (r.id === selectedReg.id ? { ...r, adminNotes: adminNoteInput } : r))
      );
      setStatusFeedback('Internal notes saved successfully');
      setTimeout(() => setStatusFeedback(null), 3000);
    } catch (err) {
      console.error('Failed to save notes:', err);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Delete Registration
  const handleDeleteRegistration = async (id: string) => {
    const confirmed = window.confirm(
      'Are you sure you want to permanently remove this registration record?'
    );
    if (!confirmed) return;

    try {
      await deleteRegistration(id);
      setRegistrations((prev) => prev.filter((r) => r.id !== id));
      if (selectedReg?.id === id) {
        setSelectedReg(null);
      }
    } catch (err: any) {
      console.error('Failed to delete registration:', err);
      alert('Failed to delete registration: ' + err.message);
    }
  };

  // Google Login
  const handleLogin = async () => {
    setIsLoggingIn(true);
    setAuthError(null);
    try {
      const res = await googleSignIn();
      if (res?.user) {
        onAdminLoginSuccess({
          uid: res.user.uid,
          email: res.user.email,
          displayName: res.user.displayName,
          isAdmin: true,
        });
      }
    } catch (err: any) {
      console.error('Admin login failed:', err);
      setAuthError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Save Store Customization Config
  const handleSaveAppConfig = async (newConfig: Partial<AppConfig>) => {
    await updateAppConfig(newConfig);
    if (onConfigUpdated) {
      onConfigUpdated({
        ...appConfig,
        ...newConfig,
      });
    }
  };

  // Enhanced CSV Export (User Mandate)
  const handleExportCSV = (exportOnlyFiltered = false) => {
    const recordsToExport = exportOnlyFiltered ? filteredRegistrations : registrations;
    if (recordsToExport.length === 0) {
      alert('No registration records to export.');
      return;
    }

    const headers = [
      'Registration ID',
      'Created At',
      'Customer Full Name',
      'Email Address',
      'Mobile Number',
      'Address',
      'Product Name',
      'Model / Variant',
      'Serial / Batch Number',
      'Purchase Date',
      'Purchased From',
      'Order ID / Invoice #',
      'Invoice Attached',
      'Warranty Status',
      'Admin Internal Notes',
      'Email Confirmation Sent',
      'Email Dispatched At',
    ];

    const escapeCsv = (str: string | undefined | null) => {
      if (!str) return '""';
      return `"${String(str).replace(/"/g, '""')}"`;
    };

    const rows = recordsToExport.map((r) => [
      escapeCsv(r.id),
      escapeCsv(new Date(r.createdAt).toLocaleString()),
      escapeCsv(r.fullName),
      escapeCsv(r.email),
      escapeCsv(r.mobile),
      escapeCsv(r.address),
      escapeCsv(r.productName),
      escapeCsv(r.modelVariant),
      escapeCsv(r.serialNumber),
      escapeCsv(r.purchaseDate),
      escapeCsv(r.purchasedFrom),
      escapeCsv(r.orderId),
      escapeCsv(r.invoiceFileName ? 'Yes' : 'No'),
      escapeCsv(r.status),
      escapeCsv(r.adminNotes),
      escapeCsv(r.confirmationEmailSent ? 'Yes' : 'No'),
      escapeCsv(r.emailSentAt || ''),
    ]);

    // UTF-8 BOM for flawless Excel and Google Sheets parsing
    const BOM = '\uFEFF';
    const csvContent = BOM + [headers.join(','), ...rows.map((row) => row.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const dateStr = new Date().toISOString().slice(0, 10);
    const fileName = exportOnlyFiltered
      ? `tapmate_filtered_registrations_${dateStr}.csv`
      : `tapmate_all_registrations_${dateStr}.csv`;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Google Forms: Create Official Form
  const handleCreateGoogleForm = async () => {
    setIsCreatingForm(true);
    setSyncFeedback(null);
    try {
      const res = await createTapmateGoogleForm();
      setCreatedFormUri(res.responderUri);
      setGoogleFormIdInput(res.formId);
      setSyncFeedback(`Successfully created Google Form "${res.title}" with ID: ${res.formId}`);
    } catch (err: any) {
      console.error('Failed to create form:', err);
      setSyncFeedback(err.message || 'Failed to create Google Form.');
    } finally {
      setIsCreatingForm(false);
    }
  };

  // Google Forms: Sync Responses
  const handleSyncResponses = async () => {
    if (!googleFormIdInput.trim()) {
      alert('Please enter a valid Google Form ID or create one above.');
      return;
    }
    setIsSyncingResponses(true);
    setSyncFeedback(null);
    try {
      const { importedCount } = await syncGoogleFormResponsesToFirestore(googleFormIdInput.trim());
      setSyncFeedback(`Imported ${importedCount} response(s) from Google Form into Firestore.`);
    } catch (err: any) {
      console.error('Failed to sync responses:', err);
      setSyncFeedback(err.message || 'Failed to fetch form responses.');
    } finally {
      setIsSyncingResponses(false);
    }
  };

  // Filter & Search Logic
  const filteredRegistrations = useMemo(() => {
    return registrations.filter((r) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        r.fullName.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.mobile.includes(q) ||
        r.productName.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q) ||
        (r.serialNumber && r.serialNumber.toLowerCase().includes(q)) ||
        (r.orderId && r.orderId.toLowerCase().includes(q));

      const matchesStatus = statusFilter === 'All' || r.status === statusFilter;
      const matchesProduct = productFilter === 'All' || r.productName === productFilter;
      const matchesDate = !dateFilter || r.purchaseDate === dateFilter || r.createdAt.startsWith(dateFilter);

      return matchesSearch && matchesStatus && matchesProduct && matchesDate;
    });
  }, [registrations, searchQuery, statusFilter, productFilter, dateFilter]);

  // Unique Products List for Filter Dropdown
  const uniqueProducts = useMemo(() => {
    const set = new Set<string>();
    registrations.forEach((r) => set.add(r.productName));
    return Array.from(set);
  }, [registrations]);

  // Metrics
  const stats = useMemo(() => {
    const total = registrations.length;
    const pending = registrations.filter((r) => r.status === 'Pending').length;
    const verified = registrations.filter((r) => r.status === 'Verified').length;
    const rejected = registrations.filter((r) => r.status === 'Rejected').length;
    return { total, pending, verified, rejected };
  }, [registrations]);

  // If Not Authenticated, show Admin Login Screen
  if (!adminUser) {
    return (
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/60 border border-slate-200 text-center space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center mx-auto shadow-md">
            <Lock className="w-7 h-7 text-[#399FC5]" />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-slate-900">Tapmate Staff Portal</h2>
            <p className="text-xs text-slate-500 mt-1">
              Authorized administrator access to verify customer registrations and customize warranty settings.
            </p>
          </div>

          {authError && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs text-left">
              {authError}
            </div>
          )}

          <div className="pt-2">
            <button
              onClick={handleLogin}
              disabled={isLoggingIn}
              className="gsi-material-button w-full shadow-sm"
            >
              <div className="gsi-material-button-icon">
                <svg viewBox="0 0 48 48" className="w-5 h-5">
                  <path
                    fill="#EA4335"
                    d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                  />
                  <path
                    fill="#34A853"
                    d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                  />
                </svg>
              </div>
              <span>{isLoggingIn ? 'Authenticating...' : 'Sign in with Google'}</span>
            </button>
          </div>

          <div className="pt-4 border-t border-slate-100 text-left text-xs text-slate-500 space-y-1">
            <p className="font-semibold text-slate-700">Protected Administrator Environment</p>
            <p>
              Direct Firestore reads are secured by database security rules. Customer PII is inaccessible to unauthorized public sessions.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Real-time Notification Alert Banner (Triggered when new registration submitted) */}
      {recentAlert && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-500 to-[#1e6f8d] text-white shadow-lg flex items-center justify-between gap-4 animate-in fade-in slide-in-from-top-3 duration-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
              <Bell className="w-5 h-5 text-white animate-bounce" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-sky-200">
                New Registration Received!
              </div>
              <p className="text-sm font-semibold mt-0.5">
                <span className="font-bold underline">{recentAlert.fullName}</span> just registered{' '}
                <span className="font-bold">{recentAlert.productName}</span> ({recentAlert.id})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                handleOpenDetails(recentAlert);
                setRecentAlert(null);
                setUnreadCount(0);
              }}
              className="px-4 py-2 rounded-xl bg-white text-slate-900 text-xs font-bold hover:bg-sky-50 shadow-sm transition-all whitespace-nowrap"
            >
              View Record
            </button>
            <button
              onClick={() => setRecentAlert(null)}
              className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10"
              title="Dismiss banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Top Header & Admin Profile Info */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#399FC5]">
            <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
            Administrative Portal
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-0.5">
            Warranty Registry & Customization Console
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Logged in as <span className="font-semibold text-slate-800">{adminUser.email}</span> · Real-time Sync Active
          </p>
        </div>

        {/* Toolbar: Sound Toggle, Desktop Alerts, Notification Bell, Export CSV, Refresh, Logout */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Audio Chime Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              soundEnabled
                ? 'bg-sky-50 border-sky-200 text-[#399FC5]'
                : 'bg-white border-slate-200 text-slate-400 hover:text-slate-700'
            }`}
            title={soundEnabled ? 'Submission chime enabled' : 'Submission chime muted'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Desktop Push Notifications Toggle */}
          <button
            onClick={handleToggleDesktopAlerts}
            className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              desktopAlertsEnabled
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm'
                : 'bg-white border-slate-200 text-slate-500 hover:text-slate-800'
            }`}
            title={
              desktopAlertsEnabled
                ? 'Desktop popup notifications are active'
                : 'Click to enable browser desktop notifications for new submissions'
            }
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">
              {desktopAlertsEnabled ? 'Desktop Alerts Active' : 'Enable Desktop Alerts'}
            </span>
          </button>

          {/* Notifications Center Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotificationMenu(!showNotificationMenu);
                setUnreadCount(0);
              }}
              className="relative p-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all"
              title="Notifications"
            >
              <Bell className="w-4 h-4 text-[#399FC5]" />
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 rounded-full bg-rose-600 text-white font-bold text-[10px] animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotificationMenu && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-30 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-900">Recent Submission Alerts</span>
                  <button
                    onClick={() => setShowNotificationMenu(false)}
                    className="text-slate-400 hover:text-slate-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {notificationHistory.length === 0 ? (
                  <p className="text-xs text-slate-400 py-3 text-center">
                    No new submissions during this session.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {notificationHistory.map((item, i) => (
                      <div
                        key={i}
                        onClick={() => {
                          handleOpenDetails(item);
                          setShowNotificationMenu(false);
                        }}
                        className="p-2.5 rounded-xl bg-slate-50 hover:bg-sky-50 cursor-pointer transition-colors text-xs"
                      >
                        <div className="flex items-center justify-between font-semibold text-slate-800">
                          <span className="truncate">{item.fullName}</span>
                          <span className="font-mono text-[10px] text-slate-500">{item.id}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">{item.productName}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Export All CSV Button */}
          <button
            onClick={() => handleExportCSV(false)}
            className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 flex items-center gap-1.5 shadow-sm transition-all"
            title="Download complete registration database as CSV"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>Export CSV</span>
          </button>

          {/* Sign Out */}
          <button
            onClick={onAdminLogout}
            className="px-3.5 py-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold hover:bg-rose-100 flex items-center gap-1.5 transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Metric Cards (Tabular figures) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Total Registrations
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1 font-mono tabular-nums">
            {stats.total}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Recorded in central database</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-600 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            Pending Verification
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-700 mt-1 font-mono tabular-nums">
            {stats.pending}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Awaiting invoice / batch review</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Verified Active
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-700 mt-1 font-mono tabular-nums">
            {stats.verified}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Approved for warranty coverage</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-rose-600 flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5" />
            Rejected
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-rose-700 mt-1 font-mono tabular-nums">
            {stats.rejected}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Counterfeit or invalid purchase</p>
        </div>
      </div>

      {/* Tabs: Registrations vs Customization vs Google Forms */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('registrations')}
          className={`pb-3 px-3 text-sm font-bold border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'registrations'
              ? 'border-[#399FC5] text-[#399FC5]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Customer Registrations ({filteredRegistrations.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('customization')}
          className={`pb-3 px-3 text-sm font-bold border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'customization'
              ? 'border-[#399FC5] text-[#399FC5]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sliders className="w-4 h-4 text-[#399FC5]" />
          <span>Store Customization (Products, Channels & Card)</span>
        </button>

        <button
          onClick={() => setActiveTab('googleForms')}
          className={`pb-3 px-3 text-sm font-bold border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'googleForms'
              ? 'border-[#399FC5] text-[#399FC5]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          <span>Google Forms Integration</span>
        </button>
      </div>

      {/* TAB 1: Registrations Table */}
      {activeTab === 'registrations' && (
        <div className="space-y-5">
          {/* Search & Filter Toolbar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row items-stretch md:items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by customer name, email, phone, product, serial, ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#399FC5] bg-slate-50/50"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#399FC5]"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Verified">Verified</option>
              <option value="Rejected">Rejected</option>
            </select>

            {/* Product Filter */}
            <select
              value={productFilter}
              onChange={(e) => setProductFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#399FC5] max-w-[200px] truncate"
            >
              <option value="All">All Products</option>
              {uniqueProducts.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>

            {/* Date Filter */}
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#399FC5]"
              title="Filter by date"
            />

            {/* Export Filtered CSV */}
            <button
              onClick={() => handleExportCSV(true)}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-colors"
              title="Export only records currently visible matching filters"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>Export Filtered ({filteredRegistrations.length})</span>
            </button>

            {(searchQuery || statusFilter !== 'All' || productFilter !== 'All' || dateFilter) && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('All');
                  setProductFilter('All');
                  setDateFilter('');
                }}
                className="text-xs text-slate-500 hover:text-rose-600 px-2 py-1 font-semibold whitespace-nowrap"
              >
                Clear
              </button>
            )}
          </div>

          {/* Registrations Table */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3.5 px-4">Registration ID</th>
                    <th className="py-3.5 px-4">Customer</th>
                    <th className="py-3.5 px-4">Product Details</th>
                    <th className="py-3.5 px-4">Purchase Date</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-500">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#399FC5] mb-2" />
                        <span>Loading registrations from Firestore...</span>
                      </td>
                    </tr>
                  ) : filteredRegistrations.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-500">
                        <div className="max-w-xs mx-auto space-y-2">
                          <p className="font-semibold text-slate-700">No registrations found</p>
                          <p className="text-xs text-slate-400">
                            {registrations.length === 0
                              ? 'No customers have registered warranties yet.'
                              : 'No registrations match your current filters.'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredRegistrations.map((reg) => (
                      <tr
                        key={reg.id}
                        className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                        onClick={() => handleOpenDetails(reg)}
                      >
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900 tabular-nums">
                          {reg.id}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-900">{reg.fullName}</div>
                          <div className="text-slate-500 text-xs">{reg.email}</div>
                          <div className="text-slate-400 text-[11px]">{reg.mobile}</div>
                        </td>
                        <td className="py-3.5 px-4 max-w-[240px]">
                          <div className="font-medium text-slate-800 truncate">
                            {reg.productName}
                          </div>
                          {reg.serialNumber && (
                            <div className="text-[11px] text-slate-500 font-mono">
                              SN: {reg.serialNumber}
                            </div>
                          )}
                          <div className="text-[11px] text-slate-400">{reg.purchasedFrom}</div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 font-mono text-xs tabular-nums">
                          {reg.purchaseDate}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                              reg.status === 'Verified'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : reg.status === 'Rejected'
                                ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                : 'bg-amber-100 text-amber-800 border border-amber-200'
                            }`}
                          >
                            {reg.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div
                            className="inline-flex items-center gap-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={() => handleOpenDetails(reg)}
                              className="p-1.5 rounded-lg text-slate-600 hover:text-[#399FC5] hover:bg-sky-50 transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteRegistration(reg.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Delete Record"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Store & Product Customization (User Mandate) */}
      {activeTab === 'customization' && (
        <StoreCustomization
          appConfig={appConfig}
          onSaveConfig={handleSaveAppConfig}
        />
      )}

      {/* TAB 3: Google Forms Integration */}
      {activeTab === 'googleForms' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">
                Google Forms Warranty Integration
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
                Connect your Google Workspace to generate official warranty registration forms, share them with customers via QR codes on packaging, and automatically sync responses into Firestore.
              </p>
            </div>
          </div>

          {syncFeedback && (
            <div className="p-4 rounded-xl bg-sky-50 border border-sky-200 text-sky-900 text-xs sm:text-sm flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{syncFeedback}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* Action 1: Create Form */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
                <PlusCircle className="w-4 h-4 text-[#399FC5]" />
                1. Generate Official Google Form
              </div>
              <p className="text-xs text-slate-600">
                Instantly provision a pre-configured Tapmate Lifetime Warranty Registration Form in your Google Drive with standardized questions (Customer Name, Email, Product, Serial, Date).
              </p>

              <button
                onClick={handleCreateGoogleForm}
                disabled={isCreatingForm}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 disabled:bg-slate-400 transition-all flex items-center justify-center gap-2"
              >
                {isCreatingForm ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                )}
                <span>
                  {isCreatingForm ? 'Provisioning Form...' : 'Create Form in Google Drive'}
                </span>
              </button>

              {createdFormUri && (
                <div className="p-3 rounded-xl bg-white border border-emerald-200 space-y-1.5 text-xs">
                  <span className="font-bold text-emerald-800 block">Form Created & Ready:</span>
                  <a
                    href={createdFormUri}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#399FC5] hover:underline flex items-center gap-1 font-semibold truncate"
                  >
                    <span>Open Public Responder Form</span>
                    <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                  </a>
                </div>
              )}
            </div>

            {/* Action 2: Sync Responses */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
                <RefreshCw className="w-4 h-4 text-[#399FC5]" />
                2. Sync Google Form Responses
              </div>
              <p className="text-xs text-slate-600">
                Pull customer submissions collected through the Google Form directly into Firestore as pending registrations.
              </p>

              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                  Google Form ID
                </label>
                <input
                  type="text"
                  placeholder="e.g. 1FAIpQLSc... or auto-filled ID"
                  value={googleFormIdInput}
                  onChange={(e) => setGoogleFormIdInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#399FC5]"
                />
              </div>

              <button
                onClick={handleSyncResponses}
                disabled={isSyncingResponses}
                className="w-full py-2.5 px-4 rounded-xl bg-[#399FC5] text-white text-xs font-bold hover:bg-[#2e86a7] disabled:bg-slate-400 transition-all flex items-center justify-center gap-2"
              >
                {isSyncingResponses ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                <span>
                  {isSyncingResponses ? 'Syncing Responses...' : 'Sync Responses to Database'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal / Drawer */}
      {selectedReg && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#399FC5]">
                  Registration Record
                </span>
                <h3 className="text-xl font-extrabold text-slate-900 font-mono">
                  {selectedReg.id}
                </h3>
              </div>
              <button
                onClick={() => setSelectedReg(null)}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {statusFeedback && (
                <div className="p-3 rounded-xl bg-sky-50 border border-sky-200 text-sky-800 text-xs font-semibold flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>{statusFeedback}</span>
                </div>
              )}

              {/* Status Selector */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                    Warranty Status
                  </span>
                  <span
                    className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-bold ${
                      selectedReg.status === 'Verified'
                        ? 'bg-emerald-100 text-emerald-800'
                        : selectedReg.status === 'Rejected'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {selectedReg.status}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    disabled={isUpdatingStatus}
                    onClick={() => handleStatusChange('Pending')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      selectedReg.status === 'Pending'
                        ? 'bg-amber-500 text-white border-amber-600'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    Pending
                  </button>
                  <button
                    disabled={isUpdatingStatus}
                    onClick={() => handleStatusChange('Verified')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      selectedReg.status === 'Verified'
                        ? 'bg-emerald-600 text-white border-emerald-700'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    Verify
                  </button>
                  <button
                    disabled={isUpdatingStatus}
                    onClick={() => handleStatusChange('Rejected')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      selectedReg.status === 'Rejected'
                        ? 'bg-rose-600 text-white border-rose-700'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    Reject
                  </button>
                </div>
              </div>

              {/* Data Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block font-medium">Customer Name</span>
                  <span className="font-bold text-slate-900 text-sm mt-0.5 block">
                    {selectedReg.fullName}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block font-medium">Email Address</span>
                  <span className="font-semibold text-slate-900 text-sm mt-0.5 block">
                    {selectedReg.email}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block font-medium">Mobile Number</span>
                  <span className="font-semibold text-slate-900 text-sm mt-0.5 block">
                    {selectedReg.mobile}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block font-medium">Address</span>
                  <span className="font-semibold text-slate-900 mt-0.5 block">
                    {selectedReg.address || 'Not provided'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block font-medium">Product</span>
                  <span className="font-bold text-slate-900 mt-0.5 block">
                    {selectedReg.productName}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block font-medium">Model / Variant</span>
                  <span className="font-semibold text-slate-900 mt-0.5 block">
                    {selectedReg.modelVariant || 'Standard'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block font-medium">Serial / Batch Number</span>
                  <span className="font-mono font-bold text-slate-900 mt-0.5 block">
                    {selectedReg.serialNumber || 'None'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block font-medium">Purchase Date</span>
                  <span className="font-mono font-semibold text-slate-900 mt-0.5 block">
                    {selectedReg.purchaseDate}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block font-medium">Purchased From</span>
                  <span className="font-semibold text-slate-900 mt-0.5 block">
                    {selectedReg.purchasedFrom}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block font-medium">Order / Invoice ID</span>
                  <span className="font-mono font-semibold text-slate-900 mt-0.5 block">
                    {selectedReg.orderId || 'None'}
                  </span>
                </div>
              </div>

              {/* Automated Confirmation Email Status */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#399FC5] shrink-0" />
                  <div>
                    <span className="font-bold text-slate-800">Confirmation Email: </span>
                    {selectedReg.confirmationEmailSent ? (
                      <span className="text-emerald-700 font-semibold">
                        Dispatched{' '}
                        {selectedReg.emailSentAt
                          ? `(${new Date(selectedReg.emailSentAt).toLocaleDateString()})`
                          : ''}
                      </span>
                    ) : selectedReg.emailError ? (
                      <span className="text-rose-600 font-semibold">
                        Failed: {selectedReg.emailError}
                      </span>
                    ) : (
                      <span className="text-amber-700 font-semibold">
                        Queued for dispatch via Cloud Function
                      </span>
                    )}
                  </div>
                </div>
                {selectedReg.emailMessageId && (
                  <span className="font-mono text-[10px] text-slate-400 truncate max-w-[200px]" title={selectedReg.emailMessageId}>
                    ID: {selectedReg.emailMessageId}
                  </span>
                )}
              </div>

              {/* Invoice Attachment Preview / Download */}
              {selectedReg.invoiceFileName && selectedReg.invoiceFileData && (
                <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#1c5d75] flex items-center gap-1.5">
                    <FileText className="w-4 h-4" />
                    Uploaded Purchase Invoice
                  </span>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800 truncate">
                      {selectedReg.invoiceFileName}
                    </span>
                    <a
                      href={selectedReg.invoiceFileData}
                      download={selectedReg.invoiceFileName}
                      className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 hover:text-[#399FC5] font-semibold flex items-center gap-1 shadow-sm"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download File</span>
                    </a>
                  </div>
                  {selectedReg.invoiceFileData.startsWith('data:image') && (
                    <div className="mt-2 max-h-48 overflow-hidden rounded-xl border border-slate-200 bg-white">
                      <img
                        src={selectedReg.invoiceFileData}
                        alt="Customer Invoice Preview"
                        className="w-full h-auto object-contain max-h-48"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Internal Admin Notes */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-[#399FC5]" />
                  Internal Administrative Notes
                </label>
                <textarea
                  rows={3}
                  value={adminNoteInput}
                  onChange={(e) => setAdminNoteInput(e.target.value)}
                  placeholder="Add verification notes, distributor confirmation details, or rejection reasons..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#399FC5]"
                />
                <button
                  onClick={handleSaveNotes}
                  disabled={isUpdatingStatus}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Notes</span>
                </button>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => handleDeleteRegistration(selectedReg.id)}
                className="text-xs text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Record</span>
              </button>
              <button
                onClick={() => setSelectedReg(null)}
                className="px-4 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
