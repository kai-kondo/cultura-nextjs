import 'dotenv/config'

import { db } from "@/lib/firebase";
import { doc, writeBatch, serverTimestamp } from "firebase/firestore";

type LanguageLevel = "Beginner" | "Intermediate" | "Fluent" | "Native";
type CareType = "aupair" | "demipair";
type Availability = "Immediate" | "Within 1 month" | "Flexible" | "From specific date";

type Skill = {
  name: string;
  emoji: string;
};

type AuPairSeed = {
  name: string;
  nationality: string;
  profileImage: string;
  availability: Availability;
  availableFrom: string;
  careType: CareType;
  durationMonths: number;
  languages: {
    primary: {
      language: string;
      proficiency: LanguageLevel;
    };
    secondary: Array<{
      language: string;
      proficiency: LanguageLevel;
    }>;
  };
  skills: Skill[];
};

const auPairSeeds: AuPairSeed[] = [
  {
    name: "Maria Silva",
    nationality: "Brazil",
    profileImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
    availability: "Immediate",
    availableFrom: "2026-01-01",
    careType: "demipair",
    durationMonths: 9,
    languages: {
      primary: { language: "Portuguese", proficiency: "Native" },
      secondary: [
        { language: "English", proficiency: "Fluent" },
        { language: "Japanese", proficiency: "Intermediate" },
      ],
    },
    skills: [
      { name: "Art", emoji: "🎨" },
      { name: "Swimming", emoji: "🏊" },
      { name: "Cooking", emoji: "🍳" },
    ],
  },
  {
    name: "Yuki Tanaka",
    nationality: "Japan",
    profileImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80",
    availability: "Within 1 month",
    availableFrom: "2026-02-01",
    careType: "aupair",
    durationMonths: 12,
    languages: {
      primary: { language: "Japanese", proficiency: "Native" },
      secondary: [
        { language: "English", proficiency: "Intermediate" },
      ],
    },
    skills: [
      { name: "Babysitting", emoji: "🧸" },
      { name: "Tutoring", emoji: "📚" },
      { name: "Music", emoji: "🎵" },
    ],
  },
  {
    name: "Claire Martin",
    nationality: "France",
    profileImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2",
    availability: "Flexible",
    availableFrom: "2026-03-01",
    careType: "aupair",
    durationMonths: 6,
    languages: {
      primary: { language: "French", proficiency: "Native" },
      secondary: [
        { language: "English", proficiency: "Fluent" },
        { language: "Japanese", proficiency: "Beginner" },
      ],
    },
    skills: [
      { name: "Art", emoji: "🎨" },
      { name: "Language Support", emoji: "🗣️" },
      { name: "Reading", emoji: "📖" },
    ],
  },
  {
    name: "Sofia Garcia",
    nationality: "Spain",
    profileImage: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df",
    availability: "Immediate",
    availableFrom: "2026-01-10",
    careType: "demipair",
    durationMonths: 9,
    languages: {
      primary: { language: "Spanish", proficiency: "Native" },
      secondary: [
        { language: "English", proficiency: "Fluent" },
      ],
    },
    skills: [
      { name: "Sports", emoji: "⚽" },
      { name: "Cooking", emoji: "🍳" },
      { name: "Babysitting", emoji: "🧸" },
    ],
  },
  {
    name: "Emily Johnson",
    nationality: "Australia",
    profileImage: "https://images.unsplash.com/photo-1517841905240-472988babdf9",
    availability: "From specific date",
    availableFrom: "2026-04-01",
    careType: "aupair",
    durationMonths: 12,
    languages: {
      primary: { language: "English", proficiency: "Native" },
      secondary: [
        { language: "Japanese", proficiency: "Beginner" },
      ],
    },
    skills: [
      { name: "Swimming", emoji: "🏊" },
      { name: "Outdoor Play", emoji: "🌿" },
      { name: "First Aid Awareness", emoji: "🩹" },
    ],
  },
  {
    name: "Hannah Müller",
    nationality: "Germany",
    profileImage: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1",
    availability: "Within 1 month",
    availableFrom: "2026-02-15",
    careType: "demipair",
    durationMonths: 6,
    languages: {
      primary: { language: "German", proficiency: "Native" },
      secondary: [
        { language: "English", proficiency: "Fluent" },
      ],
    },
    skills: [
      { name: "Tutoring", emoji: "📚" },
      { name: "Music", emoji: "🎵" },
      { name: "House Support", emoji: "🏠" },
    ],
  },
  {
    name: "Ana Santos",
    nationality: "Philippines",
    profileImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e",
    availability: "Immediate",
    availableFrom: "2026-01-05",
    careType: "aupair",
    durationMonths: 12,
    languages: {
      primary: { language: "English", proficiency: "Fluent" },
      secondary: [
        { language: "Tagalog", proficiency: "Native" },
      ],
    },
    skills: [
      { name: "Babysitting", emoji: "🧸" },
      { name: "Cooking", emoji: "🍳" },
      { name: "Homework Support", emoji: "✏️" },
    ],
  },
  {
    name: "Giulia Rossi",
    nationality: "Italy",
    profileImage: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d",
    availability: "Flexible",
    availableFrom: "2026-03-10",
    careType: "demipair",
    durationMonths: 9,
    languages: {
      primary: { language: "Italian", proficiency: "Native" },
      secondary: [
        { language: "English", proficiency: "Fluent" },
      ],
    },
    skills: [
      { name: "Art", emoji: "🎨" },
      { name: "Cooking", emoji: "🍳" },
      { name: "Storytelling", emoji: "📖" },
    ],
  },
  {
    name: "Mei Chen",
    nationality: "Taiwan",
    profileImage: "https://images.unsplash.com/photo-1491349174775-aaafddd81942",
    availability: "From specific date",
    availableFrom: "2026-05-01",
    careType: "aupair",
    durationMonths: 6,
    languages: {
      primary: { language: "Mandarin", proficiency: "Native" },
      secondary: [
        { language: "English", proficiency: "Fluent" },
        { language: "Japanese", proficiency: "Intermediate" },
      ],
    },
    skills: [
      { name: "Language Support", emoji: "🗣️" },
      { name: "Tutoring", emoji: "📚" },
      { name: "Music", emoji: "🎵" },
    ],
  },
  {
    name: "Olivia Wilson",
    nationality: "New Zealand",
    profileImage: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f",
    availability: "Immediate",
    availableFrom: "2026-01-20",
    careType: "demipair",
    durationMonths: 3,
    languages: {
      primary: { language: "English", proficiency: "Native" },
      secondary: [
        { language: "Japanese", proficiency: "Beginner" },
      ],
    },
    skills: [
      { name: "Sports", emoji: "⚽" },
      { name: "Swimming", emoji: "🏊" },
      { name: "Outdoor Play", emoji: "🌿" },
    ],
  },
];

async function seedAuPairProfiles() {
  const batch = writeBatch(db);

  auPairSeeds.forEach((auPair, index) => {
    const ref = doc(db, "auPairProfiles", `seed-aupair-${index + 1}`);
    batch.set(ref, {
      ...auPair,
      createdAt: serverTimestamp(),
    });
  });

  await batch.commit();
  console.log("auPairProfiles seeded successfully");
}

seedAuPairProfiles().catch((error) => {
  console.error("Seed failed:", error);
});