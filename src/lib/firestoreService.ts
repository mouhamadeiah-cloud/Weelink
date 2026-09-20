import { doc, setDoc, getDoc, serverTimestamp, disableNetwork } from 'firebase/firestore';
import { db, auth } from './firebase';
import { UserRegistrationData, WebPage, Slide } from '../types';

let isFirestoreWriteDisabled = false;

if (typeof window !== 'undefined') {
  try {
    if (localStorage.getItem('weelink_firestore_disabled') === 'true') {
      isFirestoreWriteDisabled = true;
      disableNetwork(db).catch(() => {});
      console.warn('Firebase Firestore Quota limit is known to be reached. Silently running in fully offline mode from start.');
    }
  } catch (e) {}
}

function withTimeout<T>(promise: Promise<T>, timeoutMs = 4000, errorMessage = 'resource-exhausted (Operation timed out)'): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => {
      const err = new Error(errorMessage) as any;
      err.code = 'resource-exhausted';
      setTimeout(() => reject(err), timeoutMs);
    })
  ]);
}

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

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errMsg = error instanceof Error ? error.message : String(error);

  const errInfo: FirestoreErrorInfo = {
    error: errMsg,
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || null,
      isAnonymous: auth.currentUser?.isAnonymous || null,
      tenantId: auth.currentUser?.tenantId || null,
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

const STORAGE_USER_KEY = 'weelink_user_id';

export function getOrCreateLocalUserId(): string {
  try {
    let uid = localStorage.getItem(STORAGE_USER_KEY);
    if (!uid) {
      uid = 'user_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now().toString(36);
      localStorage.setItem(STORAGE_USER_KEY, uid);
    }
    return uid;
  } catch {
    return 'anonymous';
  }
}

function checkAndMarkQuota(err: any): void {
  const errMsg = err?.message || String(err);
  if (
    err?.code === 'resource-exhausted' ||
    errMsg.includes('quota') ||
    errMsg.includes('Quota exceeded') ||
    errMsg.includes('resource-exhausted')
  ) {
    if (!isFirestoreWriteDisabled) {
      isFirestoreWriteDisabled = true;
      try {
        localStorage.setItem('weelink_firestore_disabled', 'true');
      } catch (e) {}
      console.warn('Firebase Firestore Quota limit reached. Silently disabling Firestore network sync to stop background retry loops.');
      disableNetwork(db).catch((e) => {
        console.warn('Could not silence Firestore network:', e);
      });
    }
  }
}

/**
 * Persist user registration data to Firestore
 */
export async function saveUserRegistrationToFirestore(
  userData: UserRegistrationData,
  customUserId?: string
): Promise<boolean> {
  if (isFirestoreWriteDisabled) {
    return true;
  }
  const userId = customUserId || getOrCreateLocalUserId();
  const path = `users/${userId}/registrations/primary`;
  try {
    const regRef = doc(db, 'users', userId, 'registrations', 'primary');
    await withTimeout(
      setDoc(
        regRef,
        {
          ...userData,
          updatedAt: new Date().toISOString(),
          serverTimestamp: serverTimestamp(),
        },
        { merge: true }
      ),
      4000
    );
    console.log('Saved user registration to Firestore');
    return true;
  } catch (err: any) {
    checkAndMarkQuota(err);
    if (err?.code === 'permission-denied' || err?.message?.includes('insufficient permissions')) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
    console.warn('Failed saving registration to Firestore:', err?.message || err);
    return false;
  }
}

/**
 * Load user registration data from Firestore
 */
export async function loadUserRegistrationFromFirestore(
  customUserId?: string
): Promise<UserRegistrationData | null> {
  if (isFirestoreWriteDisabled) {
    return null;
  }
  const userId = customUserId || getOrCreateLocalUserId();
  const path = `users/${userId}/registrations/primary`;
  try {
    const regRef = doc(db, 'users', userId, 'registrations', 'primary');
    const snap = await getDoc(regRef);
    if (snap.exists()) {
      return snap.data() as UserRegistrationData;
    }
    return null;
  } catch (err: any) {
    checkAndMarkQuota(err);
    if (err?.code === 'permission-denied' || err?.message?.includes('insufficient permissions')) {
      handleFirestoreError(err, OperationType.GET, path);
    }
    console.warn('Could not load remote registration (using local/default state):', err?.message || err);
    return null;
  }
}

/**
 * Persist entire project pages, active slide, and configuration to Firestore
 */
export async function saveProjectToFirestore(
  pages: WebPage[],
  activePageId: string,
  siteTitle: string,
  customUserId?: string
): Promise<boolean> {
  if (isFirestoreWriteDisabled) {
    return true;
  }
  const userId = customUserId || getOrCreateLocalUserId();
  const path = `users/${userId}/projects/primary_site`;
  try {
    const projectRef = doc(db, 'users', userId, 'projects', 'primary_site');
    await withTimeout(
      setDoc(
        projectRef,
        {
          id: 'primary_site',
          userId,
          title: siteTitle,
          activePageId,
          pages: JSON.stringify(pages),
          updatedAt: new Date().toISOString(),
          serverTimestamp: serverTimestamp(),
        },
        { merge: true }
      ),
      4000
    );
    console.log('Project successfully saved to Firestore');
    return true;
  } catch (err: any) {
    checkAndMarkQuota(err);
    if (err?.code === 'permission-denied' || err?.message?.includes('insufficient permissions')) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
    console.warn('Failed saving project to Firestore:', err?.message || err);
    return false;
  }
}

/**
 * Load project pages from Firestore
 */
export async function loadProjectFromFirestore(
  customUserId?: string
): Promise<{ pages: WebPage[]; activePageId: string; title: string } | null> {
  if (isFirestoreWriteDisabled) {
    return null;
  }
  const userId = customUserId || getOrCreateLocalUserId();
  const path = `users/${userId}/projects/primary_site`;
  try {
    const projectRef = doc(db, 'users', userId, 'projects', 'primary_site');
    const snap = await getDoc(projectRef);
    if (snap.exists()) {
      const data = snap.data();
      const parsedPages = JSON.parse(data.pages) as WebPage[];
      return {
        pages: parsedPages,
        activePageId: data.activePageId || parsedPages[0]?.id || '',
        title: data.title || '',
      };
    }
    return null;
  } catch (err: any) {
    checkAndMarkQuota(err);
    if (err?.code === 'permission-denied' || err?.message?.includes('insufficient permissions')) {
      handleFirestoreError(err, OperationType.GET, path);
    }
    console.warn('Could not load remote project (using local/default state):', err?.message || err);
    return null;
  }
}

/**
 * Persist individual slide information to Firestore
 */
export async function saveSlideToFirestore(
  slide: Slide,
  customUserId?: string
): Promise<boolean> {
  if (isFirestoreWriteDisabled) {
    return true;
  }
  const userId = customUserId || getOrCreateLocalUserId();
  const path = `users/${userId}/slides/${slide.id}`;
  try {
    const slideRef = doc(db, 'users', userId, 'slides', slide.id);
    const cleanElements = JSON.parse(JSON.stringify(slide.elements || []));
    await withTimeout(
      setDoc(
        slideRef,
        {
          id: slide.id,
          type: slide.type,
          name: slide.name,
          elements: cleanElements,
          layoutVariant: slide.layoutVariant || 1,
          slideData: JSON.stringify(slide),
          updatedAt: new Date().toISOString(),
          serverTimestamp: serverTimestamp(),
        },
        { merge: true }
      ),
      4000
    );
    console.log(`Slide ${slide.id} successfully saved to Firestore`);
    return true;
  } catch (err: any) {
    checkAndMarkQuota(err);
    if (err?.code === 'permission-denied' || err?.message?.includes('insufficient permissions')) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
    console.warn(`Failed saving slide ${slide.id} to Firestore:`, err?.message || err);
    return false;
  }
}

/**
 * Load individual slide information from Firestore
 */
export async function loadSlideFromFirestore(
  slideId: string,
  customUserId?: string
): Promise<Slide | null> {
  if (isFirestoreWriteDisabled) {
    return null;
  }
  const userId = customUserId || getOrCreateLocalUserId();
  const path = `users/${userId}/slides/${slideId}`;
  try {
    const slideRef = doc(db, 'users', userId, 'slides', slideId);
    const snap = await getDoc(slideRef);
    if (snap.exists()) {
      const data = snap.data();
      if (data.slideData) {
        return JSON.parse(data.slideData) as Slide;
      }
      return {
        id: data.id,
        type: data.type,
        name: data.name,
        elements: data.elements || [],
        layoutVariant: data.layoutVariant || 1,
      } as Slide;
    }
    return null;
  } catch (err: any) {
    checkAndMarkQuota(err);
    if (err?.code === 'permission-denied' || err?.message?.includes('insufficient permissions')) {
      handleFirestoreError(err, OperationType.GET, path);
    }
    console.warn(`Could not load slide ${slideId} from Firestore:`, err?.message || err);
    return null;
  }
}
