// DEMO auth provider — used only while Firebase is not configured
// (see src/config/firebase.ts). Mirrors the real provider's interface so the
// UI never knows the difference. Clearly marked; never ships as "real".
import { store, type Profile } from "../storage/store";

export const DEMO_MODE = true;
/** Demo code shown in the UI so testers can complete the flow. */
export const DEMO_OTP = "123456";

export async function demoSendSignInLink(_email: string): Promise<void> {
  // Mock: pretend a sign-in email was sent.
  await new Promise((r) => setTimeout(r, 800));
}

export function demoVerifyCode(code: string): boolean {
  return code.trim() === DEMO_OTP;
}

export async function demoCompleteRegistration(
  email: string,
  firstName: string,
  lastName: string,
  branch: string
): Promise<Profile> {
  const profile: Profile = { email, firstName, lastName, branch };
  await store.saveProfile(profile);
  return profile;
}

export async function demoSignOut(): Promise<void> {
  await store.clearProfile();
}
