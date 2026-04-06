import type { AuPairProfile, FamilyProfile } from "@/lib/types";

export interface AuPairProfileFormData {
  firstName: string;
  lastName: string;
  age: string;
  nationality: string;
  currentLocation: string;

  photo: File | null;
  galleryPhotos: File[];
  profileImageUrl: string;
  galleryImageUrls: string[];

  bio: string;

  skills: string[];
  languages: { language: string; level: string }[];

  childcareExperience: string;
  previousExperience: string;
  certifications: string[];

  availableFrom: string;
  duration: string;
  preferredLocations: string[];
}

export const emptyAuPairProfileFormData: AuPairProfileFormData = {
  firstName: "",
  lastName: "",
  age: "",
  nationality: "",
  currentLocation: "",

  photo: null,
  galleryPhotos: [],
  profileImageUrl: "",
  galleryImageUrls: [],

  bio: "",

  skills: [],
  languages: [],

  childcareExperience: "",
  previousExperience: "",
  certifications: [],

  availableFrom: "",
  duration: "",
  preferredLocations: [],
};

function mapLevelFromProfile(
  value?: string
): "Basic" | "Intermediate" | "Advanced" | "Native" {
  switch (value) {
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

export function mapAuPairProfileToFormData(
  profile: AuPairProfile | null
): AuPairProfileFormData {
  if (!profile) return emptyAuPairProfileFormData;

  const nameParts = (profile.name || "").trim().split(" ");
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ");

  const primaryLanguage = profile.languages?.primary
    ? [
        {
          language: profile.languages.primary.language,
          level: mapLevelFromProfile(profile.languages.primary.proficiency),
        },
      ]
    : [];

  const secondaryLanguages = (profile.languages?.secondary || []).map((l) => ({
    language: l.language,
    level: mapLevelFromProfile(l.proficiency),
  }));

  const childcareExperience =
    profile.experience?.find((e) => e.type === "childcare")?.description || "";

  const previousExperience =
    profile.experience
      ?.filter((e) => e.type !== "childcare")
      .map((e) => e.description)
      .join("\n") || "";

  return {
    firstName,
    lastName,
    age: profile.age ? String(profile.age) : "",
    nationality: profile.nationality || "",
    currentLocation: [profile.currentLocation?.city, profile.currentLocation?.country]
      .filter(Boolean)
      .join(", "),

    photo: null,
    galleryPhotos: [],
    profileImageUrl: profile.profileImage || "",
    galleryImageUrls: profile.galleryImages || [],

    bio: profile.aboutMe || "",

    skills: (profile.skills || []).map((s) => s.name),
    languages: [...primaryLanguage, ...secondaryLanguages],

    childcareExperience,
    previousExperience,
    certifications: profile.certifications || [],

    availableFrom: profile.availability?.availableFrom || "",
    duration: profile.availability?.duration || "",
    preferredLocations: (profile.desiredCountries || []).map((c) => c.country),
  };
}