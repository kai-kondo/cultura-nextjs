import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { Separator } from "./ui/separator";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "./ui/dialog";
import { MapPin, Heart, MessageCircle, Home, Clock, Users, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "./ui/badge";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface AuPairData {
  type: 'aupair';
  id: string;
  name: string;
  age: number;
  country: string;
  flag: string;
  currentLocation: string;
  imageUrl: string;
  galleryImages?: string[];
  languages: Array<{ name: string; level: string }>;
  education: string[];
  skills: Array<{ emoji: string; name: string; description?: string }>;
  availability: {
    from: string;
    duration: string;
    visa: string;
  };
  aboutMe: string;
}

interface FamilyData {
  type: 'family';
  id: string;
  name: string;
  location: string;
  flag: string;
  imageUrl: string;
  galleryImages?: string[];
  children: Array<{ age: number; emoji: string }>;
  stayDuration: string;
  hoursPerWeek: string;
  languages: string[];
  lookingFor: string[];
  aboutUs: string;
}

type ProfileData = AuPairData | FamilyData;

interface ProfileDetailProps {
  profile: ProfileData;
  onMessageClick?: (profileId: string) => void;
}

export function ProfileDetail({ profile, onMessageClick }: ProfileDetailProps) {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  
  // Default gallery images for Au Pair
  const defaultAuPairGallery = [
    "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800",
    "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800",
    "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=800",
    "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800",
    "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800",
  ];
  
  // Default gallery images for Family
  const defaultFamilyGallery = [
    "https://images.unsplash.com/photo-1560184897-ae75f418493e?w=800",
    "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800",
    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800",
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800",
    "https://images.unsplash.com/photo-1449844908441-8829872d2607?w=800",
  ];

  const handlePrevImage = () => {
    if (selectedImage !== null && selectedImage > 0) {
      setSelectedImage(selectedImage - 1);
    }
  };

  const handleNextImage = (galleryLength: number) => {
    if (selectedImage !== null && selectedImage < galleryLength - 1) {
      setSelectedImage(selectedImage + 1);
    }
  };

  if (profile.type === 'aupair') {
    const galleryImages = profile.galleryImages || defaultAuPairGallery;
    
    return (
      <>
      <Card className="w-full bg-white shadow-xl overflow-hidden">
        {/* Profile Header with Background */}
        <div className="bg-gradient-to-br from-orange-50 to-rose-50 p-8 pb-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <Avatar className="w-32 h-32 border-4 border-white shadow-lg">
              <AvatarImage src={profile.imageUrl} alt={profile.name} />
              <AvatarFallback>{profile.name.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="text-center md:text-left flex-1">
              <h2 className="mb-2">
                {profile.name}, {profile.age}
              </h2>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-gray-600">
                <span className="text-2xl">{profile.flag}</span>
                <span>{profile.country}</span>
              </div>
              <div className="flex items-center justify-center md:justify-start gap-1 text-gray-600 mt-2">
                <MapPin className="w-4 h-4" />
                <p className="text-sm">Currently in {profile.currentLocation}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Photo Gallery */}
        <div className="px-6 md:px-8 pb-4">
          <h3 className="mb-3 flex items-center gap-2">
            <span>📸</span> Photos
          </h3>
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
        <div className="p-6 md:p-8 space-y-6">
          {/* Languages */}
          <section>
            <h3 className="mb-3 flex items-center gap-2">
              <span>🗣️</span> Languages
            </h3>
            <div className="flex flex-wrap gap-2">
              {profile.languages.map((lang, index) => (
                <Badge key={index} variant="secondary" className="px-3 py-1">
                  {lang.name} ({lang.level})
                </Badge>
              ))}
            </div>
          </section>

          <Separator />

          {/* Education & Experience */}
          <section>
            <h3 className="mb-3 flex items-center gap-2">
              <span>🎓</span> Education & Experience
            </h3>
            <ul className="space-y-2 text-gray-700">
              {profile.education.map((item, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <Separator />

          {/* Skills & Interests */}
          <section>
            <h3 className="mb-3 flex items-center gap-2">
              <span>🎯</span> Skills & Interests
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {profile.skills.map((skill, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                  <span className="text-2xl">{skill.emoji}</span>
                  <div>
                    <p className="font-medium text-sm">{skill.name}</p>
                    {skill.description && (
                      <p className="text-xs text-gray-500">{skill.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <Separator />

          {/* Availability */}
          <section>
            <h3 className="mb-3 flex items-center gap-2">
              <span>📅</span> Availability
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Start Date</p>
                <p className="font-medium">{profile.availability.from}</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Duration</p>
                <p className="font-medium">{profile.availability.duration}</p>
              </div>
              <div className="p-3 bg-pink-50 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Visa Status</p>
                <p className="font-medium">{profile.availability.visa}</p>
              </div>
            </div>
          </section>

          <Separator />

          {/* About Me */}
          <section>
            <h3 className="mb-3 flex items-center gap-2">
              <span>💬</span> About Me
            </h3>
            <p className="text-gray-700 italic bg-gray-50 p-4 rounded-lg leading-relaxed">
              "{profile.aboutMe}"
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
            onClick={() => onMessageClick?.(profile.id)}
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
                    onClick={() => handleNextImage(galleryImages.length)}
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

  // Family Profile
  const galleryImages = profile.galleryImages || defaultFamilyGallery;
  
  return (
    <>
    <Card className="w-full bg-white shadow-xl overflow-hidden">
      {/* Profile Header with Background */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-8 pb-6">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <Avatar className="w-32 h-32 border-4 border-white shadow-lg">
            <AvatarImage src={profile.imageUrl} alt={profile.name} />
            <AvatarFallback>
              <Users className="w-16 h-16 text-gray-400" />
            </AvatarFallback>
          </Avatar>
          <div className="text-center md:text-left flex-1">
            <h2 className="mb-2">
              {profile.name}
            </h2>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-gray-600">
              <span className="text-2xl">{profile.flag}</span>
              <span>{profile.location}</span>
            </div>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-3">
              <div className="flex items-center gap-1 text-sm">
                <Users className="w-4 h-4" />
                <span>{profile.children.length} {profile.children.length === 1 ? 'child' : 'children'}</span>
              </div>
              <div className="flex items-center gap-1 text-sm">
                <Clock className="w-4 h-4" />
                <span>{profile.hoursPerWeek} per week</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Photo Gallery */}
      <div className="px-6 md:px-8 pb-4">
        <h3 className="mb-3 flex items-center gap-2">
          <span>📸</span> Family & Home
        </h3>
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
      <div className="p-6 md:p-8 space-y-6">
        {/* Children */}
        <section>
          <h3 className="mb-3 flex items-center gap-2">
            <span>👶</span> Children
          </h3>
          <div className="flex flex-wrap gap-2">
            {profile.children.map((child, index) => (
              <Badge key={index} variant="secondary" className="px-3 py-1 text-base">
                {child.emoji} {child.age} years old
              </Badge>
            ))}
          </div>
        </section>

        <Separator />

        {/* Languages Spoken */}
        <section>
          <h3 className="mb-3 flex items-center gap-2">
            <span>🗣️</span> Languages We Speak
          </h3>
          <div className="flex flex-wrap gap-2">
            {profile.languages.map((lang, index) => (
              <Badge key={index} variant="secondary" className="px-3 py-1">
                {lang}
              </Badge>
            ))}
          </div>
        </section>

        <Separator />

        {/* Position Details */}
        <section>
          <h3 className="mb-3 flex items-center gap-2">
            <span>📋</span> Position Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3 bg-green-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Duration</p>
              <p className="font-medium">{profile.stayDuration}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Hours Per Week</p>
              <p className="font-medium">{profile.hoursPerWeek}</p>
            </div>
          </div>
        </section>

        <Separator />

        {/* What We're Looking For */}
        <section>
          <h3 className="mb-3 flex items-center gap-2">
            <span>🎯</span> What We're Looking For
          </h3>
          <ul className="space-y-2 text-gray-700">
            {profile.lookingFor.map((item, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-green-500 mt-1">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <Separator />

        {/* About Us */}
        <section>
          <h3 className="mb-3 flex items-center gap-2">
            <span>💬</span> About Us
          </h3>
          <p className="text-gray-700 italic bg-gray-50 p-4 rounded-lg leading-relaxed">
            "{profile.aboutUs}"
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
          onClick={() => onMessageClick?.(profile.id)}
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
                  onClick={() => handleNextImage(galleryImages.length)}
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
