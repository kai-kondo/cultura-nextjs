import { auth, db } from "./firebase";
import {
  createUserWithEmailAndPassword,
  fetchSignInMethodsForEmail,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";

function makeAuthError(code: string, message: string) {
  const e = new Error(message) as Error & { code?: string };
  e.code = code;
  return e;
}

export async function signUpEmail(
  email: string,
  password: string,
  userType: "aupair" | "family",
  fullName?: string
) {
  // Preflight: if any sign-in method exists, it's not a "new" signup.
  const methods = await fetchSignInMethodsForEmail(auth, email);
  if (methods.length > 0) {
    throw makeAuthError(
      "auth/account-already-exists",
      "An account already exists. Please log in."
    );
  }

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

export async function signInGoogle(
  userType?: "aupair" | "family",
  intent: "login" | "signup" = "login"
) {
  const cred = await signInWithPopup(auth, googleProvider);
  const { user } = cred;

  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);

  // Login flow: only existing app users should continue.
  // If there is no Firestore user document yet, sign out immediately and let the UI
  // send the user to signup/onboarding.
  if (intent === "login") {
    if (!snap.exists()) {
      await signOut(auth);
      return user;
    }

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

    return user;
  }

  // Signup flow: create the app user document only when it does not already exist.
  if (!snap.exists()) {
    await setDoc(userRef, {
      email: user.email || "",
      displayName: user.displayName || "",
      photoURL: user.photoURL || "",
      userType: userType ?? null,
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

    return user;
  }

  // Existing Firestore user on signup should be treated as an existing account.
  await signOut(auth);
  throw makeAuthError(
    "auth/account-already-exists",
    "An account already exists. Please log in."
  );
}