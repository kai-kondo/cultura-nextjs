import { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import {
  Users,
  MapPin,
  Camera,
  Baby,
  Home,
  Award,
  Heart,
  ChevronRight,
  ChevronLeft,
  X,
  Plus,
  Upload,
} from "lucide-react";

interface FamilyProfileCreateProps {
  onComplete: () => void;
}

interface Child {
  age: string;
  gender: string;
}

export function FamilyProfileCreate({ onComplete }: FamilyProfileCreateProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);

  const [profileData, setProfileData] = useState({
    // Step 1: Basic Info
    familyName: "",
    city: "",
    country: "",
    adults: "2",
    
    // Step 2: Photo & Bio
    photo: null as File | null,
    galleryPhotos: [] as File[],
    familyBio: "",
    
    // Step 3: Children
    children: [] as Child[],
    
    // Step 4: Home & Requirements
    homeDescription: "",
    providedRoom: "",
    desiredSkills: [] as string[],
    
    // Step 5: Offer & Preferences
    weeklyAllowance: "",
    startDate: "",
    duration: "",
    additionalBenefits: "",
  });

  const [newSkill, setNewSkill] = useState("");
  const [newChild, setNewChild] = useState<Child>({ age: "", gender: "Any" });

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileData({ ...profileData, photo: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const newPhotos = [...profileData.galleryPhotos, ...files].slice(0, 6); // Max 6 photos
      setProfileData({ ...profileData, galleryPhotos: newPhotos });
      
      const newPreviews = [...galleryPreviews];
      files.forEach((file, index) => {
        if (galleryPreviews.length + index < 6) {
          const reader = new FileReader();
          reader.onloadend = () => {
            setGalleryPreviews(prev => [...prev, reader.result as string].slice(0, 6));
          };
          reader.readAsDataURL(file);
        }
      });
    }
  };

  const handleGalleryClick = () => {
    galleryInputRef.current?.click();
  };

  const removeGalleryPhoto = (index: number) => {
    setProfileData({
      ...profileData,
      galleryPhotos: profileData.galleryPhotos.filter((_, i) => i !== index),
    });
    setGalleryPreviews(galleryPreviews.filter((_, i) => i !== index));
  };

  const addChild = () => {
    if (newChild.age) {
      setProfileData({
        ...profileData,
        children: [...profileData.children, { ...newChild }],
      });
      setNewChild({ age: "", gender: "Any" });
    }
  };

  const removeChild = (index: number) => {
    setProfileData({
      ...profileData,
      children: profileData.children.filter((_, i) => i !== index),
    });
  };

  const addSkill = () => {
    if (newSkill.trim() && !profileData.desiredSkills.includes(newSkill.trim())) {
      setProfileData({
        ...profileData,
        desiredSkills: [...profileData.desiredSkills, newSkill.trim()],
      });
      setNewSkill("");
    }
  };

  const removeSkill = (skill: string) => {
    setProfileData({
      ...profileData,
      desiredSkills: profileData.desiredSkills.filter((s) => s !== skill),
    });
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-rose-100 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-gray-900 mb-2">Create Your Family Profile</h1>
          <p className="text-gray-600">
            Step {currentStep} of {totalSteps}
          </p>
          <Progress value={progress} className="mt-4 h-2" />
        </motion.div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="p-8 bg-white/80 backdrop-blur border-orange-100">
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-rose-600 flex items-center justify-center">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-gray-900">Basic Information</h2>
                      <p className="text-gray-600 text-sm">Tell us about your family</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="familyName">Family Name *</Label>
                    <Input
                      id="familyName"
                      value={profileData.familyName}
                      onChange={(e) =>
                        setProfileData({ ...profileData, familyName: e.target.value })
                      }
                      placeholder="The Johnson Family"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        value={profileData.city}
                        onChange={(e) =>
                          setProfileData({ ...profileData, city: e.target.value })
                        }
                        placeholder="San Francisco"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">Country *</Label>
                      <Input
                        id="country"
                        value={profileData.country}
                        onChange={(e) =>
                          setProfileData({ ...profileData, country: e.target.value })
                        }
                        placeholder="United States"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="adults">Number of Adults in Household *</Label>
                    <select
                      id="adults"
                      value={profileData.adults}
                      onChange={(e) =>
                        setProfileData({ ...profileData, adults: e.target.value })
                      }
                      className="w-full px-3 py-2 border rounded-md bg-white"
                    >
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4+">4+</option>
                    </select>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-rose-600 flex items-center justify-center">
                      <Camera className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-gray-900">Photo & Introduction</h2>
                      <p className="text-gray-600 text-sm">Make a great first impression</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label>Family Photo</Label>
                    <div className="flex flex-col items-center gap-4">
                      <div
                        onClick={handlePhotoClick}
                        className="w-48 h-48 rounded-lg border-4 border-dashed border-orange-300 flex items-center justify-center cursor-pointer hover:border-orange-500 transition-colors overflow-hidden bg-orange-50"
                      >
                        {photoPreview ? (
                          <img
                            src={photoPreview}
                            alt="Profile preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-center">
                            <Upload className="w-8 h-8 text-orange-400 mx-auto mb-2" />
                            <p className="text-xs text-gray-500">Click to upload</p>
                          </div>
                        )}
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handlePhotoClick}
                        className="gap-2"
                      >
                        <Camera className="w-4 h-4" />
                        {photoPreview ? "Change Photo" : "Upload Photo"}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Additional Photos (up to 6)</Label>
                    <p className="text-sm text-gray-500">
                      Share photos of your home, family activities, and neighborhood
                    </p>
                    <div className="grid grid-cols-3 gap-3">
                      {galleryPreviews.map((preview, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={preview}
                            alt={`Gallery ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg border-2 border-orange-200"
                          />
                          <button
                            onClick={() => removeGalleryPhoto(index)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      {galleryPreviews.length < 6 && (
                        <div
                          onClick={handleGalleryClick}
                          className="w-full h-24 border-2 border-dashed border-orange-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-orange-500 transition-colors bg-orange-50"
                        >
                          <div className="text-center">
                            <Plus className="w-6 h-6 text-orange-400 mx-auto mb-1" />
                            <p className="text-xs text-gray-500">Add</p>
                          </div>
                        </div>
                      )}
                    </div>
                    <input
                      ref={galleryInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleGalleryChange}
                      className="hidden"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="familyBio">About Our Family *</Label>
                    <Textarea
                      id="familyBio"
                      value={profileData.familyBio}
                      onChange={(e) =>
                        setProfileData({ ...profileData, familyBio: e.target.value })
                      }
                      rows={6}
                      placeholder="Tell au pairs about your family, lifestyle, values, and what makes your home special..."
                    />
                    <p className="text-sm text-gray-500">
                      {profileData.familyBio.length} / 500 characters
                    </p>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-rose-600 flex items-center justify-center">
                      <Baby className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-gray-900">Children Information</h2>
                      <p className="text-gray-600 text-sm">Tell us about your children</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Add Children</Label>
                    <div className="flex gap-2">
                      <Input
                        value={newChild.age}
                        onChange={(e) => setNewChild({ ...newChild, age: e.target.value })}
                        placeholder="Age"
                        type="number"
                        className="flex-1"
                      />
                      <select
                        value={newChild.gender}
                        onChange={(e) => setNewChild({ ...newChild, gender: e.target.value })}
                        className="px-3 py-2 border rounded-md bg-white"
                      >
                        <option value="Any">Any</option>
                        <option value="Boy">Boy</option>
                        <option value="Girl">Girl</option>
                      </select>
                      <Button onClick={addChild} variant="outline" className="gap-2">
                        <Plus className="w-4 h-4" />
                        Add
                      </Button>
                    </div>
                    <div className="space-y-2 mt-3">
                      {profileData.children.map((child, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-orange-50 rounded-lg"
                        >
                          <div className="flex items-center gap-2">
                            <Baby className="w-4 h-4 text-orange-600" />
                            <span className="font-medium">
                              {child.age} years old
                            </span>
                            <span className="text-sm text-gray-600">• {child.gender}</span>
                          </div>
                          <button
                            onClick={() => removeChild(index)}
                            className="text-gray-400 hover:text-red-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      {profileData.children.length === 0 && (
                        <p className="text-sm text-gray-500 text-center py-4">
                          No children added yet
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-rose-600 flex items-center justify-center">
                      <Home className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-gray-900">Home & Requirements</h2>
                      <p className="text-gray-600 text-sm">What can you offer?</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="homeDescription">Home Description *</Label>
                    <Textarea
                      id="homeDescription"
                      value={profileData.homeDescription}
                      onChange={(e) =>
                        setProfileData({ ...profileData, homeDescription: e.target.value })
                      }
                      rows={4}
                      placeholder="Describe your home, neighborhood, and living environment..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="providedRoom">Au Pair's Room & Facilities *</Label>
                    <Textarea
                      id="providedRoom"
                      value={profileData.providedRoom}
                      onChange={(e) =>
                        setProfileData({ ...profileData, providedRoom: e.target.value })
                      }
                      rows={3}
                      placeholder="Describe the room and facilities provided for the au pair..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Desired Skills & Qualities</Label>
                    <div className="flex gap-2">
                      <Input
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                        placeholder="e.g., Patient, Energetic, Swimming"
                      />
                      <Button onClick={addSkill} variant="outline">
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {profileData.desiredSkills.map((skill) => (
                        <Badge
                          key={skill}
                          className="gap-1 pr-1 bg-gradient-to-r from-orange-500 to-rose-600"
                        >
                          {skill}
                          <button
                            onClick={() => removeSkill(skill)}
                            className="ml-1 hover:bg-white/20 rounded-full p-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 5 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-rose-600 flex items-center justify-center">
                      <Heart className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-gray-900">What You Offer</h2>
                      <p className="text-gray-600 text-sm">Details about compensation & timing</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="weeklyAllowance">Weekly Allowance (USD) *</Label>
                    <Input
                      id="weeklyAllowance"
                      type="number"
                      value={profileData.weeklyAllowance}
                      onChange={(e) =>
                        setProfileData({ ...profileData, weeklyAllowance: e.target.value })
                      }
                      placeholder="200"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startDate">Preferred Start Date *</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={profileData.startDate}
                        onChange={(e) =>
                          setProfileData({ ...profileData, startDate: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="duration">Expected Duration *</Label>
                      <select
                        id="duration"
                        value={profileData.duration}
                        onChange={(e) =>
                          setProfileData({ ...profileData, duration: e.target.value })
                        }
                        className="w-full px-3 py-2 border rounded-md bg-white"
                      >
                        <option value="">Select duration</option>
                        <option value="3-6 months">3-6 months</option>
                        <option value="6-12 months">6-12 months</option>
                        <option value="1-2 years">1-2 years</option>
                        <option value="2+ years">2+ years</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="additionalBenefits">Additional Benefits</Label>
                    <Textarea
                      id="additionalBenefits"
                      value={profileData.additionalBenefits}
                      onChange={(e) =>
                        setProfileData({ ...profileData, additionalBenefits: e.target.value })
                      }
                      rows={4}
                      placeholder="e.g., Language classes, travel opportunities, car use, health insurance..."
                    />
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
                <Button
                  onClick={handleBack}
                  variant="outline"
                  disabled={currentStep === 1}
                  className="gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </Button>
                <Button
                  onClick={handleNext}
                  className="gap-2 bg-gradient-to-r from-orange-500 to-rose-600 hover:from-orange-600 hover:to-rose-700"
                >
                  {currentStep === totalSteps ? "Complete Profile" : "Next"}
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
