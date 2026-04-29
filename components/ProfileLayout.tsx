// components/ProfileLayout.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Heart, MessageCircle, Share2, Flag, Star } from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { addDoc, collection, doc, onSnapshot, setDoc, deleteDoc, getDoc, serverTimestamp, query, limit } from "firebase/firestore";
import { FirebaseError } from "firebase/app";
import AuPairProfile from "./AuPairProfile";
import BabysitterProfile from "./BabysitterProfile";
import { FamilyProfile } from "./FamilyProfile";
import type {
  AuPairProfile as AuPairProfileType,
  FamilyProfile as FamilyProfileType,
} from "@/lib/types";

interface ProfileLayoutProps {
  profileId: string;
  onMessageClick?: (profileId: string) => void;
  userType: "family" | "aupair"; // ← 分岐のキー（必須）
}

export function ProfileLayout({
  profileId,
  onMessageClick,
  userType,
}: ProfileLayoutProps) {
  const [profile, setProfile] = useState<
    AuPairProfileType | FamilyProfileType | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [profileUserId, setProfileUserId] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);

  const [similarProfiles, setSimilarProfiles] = useState<any[]>([]);

  function getSimilarTitle(item: any) {
    if (isAuPair) {
      const name = item?.name || "Au Pair";
      const nationality = item?.nationality ? ` ${item.nationality}` : "";
      return `${name}${nationality}`;
    }

    const name = item?.familyName || item?.name || "Family";
    const country = item?.location?.country ? ` ${item.location.country}` : "";
    return `${name}${country}`;
  }

  function getSimilarSubtitle(item: any) {
    if (isAuPair) {
      const primary = item?.languages?.primary?.language || item?.primaryLanguage?.name || "";
      const secondary = Array.isArray(item?.languages?.secondary)
        ? item.languages.secondary.map((lang: any) => lang?.language).filter(Boolean)
        : Array.isArray(item?.secondaryLanguages)
          ? item.secondaryLanguages.map((lang: any) => lang?.name).filter(Boolean)
          : [];

      return [primary, ...secondary].filter(Boolean).slice(0, 2).join(", ") || "View profile";
    }

    const city = item?.location?.city || "";
    const childrenCount = Array.isArray(item?.familyMembers?.children)
      ? item.familyMembers.children.length
      : Array.isArray(item?.children)
        ? item.children.length
        : 0;

    const locationLabel = city ? `${city}` : "Family profile";
    const childLabel = childrenCount > 0 ? `${childrenCount} kid${childrenCount > 1 ? "s" : ""}` : "";
    return [locationLabel, childLabel].filter(Boolean).join(" • ");
  }

  // userType に応じて、正しいコレクションを購読
  useEffect(() => {
    if (!profileId || !userType) return;
    setLoading(true);
    const col = userType === "aupair" ? "auPairProfiles" : "familyProfiles";
    const unsub = onSnapshot(doc(db, col, profileId), (snap) => {
      if (snap.exists()) {
        const data = snap.data() as any;
        setProfile(data);
        setProfileUserId(typeof data?.userId === "string" ? data.userId : null);
      } else {
        setProfile(null);
        setProfileUserId(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, [profileId, userType]);

  const isAuPair = userType === "aupair";
  const isBabysitter = isAuPair && (profile as any)?.workType === "babysitter";
  const currentUserId = auth.currentUser?.uid ?? null;
  const favoriteDocId = currentUserId && profileUserId ? `${currentUserId}_${profileUserId}` : null;
  const isMyProfile = Boolean(currentUserId && profileUserId && currentUserId === profileUserId);
  const messageTargetUserId = useMemo(() => {
    if (!profileUserId) return null;
    if (isMyProfile) return null;
    return profileUserId;
  }, [isMyProfile, profileUserId]);

  useEffect(() => {
    if (!favoriteDocId) return;

    const checkFavorite = async () => {
      try {
        const ref = doc(db, "favorites", favoriteDocId);
        const snap = await getDoc(ref);
        setIsFavorite(snap.exists());
      } catch (e) {
        // Keep UI usable even when rules temporarily block read.
        setIsFavorite(false);
        if (!(e instanceof FirebaseError && e.code === "permission-denied")) {
          console.error("Favorite check error:", e);
        }
      }
    };

    checkFavorite();
  }, [favoriteDocId]);

  useEffect(() => {
    if (!userType || !profileId) return;

    const col = userType === "aupair" ? "auPairProfiles" : "familyProfiles";
    const q = query(collection(db, col), limit(6));

    const unsub = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs
        .map((snap) => ({ id: snap.id, ...(snap.data() as any) }))
        .filter((item) => item.id !== profileId)
        .filter((item) => item?.isDeleted !== true)
        .filter((item) => !profileUserId || item.userId !== profileUserId)
        .slice(0, 3);

      setSimilarProfiles(items);
    });

    return () => unsub();
  }, [profileId, profileUserId, userType]);

  const handleAddToFavorites = async () => {
    if (!profileUserId || !currentUserId || isMyProfile) return;

    const ref = doc(db, "favorites", `${currentUserId}_${profileUserId}`);

    try {
      if (isFavorite) {
        await deleteDoc(ref);
        setIsFavorite(false);
      } else {
        await setDoc(ref, {
          fromUserId: currentUserId,
          toUserId: profileUserId,
          createdAt: serverTimestamp(),
        });
        await addDoc(collection(db, "notifications"), {
          userId: profileUserId,
          actorUserId: currentUserId,
          actorName: auth.currentUser?.displayName || "Cultura member",
          actorAvatar: auth.currentUser?.photoURL || "",
          type: "favorite",
          targetId: profileId,
          text: null,
          read: false,
          createdAt: serverTimestamp(),
        });
        setIsFavorite(true);
      }
    } catch (e) {
      console.error("Favorite error:", e);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-rose-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Desktop Layout: 2 columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Profile Section */}
          <div className="lg:col-span-8">
            {loading ? (
              <Card className="p-6">Loading profile…</Card>
            ) : isBabysitter ? (
              <BabysitterProfile
                data={profile}
                onMessage={() => messageTargetUserId && onMessageClick?.(messageTargetUserId)}
                onLike={handleAddToFavorites}
              />
            ) : isAuPair ? (
              <AuPairProfile
                data={profile as AuPairProfileType | null}
                onMessage={() => messageTargetUserId && onMessageClick?.(messageTargetUserId)}
              />
            ) : (
              <FamilyProfile
                data={profile as FamilyProfileType | null}
                onMessage={() => messageTargetUserId && onMessageClick?.(messageTargetUserId)}
              />
            )}
          </div>

          {/* Sidebar - Desktop Only */}
          <aside className="hidden lg:block lg:col-span-4 space-y-6">
            {!isMyProfile && (
              <>
                {/* Quick Actions */}
                <Card className="p-6">
                  <h3 className="mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <Button
                      className="w-full bg-pink-500 hover:bg-pink-600"
                      onClick={handleAddToFavorites}
                      disabled={!profileUserId || isMyProfile}
                    >
                      <Heart className={`w-4 h-4 mr-2 ${isFavorite ? "fill-white" : ""}`} />
                      {isFavorite ? "Favorited" : "Add to Favorites"}
                    </Button>
                    <Button
                      className="w-full bg-blue-500 hover:bg-blue-600"
                      onClick={() => messageTargetUserId && onMessageClick?.(messageTargetUserId)}
                      disabled={!messageTargetUserId}
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Send Message
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full text-red-600 hover:text-red-700"
                    >
                      <Flag className="w-4 h-4 mr-2" />
                      Report
                    </Button>
                  </div>
                </Card>

              </>
            )}

            {/* Similar Profiles（Firestore-backed） */}
            <Card className="p-6">
              <h3 className="mb-4">
                {isBabysitter ? "Similar Babysitters" : isAuPair ? "Similar Au Pairs" : "Similar Families"}
              </h3>
              <div className="space-y-3">
                {similarProfiles.length > 0 ? (
                  similarProfiles.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-gray-50 cursor-pointer"
                      onClick={() => {
                        window.location.href = `/profile/${item.id}`;
                      }}
                    >
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-orange-300 to-rose-300" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {getSimilarTitle(item)}
                        </p>
                        <p className="truncate text-xs text-gray-500">
                          {getSimilarSubtitle(item)}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No similar profiles yet.</p>
                )}
              </div>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}
