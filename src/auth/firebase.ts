// Real Firebase authentication — passwordless email sign-in (email link).
//
// Firebase's JS SDK has no 6-digit email OTP API (verified against the
// installed firebase@12 SDK and the official API reference). The free
// passwordless email flow Firebase actually offers is the EMAIL LINK flow:
// the app sends a sign-in link, the member taps it in their email, the app
// opens via deep link and completes sign-in. No SMS, no cost.
//
// This module is dormant until real values land in src/config/firebase.ts.
// src/auth/index.ts picks this provider automatically when configured.
import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import {
  initializeAuth,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  getAdditionalUserInfo,
  signOut as fbSignOut,
  onAuthStateChanged,
  type Auth,
  type Persistence,
  type User,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  type Firestore,
} from "firebase/firestore";
import {
  FIREBASE_CONFIG,
  SIGN_IN_REDIRECT_URL,
  isFirebaseConfigured,
} from "../config/firebase";
import { store, type Profile } from "../storage/store";

// ---------------------------------------------------------------------------
// AsyncStorage-backed auth persistence.
//
// firebase/auth v12 no longer ships the `firebase/auth/react-native`
// subpath, so we implement the (stable, public) Persistence interface
// directly on top of the AsyncStorage the app already uses. This keeps
// the member signed in across app restarts.
// ---------------------------------------------------------------------------
class AsyncStoragePersistence implements Persistence {
  readonly type = "LOCAL" as const;

  async _isAvailable(): Promise<boolean> {
    try {
      await AsyncStorage.setItem("__mm_fb_ping", "1");
      await AsyncStorage.removeItem("__mm_fb_ping");
      return true;
    } catch {
      return false;
    }
  }

  async _set(key: string, value: unknown): Promise<void> {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  }

  async _get<T>(key: string): Promise<T | null> {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  }

  async _remove(key: string): Promise<void> {
    await AsyncStorage.removeItem(key);
  }

  _addListener(): void {
    // Cross-tab sync isn't needed on mobile; no-op.
  }

  _removeListener(): void {
    // No-op, see above.
  }
}

// ---------------------------------------------------------------------------
// Lazy singletons — never initialized unless the config is real.
// ---------------------------------------------------------------------------
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

function instances(): { auth: Auth; db: Firestore } {
  if (!isFirebaseConfigured()) {
    throw new Error("Firebase is not configured yet (see src/config/firebase.ts).");
  }
  if (!app) {
    app = getApps().length ? getApps()[0] : initializeApp(FIREBASE_CONFIG);
    auth = initializeAuth(app, {
      persistence: new AsyncStoragePersistence() as unknown as Persistence,
    });
    db = getFirestore(app);
  }
  return { auth: auth as Auth, db: db as Firestore };
}

/** Firestore instance, or null when Firebase isn't configured yet. */
export function getDb(): Firestore | null {
  if (!isFirebaseConfigured()) return null;
  return instances().db;
}

/** Email the member typed on the sign-in screen — needed to complete the link. */
const PENDING_EMAIL_KEY = "mm.pendingSignInEmail";

export async function setPendingEmail(email: string): Promise<void> {
  await AsyncStorage.setItem(PENDING_EMAIL_KEY, email);
}

export async function getPendingEmail(): Promise<string | null> {
  return AsyncStorage.getItem(PENDING_EMAIL_KEY);
}

async function clearPendingEmail(): Promise<void> {
  await AsyncStorage.removeItem(PENDING_EMAIL_KEY);
}

// ---------------------------------------------------------------------------
// Sign-in flow
// ---------------------------------------------------------------------------

/** Step 1: Firebase emails a sign-in link to the member. */
export async function sendSignInLink(email: string): Promise<void> {
  const { auth } = instances();
  await setPendingEmail(email);
  await sendSignInLinkToEmail(auth, email, {
    url: SIGN_IN_REDIRECT_URL,
    handleCodeInApp: true,
  });
}

/** True when an incoming deep link is a Firebase email sign-in link. */
export function isSignInLink(url: string): boolean {
  if (!isFirebaseConfigured()) return false;
  try {
    return isSignInWithEmailLink(instances().auth, url);
  } catch {
    return false;
  }
}

/**
 * Step 2: complete sign-in after the member taps the link in their email.
 * Returns whether this is a brand-new member (needs name/branch registration).
 */
export async function completeSignInWithLink(
  link: string
): Promise<{ uid: string; email: string; isNewUser: boolean }> {
  const { auth } = instances();
  const email = await getPendingEmail();
  if (!email) {
    throw Object.assign(new Error("missing-email"), { code: "auth/missing-email" });
  }
  const cred = await signInWithEmailLink(auth, email, link);
  await clearPendingEmail();
  const user = cred.user as User;
  const isNewUser = getAdditionalUserInfo(cred)?.isNewUser ?? false;
  return { uid: user.uid, email: user.email ?? email, isNewUser };
}

export function getCurrentUid(): string | null {
  if (!isFirebaseConfigured()) return null;
  try {
    // instances() initializes (and restores any persisted session) on first use.
    return instances().auth.currentUser?.uid ?? null;
  } catch {
    return null;
  }
}

export function onAuthChanged(cb: (uid: string | null) => void): () => void {
  if (!isFirebaseConfigured()) return () => {};
  return onAuthStateChanged(instances().auth, (user) => cb(user?.uid ?? null));
}

export async function signOutUser(): Promise<void> {
  if (isFirebaseConfigured() && auth) {
    await fbSignOut(auth);
  }
  await clearPendingEmail();
  await store.clearProfile();
}

// ---------------------------------------------------------------------------
// Member profile in Firestore: users/{uid}
// ---------------------------------------------------------------------------

export interface MemberProfile extends Profile {
  createdAt: string;
  updatedAt: string;
}

export async function saveMemberProfile(
  uid: string,
  profile: Profile
): Promise<MemberProfile> {
  const { db } = instances();
  const ref = doc(db, "users", uid);
  const now = new Date().toISOString();
  const existing = await getDoc(ref);
  const createdAt =
    existing.exists() && (existing.data() as MemberProfile).createdAt
      ? (existing.data() as MemberProfile).createdAt
      : now;
  const full: MemberProfile = { ...profile, createdAt, updatedAt: now };
  await setDoc(ref, full, { merge: true });
  return full;
}

export async function fetchMemberProfile(uid: string): Promise<Profile | null> {
  const { db } = instances();
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;
  const d = snap.data() as MemberProfile;
  return {
    email: d.email,
    firstName: d.firstName,
    lastName: d.lastName,
    branch: d.branch,
  };
}

// ---------------------------------------------------------------------------
// Plain-language error messages for the sign-in UI.
// ---------------------------------------------------------------------------
export function friendlyAuthError(code: string): string {
  switch (code) {
    case "auth/invalid-email":
      return "That email address doesn't look right. Please check it and try again.";
    case "auth/missing-email":
      return "We couldn't tell which email this link was for. Please request a new sign-in link from the app.";
    case "auth/expired-action-code":
      return "This sign-in link has expired. Please request a new one.";
    case "auth/invalid-action-code":
      return "This sign-in link isn't valid. Please request a new one.";
    case "auth/user-disabled":
      return "This account has been disabled. Please contact the church office.";
    case "auth/too-many-requests":
      return "Too many attempts. Please wait a little while and try again.";
    case "auth/network-request-failed":
      return "No internet connection. Please check and try again.";
    case "auth/operation-not-allowed":
      return "Email sign-in isn't enabled yet. Please try again later.";
    default:
      return "Something went wrong. Please try again.";
  }
}

export function authErrorMessage(e: unknown): string {
  const code =
    typeof e === "object" && e !== null && "code" in e
      ? String((e as { code: unknown }).code)
      : "";
  return friendlyAuthError(code);
}
