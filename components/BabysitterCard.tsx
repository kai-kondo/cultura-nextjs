import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { Badge } from "./ui/badge";

interface BabysitterCardProps {
  name?: string;
  location?: string;
  flag?: string;
  imageUrl?: string;
  languages?: string[];
  skills?: Array<{ emoji?: string; name: string }>;
  hourlyRate?: number | string | null;
  workingHoursType?: "hourly" | "parttime" | "flexible" | "fulltime";
  preferredDays?: string[];
  maxTravelDistance?: number | string | null;
  availableFrom?: string;
  onViewProfile?: () => void;
}

export function BabysitterCard({
  name,
  location,
  flag,
  imageUrl,
  languages,
  skills,
  hourlyRate,
  workingHoursType,
  preferredDays,
  maxTravelDistance,
  availableFrom,
  onViewProfile,
}: BabysitterCardProps) {
  const displayName = name && name.trim().length > 0 ? name : "Unnamed";
  const initials = (name || "").slice(0, 2).toUpperCase() || "--";
  const photo =
    imageUrl && imageUrl.trim().length > 0
      ? imageUrl
      : "/placeholder-avatar.svg";

  const displayLocation = location || "";
  const displayFlag = flag || "";
  const displayLanguages =
    languages && languages.length > 0 ? languages.join(", ") : "—";

  const displayRate =
    hourlyRate !== undefined && hourlyRate !== null && String(hourlyRate).trim()
      ? `${hourlyRate} / hour`
      : "Rate not set";

  const workingStyleLabels: Record<string, string> = {
    hourly: "Hourly",
    parttime: "Part-time",
    flexible: "Flexible",
    fulltime: "Full-time",
  };

  const displayWorkingStyle = workingHoursType
    ? workingStyleLabels[workingHoursType] || workingHoursType
    : "Flexible";

  const displayDays =
    preferredDays && preferredDays.length > 0
      ? preferredDays.join(", ")
      : "Ask availability";

  const displayDistance =
    maxTravelDistance !== undefined &&
    maxTravelDistance !== null &&
    String(maxTravelDistance).trim()
      ? `Up to ${maxTravelDistance} km`
      : "Distance flexible";

  return (
    <Card
      className="
        group relative flex flex-col
        rounded-2xl border border-purple-100 bg-white
        shadow-sm hover:shadow-md transition-shadow
        focus-within:ring-2 focus-within:ring-purple-400/70
        h-full w-full
      "
    >
      <div className="relative">
        <div className="aspect-[4/3] w-full overflow-hidden rounded-t-2xl bg-purple-50">
          <img
            src={photo}
            alt={`${displayName}'s babysitter profile photo`}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        </div>

        <div className="absolute top-3 right-3 z-10">
          <Badge className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg px-3 py-1.5 text-xs font-semibold">
            <span className="mr-1.5" aria-hidden>
              👶
            </span>
            Babysitter
          </Badge>
        </div>

        <div className="absolute bottom-3 left-3 z-10">
          <Badge className="bg-white/90 text-purple-700 shadow px-3 py-1.5 text-xs font-semibold">
            {displayRate}
          </Badge>
        </div>
      </div>

      <div className="-mt-6 flex justify-center relative z-10">
        <Avatar className="w-16 h-16 ring-4 ring-white shadow-md bg-white">
          <AvatarImage src={photo} alt={`${displayName} avatar`} />
          <AvatarFallback className="text-sm font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>
      </div>

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

        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="rounded-xl bg-purple-50 px-3 py-2">
            <p className="text-[11px] font-medium text-purple-600">
              Work Style
            </p>
            <p className="text-sm text-gray-800">{displayWorkingStyle}</p>
          </div>

          <div className="rounded-xl bg-purple-50 px-3 py-2">
            <p className="text-[11px] font-medium text-purple-600">
              Travel
            </p>
            <p className="text-sm text-gray-800">{displayDistance}</p>
          </div>
        </div>

        <div className="mt-3">
          <p className="text-xs font-medium text-gray-600 mb-1">
            Available Days
          </p>
          <p className="text-sm text-gray-700 line-clamp-1">{displayDays}</p>
        </div>

        {availableFrom ? (
          <div className="mt-3">
            <p className="text-xs font-medium text-gray-600 mb-1">
              Available From
            </p>
            <p className="text-sm text-gray-700">{availableFrom}</p>
          </div>
        ) : null}

        <div className="mt-3">
          <p className="text-xs font-medium text-gray-600 mb-1">Languages</p>
          <p className="text-sm text-gray-700 line-clamp-2">
            {displayLanguages}
          </p>
        </div>

        <div className="mt-3">
          <p className="text-xs font-medium text-gray-600 mb-1">Skills</p>
          {skills && skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {skills.slice(0, 4).map((skill, i) => (
                <Badge
                  key={`${skill.name}-${i}`}
                  variant="secondary"
                  className="text-xs font-medium border border-purple-100 bg-purple-50 text-purple-800 px-2.5 py-1 rounded-full"
                  title={skill.name}
                >
                  <span aria-hidden className="mr-1">
                    {skill.emoji || "✨"}
                  </span>
                  {skill.name}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-700">—</p>
          )}
        </div>
      </div>

      <div className="px-4 pb-4">
        <Button
          variant="default"
          size="sm"
          className="w-full h-10 bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:from-purple-600 hover:to-indigo-700 shadow-sm"
          onClick={onViewProfile}
          aria-label={`View ${displayName}'s babysitter profile`}
        >
          View Profile
        </Button>
      </div>
    </Card>
  );
}