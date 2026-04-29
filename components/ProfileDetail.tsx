// Firestore data-driven ProfileDetail
"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { Separator } from "./ui/separator";
import { Dialog, DialogContent, DialogTitle } from "./ui/dialog";
import { MapPin, Heart, MessageCircle, Clock, Users, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "./ui/badge";
import { ImageWithFallback } from "./figma/ImageWithFallback";


// ==== View-Model types kept compatible with current UI ====
interface AuPairDataVM {
  type: "aupair";
  id: string;
  ownerUserId: string;
  name: string;
  age: number;
  country: string;
  flag: string;
  currentLocation: string;
  imageUrl: string;
  galleryImages?: string[];
  languages: Array<{ name: string; level: string }>;
  education: string[];
  skills: Array<{ emoji: string; name: string; description?: string }>;
  availability: { from: string; duration: string; visa: string };
  aboutMe: string;
}

interface FamilyDataVM {
  type: "family";
  id: string;
  ownerUserId: string;
  name: string;
  location: string;
  flag: string;
  imageUrl: string;
  galleryImages?: string[];
  children: Array<{ age: number; emoji: string }>;
  stayDuration: string;
  hoursPerWeek: string;
  languages: string[];
  lookingFor: string[];
  aboutUs: string;
}

type ProfileDataVM = AuPairDataVM | FamilyDataVM;

interface ProfileDetailProps {
  userType: "aupair" | "family";
  profileId: string;
  onMessageClick?: (profileId: string) => void;
  onLikeClick?: (profileId: string, userType: "aupair" | "family") => void;
}

// Firebase
import { auth, db } from "@/lib/firebase";
import { addDoc, collection, doc, onSnapshot, query, serverTimestamp, where } from "firebase/firestore";

export function ProfileDetail({ userType, profileId, onMessageClick, onLikeClick }: ProfileDetailProps) {
  const [profile, setProfile] = useState<ProfileDataVM | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isLikeSaving, setIsLikeSaving] = useState(false);

  // Default gallery fallbacks
  const defaultAuPairGallery = useMemo(() => [
    "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800",
    "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800",
    "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=800",
    "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800",
    "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800",
  ], []);

  const defaultFamilyGallery = useMemo(() => [
    "https://images.unsplash.com/photo-1560184897-ae75f418493e?w=800",
    "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800",
    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800",
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800",
    "https://images.unsplash.com/photo-1449844908441-8829872d2607?w=800",
  ], []);

  // Helper: compute age from YYYY-MM-DD (or ISO)
  function calcAge(birthDate?: string): number {
    if (!birthDate) return 0;
    const d = new Date(birthDate);
    if (Number.isNaN(d.getTime())) return 0;
    const now = new Date();
    let age = now.getFullYear() - d.getFullYear();
    const m = now.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
    return Math.max(age, 0);
  }

  // Subscribe to Firestore profile doc and map → ViewModel
  useEffect(() => {
    if (!profileId || !userType) return;
    setLoading(true);

    const col = userType === "aupair" ? "auPairProfiles" : "familyProfiles";
    const unsub = onSnapshot(doc(db, col, profileId), (snap) => {
      if (!snap.exists()) {
        setProfile(null);
        setLoading(false);
        return;
      }
      const p: any = snap.data();

      if (userType === "aupair") {
        const city = p?.currentLocation?.city || p?.location?.city || "";
        const country = p?.currentLocation?.country || p?.location?.country || p?.originCountry || "";
        const langs: Array<{ name: string; level: string }> = [];
        if (p?.languages?.primary?.language) {
          langs.push({ name: p.languages.primary.language, level: p.languages.primary.proficiency || "" });
        }
        (p?.languages?.secondary || []).forEach((l: any) => {
          if (l?.language) langs.push({ name: l.language, level: l.proficiency || "" });
        });

        const vm: AuPairDataVM = {
          type: "aupair",
          id: snap.id,
          ownerUserId: p?.userId || "",
          name: p?.name || "",
          age: calcAge(p?.birthDate),
          country: country,
          flag: p?.flag || "",
          currentLocation: [city, country].filter(Boolean).join(", "),
          imageUrl: p?.profileImage || p?.photos?.[0] || "",
          galleryImages: p?.photos || undefined,
          languages: langs,
          education: (p?.education || []).map((e: any) => (typeof e === "string" ? e : e?.title || "")),
          skills: (p?.skills || []).map((s: any) => ({ emoji: s?.emoji || "✨", name: s?.name || String(s), description: s?.description })),
          availability: {
            from: p?.availability?.availableFrom || p?.availableFrom || "",
            duration: p?.durationLabel || (p?.durationMonths ? `${p.durationMonths} months` : ""),
            visa: p?.visaStatus || p?.availability?.visa || "",
          },
          aboutMe: p?.aboutMe || "",
        };
        setProfile(vm);
      } else {
        const city = p?.location?.city || p?.address?.city || "";
        const country = p?.location?.country || p?.address?.country || "";

        const vm: FamilyDataVM = {
          type: "family",
          id: snap.id,
          ownerUserId: p?.userId || "",
          name: p?.familyName || p?.name || "",
          location: [city, country].filter(Boolean).join(", "),
          flag: p?.flag || "",
          imageUrl: p?.familyPhoto || p?.profileImage || p?.photos?.[0] || "",
          galleryImages: p?.photos || undefined,
          children: (p?.children || []).map((c: any) => ({ age: Number(c?.age ?? 0), emoji: c?.emoji || "👶" })),
          stayDuration: p?.durationLabel || (p?.durationMonths ? `${p.durationMonths} months` : ""),
          hoursPerWeek: p?.hoursPerWeek || p?.requiredHoursPerWeek || "",
          languages: [
            p?.languages?.primary?.language,
            ...((p?.languages?.secondary || []).map((l: any) => l?.language)),
          ].filter(Boolean),
          lookingFor: (p?.lookingFor || p?.desiredSkills || [])
            .map((s: any) => (typeof s === "string" ? s : s?.name))
            .filter(Boolean),
          aboutUs: p?.aboutUs || "",
        };
        setProfile(vm);
      }
  useEffect(() => {
    const currentUid = auth.currentUser?.uid;
    if (!currentUid || !profile?.ownerUserId || currentUid === profile.ownerUserId) {
      setIsLiked(false);
      return;
    }

    const q = query(
      collection(db, "favorites"),
      where("fromUserId", "==", currentUid),
      where("toUserId", "==", profile.ownerUserId)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      setIsLiked(!snapshot.empty);
    });

    return () => unsub();
  }, [profile?.ownerUserId]);

      setLoading(false);
    });

    return () => unsub();
  }, [profileId, userType]);

  const handlePrevImage = () => {
    if (selectedImage !== null && selectedImage > 0) setSelectedImage(selectedImage - 1);
  };
  const handleNextImage = (galleryLength: number) => {
    if (selectedImage !== null && selectedImage < galleryLength - 1) setSelectedImage(selectedImage + 1);
  };

  const handleLikeClick = async () => {
    if (!profile) return;

    const currentUid = auth.currentUser?.uid;
    if (!currentUid || !profile.ownerUserId || currentUid === profile.ownerUserId || isLiked || isLikeSaving) {
      return;
    }

    setIsLikeSaving(true);
    try {
      await addDoc(collection(db, "favorites"), {
        fromUserId: currentUid,
        toUserId: profile.ownerUserId,
        createdAt: serverTimestamp(),
      });
      setIsLiked(true);
      onLikeClick?.(profile.id, profile.type);
    } finally {
      setIsLikeSaving(false);
    }
  };

  const handleMessageAction = () => {
    if (!profile) return;
    onMessageClick?.(profile.id);
  };

  if (loading) return <Card className="p-6">Loading profile…</Card>;
  if (!profile) return <Card className="p-6">Profile not found.</Card>;

  // ========== AUPAIR RENDER ==========
  if (profile.type === "aupair") {
    const galleryImages = profile.galleryImages?.length ? profile.galleryImages : defaultAuPairGallery;

    return (
      <>
        <Card className="w-full bg-white shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-br from-orange-50 to-rose-50 p-8 pb-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <Avatar className="w-32 h-32 border-4 border-white shadow-lg">
                <AvatarImage src={profile.imageUrl} alt={profile.name} />
                <AvatarFallback>{profile.name.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="text-center md:text-left flex-1">
                <h2 className="mb-2">{profile.name}{profile.age ? `, ${profile.age}` : ""}</h2>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-gray-600">
                  <span className="text-2xl">{profile.flag}</span>
                  <span>{profile.country}</span>
                </div>
                <div className="flex items-center justify-center md:justify-start gap-1 text-gray-600 mt-2">
                  <MapPin className="w-4 h-4" />
                  <p className="text-sm">{profile.currentLocation ? `Currently in ${profile.currentLocation}` : "Location not set"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Photo Gallery */}
          <div className="px-6 md:px-8 pb-4">
            <h3 className="mb-3 flex items-center gap-2"><span>📸</span> Photos</h3>
            <div className="overflow-x-auto">
              <div className="flex gap-2 pb-2">
                {galleryImages.map((image, index) => (
                  <div key={index} onClick={() => setSelectedImage(index)} className="flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity">
                    <ImageWithFallback src={image} alt={`Photo ${index + 1}`} className="w-24 h-24 object-cover rounded-lg border-2 border-orange-200 hover:border-orange-400" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <Separator />

          {/* Languages */}
          <div className="p-6 md:p-8 space-y-6">
            <section>
              <h3 className="mb-3 flex items-center gap-2"><span>🗣️</span> Languages</h3>
              <div className="flex flex-wrap gap-2">
                {profile.languages.length > 0 ? (
                  profile.languages.map((lang, i) => (
                    <Badge key={i} variant="secondary" className="px-3 py-1">{lang.name}{lang.level ? ` (${lang.level})` : ""}</Badge>
                  ))
                ) : (
                  <span className="text-sm text-gray-500">No languages set</span>
                )}
              </div>
            </section>

            <Separator />

            {/* Education & Experience */}
            <section>
              <h3 className="mb-3 flex items-center gap-2"><span>🎓</span> Education & Experience</h3>
              {profile.education.length ? (
                <ul className="space-y-2 text-gray-700">
                  {profile.education.map((item, i) => (
                    <li key={i} className="flex items-start gap-2"><span className="text-blue-500 mt-1">•</span><span>{item}</span></li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">No education/experience items</p>
              )}
            </section>

            <Separator />

            {/* Skills */}
            <section>
              <h3 className="mb-3 flex items-center gap-2"><span>🎯</span> Skills & Interests</h3>
              {profile.skills.length ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {profile.skills.map((skill, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                      <span className="text-2xl">{skill.emoji}</span>
                      <div>
                        <p className="font-medium text-sm">{skill.name}</p>
                        {skill.description && <p className="text-xs text-gray-500">{skill.description}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No skills added yet</p>
              )}
            </section>

            <Separator />

            {/* Availability */}
            <section>
              <h3 className="mb-3 flex items-center gap-2"><span>📅</span> Availability</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">Start Date</p>
                  <p className="font-medium">{profile.availability.from || "—"}</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">Duration</p>
                  <p className="font-medium">{profile.availability.duration || "—"}</p>
                </div>
                <div className="p-3 bg-pink-50 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">Visa Status</p>
                  <p className="font-medium">{profile.availability.visa || "—"}</p>
                </div>
              </div>
            </section>

            <Separator />

            {/* About Me */}
            <section>
              <h3 className="mb-3 flex items-center gap-2"><span>💬</span> About Me</h3>
              <p className="text-gray-700 italic bg-gray-50 p-4 rounded-lg leading-relaxed">{profile.aboutMe ? `"${profile.aboutMe}"` : "No introduction yet"}</p>
            </section>
          </div>

          <Separator />

          {/* Actions */}
          <div className="p-6 flex gap-3">
            <Button
              type="button"
              className="flex-1 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700"
              onClick={() => void handleLikeClick()}
              disabled={isLiked || isLikeSaving || !profile.ownerUserId || auth.currentUser?.uid === profile.ownerUserId}
            >
              <Heart className="w-4 h-4 mr-2" /> {isLiked ? "Liked" : isLikeSaving ? "Saving..." : "Like"}
            </Button>
            <Button
              type="button"
              className="flex-1 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700"
              onClick={handleMessageAction}
              disabled={!onMessageClick}
            >
              <MessageCircle className="w-4 h-4 mr-2" /> Message
            </Button>
          </div>
        </Card>

        {/* Lightbox */}
        <Dialog open={selectedImage !== null} onOpenChange={() => setSelectedImage(null)}>
          <DialogContent className="max-w-4xl p-0 bg-black/95 border-none" aria-describedby={undefined}>
            <DialogTitle className="sr-only">Image Gallery</DialogTitle>
            <div className="relative">
              <button onClick={() => setSelectedImage(null)} className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white">
                <X className="w-6 h-6" />
              </button>
              {selectedImage !== null && (
                <>
                  <img src={galleryImages[selectedImage]} alt={`Photo ${selectedImage + 1}`} className="w-full h-auto max-h-[80vh] object-contain" />
                  {selectedImage > 0 && (
                    <button onClick={() => handlePrevImage()} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white">
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                  )}
                  {selectedImage < galleryImages.length - 1 && (
                    <button onClick={() => handleNextImage(galleryImages.length)} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white">
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  )}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm bg-black/50 px-3 py-1 rounded-full">
                    {selectedImage + 1} / {galleryImages.length}
                  </div>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // ========== FAMILY RENDER ==========
  const galleryImages = (profile.galleryImages?.length ? profile.galleryImages : defaultFamilyGallery);

  return (
    <>
      <Card className="w-full bg-white shadow-xl overflow-hidden">
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-8 pb-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <Avatar className="w-32 h-32 border-4 border-white shadow-lg">
              <AvatarImage src={profile.imageUrl} alt={profile.name} />
              <AvatarFallback>
                <Users className="w-16 h-16 text-gray-400" />
              </AvatarFallback>
            </Avatar>
            <div className="text-center md:text-left flex-1">
              <h2 className="mb-2">{profile.name}</h2>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-gray-600">
                <span className="text-2xl">{profile.flag}</span>
                <span>{profile.location}</span>
              </div>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-3">
                <div className="flex items-center gap-1 text-sm">
                  <Users className="w-4 h-4" />
                  <span>{profile.children.length} {profile.children.length === 1 ? "child" : "children"}</span>
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <Clock className="w-4 h-4" />
                  <span>{profile.hoursPerWeek ? `${profile.hoursPerWeek} per week` : "Hours/week not set"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Gallery */}
        <div className="px-6 md:px-8 pb-4">
          <h3 className="mb-3 flex items-center gap-2"><span>📸</span> Family & Home</h3>
          <div className="overflow-x-auto">
            <div className="flex gap-2 pb-2">
              {galleryImages.map((image, index) => (
                <div key={index} onClick={() => setSelectedImage(index)} className="flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity">
                  <ImageWithFallback src={image} alt={`Photo ${index + 1}`} className="w-24 h-24 object-cover rounded-lg border-2 border-orange-200 hover:border-orange-400" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <Separator />

        {/* Content */}
        <div className="p-6 md:p-8 space-y-6">
          <section>
            <h3 className="mb-3 flex items-center gap-2"><span>👶</span> Children</h3>
            <div className="flex flex-wrap gap-2">
              {profile.children.length ? (
                profile.children.map((child, i) => (
                  <Badge key={i} variant="secondary" className="px-3 py-1 text-base">{child.emoji} {child.age} years old</Badge>
                ))
              ) : (
                <span className="text-sm text-gray-500">No children listed</span>
              )}
            </div>
          </section>

          <Separator />

          <section>
            <h3 className="mb-3 flex items-center gap-2"><span>🗣️</span> Languages We Speak</h3>
            <div className="flex flex-wrap gap-2">
              {profile.languages.length ? (
                profile.languages.map((lang, i) => (
                  <Badge key={i} variant="secondary" className="px-3 py-1">{lang}</Badge>
                ))
              ) : (
                <span className="text-sm text-gray-500">No languages set</span>
              )}
            </div>
          </section>

          <Separator />

          <section>
            <h3 className="mb-3 flex items-center gap-2"><span>📋</span> Position Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Duration</p>
                <p className="font-medium">{profile.stayDuration || "—"}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Hours Per Week</p>
                <p className="font-medium">{profile.hoursPerWeek || "—"}</p>
              </div>
            </div>
          </section>

          <Separator />

          <section>
            <h3 className="mb-3 flex items-center gap-2"><span>🎯</span> What We're Looking For</h3>
            <ul className="space-y-2 text-gray-700">
              {profile.lookingFor.length ? (
                profile.lookingFor.map((item, i) => (
                  <li key={i} className="flex items-start gap-2"><span className="text-green-500 mt-1">•</span><span>{item}</span></li>
                ))
              ) : (
                <li className="text-sm text-gray-500">No requirements listed</li>
              )}
            </ul>
          </section>

          <Separator />

          <section>
            <h3 className="mb-3 flex items-center gap-2"><span>💬</span> About Us</h3>
            <p className="text-gray-700 italic bg-gray-50 p-4 rounded-lg leading-relaxed">{profile.aboutUs ? `"${profile.aboutUs}"` : "No introduction yet"}</p>
          </section>
        </div>

        <Separator />

        <div className="p-6 flex gap-3">
          <Button
            type="button"
            className="flex-1 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700"
            onClick={() => void handleLikeClick()}
            disabled={isLiked || isLikeSaving || !profile.ownerUserId || auth.currentUser?.uid === profile.ownerUserId}
          >
            <Heart className="w-4 h-4 mr-2" /> {isLiked ? "Liked" : isLikeSaving ? "Saving..." : "Like"}
          </Button>
          <Button
            type="button"
            className="flex-1 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700"
            onClick={handleMessageAction}
            disabled={!onMessageClick}
          >
            <MessageCircle className="w-4 h-4 mr-2" /> Message
          </Button>
        </div>
      </Card>

      {/* Lightbox */}
      <Dialog open={selectedImage !== null} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl p-0 bg-black/95 border-none" aria-describedby={undefined}>
          <DialogTitle className="sr-only">Image Gallery</DialogTitle>
          <div className="relative">
            <button onClick={() => setSelectedImage(null)} className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white">
              <X className="w-6 h-6" />
            </button>
            {selectedImage !== null && (
              <>
                <img src={galleryImages[selectedImage]} alt={`Photo ${selectedImage + 1}`} className="w-full h-auto max-h-[80vh] object-contain" />
                {selectedImage > 0 && (
                  <button onClick={() => setSelectedImage((i) => (i ? i - 1 : 0))} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white">
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                )}
                {selectedImage < galleryImages.length - 1 && (
                  <button onClick={() => setSelectedImage((i) => (i === null ? 0 : i + 1))} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white">
                    <ChevronRight className="w-6 h-6" />
                  </button>
                )}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm bg-black/50 px-3 py-1 rounded-full">
                  {selectedImage + 1} / {galleryImages.length}
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
