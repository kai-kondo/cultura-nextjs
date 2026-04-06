"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { Separator } from "./ui/separator";
import { Card } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { CulturaLogo } from "./CulturaLogo";
import {
  User,
  Bell,
  Lock,
  Globe,
  Camera,
  Save,
  LogOut,
  Trash2,
  ArrowLeft,
  Shield,
  Mail,
  MapPin,
  Calendar,
  Phone,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";

import type { AuPairProfile, FamilyProfile, UserType } from "@/lib/types";
import { auth, db, storage } from "@/lib/firebase";
import { doc, onSnapshot, updateDoc, serverTimestamp } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { signOutUser } from "@/lib/auth-actions";

interface AccountSettingsProps {
  userType: UserType;
  profileId: string;
  onClose?: () => void;
  onLogout?: () => void;
}

async function uploadImageAndGetURL(file: File, path: string): Promise<string> {
  const objectRef = ref(storage, path);
  const contentType = file.type && file.type.startsWith("image/") ? file.type : "image/jpeg";
  const snap = await uploadBytes(objectRef, file, {
    contentType,
    cacheControl: "public, max-age=3600",
  });
  return await getDownloadURL(snap.ref);
}

export function AccountSettings({ userType, profileId, onClose, onLogout }: AccountSettingsProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [userDoc, setUserDoc] = useState<{
    email?: string;
    userType?: UserType;
    profileRef?: string | null;
    isProfileComplete?: boolean;
    notificationSettings?: {
      newMessages?: boolean;
      matches?: boolean;
      profileViews?: boolean;
      newsletters?: boolean;
    };
    privacySettings?: {
      profileVisible?: boolean;
      showLastSeen?: boolean;
      showReadReceipts?: boolean;
    };
  } | null>(null);

  const [profileData, setProfileData] = useState<AuPairProfile | FamilyProfile | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneVal, setPhoneVal] = useState("");
  const [locationVal, setLocationVal] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [bio, setBio] = useState("");
  const [languages, setLanguages] = useState<string[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [avatarURL, setAvatarURL] = useState<string | undefined>(undefined);

  const [notifications, setNotifications] = useState({
    newMessages: true,
    matches: true,
    profileViews: false,
    newsletters: true,
  });
  const [privacy, setPrivacy] = useState({
    profileVisible: true,
    showLastSeen: true,
    showReadReceipts: true,
  });

  const [newSkill, setNewSkill] = useState("");
  const [newLanguage, setNewLanguage] = useState("");

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const colName = useMemo(() => (userType === "aupair" ? "auPairProfiles" : "familyProfiles"), [userType]);

  useEffect(() => {
    let unsubProfile: (() => void) | null = null;
    let unsubUser: (() => void) | null = null;

    async function init() {
      try {
        setLoading(true);
        setError(null);

        const uid = auth.currentUser?.uid;
        if (!uid) {
          setError("Not signed in");
          setLoading(false);
          return;
        }

        unsubUser = onSnapshot(doc(db, "users", uid), (snap) => {
          const data = snap.data() || {};
          setUserDoc(data as any);
          setNotifications({
            newMessages: Boolean(data?.notificationSettings?.newMessages ?? true),
            matches: Boolean(data?.notificationSettings?.matches ?? true),
            profileViews: Boolean(data?.notificationSettings?.profileViews ?? false),
            newsletters: Boolean(data?.notificationSettings?.newsletters ?? true),
          });
          setPrivacy({
            profileVisible: Boolean(data?.privacySettings?.profileVisible ?? true),
            showLastSeen: Boolean(data?.privacySettings?.showLastSeen ?? true),
            showReadReceipts: Boolean(data?.privacySettings?.showReadReceipts ?? true),
          });
          setEmail((data as any)?.email || auth.currentUser?.email || "");
        });

        unsubProfile = onSnapshot(doc(db, colName, profileId), (snap) => {
          const p = (snap.exists() ? (snap.data() as any) : null) as AuPairProfile | FamilyProfile | null;
          setProfileData(p);

          if (p) {
            setAvatarURL((p as any)?.profileImage);
            setName((userType === "family" ? (p as FamilyProfile).familyName : (p as AuPairProfile).name) || "");
            setBio((p as any)?.aboutMe || (p as any)?.aboutUs || "");

            const city = (p as any)?.currentLocation?.city || (p as any)?.location?.city || "";
            const country = (p as any)?.currentLocation?.country || (p as any)?.location?.country || "";
            setLocationVal([city, country].filter(Boolean).join(", "));

            setPhoneVal((p as any)?.phone || "");
            setBirthDate((p as any)?.birthDate || "");

            const primary = (p as any)?.languages?.primary?.language
              ? [(p as any).languages.primary.language]
              : [];
            const secondaryRaw = (p as any)?.languages?.secondary;
            const secondary = Array.isArray(secondaryRaw)
              ? secondaryRaw.map((l: any) => l?.language).filter(Boolean)
              : [];

            setLanguages([...primary, ...secondary]);

            const skillsRaw = (p as any)?.skills;
            const skillsArr = Array.isArray(skillsRaw)
              ? skillsRaw.map((s: any) => s?.name || String(s)).filter(Boolean)
              : [];

            setSkills(skillsArr);
          }

          setLoading(false);
        });
      } catch (e: any) {
        setError(e?.message || "Failed to load settings");
        setLoading(false);
      }
    }

    void init();

    return () => {
      unsubProfile && unsubProfile();
      unsubUser && unsubUser();
    };
  }, [colName, profileId, userType]);

  const addSkill = () => {
    const value = newSkill.trim();
    const safeSkills = Array.isArray(skills) ? skills : [];

    if (value && !safeSkills.includes(value)) {
      setSkills([...safeSkills, value]);
    }

    setNewSkill("");
  };

  const removeSkill = (skill: string) => setSkills(skills.filter((s) => s !== skill));

  const addLanguage = () => {
    const value = newLanguage.trim();
    const safeLanguages = Array.isArray(languages) ? languages : [];

    if (value && !safeLanguages.includes(value)) {
      setLanguages([...safeLanguages, value]);
    }

    setNewLanguage("");
  };

  const removeLanguage = (lang: string) => setLanguages(languages.filter((l) => l !== lang));

  const handleSave = async () => {
    if (!auth.currentUser) return;

    setIsSaving(true);
    setError(null);

    try {
      await updateDoc(doc(db, "users", auth.currentUser.uid), {
        email: email || auth.currentUser.email,
        notificationSettings: { ...notifications },
        privacySettings: { ...privacy },
        updatedAt: serverTimestamp(),
      });

      const profileUpdate: any = {
        updatedAt: serverTimestamp(),
        phone: phoneVal || null,
      };

      if (userType === "aupair") {
        profileUpdate.name = name || null;
        profileUpdate.aboutMe = bio || null;
        if (locationVal) {
          const [city, country] = locationVal.split(",").map((s) => s.trim());
          profileUpdate.currentLocation = { city: city || null, country: country || null };
        }
        profileUpdate.birthDate = birthDate || null;
        profileUpdate.languages = {
          primary: languages[0] ? { language: languages[0], proficiency: "fluent" } : null,
          secondary: languages.slice(1).map((l) => ({ language: l, proficiency: "intermediate" })),
        };
        profileUpdate.skills = skills.map((s) => ({ name: s }));
      } else {
        profileUpdate.familyName = name || null;
        profileUpdate.aboutUs = bio || null;
        if (locationVal) {
          const [city, country] = locationVal.split(",").map((s) => s.trim());
          profileUpdate.location = { city: city || null, country: country || null };
        }
      }

      if (avatarURL) profileUpdate.profileImage = avatarURL;

      await updateDoc(doc(db, colName, profileId), profileUpdate);
    } catch (e: any) {
      setError(e?.message || "Failed to save");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarClick = () => fileInputRef.current?.click();

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const path = `${colName}/${profileId}/avatar.jpg`;
      const url = await uploadImageAndGetURL(file, path);
      setAvatarURL(url);
    } catch (e: any) {
      setError(e?.message || "Upload failed");
    }
  };

  const handleLogout = async () => {
    try {
      if (onLogout) {
        onLogout();
        return;
      }
      await signOutUser();
    } catch {
      // no-op
    }
  };

  const handleDeleteAccount = async () => {
    if (!auth.currentUser) return;
  
    setIsDeleting(true);
    setError(null);
  
    try {
      const uid = auth.currentUser.uid;
  
      await updateDoc(doc(db, "users", uid), {
        isDeleted: true,
        deletedAt: serverTimestamp(),
        displayName: "Deleted user",
        photoURL: "",
        profileRef: null,
        isProfileComplete: false,
        updatedAt: serverTimestamp(),
      });
  
      const profileUpdate: any = {
        isDeleted: true,
        deletedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        profileImage: "",
        phone: null,
      };
  
      if (userType === "aupair") {
        profileUpdate.name = "Deleted user";
        profileUpdate.aboutMe = null;
        profileUpdate.currentLocation = null;
        profileUpdate.birthDate = null;
        profileUpdate.languages = {
          primary: null,
          secondary: [],
        };
        profileUpdate.skills = [];
      } else {
        profileUpdate.familyName = "Deleted user";
        profileUpdate.aboutUs = null;
        profileUpdate.location = null;
      }
  
      await updateDoc(doc(db, colName, profileId), profileUpdate);
  
      await signOutUser();
      onLogout?.();
      onClose?.();
    } catch (e: any) {
      setError(e?.message || "Failed to delete account");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-rose-100">
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />

      <div className="lg:hidden sticky top-0 z-20 border-b border-gray-200 bg-white/80 shadow-sm backdrop-blur-md">
        <div className="px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl text-gray-900">Settings</h1>
          </div>
        </div>
      </div>

      <div className="hidden lg:block sticky top-0 z-20 border-b border-gray-200 bg-white/80 shadow-sm backdrop-blur-md">
      </div>

      <div className="max-w-5xl mx-auto p-4 md:p-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 hidden lg:block">
          <h1 className="text-3xl text-gray-900">Profile & Settings</h1>
          <p className="text-gray-600">Manage your profile information and preferences</p>
        </motion.div>

        {loading ? (
          <Card className="p-6 bg-white/80 backdrop-blur">Loading...</Card>
        ) : (
          <Tabs defaultValue="account" className="space-y-6">
            <TabsList className="grid w-full grid-cols-1 lg:w-auto lg:inline-grid">
              <TabsTrigger value="account" className="gap-2">
                <Lock className="w-4 h-4" />
                <span className="hidden sm:inline">Account</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="account" className="space-y-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-4">
                <Card className="p-6 bg-white/80 backdrop-blur">
                  <h3 className="text-gray-900 mb-4 flex items-center gap-2">
                    <Lock className="w-5 h-5 text-blue-600" />
                    Account Overview
                  </h3>
                  <div className="space-y-3 text-sm text-gray-700">
                    <div className="flex items-center justify-between rounded-lg border px-4 py-3">
                      <span>Email</span>
                      <span className="font-medium text-gray-900">{email || userDoc?.email || auth.currentUser?.email || "-"}</span>
                    </div>
                    <div className="flex items-center justify-between rounded-lg border px-4 py-3">
                      <span>Account Type</span>
                      <span className="font-medium capitalize text-gray-900">{userType || "-"}</span>
                    </div>
                    <div className="flex items-center justify-between rounded-lg border px-4 py-3">
                      <span>Profile Status</span>
                      <span className="font-medium text-gray-900">{userDoc?.isProfileComplete ? "Complete" : "Incomplete"}</span>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 bg-white/80 backdrop-blur border-red-200">
                  <h3 className="text-red-600 mb-4">Danger Zone</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
                      <div>
                        <p className="font-medium">Log Out</p>
                        <p className="text-sm text-gray-600">Sign out of your account</p>
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline">
                            <LogOut className="w-4 h-4 mr-2" />
                            Log Out
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              You will be signed out of your account. You can log back in anytime.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleLogout}>Log Out</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>

                    <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 p-4">
                      <div>
                        <p className="font-medium text-red-700">Delete Account</p>
                        <p className="text-sm text-red-600">Permanently delete your account and all data</p>
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Account?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-red-600 hover:bg-red-700"
                              onClick={(e) => {
                                e.preventDefault();
                                void handleDeleteAccount();
                              }}
                              disabled={isDeleting}
                            >
                              {isDeleting ? "Deleting..." : "Delete Account"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                    {error ? <p className="text-sm text-red-600">{error}</p> : null}
                  </div>
                </Card>
              </motion.div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
