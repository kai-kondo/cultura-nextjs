// src/lib/types.ts
export type UserType = "aupair" | "family";

export interface UserDoc {
  email: string;
  userType: UserType;
  profileRef?: string | null;
  isProfileComplete?: boolean;
  // ...必要に応じて
}

export interface AuPairProfile {
  userId: string;
  name?: string;
  age?: number | null;
  nationality?: string;
  currentLocation?: { city?: string; country?: string };
  aboutMe?: string;
  skills?: {
    name: string;
    emoji?: string;
    level?: "beginner" | "intermediate" | "advanced";
  }[];
  canTeach?: string[];
  certifications?: string[];
  personalityTraits?: string[];
  experienceYears?: number | null;
  childcareExperience?: boolean;
  experienceDetails?: string;
  languages?: {
    primary?: {
      language: string;
      proficiency: "basic" | "intermediate" | "fluent" | "native";
    };
    secondary?: {
      language: string;
      proficiency: "basic" | "intermediate" | "fluent" | "native";
    }[];
  };
  experience?: { type: "childcare" | "other"; description: string }[];
  availability?: {
    status?: string | null;
    availableFrom?: string | null;
    duration?: string | null;
    workingHoursType?: string;
    preferredDays?: string[];
  };
  desiredCountries?: { country: string; flag?: string; cities?: string[] }[];
  profileImage?: string;
  galleryImages?: string[];
}

export interface FamilyProfile {
  userId: string;
  familyName?: string;
  location?: { country?: string; flag?: string; city?: string };
  familyMembers?: {
    adults?: number;
    children?: { age: number; gender?: "boy" | "girl"; emoji?: string }[];
    pets?: string[];
  };
  aboutUs?: string;
  lookingFor?: string | string[]; // 設計書の表現次第で後ほど固定
  offering?: {
    accommodation?: {
      type?: string;
      hasPrivateBathroom?: boolean;
      description?: string;
    };
    meals?: string;
    allowance?:
      | { amount: number; currency: string; frequency: "weekly" | "monthly" }
      | undefined;
    benefits?: string[];
  };
  position?: {
    startDate?: string | null;
    duration?: string | null;
    workingHoursType?: string;
    preferredDays?: string[];
    hoursPerWeek?: number;
  };
  profileImage?: string;
  galleryImages?: string[];
}
