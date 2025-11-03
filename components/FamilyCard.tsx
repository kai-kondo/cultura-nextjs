import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Users } from "lucide-react";

interface FamilyCardProps {
  name?: string;
  location?: string;
  flag?: string;
  imageUrl?: string;
  languages?: string[];
  children?: Array<{ age?: number; emoji?: string }>;
  lookingFor?: string[];
  duration?: string;
  startDate?: string;
  lookingForType?: "aupair" | "demipair" | "babysitter";
  onViewProfile?: () => void;
}

export function FamilyCard({
  name,
  location,
  flag,
  imageUrl,
  languages,
  children,
  lookingFor,
  duration,
  startDate,
  lookingForType = "aupair",
  onViewProfile,
}: FamilyCardProps) {
  // Fallbacks
  const displayName = name || "Unnamed Family";
  const displayLocation = location || "Unknown Location";
  const displayFlag = flag || "";
  const photo =
    imageUrl && imageUrl.trim().length > 0
      ? imageUrl
      : "/placeholder-family.jpg";
  const safeLanguages = languages && languages.length > 0 ? languages : ["—"];
  const safeChildren = children && children.length > 0 ? children : [];
  const safeLookingFor =
    lookingFor && lookingFor.length > 0 ? lookingFor : ["—"];
  const displayDuration = duration || "—";
  const displayStartDate = startDate || "—";

  // Type badge config
  const typeConfig = {
    aupair: {
      label: "Looking for Au Pair",
      emoji: "👨‍👩‍👧‍👦",
      className: "bg-gradient-to-r from-orange-500 to-orange-600 text-white",
    },
    demipair: {
      label: "Looking for Demi Pair",
      emoji: "🎓",
      className: "bg-gradient-to-r from-rose-500 to-pink-600 text-white",
    },
    babysitter: {
      label: "Looking for Babysitter",
      emoji: "👶",
      className: "bg-gradient-to-r from-purple-500 to-indigo-600 text-white",
    },
  };
  const safeType =
    ["aupair", "demipair", "babysitter"].includes(lookingForType)
      ? lookingForType
      : "aupair";

  return (
    <Card
      className="
        group relative h-full flex flex-col
        rounded-2xl border border-gray-200 bg-white
        shadow-sm hover:shadow-md transition-shadow
        focus-within:ring-2 focus-within:ring-orange-400/70
      "
    >
      {/* Cover image */}
      <div className="relative">
        <div className="aspect-[4/3] w-full overflow-hidden rounded-t-2xl bg-gray-100">
          <img
            src={photo}
            alt={`${displayName} home`}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        </div>

        {/* Type Badge */}
        <div className="absolute top-3 right-3 z-10">
          <Badge
            className={`${typeConfig[safeType].className} shadow-lg px-3 py-1.5 text-xs font-semibold`}
          >
            <span className="mr-1.5" aria-hidden>
              {typeConfig[safeType].emoji}
            </span>
            {typeConfig[safeType].label}
          </Badge>
        </div>
      </div>

      {/* Avatar */}
      <div className="-mt-6 flex justify-center relative z-10">
        <Avatar className="w-16 h-16 ring-4 ring-white shadow-md bg-white">
          <AvatarImage src={photo} alt={`${displayName} avatar`} />
          <AvatarFallback className="bg-gray-100 flex items-center justify-center">
            <Users className="w-6 h-6 text-gray-400" />
          </AvatarFallback>
        </Avatar>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 pt-4 pb-4">
        <div className="text-center">
          <h3 className="text-base font-semibold text-gray-900 mb-1">
            {displayName}
          </h3>
          <p className="text-xs text-gray-500">
            <span aria-hidden>{displayFlag}</span>{" "}
            <span className="align-middle">{displayLocation}</span>
          </p>
        </div>

        {/* Languages */}
        <div className="mt-3">
          <p className="text-xs font-medium text-gray-600 mb-1">Languages</p>
          <p className="text-sm text-gray-700 line-clamp-2">
            {safeLanguages.join(", ")}
          </p>
        </div>

        {/* Children */}
        <div className="mt-3">
          <p className="text-xs font-medium text-gray-600 mb-1">Children</p>
          {safeChildren.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {safeChildren.map((child, i) => (
                <Badge
                  key={`${child?.emoji || "child"}-${i}`}
                  variant="secondary"
                  className="text-xs font-medium border border-gray-200 bg-gray-50 text-gray-800 px-2.5 py-1 rounded-full"
                >
                  <span aria-hidden className="mr-1">
                    {child?.emoji || "👶"}
                  </span>
                  {child?.age ? `${child.age}y` : "—"}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-700">—</p>
          )}
        </div>

        {/* Looking For */}
        <div className="mt-3">
          <p className="text-xs font-medium text-gray-600 mb-1">Looking For</p>
          {safeLookingFor.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {safeLookingFor.map((skill, i) => (
                <Badge
                  key={`${skill}-${i}`}
                  variant="secondary"
                  className="text-xs font-medium border border-gray-200 bg-gray-50 text-gray-800 px-2.5 py-1 rounded-full"
                >
                  {skill}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-700">—</p>
          )}
        </div>

        {/* Duration */}
        <div className="mt-3">
          <p className="text-xs font-medium text-gray-600 mb-1">
            Position Details
          </p>
          <p className="text-sm text-gray-700">
            {displayDuration} <span className="text-gray-400">•</span> From{" "}
            {displayStartDate}
          </p>
        </div>
      </div>

      {/* View Profile Button */}
      <div className="px-4 pb-4">
        <Button
          variant="default"
          size="sm"
          className="w-full h-10 bg-gradient-to-r from-orange-500 to-rose-600 text-white hover:from-orange-600 hover:to-rose-700 shadow-sm"
          onClick={onViewProfile}
          aria-label={`View ${displayName} profile`}
        >
          View Profile
        </Button>
      </div>
    </Card>
  );
}
