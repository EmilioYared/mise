import { getApp, getApps, initializeApp } from "firebase/app";
import { connectAuthEmulator, getAuth, type Auth } from "firebase/auth";
import {
  connectFirestoreEmulator,
  getFirestore,
  type Firestore,
} from "firebase/firestore";

const useEmulators = process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === "true";

let instances: { auth: Auth; db: Firestore } | undefined;

/**
 * Firebase is started on first use, in the browser. Pages are prerendered on
 * the server without it, so the build doesn't need any Firebase config.
 */
export function firebase() {
  if (instances) return instances;

  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!apiKey && !useEmulators) {
    throw new Error(
      "Missing Firebase config. Copy .env.example to .env.local and fill it in.",
    );
  }

  const app = getApps().length
    ? getApp()
    : initializeApp({
        apiKey: apiKey ?? "demo",
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        // The emulators run under a "demo-" project so they can never touch real data.
        projectId: useEmulators
          ? "demo-mise"
          : process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      });

  const auth = getAuth(app);
  const db = getFirestore(app);

  // Hot reload re-runs this module but keeps the app; connecting twice throws.
  const flags = globalThis as { __miseEmulatorsConnected?: boolean };
  if (useEmulators && !flags.__miseEmulatorsConnected) {
    flags.__miseEmulatorsConnected = true;
    connectAuthEmulator(auth, "http://127.0.0.1:9099", {
      disableWarnings: true,
    });
    connectFirestoreEmulator(db, "127.0.0.1", 8080);
  }

  instances = { auth, db };
  return instances;
}
