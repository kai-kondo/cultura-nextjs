// components/ProfileLayout.tsx
"use client";

import { useEffect, useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Heart, MessageCircle, Share2, Flag, Star } from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
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

  // userType に応じて、正しいコレクションを購読
  useEffect(() => {
    if (!profileId || !userType) return;
    setLoading(true);
    const col = userType === "aupair" ? "auPairProfiles" : "familyProfiles";
    const unsub = onSnapshot(doc(db, col, profileId), (snap) => {
      setProfile(snap.exists() ? (snap.data() as any) : null);
      setLoading(false);
    });
    return () => unsub();
  }, [profileId, userType]);

  const isAuPair = userType === "aupair";
  const isMyProfile = profileId === "me"; // （通常は実ID運用、保持しておく）

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
                onMessage={() => onMessageClick?.(profileId)}
              />
            ) : (
              <FamilyProfile
                data={profile as FamilyProfileType | null}
                onMessage={() => onMessageClick?.(profileId)}
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
                    <Button className="w-full bg-pink-500 hover:bg-pink-600">
                      <Heart className="w-4 h-4 mr-2" />
                      Add to Favorites
                    </Button>
                    <Button
                      className="w-full bg-blue-500 hover:bg-blue-600"
                      onClick={() => onMessageClick?.(profileId)}
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

                {/* Match Score */}
                <Card className="p-6">
                  <h3 className="mb-4 flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    Match Score
                  </h3>
                  <div className="text-center mb-4">
                    <div className="text-5xl font-bold text-green-600 mb-2">
                      85%
                    </div>
                    <p className="text-sm text-gray-600">Great Match!</p>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Languages</span>
                      <Badge
                        variant="secondary"
                        className="bg-green-100 text-green-800"
                      >
                        ✓ Match
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">
                        {isAuPair ? "Skills" : "Requirements"}
                      </span>
                      <Badge
                        variant="secondary"
                        className="bg-green-100 text-green-800"
                      >
                        ✓ Match
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Duration</span>
                      <Badge
                        variant="secondary"
                        className="bg-green-100 text-green-800"
                      >
                        ✓ Match
                      </Badge>
                    </div>
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
