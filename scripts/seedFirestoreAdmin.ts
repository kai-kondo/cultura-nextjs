// scripts/seedFirestoreAdmin.ts
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore, FieldValue, BulkWriter } from "firebase-admin/firestore";
import fs from "node:fs";

// ★鍵パス（環境変数でもOK）
const SA_PATH =
  process.env.GOOGLE_APPLICATION_CREDENTIALS || "secrets/cultura-sa.json";
if (!fs.existsSync(SA_PATH)) {
  console.error("Service Account JSON not found:", SA_PATH);
  process.exit(1);
}

const sa = JSON.parse(fs.readFileSync(SA_PATH, "utf8"));
if (!getApps().length) {
  initializeApp({ credential: cert(sa) });
}
const db = getFirestore();

// ダミー
const auPairs = Array.from({ length: 10 }).map((_, i) => ({
  name: `AuPair ${i + 1}`,
  nationality: ["Japan", "France", "Brazil", "Korea", "Australia"][i % 5],
  careType: i % 2 === 0 ? "aupair" : "demipair",
  profileImage: `https://placehold.co/600x400?text=AuPair+${i + 1}`,
  languages: {
    primary: { language: "English", proficiency: "Fluent" },
    secondary: [{ language: "Japanese", proficiency: "Intermediate" }],
  },
  skills: [
    { emoji: "🎨", name: "Art" },
    { emoji: "🏊", name: "Swimming" },
  ],
  durationMonths: [6, 9, 12][i % 3],
  availability: "Immediate",
  availableFrom: "2026-01-01",
  createdAt: FieldValue.serverTimestamp(),
}));

const families = Array.from({ length: 10 }).map((_, i) => ({
  familyName: `Family ${i + 1}`,
  location: { city: "Tokyo", country: "Japan" },
  familyMembers: {
    adults: 2,
    children: [
      { age: 5, emoji: "🧒" },
      { age: 3, emoji: "👧" },
    ],
  },
  profileImage: `https://placehold.co/600x400?text=Family+${i + 1}`,
  lookingForType: i % 2 === 0 ? "aupair" : "demipair",
  languages: {
    primary: { language: "English" },
    secondary: [{ language: "Japanese" }],
  },
  durationMonths: [6, 9, 12][i % 3],
  availability: "Immediate",
  createdAt: FieldValue.serverTimestamp(),
}));

async function seed() {
  console.log("🔥 Seeding with Admin SDK...");
  const writer: BulkWriter = db.bulkWriter();

  auPairs.forEach((p) => {
    const ref = db.collection("auPairProfiles").doc(); // auto ID
    writer.set(ref, p);
  });

  families.forEach((f) => {
    const ref = db.collection("familyProfiles").doc();
    writer.set(ref, f);
  });

  await writer.close();
  console.log("✅ Done: 10 auPairs + 10 families");
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
