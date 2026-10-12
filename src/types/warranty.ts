export type PurchaseSource = string;

export type RegistrationStatus = 'Pending' | 'Verified' | 'Rejected';

export interface AppConfig {
  products: string[];
  purchaseChannels: string[];
  cardImageUrl: string;
  updatedAt?: string;
  updatedBy?: string;
}

export const DEFAULT_PRODUCTS = [
  'Tapmate 3-in-1 Foldable MagSafe Wireless Charging Stand',
  'Tapmate UltraFlow 100W Braided Fast Charging Cable',
  'Tapmate SnapPower 10,000mAh Magnetic Power Bank',
  'Tapmate NeoGrip MagSafe Multi-Angle Ring & Kickstand',
  'Tapmate ArmorShield Rugged Case with Action Grip',
  'Tapmate GaN 65W Dual USB-C Fast Wall Charger',
  'Tapmate MagVent Car Mount Wireless Charger',
];

export const DEFAULT_PURCHASE_CHANNELS = [
  'Tapmate Official Website',
  'Online Marketplace',
  'Retail Store / Dealer',
  'Other',
];

export interface Registration {
  id: string; // Unique warranty registration ID (e.g. TM-LW-2026-78429B)
  fullName: string;
  email: string;
  mobile: string;
  address?: string;
  productName: string;
  modelVariant?: string;
  serialNumber?: string;
  purchaseDate: string; // YYYY-MM-DD
  purchasedFrom: PurchaseSource;
  orderId?: string;
  invoiceFileName?: string;
  invoiceFileData?: string; // base64 or URL
  agreedToTerms: boolean;
  status: RegistrationStatus;
  adminNotes?: string;
  confirmationEmailSent?: boolean;
  emailSentAt?: string;
  emailMessageId?: string;
  emailError?: string;
  emailAttemptedAt?: string;
  adminNotifiedAt?: string;
  createdAt: string; // ISO string
  updatedAt?: string; // ISO string
}

export interface RegistrationFormData {
  fullName: string;
  email: string;
  mobile: string;
  address: string;
  productName: string;
  modelVariant: string;
  serialNumber: string;
  purchaseDate: string;
  purchasedFrom: PurchaseSource;
  orderId: string;
  invoiceFile: File | null;
  invoiceFileName: string;
  invoiceFileData: string;
  agreedToTerms: boolean;
}

export interface FormValidationErrors {
  fullName?: string;
  email?: string;
  mobile?: string;
  productName?: string;
  purchaseDate?: string;
  purchasedFrom?: string;
  invoiceFile?: string;
  agreedToTerms?: string;
  general?: string;
}

export interface AdminUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  isAdmin: boolean;
}

export interface GoogleFormMetadata {
  formId: string;
  title: string;
  responderUri?: string;
  linkedAt?: string;
}
