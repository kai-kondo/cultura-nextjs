import { db } from "./firebase";
import { storage } from "./firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
  collection,
  doc,
  runTransaction,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

/** 初回プロフィール作成＋users.profileRef更新（原子的に） */
export async function createAuPairProfileAndLink(
  userId: string,
  initial?: Partial<any>
) {
  const profileRef = doc(collection(db, "auPairProfiles"));
  const userRef = doc(db, "users", userId);
  await runTransaction(db, async (tx) => {
    tx.set(profileRef, {
      userId,
      careType: "aupair",
      languages: {
        primary: { language: "English", proficiency: "basic" },
        secondary: [],
      },
      skills: [],
      interests: [],
      availability: {
        availableFrom: null,
        duration: null,
        workingHoursType: "fulltime",
        preferredDays: [],
      },
      aboutMe: "",
      stats: { profileViews: 0, likesReceived: 0, matchCount: 0 },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      ...initial,
    });
    tx.update(userRef, {
      profileRef: `auPairProfiles/${profileRef.id}`,
      updatedAt: serverTimestamp(),
    });
  });
  return profileRef.id;
}

export async function createFamilyProfileAndLink(
  userId: string,
  initial?: Partial<any>
) {
  const profileRef = doc(collection(db, "familyProfiles"));
  const userRef = doc(db, "users", userId);
  await runTransaction(db, async (tx) => {
    tx.set(profileRef, {
      userId,
      familyName: "",
      location: { country: "", flag: "", city: "" },
      lookingForType: "aupair",
      familyMembers: { adults: 2, children: [], pets: [] },
      position: {
        startDate: null,
        duration: null,
        workingHoursType: "fulltime",
        preferredDays: [],
        hoursPerWeek: 20,
      },
      offering: {
        accommodation: { type: "private_room", hasPrivateBathroom: false },
        meals: "some_meals",
      },
      aboutUs: "",
      stats: { profileViews: 0, likesReceived: 0, matchCount: 0 },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      ...initial,
    });
    tx.update(userRef, {
      profileRef: `familyProfiles/${profileRef.id}`,
      updatedAt: serverTimestamp(),
    });
  });
  return profileRef.id;
}

/** ウィザード各ステップの部分更新 */
export async function patchAuPairProfile(
  profileId: string,
  patch: Record<string, any>
) {
  await updateDoc(doc(db, "auPairProfiles", profileId), {
    ...patch,
    updatedAt: serverTimestamp(),
  });
}
export async function patchFamilyProfile(
  profileId: string,
  patch: Record<string, any>
) {
  await updateDoc(doc(db, "familyProfiles", profileId), {
    ...patch,
    updatedAt: serverTimestamp(),
  });
}
// ---- Storage helpers & photo upserts ----
async function uploadImageAndGetURL(file: File, path: string): Promise<string> {
  const objectRef = ref(storage, path);
  // Some browsers may provide an empty file.type (e.g., drag & drop or certain formats).
  // Fallback to a safe image content type so Storage rules (isImage) pass.
  const contentType = file.type && file.type.startsWith("image/") ? file.type : "image/jpeg";
  const snap = await uploadBytes(objectRef, file, {
    contentType,
    cacheControl: "public, max-age=3600", // optional caching for CDN
  });
  return await getDownloadURL(snap.ref);
}

/** Upload avatar and/or gallery photos for AuPair profile and persist URLs. */
export async function saveAuPairPhotos(
  profileId: string,
  opts: { avatar?: File | null; gallery?: File[] }
) {
  const updates: Record<string, any> = {};

  if (opts.avatar) {
    const url = await uploadImageAndGetURL(
      opts.avatar,
      `auPairProfiles/${profileId}/avatar.jpg`
    );
    updates.profileImage = url;
  }

  if (opts.gallery && opts.gallery.length) {
    const urls: string[] = [];
    let i = 0;
    for (const file of opts.gallery) {
      const url = await uploadImageAndGetURL(
        file,
        `auPairProfiles/${profileId}/gallery/${Date.now()}_${i++}.jpg`
      );
      urls.push(url);
    }
    updates.galleryImages = urls;
  }

  if (Object.keys(updates).length) {
    await updateDoc(doc(db, "auPairProfiles", profileId), {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  }
}

/** Upload avatar and/or gallery photos for Family profile and persist URLs. */
export async function saveFamilyPhotos(
  profileId: string,
  opts: { avatar?: File | null; gallery?: File[] }
) {
  const updates: Record<string, any> = {};

  if (opts.avatar) {
    const url = await uploadImageAndGetURL(
      opts.avatar,
      `familyProfiles/${profileId}/avatar.jpg`
    );
    updates.profileImage = url;
  }

  if (opts.gallery && opts.gallery.length) {
    const urls: string[] = [];
    let i = 0;
    for (const file of opts.gallery) {
      const url = await uploadImageAndGetURL(
        file,
        `familyProfiles/${profileId}/gallery/${Date.now()}_${i++}.jpg`
      );
      urls.push(url);
    }
    updates.galleryImages = urls;
  }

  if (Object.keys(updates).length) {
    await updateDoc(doc(db, "familyProfiles", profileId), {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  }
}
