"use client";

import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { firebase } from "@/lib/firebase/client";
import type { Store, UserProfile } from "@/lib/types";

type AuthState =
  | { status: "loading" }
  | { status: "signed-out" }
  | { status: "no-profile"; user: User }
  | { status: "signed-in"; user: User; profile: UserProfile; store: Store };

const AuthContext = createContext<AuthState>({ status: "loading" });

// Each snapshot remembers which document it came from, so a stale one (from a
// previous user or store) reads as "still loading" instead of wrong data.
type Snapshot<T> = { key: string; value: T | null };

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [profileSnap, setProfileSnap] = useState<Snapshot<UserProfile> | null>(
    null,
  );
  const [storeSnap, setStoreSnap] = useState<Snapshot<Store> | null>(null);

  useEffect(() => onAuthStateChanged(firebase().auth, setUser), []);

  // The profile holds the user's role and store. It's server-written, so the
  // UI can trust it, and the security rules check the same document.
  const uid = user?.uid;
  useEffect(() => {
    if (!uid) return;
    return onSnapshot(doc(firebase().db, "users", uid), (snap) =>
      setProfileSnap({
        key: uid,
        value: snap.exists() ? ({ uid, ...snap.data() } as UserProfile) : null,
      }),
    );
  }, [uid]);

  const profile =
    profileSnap && profileSnap.key === uid ? profileSnap.value : undefined;
  const storeId = profile?.storeId;

  useEffect(() => {
    if (!storeId) return;
    return onSnapshot(doc(firebase().db, "stores", storeId), (snap) =>
      setStoreSnap({
        key: storeId,
        value: snap.exists()
          ? ({ id: storeId, ...snap.data() } as Store)
          : null,
      }),
    );
  }, [storeId]);

  const store =
    storeSnap && storeSnap.key === storeId ? storeSnap.value : undefined;

  let state: AuthState;
  if (user === undefined) state = { status: "loading" };
  else if (user === null) state = { status: "signed-out" };
  else if (profile === null) state = { status: "no-profile", user };
  else if (!profile || !store) state = { status: "loading" };
  else state = { status: "signed-in", user, profile, store };

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

export function signOutUser() {
  return signOut(firebase().auth);
}
