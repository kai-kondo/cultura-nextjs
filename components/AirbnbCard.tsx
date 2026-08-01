"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Heart, Star } from "lucide-react";
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
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&h=600&fit=crop&crop=face";

export type AirbnbCardProps = {
  id: string;
  userId?: string;
  imageUrl?: string;
  badge?: string;
  title: string;
  subtitle?: string;
  meta?: string;
  rating?: number;
  onClick?: () => void;
};

// Airbnb-style listing card: square image, pill badge top-left, wishlist
// heart top-right, bold title + one meta line underneath. The heart wires
// into the same `favorites` collection ProfileLayout.tsx uses
// (`{fromUserId}_{toUserId}`), so hearting from the home grid actually
// favorites the profile, it isn't just decorative.
export function AirbnbCard({
  id,
  userId,
  imageUrl,
  badge,
  title,
  subtitle,
  meta,
  rating,
  onClick,
}: AirbnbCardProps) {
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
      className="group block w-full cursor-pointer text-left"
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-gray-100">
        <img
          src={imageUrl || fallbackImage}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {badge ? (
          <span className="absolute left-3 top-3 rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-gray-900 shadow-sm">
            {badge}
          </span>
        ) : null}

        {userId ? (
          <button
            type="button"
            onClick={toggleFavorite}
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
            className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center transition-transform hover:scale-110"
          >
            <Heart
              className={`h-6 w-6 drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)] ${
                isFavorite ? "fill-rose-600 text-rose-600" : "fill-black/40 text-white"
              }`}
            />
          </button>
        ) : null}
      </div>

      <div className="mt-2 space-y-0.5">
        <div className="flex items-start justify-between gap-2">
          <p className="truncate text-[15px] font-medium text-gray-900">{title}</p>
          {rating ? (
            <span className="flex shrink-0 items-center gap-1 text-[13px] text-gray-900">
              <Star className="h-3.5 w-3.5 fill-gray-900" />
              {rating.toFixed(2)}
            </span>
          ) : null}
        </div>
        {subtitle ? <p className="truncate text-[13px] text-gray-500">{subtitle}</p> : null}
        {meta ? <p className="truncate text-[13px] text-gray-500">{meta}</p> : null}
      </div>
    </motion.div>
  );
}
