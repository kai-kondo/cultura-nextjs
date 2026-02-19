import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

// Firebase Admin SDKの初期化
const app = initializeApp({
  credential: cert(require("../secrets/cultura-sa.json")),
});

const auth = getAuth();
const db = getFirestore();

// ---- Unsplash fixed URLs (deterministic by index) ----
const unsplashUrl = (i: number, type: "aupair" | "family") =>
  type === "aupair"
    ? `https://source.unsplash.com/600x600/?portrait,woman&amp;sig=${i + 1}`
    : `https://source.unsplash.com/600x600/?family,home&amp;sig=${i + 1}`;

// ---- Profile payload factories (with photo URLs) ----
const makeAuPairProfile = (i: number) => ({
  name: `AuPair ${i + 1}`,
  nationality: ["Japan", "France", "Brazil", "Korea", "Australia"][i % 5],
  careType: i % 2 === 0 ? "aupair" : "demipair",
  profileImage: unsplashUrl(i, "aupair"),
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
});

const makeFamilyProfile = (i: number) => ({
  familyName: `Family ${i + 1}`,
  location: { city: "Tokyo", country: "Japan" },
  familyMembers: {
    adults: 2,
    children: [
      { age: 5, emoji: "🧒" },
      { age: 3, emoji: "👧" },
    ],
  },
  profileImage: unsplashUrl(i, "family"),
  lookingForType: i % 2 === 0 ? "aupair" : "demipair",
  languages: {
    primary: { language: "English" },
    secondary: [{ language: "Japanese" }],
  },
  durationMonths: [6, 9, 12][i % 3],
  availability: "Immediate",
  createdAt: FieldValue.serverTimestamp(),
});

// テスト用ユーザーリスト（AuPair / Family 各10）
const testUsers = [
  ...Array.from({ length: 10 }).map((_, i) => ({
    email: `aupair${i + 1}@example.com`,
    password: "test1234",
    displayName: `AuPair ${i + 1}`,
    userType: "aupair",
  })),
  ...Array.from({ length: 10 }).map((_, i) => ({
    email: `family${i + 1}@example.com`,
    password: "test1234",
    displayName: `Family ${i + 1}`,
    userType: "family",
  })),
];

async function seedAuth() {
  console.log("🔥 Creating Authentication users + profiles (with Unsplash photos)...");
  for (const [i, u] of testUsers.entries()) {
    try {
      const userRecord = await auth.createUser({
        email: u.email,
        password: u.password,
        displayName: u.displayName,
      });

      // Create corresponding profile with fixed Unsplash URL
      let profileId: string;
      if (u.userType === "aupair") {
        const ref = db.collection("auPairProfiles").doc();
        await ref.set(makeAuPairProfile(i));
        profileId = ref.id;
      } else {
        const ref = db.collection("familyProfiles").doc();
        await ref.set(makeFamilyProfile(i));
        profileId = ref.id;
      }

      // Link user document to the created profile
      await db.collection("users").doc(userRecord.uid).set({
        email: u.email,
        userType: u.userType,
        profileRef: profileId,
        createdAt: FieldValue.serverTimestamp(),
      });

      console.log(`✅ ${u.displayName} (${u.userType}) created → profileRef: ${profileId}`);
    } catch (error: any) {
      if (error.code === "auth/email-already-exists") {
        console.log(`⚠️ ${u.email} はすでに存在します（スキップ）`);
      } else {
        console.error(`❌ ${u.email}:`, error);
      }
    }
  }
  console.log("🎉 Done seeding Auth + profiles!");
}

// ---- run ----
seedAuth().catch((e) => {
  console.error(e);
  process.exit(1);
});
