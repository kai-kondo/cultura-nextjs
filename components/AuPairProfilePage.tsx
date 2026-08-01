"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Switch } from "./ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { TagListEditor, DayPicker, FieldRow } from "./ProfileFieldEditors";
import {
  BadgeCheck,
  BookOpen,
  Briefcase,
  Calendar,
  Camera,
  Globe,
  Home,
  Image as ImageIcon,
  Languages,
  MapPin,
  Pencil,
  Sparkles,
  Star,
  Wallet,
  X,
} from "lucide-react";
import { doc, onSnapshot } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, db, storage } from "@/lib/firebase";
import { patchAuPairProfile } from "@/lib/profile-actions";
import type { AuPairProfile } from "@/lib/types";
import { toast } from "sonner";

interface AuPairProfilePageProps {
  profileId: string;
  onBack: () => void;
}

type Draft = {
  name: string;
  age: string;
  nationality: string;
  city: string;
  country: string;
  aboutMe: string;
  skills: { name: string; emoji: string; level: "beginner" | "intermediate" | "advanced" }[];
  canTeach: string[];
  certifications: string[];
  personalityTraits: string[];
  experienceYears: string;
  childcareExperience: boolean;
  experienceDetails: string;
  primaryLanguage: string;
  primaryProficiency: "basic" | "intermediate" | "fluent" | "native";
  secondaryLanguages: { language: string; proficiency: "basic" | "intermediate" | "fluent" | "native" }[];
  availabilityStatus: string;
  availableFrom: string;
  duration: string;
  workingHoursType: "fulltime" | "parttime" | "hourly" | "flexible";
  preferredDays: string[];
  desiredCountries: { country: string; cities: string[] }[];
  hourlyRate: string;
  maxTravelDistance: string;
};

function formatWorkingStyle(value?: string) {
  const labels: Record<string, string> = {
    hourly: "Hourly",
    parttime: "Part-time",
    flexible: "Flexible",
    fulltime: "Full-time",
  };
  return value ? labels[value] || value : "Full-time";
}

function toDraft(p: any): Draft {
  return {
    name: p?.name || "",
    age: p?.age != null ? String(p.age) : "",
    nationality: p?.nationality || "",
    city: p?.currentLocation?.city || "",
    country: p?.currentLocation?.country || "",
    aboutMe: p?.aboutMe || "",
    skills: Array.isArray(p?.skills)
      ? p.skills.map((s: any) => ({ name: s?.name || "", emoji: s?.emoji || "", level: s?.level || "intermediate" }))
      : [],
    canTeach: Array.isArray(p?.canTeach) ? p.canTeach : [],
    certifications: Array.isArray(p?.certifications) ? p.certifications : [],
    personalityTraits: Array.isArray(p?.personalityTraits) ? p.personalityTraits : [],
    experienceYears: p?.experienceYears != null ? String(p.experienceYears) : "",
    childcareExperience: Boolean(p?.childcareExperience),
    experienceDetails:
      p?.experienceDetails || p?.experience?.find((e: any) => e.type === "childcare")?.description || "",
    primaryLanguage: p?.languages?.primary?.language || "",
    primaryProficiency: p?.languages?.primary?.proficiency || "intermediate",
    secondaryLanguages: Array.isArray(p?.languages?.secondary)
      ? p.languages.secondary.map((l: any) => ({ language: l?.language || "", proficiency: l?.proficiency || "intermediate" }))
      : [],
    availabilityStatus: p?.availability?.status || "",
    availableFrom: p?.availability?.availableFrom || "",
    duration: p?.availability?.duration || "",
    workingHoursType: p?.availability?.workingHoursType || "fulltime",
    preferredDays: Array.isArray(p?.availability?.preferredDays) ? p.availability.preferredDays : [],
    desiredCountries: Array.isArray(p?.desiredCountries)
      ? p.desiredCountries.map((c: any) => ({ country: c?.country || "", cities: Array.isArray(c?.cities) ? c.cities : [] }))
      : [],
    hourlyRate: p?.hourlyRate != null ? String(p.hourlyRate) : "",
    maxTravelDistance: p?.maxTravelDistance != null ? String(p.maxTravelDistance) : "",
  };
}

async function uploadImage(file: File, path: string): Promise<string> {
  const objectRef = ref(storage, path);
  const contentType = file.type && file.type.startsWith("image/") ? file.type : "image/jpeg";
  const snap = await uploadBytes(objectRef, file, { contentType, cacheControl: "public, max-age=3600" });
  return getDownloadURL(snap.ref);
}

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="rounded-2xl border border-orange-100 bg-white/90 p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-100 text-orange-600">
          {icon}
        </div>
        <h2 className="text-base font-semibold text-gray-900">{title}</h2>
      </div>
      {children}
    </Card>
  );
}

export function AuPairProfilePage({ profileId, onBack }: AuPairProfilePageProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [draft, setDraft] = useState<Draft | null>(null);

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [galleryUrls, setGalleryUrls] = useState<string[]>([]);
  const [newGalleryFiles, setNewGalleryFiles] = useState<File[]>([]);
  const [newGalleryPreviews, setNewGalleryPreviews] = useState<string[]>([]);

  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, "auPairProfiles", profileId),
      (snap) => {
        if (!snap.exists()) {
          setError("Profile not found");
          setLoading(false);
          return;
        }
        const data = snap.data() as AuPairProfile & { userId: string };
        const currentUid = auth.currentUser?.uid;
        if (!currentUid || data.userId !== currentUid) {
          setError("You don't have permission to view this profile.");
          setLoading(false);
          return;
        }
        setProfile(data);
        setLoading(false);
      },
      (e) => {
        setError(e.message);
        setLoading(false);
      }
    );
    return () => unsub();
  }, [profileId]);

  const startEditing = () => {
    setDraft(toDraft(profile));
    setGalleryUrls(Array.isArray(profile?.galleryImages) ? profile.galleryImages : []);
    setAvatarPreview(profile?.profileImage || "");
    setAvatarFile(null);
    setNewGalleryFiles([]);
    setNewGalleryPreviews([]);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setDraft(null);
  };

  const onAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const onGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setNewGalleryFiles((prev) => [...prev, ...files]);
    setNewGalleryPreviews((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
  };

  const removeExistingGalleryUrl = (url: string) => {
    setGalleryUrls((prev) => prev.filter((u) => u !== url));
  };
  const removeNewGalleryFile = (index: number) => {
    setNewGalleryFiles((prev) => prev.filter((_, i) => i !== index));
    setNewGalleryPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!draft) return;
    setIsSaving(true);
    try {
      let profileImage = profile?.profileImage || "";
      if (avatarFile) {
        profileImage = await uploadImage(avatarFile, `auPairProfiles/${profileId}/avatar.jpg`);
      }

      let finalGallery = [...galleryUrls];
      if (newGalleryFiles.length) {
        const uploaded = await Promise.all(
          newGalleryFiles.map((file, i) =>
            uploadImage(file, `auPairProfiles/${profileId}/gallery/${Date.now()}_${i}.jpg`)
          )
        );
        finalGallery = [...finalGallery, ...uploaded];
      }

      const isBabysitter = profile?.workType === "babysitter" || profile?.careType === "babysitter";

      const patch: Record<string, any> = {
        name: draft.name,
        age: draft.age ? Number(draft.age) : null,
        nationality: draft.nationality,
        currentLocation: { city: draft.city, country: draft.country },
        aboutMe: draft.aboutMe,
        skills: draft.skills.filter((s) => s.name.trim()),
        canTeach: draft.canTeach,
        certifications: draft.certifications,
        personalityTraits: draft.personalityTraits,
        experienceYears: draft.experienceYears ? Number(draft.experienceYears) : null,
        childcareExperience: draft.childcareExperience,
        experienceDetails: draft.experienceDetails,
        experience: draft.experienceDetails ? [{ type: "childcare", description: draft.experienceDetails }] : [],
        languages: {
          primary: draft.primaryLanguage ? { language: draft.primaryLanguage, proficiency: draft.primaryProficiency } : null,
          secondary: draft.secondaryLanguages.filter((l) => l.language.trim()),
        },
        availability: {
          status: draft.availabilityStatus || null,
          availableFrom: draft.availableFrom || null,
          duration: draft.duration || null,
          workingHoursType: draft.workingHoursType,
          preferredDays: draft.preferredDays,
        },
        desiredCountries: draft.desiredCountries.filter((c) => c.country.trim()),
        profileImage,
        galleryImages: finalGallery,
      };

      if (isBabysitter) {
        patch.hourlyRate = draft.hourlyRate ? Number(draft.hourlyRate) : null;
        patch.maxTravelDistance = draft.maxTravelDistance ? Number(draft.maxTravelDistance) : null;
      }

      await patchAuPairProfile(profileId, patch);
      toast.success("Profile updated");
      setIsEditing(false);
      setDraft(null);
    } catch (e: any) {
      toast.error(e?.message || "Failed to save profile");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-rose-100 p-6">
        <div className="mx-auto max-w-3xl rounded-2xl border border-orange-100 bg-white/80 p-6 text-sm text-gray-600 shadow-sm backdrop-blur">
          Loading your profile...
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-rose-100 p-6">
        <div className="mx-auto max-w-3xl rounded-2xl border border-red-200 bg-white/80 p-6 text-sm text-red-600 shadow-sm backdrop-blur">
          {error || "Profile not found"}
        </div>
      </div>
    );
  }

  const isBabysitter = profile?.workType === "babysitter" || profile?.careType === "babysitter";
  const name = profile?.name || "Unnamed Au Pair";
  const initials = name.slice(0, 2).toUpperCase();
  const photo = isEditing ? avatarPreview || "/placeholder-avatar.svg" : profile?.profileImage || "/placeholder-avatar.svg";

  const currentLocation = profile?.currentLocation || {};
  const locationLabel = [currentLocation?.city, currentLocation?.country].filter(Boolean).join(", ");
  const availability = profile?.availability || {};
  const galleryPhotos = Array.isArray(profile?.galleryImages) ? profile.galleryImages : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-rose-50 pb-24">
      <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={onAvatarChange} />
      <input ref={galleryInputRef} type="file" accept="image/*" multiple className="hidden" onChange={onGalleryChange} />

      <div className="mx-auto max-w-5xl px-4 py-6">
        <div className="mb-4 flex items-center justify-between">
          <Button type="button" variant="ghost" onClick={onBack}>
            Back
          </Button>
          {isEditing ? (
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={cancelEditing} disabled={isSaving}>
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="bg-gradient-to-r from-orange-500 to-rose-600 text-white hover:from-orange-600 hover:to-rose-700"
              >
                {isSaving ? "Saving..." : "Save"}
              </Button>
            </div>
          ) : (
            <Button type="button" onClick={startEditing} className="bg-gradient-to-r from-orange-500 to-rose-600 text-white hover:from-orange-600 hover:to-rose-700">
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Button>
          )}
        </div>

        <Card className="overflow-hidden rounded-3xl border border-orange-100 bg-white shadow-sm">
          <div className="relative h-56 bg-gradient-to-r from-orange-400 via-amber-400 to-rose-500 sm:h-72">
            <img src={photo} alt={`${name}'s profile photo`} className="h-full w-full object-cover opacity-80 mix-blend-overlay" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />

            <div className="absolute bottom-5 left-5 right-5 flex items-end gap-4">
              <div className="relative">
                <Avatar className="h-24 w-24 border-4 border-white bg-white shadow-lg">
                  <AvatarImage src={photo} alt={`${name} avatar`} />
                  <AvatarFallback>{initials || "--"}</AvatarFallback>
                </Avatar>
                {isEditing ? (
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full bg-orange-500 text-white shadow-md hover:bg-orange-600"
                  >
                    <Camera className="h-4 w-4" />
                  </button>
                ) : null}
              </div>

              <div className="min-w-0 flex-1 text-white">
                <Badge className="mb-2 bg-white/90 text-orange-700 shadow-sm">
                  <Home className="mr-1 h-3 w-3" />
                  {isBabysitter ? "Babysitter Profile" : "Au Pair Profile"}
                </Badge>
                {isEditing ? (
                  <Input
                    value={draft?.name || ""}
                    onChange={(e) => setDraft((d) => (d ? { ...d, name: e.target.value } : d))}
                    placeholder="Your name"
                    className="max-w-xs border-white/40 bg-white/20 text-white placeholder:text-white/70"
                  />
                ) : (
                  <h1 className="truncate text-2xl font-semibold sm:text-3xl">
                    {name}
                    {profile?.age ? `, ${profile.age}` : ""}
                  </h1>
                )}
                {!isEditing && (locationLabel || profile?.nationality) ? (
                  <p className="mt-1 flex items-center gap-1 text-sm text-white/90">
                    <MapPin className="h-4 w-4" />
                    {[locationLabel, profile?.nationality].filter(Boolean).join(" · ")}
                  </p>
                ) : null}
              </div>
            </div>
          </div>

          {isEditing ? (
            <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
              <FieldRow label="Age">
                <Input type="number" value={draft?.age || ""} onChange={(e) => setDraft((d) => (d ? { ...d, age: e.target.value } : d))} />
              </FieldRow>
              <FieldRow label="Nationality">
                <Input value={draft?.nationality || ""} onChange={(e) => setDraft((d) => (d ? { ...d, nationality: e.target.value } : d))} />
              </FieldRow>
              <FieldRow label="City">
                <Input value={draft?.city || ""} onChange={(e) => setDraft((d) => (d ? { ...d, city: e.target.value } : d))} />
              </FieldRow>
              <FieldRow label="Country">
                <Input value={draft?.country || ""} onChange={(e) => setDraft((d) => (d ? { ...d, country: e.target.value } : d))} />
              </FieldRow>
            </div>
          ) : (
            <div className="grid gap-3 p-5 sm:grid-cols-3">
              <div className="rounded-2xl bg-orange-50 p-4">
                <div className="mb-1 flex items-center gap-2 text-xs font-medium text-orange-600">
                  <Calendar className="h-4 w-4" />
                  Available From
                </div>
                <p className="text-lg font-semibold text-gray-900">{availability?.availableFrom || "Not set yet"}</p>
              </div>
              <div className="rounded-2xl bg-orange-50 p-4">
                <div className="mb-1 flex items-center gap-2 text-xs font-medium text-orange-600">
                  <Briefcase className="h-4 w-4" />
                  Preferred Duration
                </div>
                <p className="text-lg font-semibold text-gray-900">{availability?.duration || "Flexible"}</p>
              </div>
              <div className="rounded-2xl bg-orange-50 p-4">
                <div className="mb-1 flex items-center gap-2 text-xs font-medium text-orange-600">
                  <Globe className="h-4 w-4" />
                  Work Style
                </div>
                <p className="text-lg font-semibold text-gray-900">{formatWorkingStyle(availability?.workingHoursType)}</p>
              </div>
            </div>
          )}
        </Card>

        <div className="mt-5 grid gap-5 lg:grid-cols-[1.4fr_0.9fr]">
          <div className="space-y-5">
            <Section icon={<Sparkles className="h-4 w-4" />} title="About Me">
              {isEditing ? (
                <Textarea rows={4} value={draft?.aboutMe || ""} onChange={(e) => setDraft((d) => (d ? { ...d, aboutMe: e.target.value } : d))} placeholder="Tell families about yourself..." />
              ) : profile?.aboutMe ? (
                <p className="whitespace-pre-line leading-relaxed text-gray-700">{profile.aboutMe}</p>
              ) : (
                <p className="text-sm text-gray-500">Add a short introduction so families get to know you.</p>
              )}
            </Section>

            <Section icon={<Calendar className="h-4 w-4" />} title="Availability">
              {isEditing ? (
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FieldRow label="Status">
                      <Input value={draft?.availabilityStatus || ""} onChange={(e) => setDraft((d) => (d ? { ...d, availabilityStatus: e.target.value } : d))} placeholder="e.g. Immediate" />
                    </FieldRow>
                    <FieldRow label="Available from">
                      <Input type="date" value={draft?.availableFrom || ""} onChange={(e) => setDraft((d) => (d ? { ...d, availableFrom: e.target.value } : d))} />
                    </FieldRow>
                    <FieldRow label="Preferred duration">
                      <Input value={draft?.duration || ""} onChange={(e) => setDraft((d) => (d ? { ...d, duration: e.target.value } : d))} placeholder="e.g. 12 months" />
                    </FieldRow>
                    <FieldRow label="Working style">
                      <Select value={draft?.workingHoursType} onValueChange={(v) => setDraft((d) => (d ? { ...d, workingHoursType: v as Draft["workingHoursType"] } : d))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fulltime">Full-time</SelectItem>
                          <SelectItem value="parttime">Part-time</SelectItem>
                          <SelectItem value="hourly">Hourly</SelectItem>
                          <SelectItem value="flexible">Flexible</SelectItem>
                        </SelectContent>
                      </Select>
                    </FieldRow>
                  </div>
                  {isBabysitter ? (
                    <div className="grid gap-4 sm:grid-cols-2">
                      <FieldRow label="Hourly rate">
                        <Input type="number" value={draft?.hourlyRate || ""} onChange={(e) => setDraft((d) => (d ? { ...d, hourlyRate: e.target.value } : d))} />
                      </FieldRow>
                      <FieldRow label="Max travel distance (km)">
                        <Input type="number" value={draft?.maxTravelDistance || ""} onChange={(e) => setDraft((d) => (d ? { ...d, maxTravelDistance: e.target.value } : d))} />
                      </FieldRow>
                    </div>
                  ) : null}
                  <FieldRow label="Preferred days">
                    <DayPicker selected={draft?.preferredDays || []} onChange={(next) => setDraft((d) => (d ? { ...d, preferredDays: next } : d))} />
                  </FieldRow>
                </div>
              ) : (
                <div className="space-y-3 text-sm text-gray-700">
                  {availability?.status ? (
                    <div className="rounded-xl bg-orange-50 px-3 py-2">
                      <span className="font-medium text-gray-900">Status:</span> {availability.status}
                    </div>
                  ) : null}
                  <div className="rounded-xl bg-orange-50 px-3 py-2">
                    <span className="font-medium text-gray-900">Available from:</span> {availability?.availableFrom || "Not set yet"}
                  </div>
                  <div className="rounded-xl bg-orange-50 px-3 py-2">
                    <span className="font-medium text-gray-900">Preferred duration:</span> {availability?.duration || "Flexible"}
                  </div>
                  <div className="rounded-xl bg-orange-50 px-3 py-2">
                    <span className="font-medium text-gray-900">Working style:</span> {formatWorkingStyle(availability?.workingHoursType)}
                  </div>
                  {isBabysitter ? (
                    <div className="rounded-xl bg-orange-50 px-3 py-2">
                      <span className="font-medium text-gray-900">Hourly rate:</span> {profile?.hourlyRate != null ? profile.hourlyRate : "Not set"}
                      {" · "}
                      <span className="font-medium text-gray-900">Max travel:</span> {profile?.maxTravelDistance != null ? `${profile.maxTravelDistance} km` : "Flexible"}
                    </div>
                  ) : null}
                  {Array.isArray(availability?.preferredDays) && availability.preferredDays.length > 0 ? (
                    <div className="rounded-xl bg-orange-50 px-3 py-2">
                      <span className="font-medium text-gray-900">Preferred days:</span> {availability.preferredDays.join(", ")}
                    </div>
                  ) : null}
                </div>
              )}
            </Section>

            <Section icon={<Star className="h-4 w-4" />} title="Experience">
              {isEditing ? (
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FieldRow label="Years of experience">
                      <Input type="number" value={draft?.experienceYears || ""} onChange={(e) => setDraft((d) => (d ? { ...d, experienceYears: e.target.value } : d))} />
                    </FieldRow>
                    <FieldRow label="Childcare experience">
                      <div className="flex h-10 items-center gap-2">
                        <Switch checked={draft?.childcareExperience || false} onCheckedChange={(checked) => setDraft((d) => (d ? { ...d, childcareExperience: checked } : d))} />
                        <span className="text-sm text-gray-600">{draft?.childcareExperience ? "Yes" : "No"}</span>
                      </div>
                    </FieldRow>
                  </div>
                  <FieldRow label="Experience details">
                    <Textarea rows={3} value={draft?.experienceDetails || ""} onChange={(e) => setDraft((d) => (d ? { ...d, experienceDetails: e.target.value } : d))} />
                  </FieldRow>
                </div>
              ) : profile?.experienceDetails || (profile?.experience || []).length > 0 ? (
                <div className="space-y-3 text-sm text-gray-700">
                  {(profile?.experience || []).map((item: any, index: number) => (
                    <div key={`${item?.type || "experience"}-${index}`} className="rounded-xl border border-orange-100 bg-white px-3 py-2">
                      {item?.type ? <p className="mb-1 text-xs font-medium uppercase tracking-wide text-orange-600">{item.type}</p> : null}
                      <p>{item?.description || item}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No experience added yet.</p>
              )}
            </Section>

            <Section icon={<ImageIcon className="h-4 w-4" />} title="Photos">
              {isEditing ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {galleryUrls.map((src, index) => (
                      <div key={`${src}-${index}`} className="group relative aspect-square overflow-hidden rounded-2xl bg-gray-100">
                        <img src={src} alt={`gallery ${index + 1}`} className="h-full w-full object-cover" />
                        <button type="button" onClick={() => removeExistingGalleryUrl(src)} className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                    {newGalleryPreviews.map((src, index) => (
                      <div key={`new-${src}-${index}`} className="group relative aspect-square overflow-hidden rounded-2xl bg-gray-100">
                        <img src={src} alt={`new gallery ${index + 1}`} className="h-full w-full object-cover" />
                        <button type="button" onClick={() => removeNewGalleryFile(index)} className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <Button type="button" variant="outline" onClick={() => galleryInputRef.current?.click()}>
                    <Camera className="mr-2 h-4 w-4" />
                    Add photos
                  </Button>
                </div>
              ) : galleryPhotos.length > 0 ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {galleryPhotos.slice(0, 6).map((src: string, index: number) => (
                    <div key={`${src}-${index}`} className="aspect-square overflow-hidden rounded-2xl bg-gray-100">
                      <img src={src} alt={`${name} gallery ${index + 1}`} className="h-full w-full object-cover" />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No photos added yet.</p>
              )}
            </Section>
          </div>

          <div className="space-y-5">
            <Section icon={<Languages className="h-4 w-4" />} title="Languages">
              {isEditing ? (
                <div className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <FieldRow label="Primary language">
                      <Input value={draft?.primaryLanguage || ""} onChange={(e) => setDraft((d) => (d ? { ...d, primaryLanguage: e.target.value } : d))} />
                    </FieldRow>
                    <FieldRow label="Proficiency">
                      <Select value={draft?.primaryProficiency} onValueChange={(v) => setDraft((d) => (d ? { ...d, primaryProficiency: v as Draft["primaryProficiency"] } : d))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="basic">Basic</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="fluent">Fluent</SelectItem>
                          <SelectItem value="native">Native</SelectItem>
                        </SelectContent>
                      </Select>
                    </FieldRow>
                  </div>

                  <FieldRow label="Secondary languages">
                    <div className="space-y-2">
                      {(draft?.secondaryLanguages || []).map((lang, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Input
                            value={lang.language}
                            onChange={(e) =>
                              setDraft((d) => {
                                if (!d) return d;
                                const next = [...d.secondaryLanguages];
                                next[index] = { ...next[index], language: e.target.value };
                                return { ...d, secondaryLanguages: next };
                              })
                            }
                            placeholder="Language"
                          />
                          <Select
                            value={lang.proficiency}
                            onValueChange={(v) =>
                              setDraft((d) => {
                                if (!d) return d;
                                const next = [...d.secondaryLanguages];
                                next[index] = { ...next[index], proficiency: v as any };
                                return { ...d, secondaryLanguages: next };
                              })
                            }
                          >
                            <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="basic">Basic</SelectItem>
                              <SelectItem value="intermediate">Intermediate</SelectItem>
                              <SelectItem value="fluent">Fluent</SelectItem>
                              <SelectItem value="native">Native</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              setDraft((d) => (d ? { ...d, secondaryLanguages: d.secondaryLanguages.filter((_, i) => i !== index) } : d))
                            }
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setDraft((d) => (d ? { ...d, secondaryLanguages: [...d.secondaryLanguages, { language: "", proficiency: "intermediate" }] } : d))
                        }
                      >
                        Add language
                      </Button>
                    </div>
                  </FieldRow>
                </div>
              ) : (
                <div className="space-y-2 text-sm">
                  {profile?.languages?.primary ? (
                    <div className="flex items-center justify-between rounded-xl bg-orange-50 px-3 py-2">
                      <span className="text-gray-800">{profile.languages.primary.language}</span>
                      <span className="text-xs text-orange-600">{profile.languages.primary.proficiency || "Primary"}</span>
                    </div>
                  ) : null}
                  {(profile?.languages?.secondary || []).map((language: any, index: number) => (
                    <div key={`${language?.language}-${index}`} className="flex items-center justify-between rounded-xl bg-orange-50 px-3 py-2">
                      <span className="text-gray-800">{language?.language}</span>
                      <span className="text-xs text-orange-600">{language?.proficiency || "Secondary"}</span>
                    </div>
                  ))}
                  {!profile?.languages?.primary && (!profile?.languages?.secondary || profile.languages.secondary.length === 0) ? (
                    <p className="text-sm text-gray-500">No language information yet.</p>
                  ) : null}
                </div>
              )}
            </Section>

            <Section icon={<BookOpen className="h-4 w-4" />} title="Skills & Teaching">
              {isEditing ? (
                <div className="space-y-4">
                  <FieldRow label="Skills">
                    <div className="space-y-2">
                      {(draft?.skills || []).map((skill, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Input
                            value={skill.emoji}
                            onChange={(e) =>
                              setDraft((d) => {
                                if (!d) return d;
                                const next = [...d.skills];
                                next[index] = { ...next[index], emoji: e.target.value };
                                return { ...d, skills: next };
                              })
                            }
                            placeholder="🎨"
                            className="w-16"
                          />
                          <Input
                            value={skill.name}
                            onChange={(e) =>
                              setDraft((d) => {
                                if (!d) return d;
                                const next = [...d.skills];
                                next[index] = { ...next[index], name: e.target.value };
                                return { ...d, skills: next };
                              })
                            }
                            placeholder="Skill name"
                          />
                          <Select
                            value={skill.level}
                            onValueChange={(v) =>
                              setDraft((d) => {
                                if (!d) return d;
                                const next = [...d.skills];
                                next[index] = { ...next[index], level: v as any };
                                return { ...d, skills: next };
                              })
                            }
                          >
                            <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="beginner">Beginner</SelectItem>
                              <SelectItem value="intermediate">Intermediate</SelectItem>
                              <SelectItem value="advanced">Advanced</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button type="button" variant="ghost" size="icon" onClick={() => setDraft((d) => (d ? { ...d, skills: d.skills.filter((_, i) => i !== index) } : d))}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button type="button" variant="outline" size="sm" onClick={() => setDraft((d) => (d ? { ...d, skills: [...d.skills, { name: "", emoji: "", level: "intermediate" }] } : d))}>
                        Add skill
                      </Button>
                    </div>
                  </FieldRow>
                  <FieldRow label="Can teach">
                    <TagListEditor values={draft?.canTeach || []} onChange={(next) => setDraft((d) => (d ? { ...d, canTeach: next } : d))} placeholder="e.g. Piano" badgeClassName="rounded-full bg-amber-100 px-3 py-1 text-amber-800 hover:bg-amber-100" />
                  </FieldRow>
                </div>
              ) : (
                <div className="space-y-4">
                  {(profile?.skills || []).length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {profile.skills.map((skill: any, index: number) => (
                        <Badge key={`${skill?.name}-${index}`} className="rounded-full bg-orange-100 px-3 py-1 text-orange-800 hover:bg-orange-100">
                          {skill?.emoji ? `${skill.emoji} ` : "✨ "}
                          {skill?.name}
                          {skill?.level ? ` · ${skill.level}` : ""}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No skills added yet.</p>
                  )}
                  {(profile?.canTeach || []).length > 0 ? (
                    <div>
                      <p className="mb-2 text-sm font-medium text-gray-900">Can Teach</p>
                      <div className="flex flex-wrap gap-2">
                        {profile.canTeach.map((skill: string, index: number) => (
                          <Badge key={`${skill}-${index}`} className="rounded-full bg-amber-100 px-3 py-1 text-amber-800 hover:bg-amber-100">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              )}
            </Section>

            <Section icon={<BadgeCheck className="h-4 w-4" />} title="Trust & Personality">
              {isEditing ? (
                <div className="space-y-4">
                  <FieldRow label="Certifications">
                    <TagListEditor values={draft?.certifications || []} onChange={(next) => setDraft((d) => (d ? { ...d, certifications: next } : d))} placeholder="e.g. First Aid & CPR" badgeClassName="rounded-full bg-emerald-100 px-3 py-1 text-emerald-800 hover:bg-emerald-100" />
                  </FieldRow>
                  <FieldRow label="Personality traits">
                    <TagListEditor values={draft?.personalityTraits || []} onChange={(next) => setDraft((d) => (d ? { ...d, personalityTraits: next } : d))} placeholder="e.g. Patient" badgeClassName="rounded-full bg-rose-100 px-3 py-1 text-rose-800 hover:bg-rose-100" />
                  </FieldRow>
                </div>
              ) : (
                <div className="space-y-4">
                  {(profile?.certifications || []).length > 0 ? (
                    <div>
                      <p className="mb-2 text-sm font-medium text-gray-900">Certifications</p>
                      <div className="flex flex-wrap gap-2">
                        {profile.certifications.map((c: string, index: number) => (
                          <Badge key={`${c}-${index}`} className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-800 hover:bg-emerald-100">
                            {c}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ) : null}
                  {(profile?.personalityTraits || []).length > 0 ? (
                    <div>
                      <p className="mb-2 text-sm font-medium text-gray-900">Personality Traits</p>
                      <div className="flex flex-wrap gap-2">
                        {profile.personalityTraits.map((t: string, index: number) => (
                          <Badge key={`${t}-${index}`} className="rounded-full bg-rose-100 px-3 py-1 text-rose-800 hover:bg-rose-100">
                            {t}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ) : null}
                  {(profile?.certifications || []).length === 0 && (profile?.personalityTraits || []).length === 0 ? (
                    <p className="text-sm text-gray-500">Nothing added yet.</p>
                  ) : null}
                </div>
              )}
            </Section>

            {!isBabysitter ? (
              <Section icon={<MapPin className="h-4 w-4" />} title="Preferred Locations">
                {isEditing ? (
                  <div className="space-y-2">
                    {(draft?.desiredCountries || []).map((c, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          value={c.country}
                          onChange={(e) =>
                            setDraft((d) => {
                              if (!d) return d;
                              const next = [...d.desiredCountries];
                              next[index] = { ...next[index], country: e.target.value };
                              return { ...d, desiredCountries: next };
                            })
                          }
                          placeholder="Country"
                        />
                        <Input
                          value={c.cities.join(", ")}
                          onChange={(e) =>
                            setDraft((d) => {
                              if (!d) return d;
                              const next = [...d.desiredCountries];
                              next[index] = { ...next[index], cities: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) };
                              return { ...d, desiredCountries: next };
                            })
                          }
                          placeholder="Cities (comma separated)"
                        />
                        <Button type="button" variant="ghost" size="icon" onClick={() => setDraft((d) => (d ? { ...d, desiredCountries: d.desiredCountries.filter((_, i) => i !== index) } : d))}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button type="button" variant="outline" size="sm" onClick={() => setDraft((d) => (d ? { ...d, desiredCountries: [...d.desiredCountries, { country: "", cities: [] }] } : d))}>
                      Add country
                    </Button>
                  </div>
                ) : (profile?.desiredCountries || []).length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {profile.desiredCountries.map((location: any, index: number) => {
                      const citiesLabel = Array.isArray(location?.cities) && location.cities.length > 0 ? location.cities.join(", ") : "";
                      return (
                        <Badge key={`${location?.country}-${index}`} className="rounded-full bg-orange-100 px-3 py-1 text-orange-800 hover:bg-orange-100">
                          {[location?.country, citiesLabel].filter(Boolean).join(" · ")}
                        </Badge>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No preferred locations added yet.</p>
                )}
              </Section>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
