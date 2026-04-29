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
import {
  User,
  Bell,
  Lock,
  Globe,
  Camera,
  Save,
  LogOut,
  Trash2,
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
import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { signOutUser } from "@/lib/auth-actions";

interface ProfileSettingsProps {
  userType: UserType; // "+"固定で受け取り（ページ側で解決済み）
  profileId: string;  // FirestoreのプロフィールID
  onClose?: () => void;
  onLogout?: () => void;
}

// 画像アップロードのヘルパ（contentTypeフォールバック込み）
async function uploadImageAndGetURL(file: File, path: string): Promise<string> {
  const objectRef = ref(storage, path);
  const contentType = file.type && file.type.startsWith("image/") ? file.type : "image/jpeg";
  const snap = await uploadBytes(objectRef, file, {
    contentType,
    cacheControl: "public, max-age=3600",
  });
  return await getDownloadURL(snap.ref);
}

export function ProfileSettings({ userType, profileId, onClose, onLogout }: ProfileSettingsProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Firestore: users/{uid}
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

  // Firestore: profile doc（auPairProfiles/{id} | familyProfiles/{id}）
  const [profileData, setProfileData] = useState<AuPairProfile | FamilyProfile | null>(null);

  // ローカル編集用の追加フィールド（UI都合のフラット化）
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

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const colName = useMemo(() => (userType === "aupair" ? "auPairProfiles" : "familyProfiles"), [userType]);

  // 初期購読
  useEffect(() => {
    let unsubProfile: (() => void) | null = null;
    let unsubUser: (() => void) | null = null;

    async function init() {
      try {
        setLoading(true);
        setError(null);

        // 認証済みユーザー
        const uid = auth.currentUser?.uid;
        if (!uid) {
          setError("Not signed in");
          setLoading(false);
          return;
        }

        // users/{uid}
        unsubUser = onSnapshot(doc(db, "users", uid), (snap) => {
          const data = snap.data() || {};
          setUserDoc(data as any);
          // 通知・プライバシー設定をローカルに反映
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
        });

        // profile doc
        unsubProfile = onSnapshot(doc(db, colName, profileId), (snap) => {
          const p = (snap.exists() ? (snap.data() as any) : null) as AuPairProfile | FamilyProfile | null;
          setProfileData(p);
          // UIへの展開
          if (p) {
            setAvatarURL((p as any)?.profileImage);
            // aupair: name/age/nationality/… family: familyName/… → 表示名に吸収
            setName((userType === "family" ? (p as FamilyProfile).familyName : (p as AuPairProfile).name) || "");
            setBio((p as any)?.aboutMe || (p as any)?.aboutUs || "");
            // location: 文字列入力枠は city,country をまとめた簡易表示
            const city = (p as any)?.currentLocation?.city || (p as any)?.location?.city || "";
            const country = (p as any)?.currentLocation?.country || (p as any)?.location?.country || "";
            setLocationVal([city, country].filter(Boolean).join(", "));
            // email は users から（profile側にないことが多い）
            setEmail(auth.currentUser?.email || "");
            // phone は未定義の可能性 → p側にあれば吸収
            setPhoneVal((p as any)?.phone || "");
            // birthDate（aupairのみ）
            setBirthDate((p as any)?.birthDate || "");
            // languages
            const primary = (p as any)?.languages?.primary?.language
              ? [(p as any).languages.primary.language]
              : [];
            const secondary = ((p as any)?.languages?.secondary || []).map((l: any) => l.language);
            setLanguages([...primary, ...secondary]);
            // skills（名前のみ抽出）
            const skillsArr = ((p as any)?.skills || []).map((s: any) => s.name || String(s));
            setSkills(skillsArr);
          }
          setLoading(false);
        });
      } catch (e: any) {
        setError(e?.message || "Failed to load settings");
        setLoading(false);
      }
    }

    init();
    return () => {
      unsubProfile && unsubProfile();
      unsubUser && unsubUser();
    };
  }, [colName, profileId, userType]);

  // 入力add/remove（言語/スキル）
  const [newSkill, setNewSkill] = useState("");
  const [newLanguage, setNewLanguage] = useState("");

  const addSkill = () => {
    const v = newSkill.trim();
    if (v && !skills.includes(v)) setSkills([...skills, v]);
    setNewSkill("");
  };
  const removeSkill = (skill: string) => setSkills(skills.filter((s) => s !== skill));

  const addLanguage = () => {
    const v = newLanguage.trim();
    if (v && !languages.includes(v)) setLanguages([...languages, v]);
    setNewLanguage("");
  };
  const removeLanguage = (lang: string) => setLanguages(languages.filter((l) => l !== lang));

  // 保存
  const handleSave = async () => {
    if (!auth.currentUser) return;
    setIsSaving(true);
    setError(null);
    try {
      // users/{uid} 側
      await updateDoc(doc(db, "users", auth.currentUser.uid), {
        email: email || auth.currentUser.email,
        notificationSettings: { ...notifications },
        privacySettings: { ...privacy },
        updatedAt: new Date(),
      });

      // profile 側（簡易マッピング）
      const profileUpdate: any = { updatedAt: new Date() };

      if (userType === "aupair") {
        profileUpdate.name = name || null;
        profileUpdate.aboutMe = bio || null;
        // location: "City, Country" → 分解
        if (locationVal) {
          const [city, country] = locationVal.split(",").map((s) => s.trim());
          profileUpdate.currentLocation = { city: city || null, country: country || null };
        }
        profileUpdate.birthDate = birthDate || null;
        // languages
        profileUpdate.languages = {
          primary: languages[0] ? { language: languages[0], proficiency: "fluent" } : null,
          secondary: languages.slice(1).map((l) => ({ language: l, proficiency: "intermediate" })),
        };
        // skills
        profileUpdate.skills = skills.map((s) => ({ name: s }));
      } else {
        // family
        profileUpdate.familyName = name || null;
        profileUpdate.aboutUs = bio || null;
        if (locationVal) {
          const [city, country] = locationVal.split(",").map((s) => s.trim());
          profileUpdate.location = { city: city || null, country: country || null };
        }
        // languages/skills は任意。必要なら family 側のスキーマに合わせて追加
      }

      if (avatarURL) profileUpdate.profileImage = avatarURL;

      await updateDoc(doc(db, colName, profileId), profileUpdate);
    } catch (e: any) {
      setError(e?.message || "Failed to save");
    } finally {
      setIsSaving(false);
    }
  };

  // 画像アップロード
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
      if (onLogout) return onLogout();
      await signOutUser();
    } catch (e) {
      // no-op
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-rose-100">
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />
      <div className="max-w-5xl mx-auto p-4 md:p-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl text-gray-900">Profile & Settings</h1>
            {onClose && (
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            )}
          </div>
          <p className="text-gray-600">Manage your profile information and preferences</p>
        </motion.div>

        {loading ? (
          <Card className="p-6">Loading…</Card>
        ) : (
          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
              <TabsTrigger value="profile" className="gap-2">
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Profile</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="gap-2">
                <Bell className="w-4 h-4" />
                <span className="hidden sm:inline">Settings</span>
              </TabsTrigger>
              <TabsTrigger value="account" className="gap-2">
                <Lock className="w-4 h-4" />
                <span className="hidden sm:inline">Account</span>
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <Card className="p-6 bg-white/80 backdrop-blur">
                  {/* Profile Photo */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-6">
                    <div className="relative group">
                      <Avatar className="h-24 w-24">
                        <AvatarImage src={avatarURL || "/placeholder-avatar.svg"} />
                        <AvatarFallback>{name.slice(0, 2).toUpperCase() || "--"}</AvatarFallback>
                      </Avatar>
                      <Button size="icon" className="absolute bottom-0 right-0 h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" onClick={handleAvatarClick}>
                        <Camera className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-gray-900 mb-1">Profile Photo</h3>
                      <p className="text-sm text-gray-600 mb-3">JPG, GIF or PNG. Max size of 10MB</p>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={handleAvatarClick}>
                          <Camera className="w-4 h-4 mr-2" />
                          Upload
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setAvatarURL(undefined)}>Remove</Button>
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
                        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input id="email" type="email" className="pl-10" value={email} onChange={(e) => setEmail(e.target.value)} />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input id="phone" type="tel" className="pl-10" value={phoneVal} onChange={(e) => setPhoneVal(e.target.value)} />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input id="location" className="pl-10" value={locationVal} onChange={(e) => setLocationVal(e.target.value)} />
                        </div>
                      </div>

                      {userType === "aupair" && (
                        <div className="space-y-2">
                          <Label htmlFor="birthDate">Date of Birth</Label>
                          <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input id="birthDate" type="date" className="pl-10" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio">About {userType === "family" ? "Us" : "Me"}</Label>
                      <Textarea id="bio" rows={4} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell us about yourself..." />
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
                      {languages.map((lang, index) => (
                        <Badge key={`${lang}-${index}`} variant="secondary" className="gap-1 pr-1">
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
                      {skills.map((skill, index) => (
                        <Badge key={`${skill}-${index}`} className="gap-1 pr-1 bg-gradient-to-r from-orange-500 to-rose-600">
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
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSave} disabled={isSaving} className="bg-gradient-to-r from-orange-500 to-rose-600">
                      <Save className="w-4 h-4 mr-2" />
                      {isSaving ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </Card>
              </motion.div>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-4">
                {/* Notifications */}
                <Card className="p-6 bg-white/80 backdrop-blur">
                  <h3 className="text-gray-900 mb-4 flex items-center gap-2">
                    <Bell className="w-5 h-5 text-blue-600" />
                    Notification Preferences
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">New Messages</p>
                        <p className="text-sm text-gray-600">Get notified when you receive new messages</p>
                      </div>
                      <Switch checked={notifications.newMessages} onCheckedChange={(checked) => setNotifications({ ...notifications, newMessages: checked })} />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">New Matches</p>
                        <p className="text-sm text-gray-600">Get notified about potential matches</p>
                      </div>
                      <Switch checked={notifications.matches} onCheckedChange={(checked) => setNotifications({ ...notifications, matches: checked })} />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Profile Views</p>
                        <p className="text-sm text-gray-600">Get notified when someone views your profile</p>
                      </div>
                      <Switch checked={notifications.profileViews} onCheckedChange={(checked) => setNotifications({ ...notifications, profileViews: checked })} />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Newsletters</p>
                        <p className="text-sm text-gray-600">Receive tips and updates via email</p>
                      </div>
                      <Switch checked={notifications.newsletters} onCheckedChange={(checked) => setNotifications({ ...notifications, newsletters: checked })} />
                    </div>
                  </div>
                </Card>

                {/* Privacy */}
                <Card className="p-6 bg-white/80 backdrop-blur">
                  <h3 className="text-gray-900 mb-4 flex items-center gap-2">
                    <Lock className="w-5 h-5 text-blue-600" />
                    Privacy Settings
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Profile Visibility</p>
                        <p className="text-sm text-gray-600">Make your profile visible in search results</p>
                      </div>
                      <Switch checked={privacy.profileVisible} onCheckedChange={(checked) => setPrivacy({ ...privacy, profileVisible: checked })} />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Last Seen</p>
                        <p className="text-sm text-gray-600">Show when you were last active</p>
                      </div>
                      <Switch checked={privacy.showLastSeen} onCheckedChange={(checked) => setPrivacy({ ...privacy, showLastSeen: checked })} />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Read Receipts</p>
                        <p className="text-sm text-gray-600">Let others know when you've read their messages</p>
                      </div>
                      <Switch checked={privacy.showReadReceipts} onCheckedChange={(checked) => setPrivacy({ ...privacy, showReadReceipts: checked })} />
                    </div>
                  </div>
                </Card>

                <div className="flex justify-end">
                  <Button onClick={handleSave} disabled={isSaving} className="bg-gradient-to-r from-orange-500 to-rose-600">
                    <Save className="w-4 h-4 mr-2" />
                    {isSaving ? "Saving..." : "Save Settings"}
                  </Button>
                </div>
              </motion.div>
            </TabsContent>

            {/* Account Tab */}
            <TabsContent value="account" className="space-y-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-4">
                {/* Password（実装は後で） */}
                <Card className="p-6 bg-white/80 backdrop-blur">
                  <h3 className="text-gray-900 mb-4 flex items-center gap-2">
                    <Lock className="w-5 h-5 text-blue-600" />
                    Change Password
                  </h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="current-password">Current Password</Label>
                      <Input id="current-password" type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-password">New Password</Label>
                      <Input id="new-password" type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm New Password</Label>
                      <Input id="confirm-password" type="password" />
                    </div>
                    <Button className="bg-gradient-to-r from-orange-500 to-rose-600">Update Password</Button>
                  </div>
                </Card>

                {/* Danger Zone */}
                <Card className="p-6 bg-white/80 backdrop-blur border-red-200">
                  <h3 className="text-red-600 mb-4">Danger Zone</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
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

                    <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
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
                            <AlertDialogAction className="bg-red-600 hover:bg-red-700">
                              Delete Account
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
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
