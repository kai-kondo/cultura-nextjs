import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { Separator } from "./ui/separator";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "./ui/dialog";
import { MapPin, Heart, MessageCircle, X, ChevronLeft, ChevronRight } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

const galleryImages = [
  "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800",
  "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800",
  "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=800",
  "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800",
  "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800",
];

export function AuPairProfile() {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  const handlePrevImage = () => {
    if (selectedImage !== null && selectedImage > 0) {
      setSelectedImage(selectedImage - 1);
    }
  };

  const handleNextImage = () => {
    if (selectedImage !== null && selectedImage < galleryImages.length - 1) {
      setSelectedImage(selectedImage + 1);
    }
  };

  return (
    <>
      <Card className="w-full max-w-md bg-white shadow-xl">
        {/* Profile Photo */}
        <div className="p-6 pb-4">
          <div className="flex justify-center">
            <Avatar className="w-32 h-32">
              <AvatarImage 
                src="https://images.unsplash.com/photo-1704054006064-2c5b922e7a1e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMHdvbWFuJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzYxNjcyOTM1fDA&ixlib=rb-4.1.0&q=80&w=1080" 
                alt="Emma" 
              />
              <AvatarFallback>EM</AvatarFallback>
            </Avatar>
          </div>
        </div>

        {/* Name and Location */}
        <div className="px-6 pb-4 text-center">
          <h2 className="mb-2">🧑‍🦱 Emma, 23 🇯🇵 (Japan)</h2>
          <div className="flex items-center justify-center gap-1 text-gray-600">
            <MapPin className="w-4 h-4" />
            <p>Currently in Sydney, Australia</p>
          </div>
        </div>

        {/* Photo Gallery */}
        <div className="px-6 pb-4">
          <h3 className="mb-3">📸 Photos</h3>
          <div className="overflow-x-auto">
            <div className="flex gap-2 pb-2">
              {galleryImages.map((image, index) => (
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

        <Separator />

        {/* Content Sections */}
        <div className="px-6 py-4 space-y-4">
          {/* Languages */}
          <section>
            <h3 className="mb-2">🗣️ Languages</h3>
            <ul className="space-y-1 text-gray-700">
              <li>• Japanese (Native)</li>
              <li>• English (Intermediate)</li>
            </ul>
          </section>

          {/* Education & Experience */}
          <section>
            <h3 className="mb-2">🎓 Education & Experience</h3>
            <ul className="space-y-1 text-gray-700">
              <li>• Childcare volunteer (2 years)</li>
              <li>• Swimming coach assistant</li>
            </ul>
          </section>

          {/* Skills & Interests */}
          <section>
            <h3 className="mb-2">🎯 Skills & Interests</h3>
            <ul className="space-y-1 text-gray-700">
              <li>• 🏊 Swimming</li>
              <li>• 🍳 Cooking (Japanese dishes)</li>
              <li>• 🏄 Surfing</li>
            </ul>
          </section>

          {/* Availability */}
          <section>
            <h3 className="mb-2">📅 Availability</h3>
            <ul className="space-y-1 text-gray-700">
              <li>• From: December 2025</li>
              <li>• Duration: 6 months</li>
              <li>• Visa: Working Holiday</li>
            </ul>
          </section>

          {/* About Me */}
          <section>
            <h3 className="mb-2">💬 About Me</h3>
            <p className="text-gray-700 italic">
              "I love outdoor activities and teaching kids new things.
              I'd love to share Japanese culture while learning English."
            </p>
          </section>
        </div>

        <Separator />

        {/* Action Buttons */}
        <div className="p-6 flex gap-3">
          <Button 
            variant="default" 
            className="flex-1 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700"
          >
            <Heart className="w-4 h-4 mr-2" />
            Like
          </Button>
          <Button 
            variant="default" 
            className="flex-1 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700"
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
                  src={galleryImages[selectedImage]}
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
                
                {selectedImage < galleryImages.length - 1 && (
                  <button
                    onClick={handleNextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                )}
                
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm bg-black/50 px-3 py-1 rounded-full">
                  {selectedImage + 1} / {galleryImages.length}
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
