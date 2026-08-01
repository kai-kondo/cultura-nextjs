"use client";

import { useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
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
  Briefcase,
  Calendar,
  Camera,
  Gift,
  Home,
  Languages,
  MapPin,
  PawPrint,
  Pencil,
  Sparkles,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { doc, onSnapshot } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, db, storage } from "@/lib/firebase";
import { patchFamilyProfile } from "@/lib/profile-actions";
import type { FamilyProfile } from "@/lib/types";
import { toast } from "sonner";

interface FamilyProfilePageProps {
  profileId: string;
  onBack: () => void;
}

type ChildDraft = { age: string; gender: "boy" | "girl" | "" };

type Draft = {
  familyName: string;
  city: string;
  country: string;
  adults: string;
  children: ChildDraft[];
  pets: string[];
  aboutUs: string;
  lookingFor: string[];
  lookingForType: "aupair" | "demipair" | "babysitter";
  accommodationType: string;
  hasPrivateBathroom: boolean;
  accommodationDescription: string;
  meals: string;
  allowanceAmount: string;
  allowanceCurrency: string;
  allowanceFrequency: "weekly" | "monthly";
  benefits: string[];
  startDate: string;
  duration: string;
  workingHoursType: "fulltime" | "parttime" | "flexible";
  preferredDays: string[];
  hoursPerWeek: string;
};

function toDraft(p: any): Draft {
  return {
    familyName: p?.familyName || "",
    city: p?.location?.city || "",
    country: p?.location?.country || "",
    adults: p?.familyMembers?.adults != null ? String(p.familyMembers.adults) : "",
    children: Array.isArray(p?.familyMembers?.children)
      ? p.familyMembers.children.map((c: any) => ({ age: c?.age != null ? String(c.age) : "", gender: c?.gender || "" }))
      : [],
    pets: Array.isArray(p?.familyMembers?.pets) ? p.familyMembers.pets.map(String) : [],
    aboutUs: p?.aboutUs || "",
    lookingFor: Array.isArray(p?.lookingFor) ? p.lookingFor : p?.lookingFor ? [String(p.lookingFor)] : [],
    lookingForType: p?.lookingForType || "aupair",
    accommodationType: p?.offering?.accommodation?.type || "",
    hasPrivateBathroom: Boolean(p?.offering?.accommodation?.hasPrivateBathroom),
    accommodationDescription: p?.offering?.accommodation?.description || "",
    meals: p?.offering?.meals || "",
    allowanceAmount: p?.offering?.allowance?.amount != null ? String(p.offering.allowance.amount) : "",
    allowanceCurrency: p?.offering?.allowance?.currency || "",
    allowanceFrequency: p?.offering?.allowance?.frequency || "monthly",
    benefits: Array.isArray(p?.offering?.benefits) ? p.offering.benefits : [],
    startDate: p?.position?.startDate || "",
    duration: p?.position?.duration || "",
    workingHoursType: p?.position?.workingHoursType || "fulltime",
    preferredDays: Array.isArray(p?.position?.preferredDays) ? p.position.preferredDays : [],
    hoursPerWeek: p?.position?.hoursPerWeek != null ? String(p.position.hoursPerWeek) : "",
  };
}

async function uploadImage(file: File, path: string): Promise<string> {
  const objectRef = ref(storage, path);
  const contentType = file.type && file.type.startsWith("image/") ? file.type : "image/jpeg";
  const snap = await uploadBytes(objectRef, file, { contentType, cacheControl: "public, max-age=3600" });
  return getDownloadURL(snap.ref);
}

function formatLookingFor(value: string) {
  const labels: Record<string, string> = { aupair: "Au Pair", demipair: "Demi Pair", babysitter: "Babysitter" };
  return labels[value] || value;
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
    <Card className="rounded-2xl border border-emerald-100 bg-white/90 p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
          {icon}
        </div>
        <h2 className="text-base font-semibold text-gray-900">{title}</h2>
      </div>
      {children}
    </Card>
  );
}

export function FamilyProfilePage({ profileId, onBack }: FamilyProfilePageProps) {
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
      doc(db, "familyProfiles", profileId),
      (snap) => {
        if (!snap.exists()) {
          setError("Profile not found");
          setLoading(false);
          return;
        }
        const data = snap.data() as FamilyProfile & { userId: string };
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

  const removeExistingGalleryUrl = (url: string) => setGalleryUrls((prev) => prev.filter((u) => u !== url));
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
        profileImage = await uploadImage(avatarFile, `familyProfiles/${profileId}/avatar.jpg`);
      }

      let finalGallery = [...galleryUrls];
      if (newGalleryFiles.length) {
        const uploaded = await Promise.all(
          newGalleryFiles.map((file, i) => uploadImage(file, `familyProfiles/${profileId}/gallery/${Date.now()}_${i}.jpg`))
        );
        finalGallery = [...finalGallery, ...uploaded];
      }

      const patch: Record<string, any> = {
        familyName: draft.familyName,
        location: { city: draft.city, country: draft.country, flag: profile?.location?.flag || "" },
        familyMembers: {
          adults: draft.adults ? Number(draft.adults) : null,
          children: draft.children
            .filter((c) => c.age.trim())
            .map((c) => ({ age: Number(c.age), gender: c.gender || undefined })),
          pets: draft.pets,
        },
        aboutUs: draft.aboutUs,
        lookingFor: draft.lookingFor,
        lookingForType: draft.lookingForType,
        offering: {
          accommodation: {
            type: draft.accommodationType,
            hasPrivateBathroom: draft.hasPrivateBathroom,
            description: draft.accommodationDescription,
          },
          meals: draft.meals,
          allowance: draft.allowanceAmount
            ? { amount: Number(draft.allowanceAmount), currency: draft.allowanceCurrency, frequency: draft.allowanceFrequency }
            : null,
          benefits: draft.benefits,
        },
        position: {
          startDate: draft.startDate || null,
          duration: draft.duration || null,
          workingHoursType: draft.workingHoursType,
          preferredDays: draft.preferredDays,
          hoursPerWeek: draft.hoursPerWeek ? Number(draft.hoursPerWeek) : null,
        },
        profileImage,
        galleryImages: finalGallery,
      };

      await patchFamilyProfile(profileId, patch);
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
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-6">
        <div className="mx-auto max-w-3xl rounded-2xl border border-emerald-100 bg-white/80 p-6 text-sm text-gray-600 shadow-sm backdrop-blur">
          Loading your profile...
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-6">
        <div className="mx-auto max-w-3xl rounded-2xl border border-red-200 bg-white/80 p-6 text-sm text-red-600 shadow-sm backdrop-blur">
          {error || "Profile not found"}
        </div>
      </div>
    );
  }

  const familyName = profile?.familyName || "Unnamed Family";
  const initials = familyName.slice(0, 2).toUpperCase() || "--";
  const photo = isEditing ? avatarPreview || "/placeholder-avatar.svg" : profile?.profileImage || "/placeholder-avatar.svg";
  const location = profile?.location || {};
  const locationLabel = [location?.city, location?.country].filter(Boolean).join(", ");
  const familyMembers = profile?.familyMembers || {};
  const offering = profile?.offering || {};
  const position = profile?.position || {};
  const allowance = offering?.allowance;
  const allowanceLabel = allowance?.amount ? `${allowance.amount} ${allowance.currency || ""}${allowance.frequency ? ` / ${allowance.frequency}` : ""}` : "Not set yet";
  const galleryPhotos = Array.isArray(profile?.galleryImages) ? profile.galleryImages : [];
  const lookingFor = Array.isArray(profile?.lookingFor) ? profile.lookingFor : profile?.lookingFor ? [profile.lookingFor] : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 pb-24">
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
              <Button type="button" onClick={handleSave} disabled={isSaving} className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700">
                {isSaving ? "Saving..." : "Save"}
              </Button>
            </div>
          ) : (
            <Button type="button" onClick={startEditing} className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700">
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Button>
          )}
        </div>

        <Card className="overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-sm">
          <div className="relative h-56 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-500 sm:h-72">
            <img src={photo} alt={`${familyName}'s profile photo`} className="h-full w-full object-cover opacity-80 mix-blend-overlay" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />

            <div className="absolute bottom-5 left-5 right-5 flex items-end gap-4">
              <div className="relative">
                <Avatar className="h-24 w-24 border-4 border-white bg-white shadow-lg">
                  <AvatarImage src={photo} alt={`${familyName} avatar`} />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                {isEditing ? (
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full bg-emerald-600 text-white shadow-md hover:bg-emerald-700"
                  >
                    <Camera className="h-4 w-4" />
                  </button>
                ) : null}
              </div>

              <div className="min-w-0 flex-1 text-white">
                <Badge className="mb-2 bg-white/90 text-emerald-700 shadow-sm">
                  <Home className="mr-1 h-3 w-3" />
                  Host Family Profile
                </Badge>
                {isEditing ? (
                  <Input
                    value={draft?.familyName || ""}
                    onChange={(e) => setDraft((d) => (d ? { ...d, familyName: e.target.value } : d))}
                    placeholder="Family name"
                    className="max-w-xs border-white/40 bg-white/20 text-white placeholder:text-white/70"
                  />
                ) : (
                  <h1 className="truncate text-2xl font-semibold sm:text-3xl">{familyName}</h1>
                )}
                {!isEditing && locationLabel ? (
                  <p className="mt-1 flex items-center gap-1 text-sm text-white/90">
                    <MapPin className="h-4 w-4" />
                    {locationLabel}
                  </p>
                ) : null}
              </div>
            </div>
          </div>

          {isEditing ? (
            <div className="grid gap-4 p-5 sm:grid-cols-2">
              <FieldRow label="City">
                <Input value={draft?.city || ""} onChange={(e) => setDraft((d) => (d ? { ...d, city: e.target.value } : d))} />
              </FieldRow>
              <FieldRow label="Country">
                <Input value={draft?.country || ""} onChange={(e) => setDraft((d) => (d ? { ...d, country: e.target.value } : d))} />
              </FieldRow>
            </div>
          ) : (
            <div className="grid gap-3 p-5 sm:grid-cols-3">
              <div className="rounded-2xl bg-emerald-50 p-4">
                <div className="mb-1 flex items-center gap-2 text-xs font-medium text-emerald-700">
                  <Users className="h-4 w-4" />
                  Family
                </div>
                <p className="text-lg font-semibold text-gray-900">{familyMembers?.adults != null ? `${familyMembers.adults} adults` : "Not set"}</p>
                <p className="mt-1 text-sm text-gray-600">{(familyMembers?.children || []).length} children</p>
              </div>
              <div className="rounded-2xl bg-emerald-50 p-4">
                <div className="mb-1 flex items-center gap-2 text-xs font-medium text-emerald-700">
                  <Calendar className="h-4 w-4" />
                  Start / Duration
                </div>
                <p className="text-lg font-semibold text-gray-900">{position?.startDate || "Flexible"}</p>
                <p className="mt-1 text-sm text-gray-600">{position?.duration || "Duration flexible"}</p>
              </div>
              <div className="rounded-2xl bg-emerald-50 p-4">
                <div className="mb-1 flex items-center gap-2 text-xs font-medium text-emerald-700">
                  <Wallet className="h-4 w-4" />
                  Allowance
                </div>
                <p className="text-lg font-semibold text-gray-900">{allowanceLabel}</p>
              </div>
            </div>
          )}
        </Card>

        <div className="mt-5 grid gap-5 lg:grid-cols-[1.4fr_0.9fr]">
          <div className="space-y-5">
            <Section icon={<Sparkles className="h-4 w-4" />} title="About Our Family">
              {isEditing ? (
                <Textarea rows={4} value={draft?.aboutUs || ""} onChange={(e) => setDraft((d) => (d ? { ...d, aboutUs: e.target.value } : d))} placeholder="Tell au pairs about your family..." />
              ) : profile?.aboutUs ? (
                <p className="whitespace-pre-line leading-relaxed text-gray-700">{profile.aboutUs}</p>
              ) : (
                <p className="text-sm text-gray-500">Add a short introduction about your family.</p>
              )}
            </Section>

            <Section icon={<Users className="h-4 w-4" />} title="Family Overview">
              {isEditing ? (
                <div className="space-y-4">
                  <FieldRow label="Adults">
                    <Input type="number" value={draft?.adults || ""} onChange={(e) => setDraft((d) => (d ? { ...d, adults: e.target.value } : d))} className="max-w-[8rem]" />
                  </FieldRow>
                  <FieldRow label="Children">
                    <div className="space-y-2">
                      {(draft?.children || []).map((child, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Input
                            type="number"
                            value={child.age}
                            onChange={(e) =>
                              setDraft((d) => {
                                if (!d) return d;
                                const next = [...d.children];
                                next[index] = { ...next[index], age: e.target.value };
                                return { ...d, children: next };
                              })
                            }
                            placeholder="Age"
                            className="w-24"
                          />
                          <Select
                            value={child.gender || "any"}
                            onValueChange={(v) =>
                              setDraft((d) => {
                                if (!d) return d;
                                const next = [...d.children];
                                next[index] = { ...next[index], gender: v === "any" ? "" : (v as "boy" | "girl") };
                                return { ...d, children: next };
                              })
                            }
                          >
                            <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="any">Any</SelectItem>
                              <SelectItem value="boy">Boy</SelectItem>
                              <SelectItem value="girl">Girl</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button type="button" variant="ghost" size="icon" onClick={() => setDraft((d) => (d ? { ...d, children: d.children.filter((_, i) => i !== index) } : d))}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button type="button" variant="outline" size="sm" onClick={() => setDraft((d) => (d ? { ...d, children: [...d.children, { age: "", gender: "" }] } : d))}>
                        Add child
                      </Button>
                    </div>
                  </FieldRow>
                  <FieldRow label="Pets">
                    <TagListEditor
                      values={draft?.pets || []}
                      onChange={(next) => setDraft((d) => (d ? { ...d, pets: next } : d))}
                      placeholder="e.g. Dog"
                      badgeClassName="rounded-full bg-emerald-100 px-3 py-1 text-emerald-800 hover:bg-emerald-100"
                    />
                  </FieldRow>
                </div>
              ) : (
                <div className="space-y-3 text-sm text-gray-700">
                  <div className="rounded-xl bg-emerald-50 px-3 py-2">
                    <span className="font-medium text-gray-900">Adults:</span> {familyMembers?.adults ?? "Not set yet"}
                  </div>
                  {(familyMembers?.children || []).length > 0 ? (
                    <div className="space-y-2">
                      {familyMembers.children.map((child: any, index: number) => (
                        <div key={index} className="rounded-xl border border-emerald-100 bg-white px-3 py-2">
                          <p className="text-gray-600">{[child?.age ? `${child.age} years old` : "", child?.gender || ""].filter(Boolean).join(" · ") || "Details not set"}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-xl bg-emerald-50 px-3 py-2">
                      <span className="font-medium text-gray-900">Children:</span> Not listed
                    </div>
                  )}
                  <div className="rounded-xl bg-emerald-50 px-3 py-2">
                    <span className="font-medium text-gray-900">Pets:</span> {(familyMembers?.pets || []).length > 0 ? familyMembers.pets.join(", ") : "No pets listed"}
                  </div>
                </div>
              )}
            </Section>

            <Section icon={<Briefcase className="h-4 w-4" />} title="Position Details">
              {isEditing ? (
                <div className="space-y-4">
                  <FieldRow label="Looking for">
                    <Select value={draft?.lookingForType} onValueChange={(v) => setDraft((d) => (d ? { ...d, lookingForType: v as Draft["lookingForType"] } : d))}>
                      <SelectTrigger className="max-w-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="aupair">Au Pair</SelectItem>
                        <SelectItem value="demipair">Demi Pair</SelectItem>
                        <SelectItem value="babysitter">Babysitter</SelectItem>
                      </SelectContent>
                    </Select>
                  </FieldRow>
                  <FieldRow label="Skills / qualities you'd love">
                    <TagListEditor
                      values={draft?.lookingFor || []}
                      onChange={(next) => setDraft((d) => (d ? { ...d, lookingFor: next } : d))}
                      placeholder="e.g. Childcare"
                      badgeClassName="rounded-full bg-emerald-100 px-3 py-1 text-emerald-800 hover:bg-emerald-100"
                    />
                  </FieldRow>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FieldRow label="Start date">
                      <Input type="date" value={draft?.startDate || ""} onChange={(e) => setDraft((d) => (d ? { ...d, startDate: e.target.value } : d))} />
                    </FieldRow>
                    <FieldRow label="Duration">
                      <Input value={draft?.duration || ""} onChange={(e) => setDraft((d) => (d ? { ...d, duration: e.target.value } : d))} placeholder="e.g. 12 months" />
                    </FieldRow>
                    <FieldRow label="Hours per week">
                      <Input type="number" value={draft?.hoursPerWeek || ""} onChange={(e) => setDraft((d) => (d ? { ...d, hoursPerWeek: e.target.value } : d))} />
                    </FieldRow>
                    <FieldRow label="Schedule">
                      <Select value={draft?.workingHoursType} onValueChange={(v) => setDraft((d) => (d ? { ...d, workingHoursType: v as Draft["workingHoursType"] } : d))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fulltime">Full-time</SelectItem>
                          <SelectItem value="parttime">Part-time</SelectItem>
                          <SelectItem value="flexible">Flexible</SelectItem>
                        </SelectContent>
                      </Select>
                    </FieldRow>
                  </div>
                  <FieldRow label="Preferred days">
                    <DayPicker selected={draft?.preferredDays || []} onChange={(next) => setDraft((d) => (d ? { ...d, preferredDays: next } : d))} />
                  </FieldRow>
                </div>
              ) : (
                <div className="space-y-3 text-sm text-gray-700">
                  {lookingFor.length > 0 ? (
                    <div>
                      <p className="mb-2 text-sm font-medium text-gray-900">Looking For</p>
                      <div className="flex flex-wrap gap-2">
                        {lookingFor.map((item: string, index: number) => (
                          <Badge key={`${item}-${index}`} className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-800 hover:bg-emerald-100">
                            {formatLookingFor(item)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ) : null}
                  <div className="rounded-xl bg-emerald-50 px-3 py-2">
                    <span className="font-medium text-gray-900">Start date:</span> {position?.startDate || "Flexible"}
                  </div>
                  <div className="rounded-xl bg-emerald-50 px-3 py-2">
                    <span className="font-medium text-gray-900">Duration:</span> {position?.duration || "Flexible"}
                  </div>
                  <div className="rounded-xl bg-emerald-50 px-3 py-2">
                    <span className="font-medium text-gray-900">Hours per week:</span> {position?.hoursPerWeek || "Not set yet"}
                  </div>
                  <div className="rounded-xl bg-emerald-50 px-3 py-2">
                    <span className="font-medium text-gray-900">Schedule:</span> {position?.workingHoursType || "Flexible"}
                  </div>
                  {(position?.preferredDays || []).length > 0 ? (
                    <div className="rounded-xl bg-emerald-50 px-3 py-2">
                      <span className="font-medium text-gray-900">Preferred days:</span> {position.preferredDays.join(", ")}
                    </div>
                  ) : null}
                </div>
              )}
            </Section>

            <Section icon={<Home className="h-4 w-4" />} title="Family & Home Photos">
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
                      <img src={src} alt={`${familyName} gallery ${index + 1}`} className="h-full w-full object-cover" />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No photos added yet.</p>
              )}
            </Section>
          </div>

          <div className="space-y-5">
            <Section icon={<Gift className="h-4 w-4" />} title="Accommodation & Benefits">
              {isEditing ? (
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FieldRow label="Accommodation type">
                      <Input value={draft?.accommodationType || ""} onChange={(e) => setDraft((d) => (d ? { ...d, accommodationType: e.target.value } : d))} placeholder="e.g. private_room" />
                    </FieldRow>
                    <FieldRow label="Private bathroom">
                      <div className="flex h-10 items-center gap-2">
                        <Switch checked={draft?.hasPrivateBathroom || false} onCheckedChange={(checked) => setDraft((d) => (d ? { ...d, hasPrivateBathroom: checked } : d))} />
                        <span className="text-sm text-gray-600">{draft?.hasPrivateBathroom ? "Yes" : "No"}</span>
                      </div>
                    </FieldRow>
                  </div>
                  <FieldRow label="Accommodation description">
                    <Textarea rows={3} value={draft?.accommodationDescription || ""} onChange={(e) => setDraft((d) => (d ? { ...d, accommodationDescription: e.target.value } : d))} />
                  </FieldRow>
                  <FieldRow label="Meals">
                    <Input value={draft?.meals || ""} onChange={(e) => setDraft((d) => (d ? { ...d, meals: e.target.value } : d))} placeholder="e.g. all_meals" />
                  </FieldRow>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <FieldRow label="Allowance amount">
                      <Input type="number" value={draft?.allowanceAmount || ""} onChange={(e) => setDraft((d) => (d ? { ...d, allowanceAmount: e.target.value } : d))} />
                    </FieldRow>
                    <FieldRow label="Currency">
                      <Input value={draft?.allowanceCurrency || ""} onChange={(e) => setDraft((d) => (d ? { ...d, allowanceCurrency: e.target.value } : d))} placeholder="e.g. EUR" />
                    </FieldRow>
                    <FieldRow label="Frequency">
                      <Select value={draft?.allowanceFrequency} onValueChange={(v) => setDraft((d) => (d ? { ...d, allowanceFrequency: v as Draft["allowanceFrequency"] } : d))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </FieldRow>
                  </div>
                  <FieldRow label="Benefits">
                    <TagListEditor
                      values={draft?.benefits || []}
                      onChange={(next) => setDraft((d) => (d ? { ...d, benefits: next } : d))}
                      placeholder="e.g. Gym membership"
                      badgeClassName="rounded-full bg-amber-100 px-3 py-1 text-amber-800 hover:bg-amber-100"
                    />
                  </FieldRow>
                </div>
              ) : (
                <div className="space-y-3 text-sm text-gray-700">
                  <div className="rounded-xl bg-emerald-50 px-3 py-2">
                    <span className="font-medium text-gray-900">Allowance:</span> {allowanceLabel}
                  </div>
                  <div className="rounded-xl bg-emerald-50 px-3 py-2">
                    <span className="font-medium text-gray-900">Accommodation:</span> {offering?.accommodation?.type || "Not set yet"}
                  </div>
                  {offering?.accommodation?.description ? (
                    <div className="whitespace-pre-line rounded-xl bg-emerald-50 px-3 py-2 leading-7">{offering.accommodation.description}</div>
                  ) : null}
                  <div className="rounded-xl bg-emerald-50 px-3 py-2">
                    <span className="font-medium text-gray-900">Meals:</span> {offering?.meals || "Not set yet"}
                  </div>
                  {(offering?.benefits || []).length > 0 ? (
                    <div>
                      <p className="mb-2 text-sm font-medium text-gray-900">Benefits</p>
                      <div className="flex flex-wrap gap-2">
                        {offering.benefits.map((benefit: string, index: number) => (
                          <Badge key={`${benefit}-${index}`} className="rounded-full bg-amber-100 px-3 py-1 text-amber-800 hover:bg-amber-100">
                            {benefit}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              )}
            </Section>

            {(profile?.familyMembers?.pets || []).length > 0 && !isEditing ? (
              <Section icon={<PawPrint className="h-4 w-4" />} title="Pets">
                <div className="flex flex-wrap gap-2">
                  {profile.familyMembers.pets.map((pet: string, index: number) => (
                    <Badge key={`${pet}-${index}`} className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-800 hover:bg-emerald-100">
                      {pet}
                    </Badge>
                  ))}
                </div>
              </Section>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
