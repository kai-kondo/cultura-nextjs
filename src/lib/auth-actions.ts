import { auth, db } from "./firebase";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";

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

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: "select_account",
});

export async function signInGoogle(defaultUserType: "aupair" | "family" = "aupair") {
  const { user } = await signInWithPopup(auth, googleProvider);

  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);

  if (!snap.exists()) {
    await setDoc(userRef, {
      email: user.email || "",
      displayName: user.displayName || "",
      photoURL: user.photoURL || "",
      userType: defaultUserType,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
      isActive: true,
      isEmailVerified: user.emailVerified ?? true,
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
      onboarding: { step: "profileSetup" },
    });
  } else {
    await setDoc(
      userRef,
      {
        email: user.email || "",
        displayName: user.displayName || "",
        photoURL: user.photoURL || "",
        isEmailVerified: user.emailVerified ?? true,
        lastLoginAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  }

  return user;
}