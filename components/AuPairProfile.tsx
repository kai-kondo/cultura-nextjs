"use client";
import { useState } from "react";
import type { AuPairProfile as AuPairProfileType } from "@/lib/types";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { Separator } from "./ui/separator";
import { Dialog, DialogContent, DialogTitle } from "./ui/dialog";
import {
  MapPin,
  Heart,
  MessageCircle,
  X,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Briefcase,
  BadgeCheck,
  Sparkles,
  Globe,
  BookOpen,
  UserRound,
} from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

type Props = {
  data: AuPairProfileType | null;
  onLike?: () => void;
  onMessage?: () => void;
};

export default function AuPairProfile({ data, onLike, onMessage }: Props) {
  const gallery = data?.galleryImages ?? [];
  const avatar = data?.profileImage || "/placeholder-avatar.svg";
  const name = data?.name || "Unnamed";
  const age = typeof data?.age === "number" ? data!.age : undefined;
  const nationality = data?.nationality;
  const city = data?.currentLocation?.city;
  const country = data?.currentLocation?.country;

  const languagesPrimary = data?.languages?.primary;
  const languagesSecondary = data?.languages?.secondary ?? [];

  const skills = data?.skills ?? [];
  const canTeach = data?.canTeach ?? [];
  const certifications = data?.certifications ?? [];
  const personalityTraits = data?.personalityTraits ?? [];

  const experience = data?.experience ?? [];
  const experienceYears =
    typeof data?.experienceYears === "number" ? data.experienceYears : undefined;
  const childcareExperience = data?.childcareExperience;
  const experienceDetails = data?.experienceDetails || undefined;

  const availabilityStatus = data?.availability?.status || undefined;
  const availableFrom = data?.availability?.availableFrom || undefined;
  const duration = data?.availability?.duration || undefined;

  const aboutMe = data?.aboutMe || undefined;

  const infoChips = [
    age !== undefined ? `${age} years old` : null,
    nationality || null,
    city || country ? [city, country].filter(Boolean).join(", ") : null,
    availabilityStatus ? `Status: ${availabilityStatus}` : null,
  ].filter(Boolean) as string[];

  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  const handlePrevImage = () => {
    if (selectedImage !== null && selectedImage > 0) setSelectedImage(selectedImage - 1);
  };
  const handleNextImage = () => {
    if (selectedImage !== null && selectedImage < gallery.length - 1) setSelectedImage(selectedImage + 1);
  };

  const Section = ({
    icon,
    title,
    children,
  }: {
    icon: React.ReactNode;
    title: string;
    children: React.ReactNode;
  }) => (
    <section className="rounded-2xl border border-orange-100 bg-gradient-to-br from-white to-orange-50/40 p-4 sm:p-5">
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-100 text-orange-700">
          {icon}
        </div>
        <h3 className="text-base font-semibold text-gray-900">{title}</h3>
      </div>
      {children}
    </section>
  );

  return (
    <div className="mx-auto w-full max-w-screen-xl px-3 sm:px-4 md:px-6 lg:px-8">
      <Card className="w-full overflow-hidden border-orange-100 bg-white shadow-xl">
        <div className="bg-gradient-to-br from-orange-50 via-amber-50 to-rose-100 px-6 py-8 sm:px-8">
          <div className="flex flex-col items-center gap-5 text-center">
            <Avatar className="h-32 w-32 ring-4 ring-white shadow-lg">
              <AvatarImage src={avatar} alt={name} />
              <AvatarFallback>{name.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>

            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.2em] text-orange-600">
                  Au Pair Profile
                </p>
                <h2 className="mt-1 text-3xl font-semibold text-gray-900">
                  {name}
                  {age !== undefined ? `, ${age}` : ""}
                </h2>
                {(city || country) && (
                  <div className="mt-2 flex items-center justify-center gap-1 text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <p>
                      {city ? `${city}` : ""}
                      {city && country ? ", " : ""}
                      {country ? `${country}` : ""}
                    </p>
                  </div>
                )}
              </div>

              {infoChips.length > 0 && (
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {infoChips.map((chip, index) => (
                    <span
                      key={`${chip}-${index}`}
                      className="rounded-full border border-orange-200 bg-white/80 px-3 py-1 text-sm text-gray-700"
                    >
                      {chip}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {gallery.length > 0 && (
          <div className="px-6 py-5 sm:px-8">
            <div className="mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-orange-600" />
              <h3 className="text-base font-semibold text-gray-900">Photo Gallery</h3>
            </div>
            <div className="overflow-x-auto">
              <div className="flex gap-3 pb-2">
                {gallery.map((image, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setSelectedImage(index)}
                    className="flex-shrink-0 overflow-hidden rounded-xl border-2 border-orange-200 transition hover:border-orange-400 hover:opacity-90"
                  >
                    <ImageWithFallback
                      src={image}
                      alt={`Photo ${index + 1}`}
                      className="h-24 w-24 object-cover sm:h-28 sm:w-28"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <Separator />

        <div className="px-6 py-6 sm:px-8">
          <div className="grid gap-4 lg:grid-cols-2">
            {aboutMe && (
              <div className="lg:col-span-2">
                <Section icon={<UserRound className="h-4 w-4" />} title="About Me">
                  <p className="leading-7 text-gray-700">{aboutMe}</p>
                </Section>
              </div>
            )}

            {(languagesPrimary || languagesSecondary.length > 0) && (
              <Section icon={<Globe className="h-4 w-4" />} title="Languages">
                <div className="space-y-2 text-gray-700">
                  {languagesPrimary && (
                    <div className="rounded-xl bg-white px-3 py-2 border border-orange-100">
                      <span className="font-medium text-gray-900">Primary:</span>{" "}
                      {languagesPrimary.language} ({languagesPrimary.proficiency})
                    </div>
                  )}
                  {languagesSecondary.map((l, i) => (
                    <div
                      key={`${l.language}-${i}`}
                      className="rounded-xl bg-white px-3 py-2 border border-orange-100"
                    >
                      <span className="font-medium text-gray-900">Additional:</span>{" "}
                      {l.language} ({l.proficiency})
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {(skills.length > 0 || canTeach.length > 0) && (
              <Section icon={<BookOpen className="h-4 w-4" />} title="Skills & Teaching">
                <div className="space-y-4">
                  {skills.length > 0 && (
                    <div>
                      <p className="mb-2 text-sm font-medium text-gray-900">Skills & Interests</p>
                      <div className="flex flex-wrap gap-2">
                        {skills.map((s, i) => (
                          <span
                            key={`${s.name}-${i}`}
                            className="rounded-full bg-orange-100 px-3 py-1 text-sm text-orange-800"
                          >
                            {s.emoji ? `${s.emoji} ` : ""}
                            {s.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {canTeach.length > 0 && (
                    <div>
                      <p className="mb-2 text-sm font-medium text-gray-900">Can Teach</p>
                      <div className="flex flex-wrap gap-2">
                        {canTeach.map((skill, i) => (
                          <span
                            key={`${skill}-${i}`}
                            className="rounded-full bg-amber-100 px-3 py-1 text-sm text-amber-800"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Section>
            )}

            {(experienceYears !== undefined || experienceDetails || experience.length > 0 || childcareExperience) && (
              <Section icon={<Briefcase className="h-4 w-4" />} title="Experience">
                <div className="space-y-3 text-gray-700">
                  {experienceYears !== undefined && (
                    <div className="rounded-xl border border-orange-100 bg-white px-3 py-2">
                      <span className="font-medium text-gray-900">Experience:</span> {experienceYears}+ years
                    </div>
                  )}
                  {typeof childcareExperience === "boolean" && (
                    <div className="rounded-xl border border-orange-100 bg-white px-3 py-2">
                      <span className="font-medium text-gray-900">Childcare background:</span>{" "}
                      {childcareExperience ? "Yes" : "Not specified yet"}
                    </div>
                  )}
                  {experienceDetails && (
                    <div className="rounded-xl border border-orange-100 bg-white px-3 py-3 whitespace-pre-line leading-7">
                      {experienceDetails}
                    </div>
                  )}
                  {experience.map((e, i) => (
                    <div
                      key={`${e.type}-${i}`}
                      className="rounded-xl border border-orange-100 bg-white px-3 py-2"
                    >
                      {e.description}
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {(certifications.length > 0 || personalityTraits.length > 0) && (
              <Section icon={<BadgeCheck className="h-4 w-4" />} title="Trust & Personality">
                <div className="space-y-4">
                  {certifications.length > 0 && (
                    <div>
                      <p className="mb-2 text-sm font-medium text-gray-900">Certifications</p>
                      <div className="flex flex-wrap gap-2">
                        {certifications.map((c, i) => (
                          <span
                            key={`${c}-${i}`}
                            className="rounded-full bg-emerald-100 px-3 py-1 text-sm text-emerald-800"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {personalityTraits.length > 0 && (
                    <div>
                      <p className="mb-2 text-sm font-medium text-gray-900">Personality Traits</p>
                      <div className="flex flex-wrap gap-2">
                        {personalityTraits.map((trait, i) => (
                          <span
                            key={`${trait}-${i}`}
                            className="rounded-full bg-rose-100 px-3 py-1 text-sm text-rose-800"
                          >
                            {trait}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Section>
            )}

            {(availableFrom || duration || availabilityStatus) && (
              <Section icon={<Calendar className="h-4 w-4" />} title="Availability">
                <div className="space-y-2 text-gray-700">
                  {availabilityStatus && (
                    <div className="rounded-xl border border-orange-100 bg-white px-3 py-2">
                      <span className="font-medium text-gray-900">Status:</span> {availabilityStatus}
                    </div>
                  )}
                  {availableFrom && (
                    <div className="rounded-xl border border-orange-100 bg-white px-3 py-2">
                      <span className="font-medium text-gray-900">Available from:</span> {availableFrom}
                    </div>
                  )}
                  {duration && (
                    <div className="rounded-xl border border-orange-100 bg-white px-3 py-2">
                      <span className="font-medium text-gray-900">Preferred duration:</span> {duration}
                    </div>
                  )}
                </div>
              </Section>
            )}
          </div>
        </div>

        <Separator />

        <div className="p-6 sm:px-8 sm:py-6">
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              variant="default"
              className="flex-1 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700"
              onClick={onLike}
            >
              <Heart className="mr-2 h-4 w-4" />
              Like
            </Button>
            <Button
              variant="default"
              className="flex-1 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700"
              onClick={onMessage}
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              Message
            </Button>
          </div>
        </div>
      </Card>

      {/* Image Lightbox */}
      <Dialog open={selectedImage !== null} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl p-0 bg-black/95 border-none" aria-describedby={undefined}>
          <DialogTitle className="sr-only">Image Gallery</DialogTitle>
          <div className="relative">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white"
            >
              <X className="w-6 h-6" />
            </button>

            {selectedImage !== null && (
              <>
                <img
                  src={gallery[selectedImage]}
                  alt={`Photo ${selectedImage + 1}`}
                  className="w-full h-auto max-h-[80vh] object-contain"
                />

                {selectedImage > 0 && (
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                )}

                {selectedImage < gallery.length - 1 && (
                  <button
                    onClick={handleNextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                )}

                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm bg-black/50 px-3 py-1 rounded-full">
                  {selectedImage + 1} / {gallery.length}
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
