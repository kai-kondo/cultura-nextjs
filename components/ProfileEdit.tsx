"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import { Card } from "./ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { CulturaLogo } from "./CulturaLogo";
import {
  User,
  Globe,
  Camera,
  Save,
  Mail,
  MapPin,
  Calendar,
  Phone,
  X,
  ArrowLeft,
} from "lucide-react";
import { motion } from "motion/react";
import type { AuPairProfile, FamilyProfile, UserType } from "@/lib/types";
import { auth, db, storage } from "@/lib/firebase";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

interface ProfileEditProps {
  userType: UserType; // "family" | "aupair"
  profileId: string;  // FirestoreのプロフィールID
  onBack?: () => void;
}

export function ProfileEdit({ userType, profileId, onBack }: ProfileEditProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // UI状態
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneVal, setPhoneVal] = useState("");
  const [locationVal, setLocationVal] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [bio, setBio] = useState("");
  const [languages, setLanguages] = useState<string[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [avatarURL, setAvatarURL] = useState<string | undefined>(undefined);

  const [newSkill, setNewSkill] = useState("");
  const [newLanguage, setNewLanguage] = useState("");

  // Debug helper: confirm auth state at the moment of write/upload
  const logAuth = (label: string) => {
    console.log(`[ProfileEdit] ${label} auth:`, {
      uid: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      userType,
      colName,
      profileDocId,
    });
  };

  // --- autosave helpers ---
  const hasLoadedRef = useRef(false);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scheduleSave = (partial: Record<string, any>) => {
    if (!hasLoadedRef.current) return; // avoid writing during initial load
    if (!auth.currentUser) {
      console.warn("[ProfileEdit] Autosave skipped: not authenticated");
      return;
    }
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(async () => {
      try {
        logAuth("Autosave");
        const refDoc = doc(db, colName, profileDocId);
        console.log("[ProfileEdit] Autosave writing to:", refDoc.path, partial);
        await updateDoc(refDoc, partial);
        console.log("[ProfileEdit] Autosave ok");
      } catch (e: any) {
        console.error("[ProfileEdit] Autosave failed:", e);
        console.error("[ProfileEdit] Autosave code:", e?.code);
        console.error("[ProfileEdit] Autosave message:", e?.message);
        setError(e?.message || "Autosave failed");
      }
    }, 600); // debounce 600ms
  };

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const colName = useMemo(() => (userType === "aupair" ? "auPairProfiles" : "familyProfiles"), [userType]);
  // Safety: profileId must be a Firestore doc id (no slashes). If a path is passed, use the last segment.
  const profileDocId = useMemo(() => String(profileId).split("/").pop() || profileId, [profileId]);

  // Firestore購読（profile）
  useEffect(() => {
    setLoading(true);
    setError(null);
    const unsub = onSnapshot(doc(db, colName, profileDocId), (snap) => {
      const p = (snap.exists() ? (snap.data() as any) : null) as AuPairProfile | FamilyProfile | null;
      if (!p) {
        setLoading(false);
        return;
      }
      setAvatarURL((p as any)?.profileImage);
      setName(userType === "family" ? (p as any)?.familyName || "" : (p as any)?.name || "");
      setBio((p as any)?.aboutMe || (p as any)?.aboutUs || "");
      const city = (p as any)?.currentLocation?.city || (p as any)?.location?.city || "";
      const country = (p as any)?.currentLocation?.country || (p as any)?.location?.country || "";
      setLocationVal([city, country].filter(Boolean).join(", "));
      setPhoneVal((p as any)?.phone || "");
      setBirthDate((p as any)?.birthDate || "");
      const primary = (p as any)?.languages?.primary?.language ? [(p as any).languages.primary.language] : [];
      const secondary = ((p as any)?.languages?.secondary || []).map((l: any) => l.language);
      setLanguages([...primary, ...secondary]);
      const skillsArr = ((p as any)?.skills || []).map((s: any) => s.name || String(s));
      setSkills(skillsArr);
      // emailは認証ユーザーのものを優先
      setEmail(auth.currentUser?.email || "");
      hasLoadedRef.current = true;
      setLoading(false);
    }, (e) => {
      setError(e.message);
      setLoading(false);
    });
    return () => unsub();
  }, [colName, profileDocId, userType]);

  // 追加・削除
  const addSkill = () => {
    const v = newSkill.trim();
    if (v && !skills.includes(v)) {
      const next = [...skills, v];
      setSkills(next);
      scheduleSave({
        skills: next.map((s) => ({ name: s })),
        updatedAt: new Date(),
      });
    }
    setNewSkill("");
  };
  const removeSkill = (skill: string) => {
    const next = skills.filter((s) => s !== skill);
    setSkills(next);
    scheduleSave({
      skills: next.map((s) => ({ name: s })),
      updatedAt: new Date(),
    });
  };

  const addLanguage = () => {
    const v = newLanguage.trim();
    if (v && !languages.includes(v)) {
      const next = [...languages, v];
      setLanguages(next);
      scheduleSave({
        languages:
          userType === "aupair"
            ? {
                primary: next[0] ? { language: next[0], proficiency: "fluent" } : null,
                secondary: next.slice(1).map((l) => ({ language: l, proficiency: "intermediate" })),
              }
            : {
                primary: next[0] ? { language: next[0] } : null,
                secondary: next.slice(1).map((l) => ({ language: l })),
              },
        updatedAt: new Date(),
      });
    }
    setNewLanguage("");
  };
  const removeLanguage = (lang: string) => {
    const next = languages.filter((l) => l !== lang);
    setLanguages(next);
    scheduleSave({
      languages:
        userType === "aupair"
          ? {
              primary: next[0] ? { language: next[0], proficiency: "fluent" } : null,
              secondary: next.slice(1).map((l) => ({ language: l, proficiency: "intermediate" })),
            }
          : {
              primary: next[0] ? { language: next[0] } : null,
              secondary: next.slice(1).map((l) => ({ language: l })),
            },
      updatedAt: new Date(),
    });
  };

  // 画像アップロード
  async function uploadImageAndGetURL(file: File, path: string) {
    const objectRef = ref(storage, path);
    const contentType = file.type && file.type.startsWith("image/") ? file.type : "image/jpeg";
    try {
      logAuth("Storage upload");
      console.log("[ProfileEdit] Uploading avatar to:", objectRef.fullPath, { contentType, size: file.size });
      const snap = await uploadBytes(objectRef, file, { contentType, cacheControl: "public, max-age=3600" });
      const url = await getDownloadURL(snap.ref);
      console.log("[ProfileEdit] Upload ok. downloadURL:", url);
      return url;
    } catch (e: any) {
      console.error("[ProfileEdit] Upload failed:", e);
      console.error("[ProfileEdit] Upload code:", e?.code);
      console.error("[ProfileEdit] Upload message:", e?.message);
      throw e;
    }
  }
  const handleAvatarClick = () => fileInputRef.current?.click();
  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const maxBytes = 10 * 1024 * 1024; // 10MB
    if (file.size >= maxBytes) {
      const msg = "Image too large. Please upload an image smaller than 10MB.";
      window.alert(msg);
      setError(msg);
      // Allow selecting the same file again after the alert
      e.currentTarget.value = "";
      return;
    }
    try {
      if (!auth.currentUser) {
        throw new Error("Not authenticated");
      }
      logAuth("Avatar change");
      const url = await uploadImageAndGetURL(file, `${colName}/${profileDocId}/avatar.jpg`);
      setAvatarURL(url);
      // persist immediately
      try {
        const refDoc = doc(db, colName, profileDocId);
        console.log("[ProfileEdit] Persisting profileImage to:", refDoc.path);
        await updateDoc(refDoc, { profileImage: url, updatedAt: new Date() });
        console.log("[ProfileEdit] Persist ok");
      } catch (e: any) {
        console.error("[ProfileEdit] Persist failed:", e);
        console.error("[ProfileEdit] Persist code:", e?.code);
        console.error("[ProfileEdit] Persist message:", e?.message);
        throw e;
      }
      e.currentTarget.value = "";
    } catch (err: any) {
      setError(err?.message || "Upload failed");
      // clear file input safely using the original event
      if (e?.currentTarget) {
        e.currentTarget.value = "";
      }
    }
  };

  // 保存
  const handleSave = async () => {
    if (!auth.currentUser) {
      setError("Not authenticated");
      console.warn("[ProfileEdit] Save blocked: not authenticated");
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      const update: any = { updatedAt: new Date(), phone: phoneVal || null };

      if (userType === "aupair") {
        update.name = name || null;
        update.aboutMe = bio || null;
        if (locationVal) {
          const [city, country] = locationVal.split(",").map((s) => s.trim());
          update.currentLocation = { city: city || null, country: country || null };
        }
        update.birthDate = birthDate || null;
        update.languages = {
          primary: languages[0] ? { language: languages[0], proficiency: "fluent" } : null,
          secondary: languages.slice(1).map((l) => ({ language: l, proficiency: "intermediate" })),
        };
        update.skills = skills.map((s) => ({ name: s }));
      } else {
        update.familyName = name || null;
        update.aboutUs = bio || null;
        if (locationVal) {
          const [city, country] = locationVal.split(",").map((s) => s.trim());
          update.location = { city: city || null, country: country || null };
        }
        // family側で必要に応じて languages/skills を追加してもOK
      }

      if (avatarURL) update.profileImage = avatarURL;

      logAuth("Save Changes");
      const refDoc = doc(db, colName, profileDocId);
      console.log("[ProfileEdit] Saving to:", refDoc.path, update);
      await updateDoc(refDoc, update);
      console.log("[ProfileEdit] Save ok");
    } catch (e: any) {
      setError(e?.message || "Failed to save");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-rose-100">
      {/* Header - Mobile */}
      <div className="lg:hidden sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl text-gray-900">Edit Profile</h1>
          </div>
        </div>
      </div>

      {/* Header - Desktop */}
      <div className="hidden lg:block sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={onBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
          <button
            onClick={onBack}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <CulturaLogo size={32} />
            <span className="font-semibold text-gray-800">Cultura</span>
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-4 md:p-6">
        {/* Main Header - Desktop Only */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 hidden lg:block"
        >
          <h1 className="text-3xl text-gray-900">Edit Profile</h1>
          <p className="text-gray-600">Update your profile information and preferences</p>
        </motion.div>

        {/* Main Content */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="p-6 bg-white/80 backdrop-blur">
            {/* Profile Photo */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-6">
              <div className="relative group">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={avatarURL || (userType === "family"
                      ? "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=300&h=300&fit=crop"
                      : "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop"
                  )} />
                  <AvatarFallback>{(name || "").slice(0, 2) || "--"}</AvatarFallback>
                </Avatar>
                <Button size="icon" className="absolute bottom-0 right-0 h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" onClick={handleAvatarClick}>
                  <Camera className="w-4 h-4" />
                </Button>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />
              </div>
              <div className="flex-1">
                <h3 className="text-gray-900 mb-1">Profile Photo</h3>
                <p className="text-sm text-gray-600 mb-3">JPG, GIF or PNG. Max size of 10MB</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleAvatarClick}>
                    <Camera className="w-4 h-4 mr-2" />
                    Upload
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setAvatarURL(undefined)}>
                    Remove
                  </Button>
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-gray-900 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                Basic Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{userType === "family" ? "Family Name" : "Full Name"}</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => {
                      const v = e.target.value;
                      setName(v);
                      scheduleSave(userType === "family" ? { familyName: v || null, updatedAt: new Date() } : { name: v || null, updatedAt: new Date() });
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input id="email" type="email" className="pl-10" value={email} readOnly />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="phone"
                      type="tel"
                      className="pl-10"
                      value={phoneVal}
                      onChange={(e) => {
                        const v = e.target.value;
                        setPhoneVal(v);
                        scheduleSave({ phone: v || null, updatedAt: new Date() });
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="location"
                      className="pl-10"
                      value={locationVal}
                      onChange={(e) => {
                        const v = e.target.value;
                        setLocationVal(v);
                        const [city, country] = v.split(",").map((s) => s.trim());
                        scheduleSave(
                          userType === "family"
                            ? { location: { city: city || null, country: country || null }, updatedAt: new Date() }
                            : { currentLocation: { city: city || null, country: country || null }, updatedAt: new Date() }
                        );
                      }}
                    />
                  </div>
                </div>

                {userType === "aupair" && (
                  <div className="space-y-2">
                    <Label htmlFor="birthDate">Date of Birth</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="birthDate"
                        type="date"
                        className="pl-10"
                        value={birthDate}
                        onChange={(e) => {
                          const v = e.target.value;
                          setBirthDate(v);
                          scheduleSave({ birthDate: v || null, updatedAt: new Date() });
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">{userType === "family" ? "About Us" : "About Me"}</Label>
                <Textarea
                  id="bio"
                  rows={4}
                  value={bio}
                  onChange={(e) => {
                    const v = e.target.value;
                    setBio(v);
                    scheduleSave(userType === "family" ? { aboutUs: v || null, updatedAt: new Date() } : { aboutMe: v || null, updatedAt: new Date() });
                  }}
                  placeholder="Tell us about yourself..."
                />
                <p className="text-xs text-gray-500">{bio.length} / 500 characters</p>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Languages */}
            <div className="space-y-4">
              <h3 className="text-gray-900 flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-600" />
                Languages
              </h3>
              <div className="flex flex-wrap gap-2 mb-3">
                {languages.map((lang) => (
                  <Badge key={lang} variant="secondary" className="gap-1 pr-1">
                    {lang}
                    <button onClick={() => removeLanguage(lang)} className="ml-1 hover:bg-gray-300 rounded-full p-0.5">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input placeholder="Add a language..." value={newLanguage} onChange={(e) => setNewLanguage(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addLanguage())} />
                <Button onClick={addLanguage}>Add</Button>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Skills */}
            <div className="space-y-4">
              <h3 className="text-gray-900">Skills & Interests</h3>
              <div className="flex flex-wrap gap-2 mb-3">
                {skills.map((skill) => (
                  <Badge key={skill} className="gap-1 pr-1 bg-gradient-to-r from-orange-500 to-rose-600">
                    {skill}
                    <button onClick={() => removeSkill(skill)} className="ml-1 hover:bg-white/20 rounded-full p-0.5">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input placeholder="Add a skill..." value={newSkill} onChange={(e) => setNewSkill(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())} />
                <Button onClick={addSkill}>Add</Button>
              </div>
            </div>

            {error && <p className="text-sm text-red-600 mt-2">{error}</p>}

            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={onBack}>Cancel</Button>
              <Button onClick={handleSave} disabled={isSaving} className="bg-gradient-to-r from-orange-500 to-rose-600">
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
