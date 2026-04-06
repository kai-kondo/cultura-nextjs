"use client";
import { useState } from "react";
import type { FamilyProfile as FamilyProfileType } from "@/lib/types";
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
  Home,
  Clock,
  Sparkles,
  UserRound,
  Gift,
  Bed,
  PawPrint,
} from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

type Props = {
  data: FamilyProfileType | null;
  onLike?: () => void;
  onMessage?: () => void;
};

export function FamilyProfile({ data, onLike, onMessage }: Props) {
  const gallery = data?.galleryImages ?? [];
  const avatar = data?.profileImage || "/placeholder-avatar.png";

  const familyName = data?.familyName || "Unnamed Family";
  const city = data?.location?.city;
  const country = data?.location?.country;

  const adults = data?.familyMembers?.adults;
  const children = data?.familyMembers?.children ?? [];
  const pets = data?.familyMembers?.pets ?? [];

  const lookingFor = Array.isArray(data?.lookingFor)
    ? (data?.lookingFor as string[])
    : data?.lookingFor
      ? [String(data?.lookingFor)]
      : [];

  const aboutUs = data?.aboutUs || undefined;

  const stayMonths = data?.position?.duration || undefined;
  const hoursPerWeek = data?.position?.hoursPerWeek || undefined;
  const workingHoursType = data?.position?.workingHoursType || undefined;

  const allowance = data?.offering?.allowance;
  const accommodation = data?.offering?.accommodation;
  const meals = data?.offering?.meals;
  const benefits = data?.offering?.benefits ?? [];

  const infoChips = [
    adults !== undefined ? `${adults} adult${adults > 1 ? "s" : ""}` : null,
    children.length > 0 ? `${children.length} kid${children.length > 1 ? "s" : ""}` : null,
    pets.length > 0 ? `${pets.length} pet${pets.length > 1 ? "s" : ""}` : null,
    city || country ? [city, country].filter(Boolean).join(", ") : null,
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
              <AvatarImage src={avatar} alt={familyName} />
              <AvatarFallback>{familyName.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>

            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.2em] text-orange-600">
                  Host Family Profile
                </p>
                <h2 className="mt-1 text-3xl font-semibold text-gray-900">{familyName}</h2>
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
                  {infoChips.map((chip) => (
                    <span
                      key={chip}
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
              <h3 className="text-base font-semibold text-gray-900">Family & Home Gallery</h3>
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
            {aboutUs && (
              <div className="lg:col-span-2">
                <Section icon={<UserRound className="h-4 w-4" />} title="About Our Family">
                  <p className="leading-7 text-gray-700">{aboutUs}</p>
                </Section>
              </div>
            )}

            {(adults !== undefined || children.length > 0 || pets.length > 0) && (
              <Section icon={<Home className="h-4 w-4" />} title="Family Overview">
                <div className="space-y-3 text-gray-700">
                  {adults !== undefined && (
                    <div className="rounded-xl border border-orange-100 bg-white px-3 py-2">
                      <span className="font-medium text-gray-900">Adults:</span> {adults}
                    </div>
                  )}
                  {children.length > 0 && (
                    <div className="rounded-xl border border-orange-100 bg-white px-3 py-2">
                      <span className="font-medium text-gray-900">Children:</span> {children.length}
                    </div>
                  )}
                  {pets.length > 0 && (
                    <div className="rounded-xl border border-orange-100 bg-white px-3 py-2">
                      <span className="font-medium text-gray-900">Pets:</span>{" "}
                      {pets
                        .map((pet) => {
                          if (typeof pet === "string") return pet;
                          if (pet && typeof pet === "object") {
                            const petRecord = pet as Record<string, unknown>;
                            return (
                              (typeof petRecord.type === "string" && petRecord.type) ||
                              (typeof petRecord.name === "string" && petRecord.name) ||
                              "Pet"
                            );
                          }
                          return "Pet";
                        })
                        .join(", ")}
                    </div>
                  )}
                </div>
              </Section>
            )}

            {(stayMonths || hoursPerWeek || workingHoursType || lookingFor.length > 0) && (
              <Section icon={<Clock className="h-4 w-4" />} title="Position Details">
                <div className="space-y-3 text-gray-700">
                  {stayMonths && (
                    <div className="rounded-xl border border-orange-100 bg-white px-3 py-2">
                      <span className="font-medium text-gray-900">Duration:</span> {stayMonths}
                    </div>
                  )}
                  {hoursPerWeek && (
                    <div className="rounded-xl border border-orange-100 bg-white px-3 py-2">
                      <span className="font-medium text-gray-900">Hours per week:</span> {hoursPerWeek}
                    </div>
                  )}
                  {workingHoursType && (
                    <div className="rounded-xl border border-orange-100 bg-white px-3 py-2">
                      <span className="font-medium text-gray-900">Schedule:</span> {workingHoursType}
                    </div>
                  )}
                  {lookingFor.length > 0 && (
                    <div>
                      <p className="mb-2 text-sm font-medium text-gray-900">What We&apos;re Looking For</p>
                      <div className="flex flex-wrap gap-2">
                        {lookingFor.map((item, index) => (
                          <span
                            key={`${item}-${index}`}
                            className="rounded-full bg-orange-100 px-3 py-1 text-sm text-orange-800"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Section>
            )}

            {(accommodation || meals || allowance || benefits.length > 0) && (
              <Section icon={<Gift className="h-4 w-4" />} title="Accommodation & Benefits">
                <div className="space-y-3 text-gray-700">
                  {accommodation && (
                    <div className="rounded-xl border border-orange-100 bg-white px-3 py-3">
                      <div className="mb-1 flex items-center gap-2 text-gray-900">
                        <Bed className="h-4 w-4 text-orange-600" />
                        <span className="font-medium">Accommodation</span>
                      </div>
                      <p>
                        {accommodation.type || "Accommodation provided"}
                        {accommodation.hasPrivateBathroom ? " • Private bathroom" : ""}
                      </p>
                      {accommodation.description && (
                        <p className="mt-2 whitespace-pre-line leading-7 text-gray-700">
                          {accommodation.description}
                        </p>
                      )}
                    </div>
                  )}

                  {meals && (
                    <div className="rounded-xl border border-orange-100 bg-white px-3 py-2">
                      <span className="font-medium text-gray-900">Meals:</span> {meals}
                    </div>
                  )}

                  {allowance && allowance.amount && (
                    <div className="rounded-xl border border-orange-100 bg-white px-3 py-2">
                      <span className="font-medium text-gray-900">Allowance:</span> {allowance.amount} {allowance.currency} / {allowance.frequency}
                    </div>
                  )}

                  {benefits.length > 0 && (
                    <div>
                      <p className="mb-2 text-sm font-medium text-gray-900">Benefits</p>
                      <div className="flex flex-wrap gap-2">
                        {benefits.map((benefit, index) => (
                          <span
                            key={`${benefit}-${index}`}
                            className="rounded-full bg-amber-100 px-3 py-1 text-sm text-amber-800"
                          >
                            {benefit}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Section>
            )}

            {pets.length > 0 && (
              <Section icon={<PawPrint className="h-4 w-4" />} title="Pets">
                <div className="flex flex-wrap gap-2">
                  {pets.map((pet, index) => {
                    const label =
                      typeof pet === "string"
                        ? pet
                        : pet && typeof pet === "object"
                          ? ((pet as Record<string, unknown>).type as string) ||
                            ((pet as Record<string, unknown>).name as string) ||
                            "Pet"
                          : "Pet";

                    return (
                      <span
                        key={`${label}-${index}`}
                        className="rounded-full bg-rose-100 px-3 py-1 text-sm text-rose-800"
                      >
                        {label}
                      </span>
                    );
                  })}
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

      <Dialog open={selectedImage !== null} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl border-none bg-black/95 p-0" aria-describedby={undefined}>
          <DialogTitle className="sr-only">Image Gallery</DialogTitle>
          <div className="relative">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
            >
              <X className="h-6 w-6" />
            </button>

            {selectedImage !== null && (
              <>
                <img
                  src={gallery[selectedImage]}
                  alt={`Photo ${selectedImage + 1}`}
                  className="h-auto max-h-[80vh] w-full object-contain"
                />

                {selectedImage > 0 && (
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                )}

                {selectedImage < gallery.length - 1 && (
                  <button
                    onClick={handleNextImage}
                    className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                )}

                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-sm text-white">
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
