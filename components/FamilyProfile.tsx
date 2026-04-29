import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import {
  Bed,
  Briefcase,
  Calendar,
  Gift,
  Heart,
  Home,
  Languages,
  MapPin,
  MessageCircle,
  PawPrint,
  Sparkles,
  Users,
  Wallet,
} from "lucide-react";
import type { FamilyProfile as FamilyProfileType } from "@/lib/types";

interface FamilyProfileProps {
  data: FamilyProfileType | null;
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
    <Card className="rounded-2xl border border-emerald-100 bg-white/90 p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
          {icon}
        </div>
        <h2 className="text-base font-semibold text-gray-900">{title}</h2>
      </div>
      {children}
    </Card>
  );
}

function formatLookingFor(value: string) {
  const labels: Record<string, string> = {
    aupair: "Au Pair",
    demipair: "Demi Pair",
    babysitter: "Babysitter",
  };

  return labels[value] || value;
}

function formatPet(pet: unknown) {
  if (typeof pet === "string") return pet;
  if (pet && typeof pet === "object") {
    const record = pet as Record<string, unknown>;
    return (
      (typeof record.name === "string" && record.name) ||
      (typeof record.type === "string" && record.type) ||
      "Pet"
    );
  }
  return "Pet";
}

export function FamilyProfile({
  data,
  onLike,
  onMessage,
}: FamilyProfileProps) {
  const profile = (data || {}) as any;

  const familyName = profile?.familyName || profile?.name || "Unnamed Family";
  const initials = familyName.slice(0, 2).toUpperCase() || "--";
  const photo =
    profile?.profileImage ||
    profile?.photo ||
    profile?.imageUrl ||
    profile?.galleryImages?.[0] ||
    profile?.galleryPhotos?.[0] ||
    profile?.photos?.[0] ||
    "/placeholder-avatar.svg";

  const location = profile?.location || profile?.currentLocation || {};
  const city = location?.city || "";
  const country = location?.country || "";
  const locationLabel = [city, country].filter(Boolean).join(", ");

  const familyMembers = profile?.familyMembers || {};
  const adults = familyMembers?.adults ?? profile?.adults ?? undefined;
  const children = Array.isArray(familyMembers?.children)
    ? familyMembers.children
    : Array.isArray(profile?.children)
      ? profile.children
      : [];
  const pets = Array.isArray(familyMembers?.pets)
    ? familyMembers.pets
    : Array.isArray(profile?.pets)
      ? profile.pets
      : [];

  const lookingFor = Array.isArray(profile?.lookingFor)
    ? profile.lookingFor
    : profile?.lookingFor
      ? [profile.lookingFor]
      : [];

  const aboutUs = profile?.aboutUs || profile?.aboutFamily || profile?.description || "";
  const rawLanguages = profile?.languages;
  const languages = Array.isArray(rawLanguages)
    ? rawLanguages
    : rawLanguages?.primary || rawLanguages?.secondary
      ? [
          rawLanguages.primary,
          ...(Array.isArray(rawLanguages.secondary) ? rawLanguages.secondary : []),
        ].filter(Boolean)
      : rawLanguages
        ? [rawLanguages]
        : [];

  const position = profile?.position || {};
  const startDate =
    position?.startDate ||
    position?.availableFrom ||
    profile?.availableFrom ||
    "";
  const duration = position?.duration || profile?.duration || "";
  const hoursPerWeek = position?.hoursPerWeek || profile?.hoursPerWeek || "";
  const workingHoursType =
    position?.workingHoursType || profile?.workingHoursType || "Flexible";
  const responsibilities = Array.isArray(position?.responsibilities)
    ? position.responsibilities
    : Array.isArray(profile?.responsibilities)
      ? profile.responsibilities
      : [];

  const offering = profile?.offering || {};
  const allowance = offering?.allowance || profile?.allowance || null;
  const accommodation = offering?.accommodation || profile?.accommodation || null;
  const meals = offering?.meals || profile?.meals || "";
  const benefits = Array.isArray(offering?.benefits)
    ? offering.benefits
    : Array.isArray(profile?.benefits)
      ? profile.benefits
      : [];
  const houseRules = Array.isArray(profile?.houseRules) ? profile.houseRules : [];

  const galleryPhotos = Array.isArray(profile?.galleryImages)
    ? profile.galleryImages
    : Array.isArray(profile?.galleryPhotos)
      ? profile.galleryPhotos
      : Array.isArray(profile?.photos)
        ? profile.photos
        : [];

  const childrenLabel = children.length > 0
    ? `${children.length} child${children.length > 1 ? "ren" : ""}`
    : "Children not listed";
  const adultsLabel = adults !== undefined
    ? `${adults} adult${Number(adults) === 1 ? "" : "s"}`
    : "Adults not set";
  const petsLabel = pets.length > 0
    ? `${pets.length} pet${pets.length > 1 ? "s" : ""}`
    : "No pets listed";

  const allowanceLabel = allowance?.amount
    ? `${allowance.amount} ${allowance.currency || ""}${allowance.frequency ? ` / ${allowance.frequency}` : ""}`
    : typeof allowance === "string"
      ? allowance
      : "Not set yet";

  const accommodationLabel =
    typeof accommodation === "string"
      ? accommodation
      : accommodation?.type || "Not set yet";

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 pb-24">
      <div className="mx-auto max-w-5xl px-4 py-6">
        <Card className="overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-sm">
          <div className="relative h-56 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-500 sm:h-72">
            <img
              src={photo}
              alt={`${familyName}'s profile photo`}
              className="h-full w-full object-cover opacity-80 mix-blend-overlay"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />

            <div className="absolute bottom-5 left-5 right-5 flex items-end gap-4">
              <Avatar className="h-24 w-24 border-4 border-white bg-white shadow-lg">
                <AvatarImage src={photo} alt={`${familyName} avatar`} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>

              <div className="min-w-0 flex-1 text-white">
                <Badge className="mb-2 bg-white/90 text-emerald-700 shadow-sm">
                  <Home className="mr-1 h-3 w-3" />
                  Host Family Profile
                </Badge>
                <h1 className="truncate text-2xl font-semibold sm:text-3xl">
                  {familyName}
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
            <div className="rounded-2xl bg-emerald-50 p-4">
              <div className="mb-1 flex items-center gap-2 text-xs font-medium text-emerald-700">
                <Users className="h-4 w-4" />
                Family
              </div>
              <p className="text-lg font-semibold text-gray-900">{adultsLabel}</p>
              <p className="mt-1 text-sm text-gray-600">{childrenLabel}</p>
            </div>

            <div className="rounded-2xl bg-emerald-50 p-4">
              <div className="mb-1 flex items-center gap-2 text-xs font-medium text-emerald-700">
                <Calendar className="h-4 w-4" />
                Start / Duration
              </div>
              <p className="text-lg font-semibold text-gray-900">
                {startDate || "Start flexible"}
              </p>
              <p className="mt-1 text-sm text-gray-600">{duration || "Duration flexible"}</p>
            </div>

            <div className="rounded-2xl bg-emerald-50 p-4">
              <div className="mb-1 flex items-center gap-2 text-xs font-medium text-emerald-700">
                <Wallet className="h-4 w-4" />
                Allowance
              </div>
              <p className="text-lg font-semibold text-gray-900">{allowanceLabel}</p>
            </div>
          </div>
        </Card>

        <div className="mt-5 grid gap-5 lg:grid-cols-[1.4fr_0.9fr]">
          <div className="space-y-5">
            {aboutUs ? (
              <Section icon={<Sparkles className="h-4 w-4" />} title="About Our Family">
                <p className="whitespace-pre-line leading-relaxed text-gray-700">
                  {aboutUs}
                </p>
              </Section>
            ) : null}

            <Section icon={<Users className="h-4 w-4" />} title="Family Overview">
              <div className="space-y-3 text-sm text-gray-700">
                <div className="rounded-xl bg-emerald-50 px-3 py-2">
                  <span className="font-medium text-gray-900">Adults:</span>{" "}
                  {adults !== undefined ? adults : "Not set yet"}
                </div>

                <div className="rounded-xl bg-emerald-50 px-3 py-2">
                  <span className="font-medium text-gray-900">Children:</span>{" "}
                  {children.length > 0 ? children.length : "Not listed"}
                </div>

                {children.length > 0 ? (
                  <div className="space-y-2">
                    {children.map((child: any, index: number) => (
                      <div
                        key={`${child?.name || "child"}-${index}`}
                        className="rounded-xl border border-emerald-100 bg-white px-3 py-2"
                      >
                        <p className="font-medium text-gray-900">
                          {child?.name || `Child ${index + 1}`}
                        </p>
                        <p className="text-gray-600">
                          {[child?.age ? `${child.age} years old` : "", child?.gender || ""]
                            .filter(Boolean)
                            .join(" · ") || "Details not set"}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : null}

                <div className="rounded-xl bg-emerald-50 px-3 py-2">
                  <span className="font-medium text-gray-900">Pets:</span> {petsLabel}
                </div>
              </div>
            </Section>

            <Section icon={<Briefcase className="h-4 w-4" />} title="Position Details">
              <div className="space-y-3 text-sm text-gray-700">
                {lookingFor.length > 0 ? (
                  <div>
                    <p className="mb-2 text-sm font-medium text-gray-900">Looking For</p>
                    <div className="flex flex-wrap gap-2">
                      {lookingFor.map((item: string, index: number) => (
                        <Badge
                          key={`${item}-${index}`}
                          className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-800 hover:bg-emerald-100"
                        >
                          {formatLookingFor(item)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ) : null}

                <div className="rounded-xl bg-emerald-50 px-3 py-2">
                  <span className="font-medium text-gray-900">Start date:</span>{" "}
                  {startDate || "Flexible"}
                </div>

                <div className="rounded-xl bg-emerald-50 px-3 py-2">
                  <span className="font-medium text-gray-900">Duration:</span>{" "}
                  {duration || "Flexible"}
                </div>

                <div className="rounded-xl bg-emerald-50 px-3 py-2">
                  <span className="font-medium text-gray-900">Hours per week:</span>{" "}
                  {hoursPerWeek || "Not set yet"}
                </div>

                <div className="rounded-xl bg-emerald-50 px-3 py-2">
                  <span className="font-medium text-gray-900">Schedule:</span>{" "}
                  {workingHoursType || "Flexible"}
                </div>

                {responsibilities.length > 0 ? (
                  <div>
                    <p className="mb-2 text-sm font-medium text-gray-900">Responsibilities</p>
                    <div className="flex flex-wrap gap-2">
                      {responsibilities.map((item: string, index: number) => (
                        <Badge
                          key={`${item}-${index}`}
                          className="rounded-full bg-teal-100 px-3 py-1 text-teal-800 hover:bg-teal-100"
                        >
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </Section>

            {galleryPhotos.length > 0 ? (
              <Section icon={<Home className="h-4 w-4" />} title="Family & Home Photos">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {galleryPhotos.slice(0, 6).map((src: string, index: number) => (
                    <div
                      key={`${src}-${index}`}
                      className="aspect-square overflow-hidden rounded-2xl bg-gray-100"
                    >
                      <img
                        src={src}
                        alt={`${familyName} gallery ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </Section>
            ) : null}
          </div>

          <div className="space-y-5">
            <Section icon={<Gift className="h-4 w-4" />} title="Accommodation & Benefits">
              <div className="space-y-3 text-sm text-gray-700">
                <div className="rounded-xl bg-emerald-50 px-3 py-2">
                  <span className="font-medium text-gray-900">Allowance:</span>{" "}
                  {allowanceLabel}
                </div>

                <div className="rounded-xl bg-emerald-50 px-3 py-2">
                  <span className="font-medium text-gray-900">Accommodation:</span>{" "}
                  {accommodationLabel}
                </div>

                {accommodation?.description ? (
                  <div className="whitespace-pre-line rounded-xl bg-emerald-50 px-3 py-2 leading-7">
                    {accommodation.description}
                  </div>
                ) : null}

                <div className="rounded-xl bg-emerald-50 px-3 py-2">
                  <span className="font-medium text-gray-900">Meals:</span>{" "}
                  {meals || "Not set yet"}
                </div>

                {benefits.length > 0 ? (
                  <div>
                    <p className="mb-2 text-sm font-medium text-gray-900">Benefits</p>
                    <div className="flex flex-wrap gap-2">
                      {benefits.map((benefit: string, index: number) => (
                        <Badge
                          key={`${benefit}-${index}`}
                          className="rounded-full bg-amber-100 px-3 py-1 text-amber-800 hover:bg-amber-100"
                        >
                          {benefit}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </Section>

            {languages.length > 0 ? (
              <Section icon={<Languages className="h-4 w-4" />} title="Languages at Home">
                <div className="flex flex-wrap gap-2">
                  {languages.map((language: any, index: number) => {
                    const label =
                      typeof language === "string"
                        ? language
                        : language?.language || language?.name || language?.code || "Language";
                    const level =
                      typeof language === "object"
                        ? language?.proficiency || language?.level || ""
                        : "";

                    return (
                      <Badge
                        key={`${label}-${index}`}
                        className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-800 hover:bg-emerald-100"
                      >
                        {level ? `${label} · ${level}` : label}
                      </Badge>
                    );
                  })}
                </div>
              </Section>
            ) : null}

            {pets.length > 0 ? (
              <Section icon={<PawPrint className="h-4 w-4" />} title="Pets">
                <div className="flex flex-wrap gap-2">
                  {pets.map((pet: any, index: number) => {
                    const label = formatPet(pet);
                    return (
                      <Badge
                        key={`${label}-${index}`}
                        className="rounded-full bg-rose-100 px-3 py-1 text-rose-800 hover:bg-rose-100"
                      >
                        {label}
                      </Badge>
                    );
                  })}
                </div>
              </Section>
            ) : null}

            {houseRules.length > 0 ? (
              <Section icon={<Bed className="h-4 w-4" />} title="House Rules">
                <div className="flex flex-wrap gap-2">
                  {houseRules.map((rule: string, index: number) => (
                    <Badge
                      key={`${rule}-${index}`}
                      className="rounded-full bg-orange-100 px-3 py-1 text-orange-800 hover:bg-orange-100"
                    >
                      {rule}
                    </Badge>
                  ))}
                </div>
              </Section>
            ) : null}

            <Card className="sticky top-4 rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
              <div className="space-y-3">
                <Button
                  type="button"
                  onClick={onMessage}
                  className="h-11 w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700"
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Message
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onLike}
                  className="h-11 w-full rounded-xl border-emerald-200 text-emerald-700 hover:bg-emerald-50"
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