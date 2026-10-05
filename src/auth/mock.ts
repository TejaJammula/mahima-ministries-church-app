// MOCK authentication — UI flow only, clearly marked.
// Real app: Firebase email OTP under Tj's Google account (blocked until the
// real build walkthrough with him). This module simulates the Gmail OTP
// login + name/branch collection so every screen that needs a user works now.
import { store, Profile } from "../storage/store";

export const MOCK_MODE = true;
/** Demo OTP shown in the UI so testers can complete the flow. */
export const DEMO_OTP = "123456";

export const BRANCHES = [
  "Prasadampadu",
  "Currency Nagar / Ramavarappadu",
  "Mandadam",
  "Tangeda Road / Dachepalli",
  "Hyderabad",
  "Another Mahima Ministries branch",
];

export async function requestOtp(_email: string): Promise<void> {
  // Mock: pretend an OTP email was sent. Real Firebase wiring comes later.
  await new Promise((r) => setTimeout(r, 800));
}

export function verifyOtp(code: string): boolean {
  return code.trim() === DEMO_OTP;
}

export async function completeRegistration(
  email: string,
  firstName: string,
  lastName: string,
  branch: string
): Promise<Profile> {
  const profile: Profile = { email, firstName, lastName, branch };
  await store.saveProfile(profile);
  return profile;
}

export async function signOut(): Promise<void> {
  await store.clearProfile();
}
