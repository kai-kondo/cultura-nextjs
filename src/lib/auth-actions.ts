import { auth, db } from "./firebase";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { signOut } from "firebase/auth";

export async function signUpEmail(
  email: string,
  password: string,
  userType: "aupair" | "family",
  fullName?: string
) {
  const { user } = await createUserWithEmailAndPassword(auth, email, password);
  if (fullName) await updateProfile(user, { displayName: fullName });
  await sendEmailVerification(user);

  await setDoc(doc(db, "users", user.uid), {
    email,
    userType,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    isActive: true,
    isEmailVerified: false,
    isProfileComplete: false,
    profileRef: null,
    notificationSettings: {
      emailNotifications: true,
      pushNotifications: true,
      messageNotifications: true,
      matchNotifications: true,
    },
    privacySettings: {
      profileVisibility: "public",
      showOnlineStatus: true,
      showLocation: false,
    },
    onboarding: { step: "verifyEmail" },
  });

  return user;
}

export async function signInEmail(email: string, password: string) {
  const { user } = await signInWithEmailAndPassword(auth, email, password);
  await updateDoc(doc(db, "users", user.uid), {
    lastLoginAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return user;
}

export async function signOutUser() {
  try {
    await signOut(auth);
    console.log("User signed out successfully");
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
}
