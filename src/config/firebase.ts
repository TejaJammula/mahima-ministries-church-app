// Firebase configuration — PLUG-AND-PLAY PLACEHOLDER.
//
// The Firebase project does NOT exist yet. Creating it is a guided step with
// Tj's Google account (Firebase console). When it exists, paste the web app's
// config values below and delete the "CONFIGURED = false" line — the app's
// auth, profile, and progress-sync code will switch on automatically.
// Nothing else needs to change.
//
// TODO (during the guided Firebase setup):
//   1. console.firebase.google.com → create project "mahima-ministries-app"
//      (Analytics optional — skip it, it's not needed).
//   2. Build → Authentication → Sign-in method → enable "Email/Password",
//      then enable "Email link (passwordless sign-in)". This is the free
//      passwordless email flow this app uses — no SMS, no cost.
//   3. Project Settings → General → Your apps → Add app → Web (</>).
//      Copy the firebaseConfig values into FIREBASE_CONFIG below.
//   4. Build → Firestore Database → Create database (production mode).
//      Paste the security rules from FIRESTORE_RULES below.
//   5. Authentication → Settings → Authorized domains: the redirect page's
//      domain must be listed (see DEEP LINK NOTE below).
//
// DEEP LINK NOTE (needed for the email sign-in link to open the app):
//   The sign-in email points at REDIRECT_PAGE_URL, a tiny static page that
//   forwards the full Firebase link to the app's custom scheme
//   (mahimaministries://auth?link=...). Host it free on the existing
//   Cloudflare Pages site or Firebase Hosting. Page source:
//
//     <script>
//       const q = new URLSearchParams(location.search);
//       location.replace("mahimaministries://auth?link=" +
//         encodeURIComponent(q.get("link") || location.href));
//     </script>
//
//   The app listens for that scheme (see app.json "scheme" + root layout)
//   and completes sign-in with signInWithEmailLink.

export const FIREBASE_CONFIGURED = false;

export const FIREBASE_CONFIG = {
  // TODO: paste values from Firebase console → Project Settings → Your apps → Web.
  apiKey: "TODO",
  authDomain: "TODO.firebaseapp.com",
  projectId: "TODO",
  storageBucket: "TODO.appspot.com",
  messagingSenderId: "TODO",
  appId: "TODO",
};

/** True only when real config values have been pasted in. */
export function isFirebaseConfigured(): boolean {
  if (!FIREBASE_CONFIGURED) return false;
  const c = FIREBASE_CONFIG;
  return Boolean(
    c.apiKey && c.apiKey !== "TODO" &&
    c.projectId && c.projectId !== "TODO" &&
    c.appId && c.appId !== "TODO"
  );
}

/**
 * Where the sign-in email link points. Must be https and on an authorized
 * domain (see DEEP LINK NOTE above). The page forwards to the app scheme.
 */
export const SIGN_IN_REDIRECT_URL =
  "https://TODO.pages.dev/finishSignIn"; // TODO: real redirect page URL

export const APP_SCHEME = "mahimaministries"; // must match app.json "scheme"

/**
 * Firestore security rules — paste into Firebase console →
 * Firestore Database → Rules during setup.
 *
 * Each member can only read/write their own profile and progress.
 */
// TODO: paste into Firestore console during setup:
//
// rules_version = '2';
// service cloud.firestore {
//   match /databases/{database}/documents {
//     match /users/{uid} {
//       allow read, write: if request.auth != null && request.auth.uid == uid;
//       match /progress/{doc} {
//         allow read, write: if request.auth != null && request.auth.uid == uid;
//       }
//     }
//   }
// }
export const FIRESTORE_RULES = "see comment above";
