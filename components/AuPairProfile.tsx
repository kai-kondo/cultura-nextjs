"use client";
import { useState } from "react";
import type { AuPairProfile as AuPairProfileType } from "@/lib/types";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { Separator } from "./ui/separator";
import { Dialog, DialogContent, DialogTitle } from "./ui/dialog";
import { MapPin, Heart, MessageCircle, X, ChevronLeft, ChevronRight } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

type Props = {
  data: AuPairProfileType | null;
  onLike?: () => void;
  onMessage?: () => void;
};

export default function AuPairProfile({ data, onLike, onMessage }: Props) {
  const gallery = data?.galleryImages ?? [];
  const avatar = data?.profileImage || "/placeholder-avatar.png";
  const name = data?.name || "Unnamed";
  const age = typeof data?.age === "number" ? data!.age : undefined;
  const nationality = data?.nationality;
  const city = data?.currentLocation?.city;
  const country = data?.currentLocation?.country;

  const languagesPrimary = data?.languages?.primary
    ? `${data.languages.primary.language} (${data.languages.primary.proficiency})`
    : undefined;
  const languagesSecondary = data?.languages?.secondary ?? [];

  const skills = data?.skills ?? [];
  const experience = data?.experience ?? [];

  const availableFrom = data?.availability?.availableFrom || undefined;
  const duration = data?.availability?.duration || undefined;

  const aboutMe = data?.aboutMe || undefined;

  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  const handlePrevImage = () => {
    if (selectedImage !== null && selectedImage > 0) setSelectedImage(selectedImage - 1);
  };
  const handleNextImage = () => {
    if (selectedImage !== null && selectedImage < gallery.length - 1) setSelectedImage(selectedImage + 1);
  };

  return (
    <div className="mx-auto w-full max-w-screen-xl px-3 sm:px-4 md:px-6 lg:px-8">
      <Card className="w-full bg-white shadow-xl">
        {/* Profile Photo */}
        <div className="p-6 pb-4">
          <div className="flex justify-center">
            <Avatar className="w-32 h-32">
              <AvatarImage src={avatar} alt={name} />
              <AvatarFallback>{name.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
          </div>
        </div>

        {/* Name and Location */}
        <div className="px-6 pb-4 text-center">
          <h2 className="mb-2">
            {name}
            {age !== undefined ? `, ${age}` : ""}
            {nationality ? `  ` : ""}
            {nationality ? ` ${nationality}` : ""}
          </h2>
          {(city || country) && (
            <div className="flex items-center justify-center gap-1 text-gray-600">
              <MapPin className="w-4 h-4" />
              <p>
                {city ? `${city}` : ""}{city && country ? ", " : ""}{country ? `${country}` : ""}
              </p>
            </div>
          )}
        </div>

        {/* Photo Gallery */}
        {gallery.length > 0 && (
          <div className="px-6 pb-4">
            <h3 className="mb-3">📸 Photos</h3>
            <div className="overflow-x-auto">
              <div className="flex gap-2 pb-2">
                {gallery.map((image, index) => (
                  <div
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className="flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                  >
                    <ImageWithFallback
                      src={image}
                      alt={`Photo ${index + 1}`}
                      className="w-24 h-24 object-cover rounded-lg border-2 border-orange-200 hover:border-orange-400"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <Separator />

        {/* Content Sections */}
        <div className="px-6 py-4 space-y-4">
          {/* Languages */}
          {(languagesPrimary || languagesSecondary.length > 0) && (
            <section>
              <h3 className="mb-2">🗣️ Languages</h3>
              <ul className="space-y-1 text-gray-700">
                {languagesPrimary && <li>• {languagesPrimary}</li>}
                {languagesSecondary.map((l, i) => (
                  <li key={i}>• {l.language} ({l.proficiency})</li>
                ))}
              </ul>
            </section>
          )}

          {/* Experience */}
          {experience.length > 0 && (
            <section>
              <h3 className="mb-2">🎓 Education & Experience</h3>
              <ul className="space-y-1 text-gray-700">
                {experience.map((e, i) => (
                  <li key={i}>• {e.description}</li>
                ))}
              </ul>
            </section>
          )}

          {/* Skills */}
          {skills.length > 0 && (
            <section>
              <h3 className="mb-2">🎯 Skills & Interests</h3>
              <ul className="space-y-1 text-gray-700">
                {skills.map((s, i) => (
                  <li key={i}>• {s.emoji ? `${s.emoji} ` : ""}{s.name}</li>
                ))}
              </ul>
            </section>
          )}

          {/* Availability */}
          {(availableFrom || duration) && (
            <section>
              <h3 className="mb-2">📅 Availability</h3>
              <ul className="space-y-1 text-gray-700">
                {availableFrom && <li>• From: {availableFrom}</li>}
                {duration && <li>• Duration: {duration}</li>}
              </ul>
            </section>
          )}

          {/* About Me */}
          {aboutMe && (
            <section>
              <h3 className="mb-2">💬 About Me</h3>
              <p className="text-gray-700 italic">{aboutMe}</p>
            </section>
          )}
        </div>

        <Separator />

        {/* Action Buttons */}
        <div className="p-6 flex gap-3">
          <Button
            variant="default"
            className="flex-1 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700"
            onClick={onLike}
          >
            <Heart className="w-4 h-4 mr-2" />
            Like
          </Button>
          <Button
            variant="default"
            className="flex-1 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700"
            onClick={onMessage}
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Message
          </Button>
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
