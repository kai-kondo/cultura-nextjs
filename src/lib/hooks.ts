// src/lib/hooks.ts
"use client";
import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import type { UserDoc, UserType, AuPairProfile, FamilyProfile } from "./types";

export function useAuthUser() {
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => onAuthStateChanged(auth, setUser), []);
  return user;
}

export function useUserDoc(uid?: string | null) {
  const [data, setData] = useState<UserDoc | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!uid) {
      setData(null);
      setLoading(false);
      return;
    }
    const unsub = onSnapshot(doc(db, "users", uid), (snap) => {
      setData(snap.exists() ? (snap.data() as UserDoc) : null);
      setLoading(false);
    });
    return () => unsub();
  }, [uid]);
  return { data, loading };
}

export function useProfile(userType?: UserType, profileId?: string | null) {
  const [data, setData] = useState<AuPairProfile | FamilyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!userType || !profileId) {
      setData(null);
      setLoading(false);
      return;
    }
    const col = userType === "aupair" ? "auPairProfiles" : "familyProfiles";
    const unsub = onSnapshot(doc(db, col, profileId), (snap) => {
      setData(snap.exists() ? (snap.data() as any) : null);
      setLoading(false);
    });
    return () => unsub();
  }, [userType, profileId]);
  return { data, loading };
}
