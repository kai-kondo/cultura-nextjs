import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import {
  BadgeCheck,
  BookOpen,
  Briefcase,
  Calendar,
  Globe,
  Heart,
  Home,
  Image as ImageIcon,
  Languages,
  MapPin,
  MessageCircle,
  Sparkles,
  Star,
} from "lucide-react";
import type { AuPairProfile as AuPairProfileType } from "@/lib/types";

interface AuPairProfileProps {
  data: AuPairProfileType | null;
  onLike?: () => void;
  onMessage?: () => void;
}

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="rounded-2xl border border-orange-100 bg-white/90 p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-100 text-orange-600">
          {icon}
        </div>
        <h2 className="text-base font-semibold text-gray-900">{title}</h2>
      </div>
      {children}
    </Card>
  );
}

function formatWorkingStyle(value?: string) {
  const labels: Record<string, string> = {
    hourly: "Hourly",
    parttime: "Part-time",
    flexible: "Flexible",
    fulltime: "Full-time",
  };

  return value ? labels[value] || value : "Full-time";
}

export default function AuPairProfile({
  data,
  onLike,
  onMessage,
}: AuPairProfileProps) {
  const profile = (data || {}) as any;

  const name = profile?.name || "Unnamed Au Pair";
  const initials = name.slice(0, 2).toUpperCase();
  const age = typeof profile?.age === "number" ? profile.age : undefined;
  const nationality = profile?.nationality || "";
  const photo =
    profile?.profileImage ||
    profile?.photo ||
    profile?.imageUrl ||
    profile?.galleryImages?.[0] ||
    profile?.photos?.[0] ||
    "/placeholder-avatar.svg";

  const currentLocation = profile?.currentLocation || profile?.location || {};
  const city = currentLocation?.city || "";
  const country = currentLocation?.country || "";
  const locationLabel = [city, country].filter(Boolean).join(", ");

  const availability = profile?.availability || {};
  const availableFrom = availability?.availableFrom || profile?.availableFrom || "";
  const duration = availability?.duration || profile?.duration || "";
  const workingHoursType = availability?.workingHoursType || profile?.workingHoursType;
  const preferredDays = availability?.preferredDays || profile?.preferredDays || [];
  const status = availability?.status || profile?.status || "";

  const aboutMe = profile?.aboutMe || "";
  const skills = Array.isArray(profile?.skills) ? profile.skills : [];
  const canTeach = Array.isArray(profile?.canTeach) ? profile.canTeach : [];
  const experience = Array.isArray(profile?.experience) ? profile.experience : [];
  const certifications = Array.isArray(profile?.certifications)
    ? profile.certifications
    : [];
  const personalityTraits = Array.isArray(profile?.personalityTraits)
    ? profile.personalityTraits
    : [];
  const desiredCountries = Array.isArray(profile?.desiredCountries)
    ? profile.desiredCountries
    : [];

  const languages = profile?.languages || {};
  const primaryLanguage = languages?.primary;
  const secondaryLanguages = Array.isArray(languages?.secondary)
    ? languages.secondary
    : [];

  const galleryPhotos = Array.isArray(profile?.galleryImages)
    ? profile.galleryImages
    : Array.isArray(profile?.galleryPhotos)
      ? profile.galleryPhotos
      : Array.isArray(profile?.photos)
        ? profile.photos
        : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-rose-50 pb-24">
      <div className="mx-auto max-w-5xl px-4 py-6">
        <Card className="overflow-hidden rounded-3xl border border-orange-100 bg-white shadow-sm">
          <div className="relative h-56 bg-gradient-to-r from-orange-400 via-amber-400 to-rose-500 sm:h-72">
            <img
              src={photo}
              alt={`${name}'s profile photo`}
              className="h-full w-full object-cover opacity-80 mix-blend-overlay"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />

            <div className="absolute bottom-5 left-5 right-5 flex items-end gap-4">
              <Avatar className="h-24 w-24 border-4 border-white bg-white shadow-lg">
                <AvatarImage src={photo} alt={`${name} avatar`} />
                <AvatarFallback>{initials || "--"}</AvatarFallback>
              </Avatar>

              <div className="min-w-0 flex-1 text-white">
                <Badge className="mb-2 bg-white/90 text-orange-700 shadow-sm">
                  <Home className="mr-1 h-3 w-3" />
                  Au Pair Profile
                </Badge>
                <h1 className="truncate text-2xl font-semibold sm:text-3xl">
                  {name}{age !== undefined ? `, ${age}` : ""}
                </h1>
                {locationLabel || nationality ? (
                  <p className="mt-1 flex items-center gap-1 text-sm text-white/90">
                    <MapPin className="h-4 w-4" />
                    {[locationLabel, nationality].filter(Boolean).join(" · ")}
                  </p>
                ) : null}
              </div>
            </div>
          </div>

          <div className="grid gap-3 p-5 sm:grid-cols-3">
            <div className="rounded-2xl bg-orange-50 p-4">
              <div className="mb-1 flex items-center gap-2 text-xs font-medium text-orange-600">
                <Calendar className="h-4 w-4" />
                Available From
              </div>
              <p className="text-lg font-semibold text-gray-900">
                {availableFrom || "Not set yet"}
              </p>
            </div>

            <div className="rounded-2xl bg-orange-50 p-4">
              <div className="mb-1 flex items-center gap-2 text-xs font-medium text-orange-600">
                <Briefcase className="h-4 w-4" />
                Preferred Duration
              </div>
              <p className="text-lg font-semibold text-gray-900">
                {duration || "Flexible"}
              </p>
            </div>

            <div className="rounded-2xl bg-orange-50 p-4">
              <div className="mb-1 flex items-center gap-2 text-xs font-medium text-orange-600">
                <Globe className="h-4 w-4" />
                Work Style
              </div>
              <p className="text-lg font-semibold text-gray-900">
                {formatWorkingStyle(workingHoursType)}
              </p>
            </div>
          </div>
        </Card>

        <div className="mt-5 grid gap-5 lg:grid-cols-[1.4fr_0.9fr]">
          <div className="space-y-5">
            {aboutMe ? (
              <Section icon={<Sparkles className="h-4 w-4" />} title="About Me">
                <p className="whitespace-pre-line leading-relaxed text-gray-700">
                  {aboutMe}
                </p>
              </Section>
            ) : null}

            <Section icon={<Calendar className="h-4 w-4" />} title="Availability">
              <div className="space-y-3 text-sm text-gray-700">
                {status ? (
                  <div className="rounded-xl bg-orange-50 px-3 py-2">
                    <span className="font-medium text-gray-900">Status:</span> {status}
                  </div>
                ) : null}

                <div className="rounded-xl bg-orange-50 px-3 py-2">
                  <span className="font-medium text-gray-900">Available from:</span>{" "}
                  {availableFrom || "Not set yet"}
                </div>

                <div className="rounded-xl bg-orange-50 px-3 py-2">
                  <span className="font-medium text-gray-900">Preferred duration:</span>{" "}
                  {duration || "Flexible"}
                </div>

                <div className="rounded-xl bg-orange-50 px-3 py-2">
                  <span className="font-medium text-gray-900">Working style:</span>{" "}
                  {formatWorkingStyle(workingHoursType)}
                </div>

                {preferredDays.length > 0 ? (
                  <div className="rounded-xl bg-orange-50 px-3 py-2">
                    <span className="font-medium text-gray-900">Preferred days:</span>{" "}
                    {preferredDays.join(", ")}
                  </div>
                ) : null}
              </div>
            </Section>

            {experience.length > 0 ? (
              <Section icon={<Star className="h-4 w-4" />} title="Experience">
                <div className="space-y-3 text-sm text-gray-700">
                  {experience.map((item: any, index: number) => (
                    <div
                      key={`${item?.type || "experience"}-${index}`}
                      className="rounded-xl border border-orange-100 bg-white px-3 py-2"
                    >
                      {item?.type ? (
                        <p className="mb-1 text-xs font-medium uppercase tracking-wide text-orange-600">
                          {item.type}
                        </p>
                      ) : null}
                      <p>{item?.description || item}</p>
                    </div>
                  ))}
                </div>
              </Section>
            ) : null}

            {galleryPhotos.length > 0 ? (
              <Section icon={<ImageIcon className="h-4 w-4" />} title="Photos">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {galleryPhotos.slice(0, 6).map((src: string, index: number) => (
                    <div
                      key={`${src}-${index}`}
                      className="aspect-square overflow-hidden rounded-2xl bg-gray-100"
                    >
                      <img
                        src={src}
                        alt={`${name} gallery ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </Section>
            ) : null}
          </div>

          <div className="space-y-5">
            <Section icon={<Languages className="h-4 w-4" />} title="Languages">
              <div className="space-y-2 text-sm">
                {primaryLanguage ? (
                  <div className="flex items-center justify-between rounded-xl bg-orange-50 px-3 py-2">
                    <span className="text-gray-800">
                      {primaryLanguage?.language || primaryLanguage?.name || primaryLanguage}
                    </span>
                    <span className="text-xs text-orange-600">
                      {primaryLanguage?.proficiency || primaryLanguage?.level || "Primary"}
                    </span>
                  </div>
                ) : null}

                {secondaryLanguages.map((language: any, index: number) => (
                  <div
                    key={`${language?.language || language?.name || language}-${index}`}
                    className="flex items-center justify-between rounded-xl bg-orange-50 px-3 py-2"
                  >
                    <span className="text-gray-800">
                      {language?.language || language?.name || language}
                    </span>
                    <span className="text-xs text-orange-600">
                      {language?.proficiency || language?.level || "Secondary"}
                    </span>
                  </div>
                ))}

                {!primaryLanguage && secondaryLanguages.length === 0 ? (
                  <p className="text-sm text-gray-500">No language information yet.</p>
                ) : null}
              </div>
            </Section>

            {(skills.length > 0 || canTeach.length > 0) ? (
              <Section icon={<BookOpen className="h-4 w-4" />} title="Skills & Teaching">
                <div className="space-y-4">
                  {skills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {skills.map((skill: any, index: number) => (
                        <Badge
                          key={`${skill?.name || skill}-${index}`}
                          className="rounded-full bg-orange-100 px-3 py-1 text-orange-800 hover:bg-orange-100"
                        >
                          {skill?.emoji ? `${skill.emoji} ` : "✨ "}
                          {skill?.name || skill}
                          {skill?.years
                            ? ` · ${skill.years} year${Number(skill.years) === 1 ? "" : "s"}`
                            : ""}
                          {skill?.level ? ` · ${skill.level}` : ""}
                        </Badge>
                      ))}
                    </div>
                  ) : null}

                  {canTeach.length > 0 ? (
                    <div>
                      <p className="mb-2 text-sm font-medium text-gray-900">Can Teach</p>
                      <div className="flex flex-wrap gap-2">
                        {canTeach.map((skill: string, index: number) => (
                          <Badge
                            key={`${skill}-${index}`}
                            className="rounded-full bg-amber-100 px-3 py-1 text-amber-800 hover:bg-amber-100"
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              </Section>
            ) : null}

            {(certifications.length > 0 || personalityTraits.length > 0) ? (
              <Section icon={<BadgeCheck className="h-4 w-4" />} title="Trust & Personality">
                <div className="space-y-4">
                  {certifications.length > 0 ? (
                    <div>
                      <p className="mb-2 text-sm font-medium text-gray-900">Certifications</p>
                      <div className="flex flex-wrap gap-2">
                        {certifications.map((certification: any, index: number) => (
                          <Badge
                            key={`${certification?.name || certification}-${index}`}
                            className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-800 hover:bg-emerald-100"
                          >
                            {certification?.name || certification}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {personalityTraits.length > 0 ? (
                    <div>
                      <p className="mb-2 text-sm font-medium text-gray-900">Personality Traits</p>
                      <div className="flex flex-wrap gap-2">
                        {personalityTraits.map((trait: string, index: number) => (
                          <Badge
                            key={`${trait}-${index}`}
                            className="rounded-full bg-rose-100 px-3 py-1 text-rose-800 hover:bg-rose-100"
                          >
                            {trait}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              </Section>
            ) : null}

            {desiredCountries.length > 0 ? (
              <Section icon={<MapPin className="h-4 w-4" />} title="Preferred Locations">
                <div className="flex flex-wrap gap-2">
                  {desiredCountries.map((location: any, index: number) => {
                    const countryLabel = location?.country || location;
                    const citiesLabel =
                      Array.isArray(location?.cities) && location.cities.length > 0
                        ? location.cities.join(", ")
                        : "";

                    return (
                      <Badge
                        key={`${countryLabel}-${index}`}
                        className="rounded-full bg-orange-100 px-3 py-1 text-orange-800 hover:bg-orange-100"
                      >
                        {[countryLabel, citiesLabel].filter(Boolean).join(" · ")}
                      </Badge>
                    );
                  })}
                </div>
              </Section>
            ) : null}

            <Card className="sticky top-4 rounded-2xl border border-orange-100 bg-white p-5 shadow-sm">
              <div className="space-y-3">
                <Button
                  type="button"
                  onClick={onMessage}
                  className="h-11 w-full rounded-xl bg-gradient-to-r from-orange-500 to-rose-600 text-white hover:from-orange-600 hover:to-rose-700"
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Message
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onLike}
                  className="h-11 w-full rounded-xl border-orange-200 text-orange-700 hover:bg-orange-50"
                >
                  <Heart className="mr-2 h-4 w-4" />
                  Save Profile
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}