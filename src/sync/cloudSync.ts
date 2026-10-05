// Cloud sync for member progress — Firestore backend.
//
// Firestore layout:
//   users/{uid}                  → member profile (name, branch, email)
//   users/{uid}/progress/main    → whole progress snapshot + lastSynced
//
// Behavior:
//   - pushProgress: upload the local snapshot (debounced "sync on change").
//   - pullProgress: download on sign-in; applies the remote snapshot when the
//     local device is empty OR the remote copy is newer than our last push.
//     Merge rule is deliberately simple and documented: newest lastSynced
//     wins, ties go to the local device.
//   - initCloudSync: call once at app start; subscribes to local progress
//     changes and pushes them 5s after the last change (only when signed in).
//
// Dormant until Firebase is configured — every entry point no-ops otherwise.
import AsyncStorage from "@react-native-async-storage/async-storage";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { isFirebaseConfigured } from "../config/firebase";
import { getCurrentUid } from "../auth";
import { getDb } from "../auth/firebase";
import {
  store,
  onProgressChanged,
  type ProgressSnapshot,
} from "../storage/store";

const LAST_PUSH_KEY = "mm.lastPush";

interface ProgressDoc extends ProgressSnapshot {
  /** ISO timestamp of the last successful push of this snapshot. */
  lastSynced: string;
}

function progressDocRef(uid: string) {
  const db = getDb();
  if (!db) throw new Error("Firestore not available");
  return doc(db, "users", uid, "progress", "main");
}

function isLocalEmpty(s: ProgressSnapshot): boolean {
  return (
    s.plan === null &&
    s.chaptersDone.length === 0 &&
    Object.keys(s.completions).length === 0 &&
    Object.keys(s.quizScores).length === 0 &&
    s.bookmarks.length === 0 &&
    Object.keys(s.readingSeconds).length === 0
  );
}

async function lastPush(): Promise<string> {
  return (await AsyncStorage.getItem(LAST_PUSH_KEY)) ?? "";
}

/** Upload the current local snapshot. Safe to call any time; no-ops offline. */
export async function pushProgress(uid?: string): Promise<void> {
  const id = uid ?? getCurrentUid();
  if (!isFirebaseConfigured() || !id) return;
  const snap = await store.loadAll();
  const payload: ProgressDoc = {
    ...snap,
    lastSynced: new Date().toISOString(),
  };
  await setDoc(progressDocRef(id), payload, { merge: true });
  await AsyncStorage.setItem(LAST_PUSH_KEY, payload.lastSynced);
}

// Set while applying a pull so the change listener doesn't echo it back.
let suppressNextPush = false;

/**
 * Download the cloud snapshot. Returns true when it was applied locally.
 * Applied when this device has no progress yet, or the cloud copy is newer
 * than our last push.
 */
export async function pullProgress(uid: string): Promise<boolean> {
  if (!isFirebaseConfigured()) return false;
  const snap = await getDoc(progressDocRef(uid));
  if (!snap.exists()) return false;
  const remote = snap.data() as ProgressDoc;
  const local = await store.loadAll();
  const remoteIsNewer = remote.lastSynced > (await lastPush());
  if (isLocalEmpty(local) || remoteIsNewer) {
    const { lastSynced: _ignored, ...progress } = remote;
    suppressNextPush = true;
    await store.saveAll(progress);
    return true;
  }
  return false;
}

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * Call once at app start (root layout). After that, every local progress
 * change triggers a Firestore push 5 seconds after the last change —
 * but only while a member is signed in.
 */
export function initCloudSync(): () => void {
  return onProgressChanged(() => {
    if (!isFirebaseConfigured()) return;
    if (suppressNextPush) {
      suppressNextPush = false;
      return;
    }
    const uid = getCurrentUid();
    if (!uid) return;
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      pushProgress(uid).catch(() => {
        // Offline or transient failure — the next change retries.
      });
    }, 5000);
  });
}
