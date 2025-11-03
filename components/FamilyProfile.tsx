"use client";
import { useState } from "react";
import type { FamilyProfile as FamilyProfileType } from "@/lib/types";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { Separator } from "./ui/separator";
import { Dialog, DialogContent, DialogTitle } from "./ui/dialog";
import { MapPin, Heart, MessageCircle, Home, Clock, X, ChevronLeft, ChevronRight } from "lucide-react";
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
    : (data?.lookingFor ? [String(data?.lookingFor)] : []);

  const aboutUs = data?.aboutUs || undefined;

  const stayMonths = data?.position?.duration || undefined;
  const hoursPerWeek = data?.position?.hoursPerWeek || undefined;
  const workingHoursType = data?.position?.workingHoursType || undefined;

  const allowance = data?.offering?.allowance;
  const accommodation = data?.offering?.accommodation;
  const meals = data?.offering?.meals;
  const benefits = data?.offering?.benefits ?? [];

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
              <AvatarImage src={avatar} alt={familyName} />
              <AvatarFallback>
                {familyName.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>

        {/* Family Name and Info */}
        <div className="px-6 pb-4 text-center">
          <h2 className="mb-2">🏡 {familyName}{country ? ` (${country}${city ? ` • ${city}` : ""})` : ""}</h2>
          <div className="text-gray-600 space-y-1">
            {(adults !== undefined || children.length > 0) && (
              <p>
                👨‍👩‍👧 {adults ? `${adults} adult${adults > 1 ? "s" : ""}` : ""}
                {adults && children.length ? " • " : ""}
                {children.length ? `${children.length} kid${children.length > 1 ? "s" : ""}` : ""}
              </p>
            )}
            {(city || country) && (
              <div className="flex items-center justify-center gap-1">
                <MapPin className="w-4 h-4" />
                <p>{[city, country].filter(Boolean).join(", ")}</p>
              </div>
            )}
            {(stayMonths || hoursPerWeek || workingHoursType) && (
              <div className="flex items-center justify-center gap-1">
                <Clock className="w-4 h-4" />
                <p>
                  {stayMonths ? `${stayMonths}` : ""}
                  {stayMonths && (hoursPerWeek || workingHoursType) ? " / " : ""}
                  {hoursPerWeek ? `${hoursPerWeek}h per week` : ""}
                  {hoursPerWeek && workingHoursType ? " • " : ""}
                  {workingHoursType || ""}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Photo Gallery */}
        {gallery.length > 0 && (
          <div className="px-6 pb-4">
            <h3 className="mb-3">📸 Family & Home</h3>
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
          {/* What We're Looking For */}
          {lookingFor.length > 0 && (
            <section>
              <h3 className="mb-2">🎯 What We're Looking For</h3>
              <ul className="space-y-1 text-gray-700">
                {lookingFor.map((l, i) => (
                  <li key={i}>• {l}</li>
                ))}
              </ul>
            </section>
          )}

          {/* About Us */}
          {aboutUs && (
            <section>
              <h3 className="mb-2">💬 About Us</h3>
              <p className="text-gray-700 italic">{aboutUs}</p>
            </section>
          )}

          {/* Offering */}
          {(accommodation || meals || allowance || benefits.length) && (
            <section>
              <h3 className="mb-2">🎁 What We Offer</h3>
              <ul className="space-y-1 text-gray-700">
                {accommodation && (
                  <li>
                    • Accommodation: {accommodation.type || ""}
                    {accommodation.hasPrivateBathroom ? " (private bathroom)" : ""}
                    {accommodation.description ? ` — ${accommodation.description}` : ""}
                  </li>
                )}
                {meals && <li>• Meals: {meals}</li>}
                {allowance && allowance.amount ? (
                  <li>
                    • Allowance: {allowance.amount} {allowance.currency} / {allowance.frequency}
                  </li>
                ) : null}
                {benefits.length > 0 && (
                  <li>• Benefits: {benefits.join(", ")}</li>
                )}
              </ul>
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
