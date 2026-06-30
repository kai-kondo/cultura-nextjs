"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import type { FamilyProfile } from "@/lib/types";
import { FamilyProfileCreate } from "./FamilyProfileCreate";

type FamilyEditInitialData = {
  familyName: string;
  city: string;
  country: string;
  adults: string;
  profileImageUrl?: string;
  galleryImageUrls?: string[];
  familyBio: string;
  children: { age: string; gender: string }[];
  homeDescription: string;
  providedRoom: string;
  desiredSkills: string[];
  weeklyAllowance: string;
  startDate: string;
  duration: string;
  additionalBenefits: string;
};

interface FamilyProfileEditProps {
  profileId: string;
  onComplete: () => void;
}

function mapFamilyProfileToInitialData(profile: FamilyProfile): FamilyEditInitialData {
  return {
    familyName: profile.familyName || "",
    city: profile.location?.city || "",
    country: profile.location?.country || "",
    adults: profile.familyMembers?.adults ? String(profile.familyMembers.adults) : "2",
    profileImageUrl: (profile as any).profileImage || "",
    galleryImageUrls: (profile as any).galleryImages || [],
    familyBio: profile.aboutUs || "",
    children: (profile.familyMembers?.children || []).map((child: any) => ({
      age: child?.age ? String(child.age) : "",
      gender:
        child?.gender === "boy"
          ? "Boy"
          : child?.gender === "girl"
          ? "Girl"
          : "Any",
    })),
    homeDescription: "",
    providedRoom: profile.offering?.accommodation?.description || "",
    desiredSkills: Array.isArray(profile.lookingFor)
      ? profile.lookingFor.map(String)
      : [],
    weeklyAllowance: profile.offering?.allowance?.amount
      ? String(profile.offering.allowance.amount)
      : "",
    startDate: profile.position?.startDate || "",
    duration: profile.position?.duration || "",
    additionalBenefits: (profile.offering?.benefits || []).join(", "),
  };
}

export function FamilyProfileEdit({
  profileId,
  onComplete,
}: FamilyProfileEditProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialData, setInitialData] = useState<FamilyEditInitialData | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const normalizedProfileId = String(profileId).split("/").pop() || profileId;
        const snap = await getDoc(doc(db, "familyProfiles", normalizedProfileId));

        if (!snap.exists()) {
          if (!cancelled) {
            setError("Profile not found");
            setLoading(false);
          }
          return;
        }

        const currentUid = auth.currentUser?.uid;
        const profileData = snap.data() as FamilyProfile;
        if (!currentUid || profileData.userId !== currentUid) {
          if (!cancelled) {
            setError("You don't have permission to edit this profile.");
            setLoading(false);
          }
          return;
        }

        if (cancelled) return;

        setInitialData(mapFamilyProfileToInitialData(profileData));
        setLoading(false);
      } catch (e: any) {
        if (!cancelled) {
          setError(e?.message || "Failed to load profile");
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [profileId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-rose-100 p-6">
        <div className="mx-auto max-w-3xl rounded-2xl border border-orange-100 bg-white/80 p-6 text-sm text-gray-600 shadow-sm backdrop-blur">
          Loading profile editor...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-rose-100 p-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-3xl rounded-2xl border border-red-200 bg-white/80 p-6 text-sm text-red-600 shadow-sm backdrop-blur"
        >
          {error}
        </motion.div>
      </div>
    );
  }

  return (
    <FamilyProfileCreate
      mode="edit"
      initialProfileId={profileId}
      initialData={initialData || undefined}
      onComplete={onComplete}
    />
  );
}