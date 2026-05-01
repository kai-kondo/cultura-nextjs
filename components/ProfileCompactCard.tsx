"use client";

import { motion } from "motion/react";
import { MapPin } from "lucide-react";

type ProfileCompactCardProps = {
  name?: string;
  imageUrl?: string;
  location?: string;
  profileType: "aupair" | "babysitter" | "family";
  primaryLabel?: string;
  secondaryLabel?: string;
  rating?: number;
  reviewCount?: number;
  onClick?: () => void;
};

const profileTypeLabel: Record<ProfileCompactCardProps["profileType"], string> = {
  aupair: "Au Pair",
  babysitter: "Babysitter",
  family: "Family",
};

const fallbackImage =
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop&crop=face";

export function ProfileCompactCard({
  name = "Profile",
  imageUrl,
  location,
  profileType,
  primaryLabel,
  secondaryLabel,
  rating = 5,
  reviewCount,
  onClick,
}: ProfileCompactCardProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      className="group flex w-full flex-col items-center rounded-3xl bg-white/80 px-4 py-5 text-center transition hover:bg-white hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
    >
      <div className="relative mb-3">
        <img
          src={imageUrl || fallbackImage}
          alt={name}
          className="h-24 w-24 rounded-full object-cover ring-4 ring-white shadow-md transition group-hover:scale-105"
        />
      </div>

      <p className="line-clamp-1 text-lg font-semibold text-teal-800">{name}</p>

      {location ? (
        <p className="mt-1 flex items-center justify-center gap-1 text-sm leading-relaxed text-gray-500">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span className="line-clamp-2">{location}</span>
        </p>
      ) : null}

      <div className="mt-3 flex flex-wrap justify-center gap-1.5">
        <span className="rounded-full bg-orange-50 px-2.5 py-1 text-xs font-medium text-orange-700">
          {profileTypeLabel[profileType]}
        </span>
        {primaryLabel ? (
          <span className="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-medium text-teal-700">
            {primaryLabel}
          </span>
        ) : null}
        {secondaryLabel ? (
          <span className="rounded-full bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-700">
            {secondaryLabel}
          </span>
        ) : null}
      </div>
    </motion.button>
  );
}