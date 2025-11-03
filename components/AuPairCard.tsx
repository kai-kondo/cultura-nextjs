import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { Badge } from "./ui/badge";

interface AuPairCardProps {
  name?: string;
  country?: string;
  flag?: string;
  imageUrl?: string;
  languages?: string[];
  skills?: Array<{ emoji?: string; name: string }>;
  duration?: string;
  availableFrom?: string;
  type?: "aupair" | "demipair" | "babysitter";
  onViewProfile?: () => void;
}

export function AuPairCard({
  name,
  country,
  flag,
  imageUrl,
  languages,
  skills,
  duration,
  availableFrom,
  type = "aupair",
  onViewProfile,
}: AuPairCardProps) {
  // Defensive fallbacks
  const displayName = name && name.trim().length > 0 ? name : "Unnamed";
  const initials = (name || "").slice(0, 2).toUpperCase() || "--";
  const photo = imageUrl && imageUrl.trim().length > 0 ? imageUrl : "/placeholder-avatar.png";
  const displayCountry = country || "";
  const displayFlag = flag || "";
  const displayLanguages = (languages && languages.length > 0) ? languages.join(", ") : "—";
  const availabilityParts: string[] = [];
  if (duration && duration.trim()) availabilityParts.push(duration);
  if (availableFrom && availableFrom.trim()) availabilityParts.push(`From ${availableFrom}`);
  const displayAvailability = availabilityParts.length ? availabilityParts.join(" · ") : "—";

  // Type badge configuration (fallback to aupair if unknown)
  const typeConfig: Record<string, { label: string; emoji: string; className: string }> = {
    aupair: {
      label: "Au Pair",
      emoji: "👨‍👩‍👧‍👦",
      className: "bg-gradient-to-r from-orange-500 to-orange-600 text-white",
    },
    demipair: {
      label: "Demi Pair",
      emoji: "🎓",
      className: "bg-gradient-to-r from-rose-500 to-pink-600 text-white",
    },
    babysitter: {
      label: "Babysitter",
      emoji: "👶",
      className: "bg-gradient-to-r from-purple-500 to-indigo-600 text-white",
    },
  };
  const safeType = ["aupair", "demipair", "babysitter"].includes(type) ? type : "aupair";

  return (
    <Card
      className="
        group relative flex flex-col
        rounded-2xl border border-gray-200 bg-white
        shadow-sm hover:shadow-md transition-shadow
        focus-within:ring-2 focus-within:ring-orange-400/70
        h-full w-full
      "
    >
      {/* Cover image (4:3 固定) */}
      <div className="relative">
        <div className="aspect-[4/3] w-full overflow-hidden rounded-t-2xl bg-gray-100">
          <img
            src={photo}
            alt={`${displayName}'s profile photo`}
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

      {/* ★ アバターは画像セクションの外に出し、負のマージンで重ねる（クリップ回避） */}
      <div className="-mt-6 flex justify-center relative z-10">
        <Avatar className="w-16 h-16 ring-4 ring-white shadow-md bg-white">
          <AvatarImage src={photo} alt={`${displayName} avatar`} />
          <AvatarFallback className="text-sm font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 pt-4 pb-4">
        <div className="text-center">
          <h3 className="text-base font-semibold text-gray-900 mb-1">{displayName}</h3>
          <p className="text-xs text-gray-500">
            <span aria-hidden>{displayFlag}</span>{" "}
            <span className="align-middle">{displayCountry}</span>
          </p>
        </div>

        {/* Languages */}
        <div className="mt-3">
          <p className="text-xs font-medium text-gray-600 mb-1">Languages</p>
          <p className="text-sm text-gray-700 line-clamp-2">{displayLanguages}</p>
        </div>

        {/* Skills */}
        <div className="mt-3">
          <p className="text-xs font-medium text-gray-600 mb-1">Skills</p>
          {skills && skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, i) => (
                <Badge
                  key={`${skill.name}-${i}`}
                  variant="secondary"
                  className="text-xs font-medium border border-gray-200 bg-gray-50 text-gray-800 px-2.5 py-1 rounded-full"
                  title={skill.name}
                >
                  <span aria-hidden className="mr-1">{skill.emoji || "✨"}</span>
                  {skill.name}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-700">—</p>
          )}
        </div>

        {/* Availability */}
        <div className="mt-3">
          <p className="text-xs font-medium text-gray-600 mb-1">Available</p>
          <p className="text-sm text-gray-700">{displayAvailability}</p>
        </div>
      </div>

      {/* View Profile Button */}
      <div className="px-4 pb-4">
        <Button
          variant="default"
          size="sm"
          className="w-full h-10 bg-gradient-to-r from-orange-500 to-rose-600 text-white hover:from-orange-600 hover:to-rose-700 shadow-sm"
          onClick={onViewProfile}
          aria-label={`View ${displayName}'s profile`}
        >
          View Profile
        </Button>
      </div>
    </Card>
  );
}
