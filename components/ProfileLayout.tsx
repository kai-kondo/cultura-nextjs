// components/ProfileLayout.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Heart, MessageCircle, Share2, Flag, Star } from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { addDoc, collection, doc, onSnapshot, setDoc, deleteDoc, getDoc, serverTimestamp } from "firebase/firestore";
import AuPairProfile from "./AuPairProfile";
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
      const ref = doc(db, "favorites", favoriteDocId);
      const snap = await getDoc(ref);
      setIsFavorite(snap.exists());
    };

    checkFavorite();
  }, [favoriteDocId]);

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
                    <Button variant="outline" className="w-full">
                      <Share2 className="w-4 h-4 mr-2" />
                      Share Profile
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

            {/* Similar Profiles（後でクエリ接続予定） */}
            <Card className="p-6">
              <h3 className="mb-4">
                {isAuPair ? "Similar Au Pairs" : "Similar Families"}
              </h3>
              <div className="space-y-3">
                {/* ここは後で Firestore クエリに差し替え */}
                <div className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-300 to-rose-300 rounded-full" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">
                      {isAuPair ? "Sophie 🇫🇷" : "Smith Family 🇬🇧"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {isAuPair ? "French, English" : "London • 2 kids"}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}
