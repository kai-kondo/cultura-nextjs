

"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { AuPairProfile } from "@/lib/types";
import { AuPairProfileCreate } from "./AuPairProfileCreate";

type SkillItem = { name: string; years: string };
type AuPairEditInitialData = {
  firstName: string;
  lastName: string;
  age: string;
  nationality: string;
  currentLocation: string;
  profileImageUrl?: string;
  galleryImageUrls?: string[];
  bio: string;
  skills: SkillItem[];
  languages: { language: string; level: string }[];
  childcareExperience: string;
  previousExperience: string;
  certifications: string[];
  availableFrom: string;
  duration: string;
  preferredLocations: string[];
};

interface AuPairProfileEditProps {
  profileId: string;
  onComplete: () => void;
}

function mapLanguageLevel(level?: string): "Basic" | "Intermediate" | "Advanced" | "Native" {
  switch (level) {
    case "basic":
      return "Basic";
    case "intermediate":
      return "Intermediate";
    case "advanced":
    case "fluent":
      return "Advanced";
    case "native":
      return "Native";
    default:
      return "Intermediate";
  }
}

function mapAuPairProfileToInitialData(profile: AuPairProfile): AuPairEditInitialData {
  const nameParts = (profile.name || "").trim().split(" ");
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ");

  const primaryLanguage = profile.languages?.primary
    ? [
        {
          language: profile.languages.primary.language,
          level: mapLanguageLevel(profile.languages.primary.proficiency),
        },
      ]
    : [];

  const secondaryLanguages = (profile.languages?.secondary || []).map((l) => ({
    language: l.language,
    level: mapLanguageLevel(l.proficiency),
  }));
  
    // Ensure each skill is mapped to { name, years } as string
    const skills = (profile.skills || [])
      .map((s: any) => ({
        name: typeof s === "string" ? s : s.name,
        years: s.years ? String(s.years) : "",
      }))
      .filter((s) => Boolean(s.name));
  
    return {
      firstName,
      lastName,
      age: profile.age ? String(profile.age) : "",
      nationality: profile.nationality || "",
      currentLocation: [profile.currentLocation?.city, profile.currentLocation?.country]
        .filter(Boolean)
        .join(", "),
      profileImageUrl: profile.profileImage || "",
      galleryImageUrls: profile.galleryImages || [],
      bio: profile.aboutMe || "",
      skills,
      languages: [...primaryLanguage, ...secondaryLanguages],
      childcareExperience:
        profile.experience?.find((e) => e.type === "childcare")?.description || "",
      previousExperience:
        profile.experience
          ?.filter((e) => e.type !== "childcare")
          .map((e) => e.description)
          .join("\n") || "",
      certifications: profile.certifications || [],
      availableFrom: profile.availability?.availableFrom || "",
      duration: profile.availability?.duration || "",
      preferredLocations: (profile.desiredCountries || []).map((c) => c.country).filter(Boolean),
    };
  }

export function AuPairProfileEdit({ profileId, onComplete }: AuPairProfileEditProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialData, setInitialData] = useState<AuPairEditInitialData | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const normalizedProfileId = String(profileId).split("/").pop() || profileId;
        const snap = await getDoc(doc(db, "auPairProfiles", normalizedProfileId));

        if (!snap.exists()) {
          if (!cancelled) {
            setError("Profile not found");
            setLoading(false);
          }
          return;
        }

        if (cancelled) return;

        setInitialData(mapAuPairProfileToInitialData(snap.data() as AuPairProfile));
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
    <AuPairProfileCreate
      mode="edit"
      initialProfileId={profileId}
      initialData={initialData || undefined}
      onComplete={onComplete}
    />
  );
}