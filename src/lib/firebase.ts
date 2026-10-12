import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
  signOut,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  getDocFromServer,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import {
  Registration,
  RegistrationStatus,
  AppConfig,
  DEFAULT_PRODUCTS,
  DEFAULT_PURCHASE_CHANNELS,
} from '../types/warranty';

// 1. Initialize Firebase App & Services
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// 2. Strict Error Handling Enum & Helper (Skill Requirement)
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// 3. Mandatory Connection Boot Verification
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Tapmate Firebase client offline or initializing:', error.message);
    }
  }
}
testConnection();

// 4. In-Memory OAuth Token Management (Workspace Skill Requirement)
const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/forms.body');
provider.addScope('https://www.googleapis.com/auth/forms.responses.readonly');

let isSigningIn = false;
let cachedAccessToken: string | null = null;

export const initAuth = (
  onAuthSuccess?: (user: User, token: string | null) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string | null }> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    cachedAccessToken = credential?.accessToken || null;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Sign in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const logoutAdmin = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};

// 5. Unique Registration ID Generator
// Generates official format: TM-LW-YYYY-XXXXXX (e.g., TM-LW-2026-9E4B27)
export function generateRegistrationId(): string {
  const year = new Date().getFullYear();
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let rand = '';
  for (let i = 0; i < 6; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `TM-LW-${year}-${rand}`;
}

// Helper to recursively remove any undefined properties so Firestore setDoc/updateDoc never fails
export function removeUndefinedFields<T extends Record<string, any>>(obj: T): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined) {
      continue;
    }
    if (value !== null && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
      result[key] = removeUndefinedFields(value);
    } else {
      result[key] = value;
    }
  }
  return result;
}

// 6. Database Operations for Warranty Registrations
export async function createRegistration(
  data: Omit<Registration, 'id' | 'createdAt' | 'status' | 'updatedAt'>
): Promise<Registration> {
  const regId = generateRegistrationId();
  const now = new Date().toISOString();

  const rawRegistration: Record<string, any> = {
    ...data,
    id: regId,
    status: 'Pending',
    createdAt: now,
    updatedAt: now,
  };

  // Strip empty optional strings to maintain pristine schema conformance
  if (!rawRegistration.address) delete rawRegistration.address;
  if (!rawRegistration.modelVariant) delete rawRegistration.modelVariant;
  if (!rawRegistration.serialNumber) delete rawRegistration.serialNumber;
  if (!rawRegistration.orderId) delete rawRegistration.orderId;
  if (!rawRegistration.invoiceFileName) delete rawRegistration.invoiceFileName;
  if (!rawRegistration.invoiceFileData) delete rawRegistration.invoiceFileData;
  if (!rawRegistration.adminNotes) delete rawRegistration.adminNotes;

  // Deep strip any undefined fields
  const cleanPayload = removeUndefinedFields(rawRegistration) as Registration;

  const docPath = `registrations/${regId}`;
  try {
    // Firestore rules validate required fields, Pending status, string lengths
    await setDoc(doc(db, 'registrations', regId), cleanPayload);
    return cleanPayload;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, docPath);
  }
}

export async function getRegistrations(): Promise<Registration[]> {
  const colPath = 'registrations';
  try {
    const q = query(collection(db, colPath), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    const items: Registration[] = [];
    snapshot.forEach((docSnap) => {
      items.push(docSnap.data() as Registration);
    });
    return items;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, colPath);
  }
}

export async function updateRegistrationStatus(
  id: string,
  status: RegistrationStatus,
  adminNotes?: string
): Promise<void> {
  const docPath = `registrations/${id}`;
  try {
    const ref = doc(db, 'registrations', id);
    const updateData: Record<string, any> = {
      status,
      updatedAt: new Date().toISOString(),
    };
    if (adminNotes !== undefined && adminNotes !== null) {
      updateData.adminNotes = adminNotes;
    }
    const cleanUpdate = removeUndefinedFields(updateData);
    await updateDoc(ref, cleanUpdate);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, docPath);
  }
}

export async function deleteRegistration(id: string): Promise<void> {
  const docPath = `registrations/${id}`;
  try {
    const ref = doc(db, 'registrations', id);
    await deleteDoc(ref);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, docPath);
  }
}

// 7. App Configuration (Dynamic Products, Purchase Channels, Card Image)
export const DEFAULT_APP_CONFIG: AppConfig = {
  products: DEFAULT_PRODUCTS,
  purchaseChannels: DEFAULT_PURCHASE_CHANNELS,
  cardImageUrl: '',
};

export async function getAppConfig(): Promise<AppConfig> {
  try {
    const snap = await getDoc(doc(db, 'settings', 'config'));
    if (snap.exists()) {
      const data = snap.data() as AppConfig;
      return {
        products: Array.isArray(data.products) && data.products.length ? data.products : DEFAULT_PRODUCTS,
        purchaseChannels:
          Array.isArray(data.purchaseChannels) && data.purchaseChannels.length
            ? data.purchaseChannels
            : DEFAULT_PURCHASE_CHANNELS,
        cardImageUrl: data.cardImageUrl || '',
        updatedAt: data.updatedAt,
        updatedBy: data.updatedBy,
      };
    }
    return DEFAULT_APP_CONFIG;
  } catch (error) {
    console.warn('Could not read settings from Firestore, fallback to defaults:', error);
    return DEFAULT_APP_CONFIG;
  }
}

export function subscribeAppConfig(callback: (config: AppConfig) => void): () => void {
  const docRef = doc(db, 'settings', 'config');
  return onSnapshot(
    docRef,
    (snap) => {
      if (snap.exists()) {
        const data = snap.data() as AppConfig;
        callback({
          products: Array.isArray(data.products) && data.products.length ? data.products : DEFAULT_PRODUCTS,
          purchaseChannels:
            Array.isArray(data.purchaseChannels) && data.purchaseChannels.length
              ? data.purchaseChannels
              : DEFAULT_PURCHASE_CHANNELS,
          cardImageUrl: data.cardImageUrl || '',
          updatedAt: data.updatedAt,
          updatedBy: data.updatedBy,
        });
      } else {
        callback(DEFAULT_APP_CONFIG);
      }
    },
    (error) => {
      console.warn('Settings subscription error:', error);
      callback(DEFAULT_APP_CONFIG);
    }
  );
}

export async function updateAppConfig(config: Partial<AppConfig>): Promise<void> {
  const docPath = 'settings/config';
  try {
    const userEmail = auth.currentUser?.email || 'admin';
    const payload: Record<string, any> = {
      ...config,
      updatedAt: new Date().toISOString(),
      updatedBy: userEmail,
    };
    await setDoc(doc(db, 'settings', 'config'), removeUndefinedFields(payload), { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, docPath);
  }
}

// 8. Real-time Registrations Subscription with Notification Support
export function subscribeRegistrations(
  onData: (registrations: Registration[]) => void,
  onError?: (error: Error) => void
): () => void {
  const q = query(collection(db, 'registrations'), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const items: Registration[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as Registration);
      });
      onData(items);
    },
    (error) => {
      if (onError) {
        onError(error);
      } else {
        handleFirestoreError(error, OperationType.LIST, 'registrations');
      }
    }
  );
}
