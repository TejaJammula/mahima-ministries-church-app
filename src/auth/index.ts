// Auth facade — the ONLY auth module screens import.
//
// Picks the provider automatically:
//   - Firebase config present  → real passwordless email sign-in (email link)
//   - Firebase not configured  → demo provider (clearly marked in the UI)
//
// When the Firebase project is created and src/config/firebase.ts is filled
// in, the real flow switches on with zero code changes.
import { isFirebaseConfigured } from "../config/firebase";
import { store, type Profile } from "../storage/store";
import {
  sendSignInLink as fbSendSignInLink,
  isSignInLink as fbIsSignInLink,
  completeSignInWithLink as fbCompleteSignInWithLink,
  getCurrentUid as fbGetCurrentUid,
  onAuthChanged as fbOnAuthChanged,
  signOutUser as fbSignOut,
  saveMemberProfile,
  fetchMemberProfile,
  getPendingEmail,
  authErrorMessage,
} from "./firebase";
import {
  DEMO_OTP,
  demoSendSignInLink,
  demoVerifyCode,
  demoCompleteRegistration,
  demoSignOut,
} from "./mock";

export { DEMO_OTP, authErrorMessage };

export const BRANCHES = [
  "Prasadampadu",
  "Currency Nagar / Ramavarappadu",
  "Mandadam",
  "Tangeda Road / Dachepalli",
  "Hyderabad",
  "Another Mahima Ministries branch",
];

/** 'firebase' once the config lands, 'demo' until then. */
export function authMode(): "firebase" | "demo" {
  return isFirebaseConfigured() ? "firebase" : "demo";
}

/** Step 1: send the sign-in email (real link, or demo stand-in). */
export async function requestSignIn(email: string): Promise<void> {
  if (authMode() === "firebase") {
    await fbSendSignInLink(email);
  } else {
    await demoSendSignInLink(email);
  }
}

/** Demo only: check the typed code. */
export function verifyDemoCode(code: string): boolean {
  return demoVerifyCode(code);
}

/** True when an incoming deep link is a Firebase email sign-in link. */
export function isSignInLink(url: string): boolean {
  return authMode() === "firebase" && fbIsSignInLink(url);
}

/**
 * Complete sign-in after the member taps the emailed link.
 * Returns true when this member still needs name/branch registration.
 */
export async function completeSignInWithLink(link: string): Promise<{
  needsRegistration: boolean;
}> {
  const { uid } = await fbCompleteSignInWithLink(link);
  const existing = await fetchMemberProfile(uid);
  if (existing) {
    // Returning member — restore their profile locally and sync progress.
    await store.saveProfile(existing);
    const { pullProgress } = await import("../sync/cloudSync");
    await pullProgress(uid).catch(() => {});
    return { needsRegistration: false };
  }
  return { needsRegistration: true };
}

/**
 * Step 3: save name + branch. Writes Firestore users/{uid} when signed in
 * with Firebase, and always saves locally so "Welcome home, [name]" works.
 */
export async function completeRegistration(
  email: string,
  firstName: string,
  lastName: string,
  branch: string
): Promise<Profile> {
  const profile: Profile = { email, firstName, lastName, branch };
  if (authMode() === "firebase") {
    const uid = fbGetCurrentUid();
    if (uid) {
      await saveMemberProfile(uid, profile);
      const { pushProgress } = await import("../sync/cloudSync");
      await pushProgress(uid).catch(() => {});
    }
  } else {
    await demoCompleteRegistration(email, firstName, lastName, branch);
  }
  await store.saveProfile(profile);
  return profile;
}

/** The member's Firebase uid, or null when signed out / demo mode. */
export function getCurrentUid(): string | null {
  return authMode() === "firebase" ? fbGetCurrentUid() : null;
}

/** Observe sign-in state. Demo mode calls back once with the local state. */
export function onAuthChanged(cb: (uid: string | null) => void): () => void {
  if (authMode() === "firebase") {
    return fbOnAuthChanged(cb);
  }
  store.getProfile().then((p) => cb(p ? "demo" : null));
  return () => {};
}

export async function signOut(): Promise<void> {
  if (authMode() === "firebase") {
    await fbSignOut();
  } else {
    await demoSignOut();
  }
}

export { getPendingEmail };
