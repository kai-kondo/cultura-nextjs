

import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import {
  Baby,
  Calendar,
  Clock,
  Heart,
  Languages,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Star,
  Wallet,
} from "lucide-react";

interface BabysitterProfileProps {
  data: any;
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
    <Card className="rounded-2xl border border-purple-100 bg-white/90 p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-100 text-purple-600">
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

  return value ? labels[value] || value : "Flexible";
}

export default function BabysitterProfile({
  data,
  onLike,
  onMessage,
}: BabysitterProfileProps) {
  const profile = data || {};

  const name = profile?.name || "Unnamed Babysitter";
  const initials = name.slice(0, 2).toUpperCase();
  const photo =
    profile?.profileImage ||
    profile?.photo ||
    profile?.imageUrl ||
    profile?.photos?.[0] ||
    "/placeholder-avatar.svg";

  const currentLocation = profile?.currentLocation || profile?.location || {};
  const city = currentLocation?.city || "";
  const country = currentLocation?.country || profile?.nationality || "";
  const locationLabel = [city, country].filter(Boolean).join(", ");

  const availability = profile?.availability || {};
  const hourlyRate = profile?.hourlyRate ?? profile?.rate ?? null;
  const workingHoursType = availability?.workingHoursType || profile?.workingHoursType;
  const preferredDays = availability?.preferredDays || profile?.preferredDays || [];
  const maxTravelDistance =
    availability?.maxTravelDistance ?? profile?.maxTravelDistance ?? null;
  const availableFrom = availability?.availableFrom || profile?.availableFrom || "";

  const skills = Array.isArray(profile?.skills) ? profile.skills : [];
  const experience = Array.isArray(profile?.experience) ? profile.experience : [];
  const certifications = Array.isArray(profile?.certifications)
    ? profile.certifications
    : [];
  const desiredCountries = Array.isArray(profile?.desiredCountries)
    ? profile.desiredCountries
    : [];

  const languages = profile?.languages || {};
  const primaryLanguage = languages?.primary;
  const secondaryLanguages = Array.isArray(languages?.secondary)
    ? languages.secondary
    : [];

  const galleryPhotos = Array.isArray(profile?.galleryPhotos)
    ? profile.galleryPhotos
    : Array.isArray(profile?.photos)
      ? profile.photos
      : [];

  const displayRate =
    hourlyRate !== null && hourlyRate !== undefined && String(hourlyRate).trim()
      ? `${hourlyRate} / hour`
      : "Rate not set";

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 pb-24">
      <div className="mx-auto max-w-5xl px-4 py-6">
        <Card className="overflow-hidden rounded-3xl border border-purple-100 bg-white shadow-sm">
          <div className="relative h-56 bg-gradient-to-r from-purple-400 via-fuchsia-400 to-indigo-500 sm:h-72">
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
                <Badge className="mb-2 bg-white/90 text-purple-700 shadow-sm">
                  <Baby className="mr-1 h-3 w-3" />
                  Babysitter Profile
                </Badge>
                <h1 className="truncate text-2xl font-semibold sm:text-3xl">
                  {name}
                </h1>
                {locationLabel ? (
                  <p className="mt-1 flex items-center gap-1 text-sm text-white/90">
                    <MapPin className="h-4 w-4" />
                    {locationLabel}
                  </p>
                ) : null}
              </div>
            </div>
          </div>

          <div className="grid gap-3 p-5 sm:grid-cols-3">
            <div className="rounded-2xl bg-purple-50 p-4">
              <div className="mb-1 flex items-center gap-2 text-xs font-medium text-purple-600">
                <Wallet className="h-4 w-4" />
                Hourly Rate
              </div>
              <p className="text-lg font-semibold text-gray-900">{displayRate}</p>
            </div>

            <div className="rounded-2xl bg-purple-50 p-4">
              <div className="mb-1 flex items-center gap-2 text-xs font-medium text-purple-600">
                <Clock className="h-4 w-4" />
                Working Style
              </div>
              <p className="text-lg font-semibold text-gray-900">
                {formatWorkingStyle(workingHoursType)}
              </p>
            </div>

            <div className="rounded-2xl bg-purple-50 p-4">
              <div className="mb-1 flex items-center gap-2 text-xs font-medium text-purple-600">
                <MapPin className="h-4 w-4" />
                Travel Distance
              </div>
              <p className="text-lg font-semibold text-gray-900">
                {maxTravelDistance ? `Up to ${maxTravelDistance} km` : "Flexible"}
              </p>
            </div>
          </div>
        </Card>

        <div className="mt-5 grid gap-5 lg:grid-cols-[1.4fr_0.9fr]">
          <div className="space-y-5">
            {profile?.aboutMe ? (
              <Section icon={<Sparkles className="h-4 w-4" />} title="About Me">
                <p className="whitespace-pre-line leading-relaxed text-gray-700">
                  {profile.aboutMe}
                </p>
              </Section>
            ) : null}

            <Section icon={<Calendar className="h-4 w-4" />} title="Availability">
              <div className="space-y-3 text-sm text-gray-700">
                {availableFrom ? (
                  <div className="rounded-xl bg-purple-50 px-3 py-2">
                    <span className="font-medium text-gray-900">Available from:</span>{" "}
                    {availableFrom}
                  </div>
                ) : null}

                <div className="rounded-xl bg-purple-50 px-3 py-2">
                  <span className="font-medium text-gray-900">Available days:</span>{" "}
                  {preferredDays.length > 0
                    ? preferredDays.join(", ")
                    : "Ask availability"}
                </div>

                <div className="rounded-xl bg-purple-50 px-3 py-2">
                  <span className="font-medium text-gray-900">Working style:</span>{" "}
                  {formatWorkingStyle(workingHoursType)}
                </div>

                <div className="rounded-xl bg-purple-50 px-3 py-2">
                  <span className="font-medium text-gray-900">Max travel distance:</span>{" "}
                  {maxTravelDistance ? `${maxTravelDistance} km` : "Flexible"}
                </div>
              </div>
            </Section>

            {experience.length > 0 ? (
              <Section icon={<Star className="h-4 w-4" />} title="Experience">
                <div className="space-y-3 text-sm text-gray-700">
                  {experience.map((item: any, index: number) => (
                    <div
                      key={`${item?.type || "experience"}-${index}`}
                      className="rounded-xl border border-purple-100 bg-white px-3 py-2"
                    >
                      {item?.type ? (
                        <p className="mb-1 text-xs font-medium uppercase tracking-wide text-purple-600">
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
              <Section icon={<Sparkles className="h-4 w-4" />} title="Photos">
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
                  <div className="flex items-center justify-between rounded-xl bg-purple-50 px-3 py-2">
                    <span className="text-gray-800">
                      {primaryLanguage?.language || primaryLanguage?.name || primaryLanguage}
                    </span>
                    <span className="text-xs text-purple-600">
                      {primaryLanguage?.proficiency || primaryLanguage?.level || "Primary"}
                    </span>
                  </div>
                ) : null}

                {secondaryLanguages.map((language: any, index: number) => (
                  <div
                    key={`${language?.language || language?.name || language}-${index}`}
                    className="flex items-center justify-between rounded-xl bg-purple-50 px-3 py-2"
                  >
                    <span className="text-gray-800">
                      {language?.language || language?.name || language}
                    </span>
                    <span className="text-xs text-purple-600">
                      {language?.proficiency || language?.level || "Secondary"}
                    </span>
                  </div>
                ))}

                {!primaryLanguage && secondaryLanguages.length === 0 ? (
                  <p className="text-sm text-gray-500">No language information yet.</p>
                ) : null}
              </div>
            </Section>

            {skills.length > 0 ? (
              <Section icon={<Sparkles className="h-4 w-4" />} title="Skills">
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill: any, index: number) => (
                    <Badge
                      key={`${skill?.name || skill}-${index}`}
                      className="rounded-full bg-purple-100 px-3 py-1 text-purple-800 hover:bg-purple-100"
                    >
                      {skill?.emoji ? `${skill.emoji} ` : "✨ "}
                      {skill?.name || skill}
                      {skill?.years
                        ? ` · ${skill.years} year${Number(skill.years) === 1 ? "" : "s"}`
                        : ""}
                    </Badge>
                  ))}
                </div>
              </Section>
            ) : null}

            {certifications.length > 0 ? (
              <Section icon={<ShieldCheck className="h-4 w-4" />} title="Certifications">
                <div className="flex flex-wrap gap-2">
                  {certifications.map((certification: any, index: number) => (
                    <Badge
                      key={`${certification?.name || certification}-${index}`}
                      className="rounded-full bg-indigo-100 px-3 py-1 text-indigo-800 hover:bg-indigo-100"
                    >
                      {certification?.name || certification}
                    </Badge>
                  ))}
                </div>
              </Section>
            ) : null}

            {desiredCountries.length > 0 ? (
              <Section icon={<MapPin className="h-4 w-4" />} title="Preferred Work Areas">
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
                        className="rounded-full bg-purple-100 px-3 py-1 text-purple-800 hover:bg-purple-100"
                      >
                        {[countryLabel, citiesLabel].filter(Boolean).join(" · ")}
                      </Badge>
                    );
                  })}
                </div>
              </Section>
            ) : null}

            <Card className="sticky top-4 rounded-2xl border border-purple-100 bg-white p-5 shadow-sm">
              <div className="space-y-3">
                <Button
                  type="button"
                  onClick={onMessage}
                  className="h-11 w-full rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:from-purple-600 hover:to-indigo-700"
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Message
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onLike}
                  className="h-11 w-full rounded-xl border-purple-200 text-purple-700 hover:bg-purple-50"
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