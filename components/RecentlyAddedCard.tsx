"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Heart, Sparkles } from "lucide-react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

const fallbackImage =
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop&crop=face";

export type RecentlyAddedCardProps = {
  id: string;
  userId?: string;
  imageUrl?: string;
  badge?: string;
  title: string;
  subtitle?: string;
  meta?: string;
  onClick?: () => void;
};

// Horizontal "list item" card — deliberately different from AirbnbCard's
// square grid layout so the "recently added" rail reads as its own thing
// next to the "Featured" grid, not a duplicate. Same favorites wiring as
// AirbnbCard (`favorites/{fromUserId}_{toUserId}`).
export function RecentlyAddedCard({
  id,
  userId,
  imageUrl,
  badge,
  title,
  subtitle,
  meta,
  onClick,
}: RecentlyAddedCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const currentUserId = auth.currentUser?.uid ?? null;
  const favoriteDocId = currentUserId && userId ? `${currentUserId}_${userId}` : null;

  useEffect(() => {
    if (!favoriteDocId) return;
    let cancelled = false;
    getDoc(doc(db, "favorites", favoriteDocId))
      .then((snap) => {
        if (!cancelled) setIsFavorite(snap.exists());
      })
      .catch(() => {
        if (!cancelled) setIsFavorite(false);
      });
    return () => {
      cancelled = true;
    };
  }, [favoriteDocId]);

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!favoriteDocId || !currentUserId || !userId || currentUserId === userId) return;

    const ref = doc(db, "favorites", favoriteDocId);
    try {
      if (isFavorite) {
        await deleteDoc(ref);
        setIsFavorite(false);
      } else {
        await setDoc(ref, {
          fromUserId: currentUserId,
          toUserId: userId,
          createdAt: serverTimestamp(),
        });
        setIsFavorite(true);
        await addDoc(collection(db, "notifications"), {
          userId,
          actorUserId: currentUserId,
          actorName: auth.currentUser?.displayName || "Cultura member",
          actorAvatar: auth.currentUser?.photoURL || "",
          type: "favorite",
          targetId: id,
          text: null,
          read: false,
          createdAt: serverTimestamp(),
        });
      }
    } catch {
      // Keep UI usable even if the write is rejected (e.g. rules not deployed yet).
    }
  };

  return (
    <motion.div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.();
        }
      }}
      whileHover={{ y: -2 }}
      className="flex w-full cursor-pointer items-center gap-3 rounded-2xl border border-gray-100 bg-white p-3 pr-4 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-gray-100">
        <img src={imageUrl || fallbackImage} alt={title} className="h-full w-full object-cover" />
        <span className="absolute -left-1.5 -top-1.5 flex items-center gap-0.5 rounded-full bg-gradient-to-r from-orange-500 to-rose-600 px-2 py-0.5 text-[10px] font-semibold text-white shadow">
          <Sparkles className="h-2.5 w-2.5" />
          NEW
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          {badge ? (
            <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-700">
              {badge}
            </span>
          ) : null}
          <p className="truncate text-[15px] font-medium text-gray-900">{title}</p>
        </div>
        {subtitle ? <p className="truncate text-[13px] text-gray-500">{subtitle}</p> : null}
        {meta ? <p className="truncate text-[13px] text-gray-500">{meta}</p> : null}
      </div>

      {userId ? (
        <button
          type="button"
          onClick={toggleFavorite}
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-gray-300 transition-colors hover:bg-gray-50 hover:text-gray-400"
        >
          <Heart className={`h-5 w-5 ${isFavorite ? "fill-rose-600 text-rose-600" : ""}`} />
        </button>
      ) : null}
    </motion.div>
  );
}
