import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { Badge } from "./ui/badge";

interface AuPairCardProps {
  name: string;
  country: string;
  flag: string;
  imageUrl: string;
  languages: string[];
  skills: Array<{ emoji: string; name: string }>;
  duration: string;
  availableFrom: string;
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
  // Type badge configuration
  const typeConfig = {
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
  return (
    <Card
      className="
        group relative h-full flex flex-col
        rounded-2xl border border-gray-200 bg-white
        shadow-sm hover:shadow-md transition-shadow
        focus-within:ring-2 focus-within:ring-orange-400/70
      "
    >
      {/* Cover image (4:3 固定) */}
      <div className="relative">
        <div className="aspect-[4/3] w-full overflow-hidden rounded-t-2xl bg-gray-100">
          <img
            src={imageUrl}
            alt={`${name}'s profile photo`}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        </div>

        {/* Type Badge */}
        <div className="absolute top-3 right-3 z-10">
          <Badge
            className={`${typeConfig[type].className} shadow-lg px-3 py-1.5 text-xs font-semibold`}
          >
            <span className="mr-1.5" aria-hidden>
              {typeConfig[type].emoji}
            </span>
            {typeConfig[type].label}
          </Badge>
        </div>
      </div>

      {/* ★ アバターは画像セクションの外に出し、負のマージンで重ねる（クリップ回避） */}
      <div className="-mt-6 flex justify-center relative z-10">
        <Avatar className="w-16 h-16 ring-4 ring-white shadow-md bg-white">
          <AvatarImage src={imageUrl} alt={`${name} avatar`} />
          <AvatarFallback className="text-sm font-semibold">
            {name.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 pt-4 pb-4">
        <div className="text-center">
          <h3 className="text-base font-semibold text-gray-900 mb-1">{name}</h3>
          <p className="text-xs text-gray-500">
            <span aria-hidden>{flag}</span>{" "}
            <span className="align-middle">{country}</span>
          </p>
        </div>

        {/* Languages */}
        <div className="mt-3">
          <p className="text-xs font-medium text-gray-600 mb-1">Languages</p>
          <p className="text-sm text-gray-700 line-clamp-2">
            {languages.join(", ")}
          </p>
        </div>

        {/* Skills */}
        <div className="mt-3">
          <p className="text-xs font-medium text-gray-600 mb-1">Skills</p>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, i) => (
              <Badge
                key={`${skill.name}-${i}`}
                variant="secondary"
                className="text-xs font-medium border border-gray-200 bg-gray-50 text-gray-800 px-2.5 py-1 rounded-full"
                title={skill.name}
              >
                <span aria-hidden className="mr-1">
                  {skill.emoji}
                </span>
                {skill.name}
              </Badge>
            ))}
          </div>
        </div>

        {/* Availability */}
        <div className="mt-3">
          <p className="text-xs font-medium text-gray-600 mb-1">Available</p>
          <p className="text-sm text-gray-700">
            {duration} <span className="text-gray-400">•</span> From{" "}
            {availableFrom}
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
          aria-label={`View ${name}'s profile`}
        >
          View Profile
        </Button>
      </div>
    </Card>
  );
}
