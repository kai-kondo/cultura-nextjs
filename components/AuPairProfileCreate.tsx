import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import {
  User,
  MapPin,
  Camera,
  Award,
  Languages,
  Briefcase,
  Heart,
  ChevronRight,
  ChevronLeft,
  X,
  Upload,
  Plus,
} from "lucide-react";

import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import {
  createAuPairProfileAndLink,
  patchAuPairProfile,
  saveAuPairPhotos,
} from "@/lib/profile-actions";

interface SkillItem {
  name: string;
  years: string;
}

interface AuPairProfileFormData {
  firstName: string;
  lastName: string;
  age: string;
  nationality: string;
  currentLocation: string;
  photo: File | null;
  galleryPhotos: File[];
  bio: string;
  skills: SkillItem[];
  languages: { language: string; level: string }[];
  childcareExperience: string;
  previousExperience: string;
  certifications: string[];
  availableFrom: string;
  duration: string;
  preferredLocations: string[];
  workType: "aupair" | "babysitter";
  hourlyRate: string;
}

const emptyAuPairProfileFormData: AuPairProfileFormData = {
  firstName: "",
  lastName: "",
  age: "",
  nationality: "",
  currentLocation: "",
  photo: null,
  galleryPhotos: [],
  bio: "",
  skills: [],
  languages: [],
  childcareExperience: "",
  previousExperience: "",
  certifications: [],
  availableFrom: "",
  duration: "",
  preferredLocations: [],
  workType: "aupair",
  hourlyRate: "",
};

interface AuPairProfileCreateProps {
  onComplete: () => void;
  mode?: "create" | "edit";
  initialData?: Partial<AuPairProfileFormData>;
  initialProfileId?: string | null;
}

export function AuPairProfileCreate({
  onComplete,
  mode = "create",
  initialData,
  initialProfileId = null,
}: AuPairProfileCreateProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);

  const [profileData, setProfileData] = useState<AuPairProfileFormData>({
    ...emptyAuPairProfileFormData,
    ...initialData,
  });

  const [newSkill, setNewSkill] = useState<SkillItem>({
    name: "",
    years: "",
  });
  const [newLanguage, setNewLanguage] = useState({
    language: "",
    level: "Intermediate",
  });
  const [newLocation, setNewLocation] = useState("");

  const [profileId, setProfileId] = useState<string | null>(initialProfileId);

  useEffect(() => {
    if (!initialData) return;
    setProfileData((prev) => ({
      ...prev,
      ...initialData,
      photo: null,
      galleryPhotos: [],
    }));
  }, [initialData]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) return;
      const us = await getDoc(doc(db, "users", u.uid));
      const profileRef: string | undefined = us.exists()
        ? us.data().profileRef
        : undefined;
      if (profileRef) {
        const [, id] = profileRef.split("/");
        setProfileId(id);
      } else if (mode === "create") {
        const id = await createAuPairProfileAndLink(u.uid, {
          name: `${profileData.firstName} ${profileData.lastName}`.trim(),
          age: profileData.age ? Number(profileData.age) : null,
          nationality: profileData.nationality || "",
          aboutMe: profileData.bio || "",
        });
        setProfileId(id);
      }
    });
    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function parseCityCountry(input: string) {
    const parts = input.split(",").map((s) => s.trim());
    if (parts.length >= 2) {
      const country = parts.pop() as string;
      const city = parts.join(", ");
      return { city, country };
    }
    return { city: input, country: "" };
  }

  function mapLanguageLevel(level: string) {
    const table: Record<
      string,
      "basic" | "intermediate" | "advanced" | "fluent" | "native"
    > = {
      Basic: "basic",
      Intermediate: "intermediate",
      Advanced: "advanced",
      Native: "native",
    };
    return table[level] || "basic";
  }

  // Ensure the auPairProfiles doc exists before any Storage write
  async function ensureAuPairProfileExists(currentProfileId: string | null) {
    const uid = auth.currentUser?.uid;
    if (!uid) throw new Error("Not authenticated");

    if (currentProfileId) {
      const s = await getDoc(doc(db, "auPairProfiles", currentProfileId));
      if (s.exists() && s.data()?.userId === uid) {
        return currentProfileId;
      }
    }
    // Create minimal profile and link if missing or mismatched
    const newId = await createAuPairProfileAndLink(uid, {
      name: `${profileData.firstName} ${profileData.lastName}`.trim(),
      age: profileData.age ? Number(profileData.age) : null,
      nationality: profileData.nationality || "",
      aboutMe: profileData.bio || "",
    });
    setProfileId(newId);
    return newId;
  }

  async function saveStep(step: number) {
    // Ensure profile doc exists and belongs to the current user (fix race with Storage rules)
    const ensuredId = await ensureAuPairProfileExists(profileId);

    if (step === 1) {
      const { city, country } = parseCityCountry(profileData.currentLocation);
      await patchAuPairProfile(ensuredId, {
        name: `${profileData.firstName} ${profileData.lastName}`.trim(),
        age: profileData.age ? Number(profileData.age) : null,
        nationality: profileData.nationality || "",
        currentLocation: { city, country },
        workType: profileData.workType,
        hourlyRate:
          profileData.workType === "babysitter" && profileData.hourlyRate
            ? Number(profileData.hourlyRate)
            : null,
      });
    }
    if (step === 2) {
      await patchAuPairProfile(ensuredId, {
        aboutMe: profileData.bio || "",
      });

      if (profileData.photo || (profileData.galleryPhotos && profileData.galleryPhotos.length)) {
        await saveAuPairPhotos(ensuredId, {
          avatar: profileData.photo,
          gallery: profileData.galleryPhotos,
        });
        // アップロード済みのローカル選択ファイルをクリア（プレビューは維持）
        setProfileData((prev) => ({ ...prev, photo: null, galleryPhotos: [] }));
      }
    }
    if (step === 3) {
      await patchAuPairProfile(ensuredId, {
        skills: profileData.skills.map((skill) => ({
          name: skill.name,
          emoji: "",
          level: "beginner",
          years: skill.years ? Number(skill.years) : null,
        })),
        languages: {
          primary: profileData.languages[0]
            ? {
                language: profileData.languages[0].language,
                proficiency: mapLanguageLevel(profileData.languages[0].level),
              }
            : null,
          secondary: profileData.languages.slice(1).map((l) => ({
            language: l.language,
            proficiency: mapLanguageLevel(l.level),
          })),
        },
      });
    }
    if (step === 4) {
      await patchAuPairProfile(ensuredId, {
        experience: [
          profileData.childcareExperience
            ? {
                type: "childcare",
                description: profileData.childcareExperience,
              }
            : null,
          profileData.previousExperience
            ? { type: "other", description: profileData.previousExperience }
            : null,
        ].filter(Boolean),
        certifications: profileData.certifications,
      });
    }
    if (step === 5) {
      const desiredCountries = profileData.preferredLocations.map((loc) => {
        const { country } = parseCityCountry(loc);
        return { country, flag: "", cities: [] };
      });
      await patchAuPairProfile(ensuredId, {
        availability: {
          availableFrom: profileData.availableFrom || null,
          duration: profileData.duration || null,
          workingHoursType: "fulltime",
          preferredDays: [],
        },
        desiredCountries,
      });
    }
  }

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
            setGalleryPreviews((prev) =>
              [...prev, reader.result as string].slice(0, 6)
            );
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

  const addSkill = () => {
    const trimmedName = newSkill.name.trim();

    if (
      trimmedName &&
      !profileData.skills.some(
        (skill) => skill.name.toLowerCase() === trimmedName.toLowerCase()
      )
    ) {
      setProfileData({
        ...profileData,
        skills: [
          ...profileData.skills,
          {
            name: trimmedName,
            years: newSkill.years,
          },
        ],
      });
      setNewSkill({ name: "", years: "" });
    }
  };

  const removeSkill = (skillName: string) => {
    setProfileData({
      ...profileData,
      skills: profileData.skills.filter((skill) => skill.name !== skillName),
    });
  };

  const addLanguage = () => {
    if (newLanguage.language.trim()) {
      setProfileData({
        ...profileData,
        languages: [...profileData.languages, { ...newLanguage }],
      });
      setNewLanguage({ language: "", level: "Intermediate" });
    }
  };

  const removeLanguage = (index: number) => {
    setProfileData({
      ...profileData,
      languages: profileData.languages.filter((_, i) => i !== index),
    });
  };

  const addLocation = () => {
    if (
      newLocation.trim() &&
      !profileData.preferredLocations.includes(newLocation.trim())
    ) {
      setProfileData({
        ...profileData,
        preferredLocations: [
          ...profileData.preferredLocations,
          newLocation.trim(),
        ],
      });
      setNewLocation("");
    }
  };

  const removeLocation = (location: string) => {
    setProfileData({
      ...profileData,
      preferredLocations: profileData.preferredLocations.filter(
        (l) => l !== location
      ),
    });
  };

  const handleNext = async () => {
    // 保存（現在のステップのデータをFirestoreへ）
    await saveStep(currentStep);

    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      // 最終ステップ：完了
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
          <h1 className="text-gray-900 mb-2">
            {mode === "create" ? "Create Your Au Pair Profile" : "Edit Your Au Pair Profile"}
          </h1>
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
                <div className="space-y-2">
                  <Label>Work Type *</Label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setProfileData({
                          ...profileData,
                          workType: "aupair",
                          hourlyRate: "",
                        })
                      }
                      className={`flex-1 rounded-lg px-4 py-2 border transition ${
                        profileData.workType === "aupair"
                          ? "bg-orange-500 text-white border-orange-500"
                          : "bg-white"
                      }`}
                    >
                      Au Pair (Live-in)
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setProfileData({
                          ...profileData,
                          workType: "babysitter",
                        })
                      }
                      className={`flex-1 rounded-lg px-4 py-2 border transition ${
                        profileData.workType === "babysitter"
                          ? "bg-orange-500 text-white border-orange-500"
                          : "bg-white"
                      }`}
                    >
                      Babysitter (Hourly)
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-rose-600 flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-gray-900">Basic Information</h2>
                      <p className="text-gray-600 text-sm">
                        Tell us about yourself
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        value={profileData.firstName}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            firstName: e.target.value,
                          })
                        }
                        placeholder="Emma"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        value={profileData.lastName}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            lastName: e.target.value,
                          })
                        }
                        placeholder="Wilson"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="age">Age *</Label>
                    <Input
                      id="age"
                      type="number"
                      value={profileData.age}
                      onChange={(e) =>
                        setProfileData({ ...profileData, age: e.target.value })
                      }
                      placeholder="24"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nationality">Nationality *</Label>
                    <Input
                      id="nationality"
                      value={profileData.nationality}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          nationality: e.target.value,
                        })
                      }
                      placeholder="French"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currentLocation">Current Location *</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="currentLocation"
                        value={profileData.currentLocation}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            currentLocation: e.target.value,
                          })
                        }
                        className="pl-10"
                        placeholder="Paris, France"
                      />
                    </div>
                  </div>

                  {profileData.workType === "babysitter" && (
                    <div className="space-y-2">
                      <Label htmlFor="hourlyRate">Hourly Rate *</Label>
                      <Input
                        id="hourlyRate"
                        type="number"
                        min="0"
                        value={profileData.hourlyRate}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            hourlyRate: e.target.value,
                          })
                        }
                        placeholder="e.g. 25"
                      />
                      <p className="text-sm text-gray-500">
                        Enter your expected hourly rate in your local currency.
                      </p>
                    </div>
                  )}
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
                      <p className="text-gray-600 text-sm">
                        Make a great first impression
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label>Profile Photo</Label>
                    <div className="flex flex-col items-center gap-4">
                      <div
                        onClick={handlePhotoClick}
                        className="w-32 h-32 rounded-full border-4 border-dashed border-orange-300 flex items-center justify-center cursor-pointer hover:border-orange-500 transition-colors overflow-hidden bg-orange-50"
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
                            <p className="text-xs text-gray-500">
                              Click to upload
                            </p>
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
                      Add more photos to showcase your personality and
                      experiences
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
                    <Label htmlFor="bio">About Me *</Label>
                    <Textarea
                      id="bio"
                      value={profileData.bio}
                      onChange={(e) =>
                        setProfileData({ ...profileData, bio: e.target.value })
                      }
                      rows={6}
                      placeholder="Tell families about yourself, your personality, interests, and why you want to be an au pair..."
                    />
                    <p className="text-sm text-gray-500">
                      {profileData.bio.length} / 500 characters
                    </p>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-rose-600 flex items-center justify-center">
                      <Award className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-gray-900">Skills & Languages</h2>
                      <p className="text-gray-600 text-sm">
                        Showcase your abilities
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Skills & Talents</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-[1fr_140px_auto] gap-2">
                      <Input
                        value={newSkill.name}
                        onChange={(e) =>
                          setNewSkill({ ...newSkill, name: e.target.value })
                        }
                        onKeyPress={(e) =>
                          e.key === "Enter" && (e.preventDefault(), addSkill())
                        }
                        placeholder="e.g., Cooking, Swimming, Music"
                      />
                      <Input
                        type="number"
                        min="0"
                        value={newSkill.years}
                        onChange={(e) =>
                          setNewSkill({ ...newSkill, years: e.target.value })
                        }
                        onKeyPress={(e) =>
                          e.key === "Enter" && (e.preventDefault(), addSkill())
                        }
                        placeholder="Years"
                      />
                      <Button onClick={addSkill} variant="outline">
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {profileData.skills.map((skill) => (
                        <Badge
                          key={skill.name}
                          className="gap-1 pr-1 bg-gradient-to-r from-orange-500 to-rose-600"
                        >
                          {skill.name}
                          {skill.years && <span className="ml-1">• {skill.years}y</span>}
                          <button
                            onClick={() => removeSkill(skill.name)}
                            className="ml-1 hover:bg-white/20 rounded-full p-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Languages</Label>
                    <div className="flex gap-2">
                      <Input
                        value={newLanguage.language}
                        onChange={(e) =>
                          setNewLanguage({
                            ...newLanguage,
                            language: e.target.value,
                          })
                        }
                        placeholder="Language"
                        className="flex-1"
                      />
                      <select
                        value={newLanguage.level}
                        onChange={(e) =>
                          setNewLanguage({
                            ...newLanguage,
                            level: e.target.value,
                          })
                        }
                        className="px-3 py-2 border rounded-md bg-white"
                      >
                        <option value="Basic">Basic</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                        <option value="Native">Native</option>
                      </select>
                      <Button onClick={addLanguage} variant="outline">
                        Add
                      </Button>
                    </div>
                    <div className="space-y-2 mt-3">
                      {profileData.languages.map((lang, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-orange-50 rounded-lg"
                        >
                          <div className="flex items-center gap-2">
                            <Languages className="w-4 h-4 text-orange-600" />
                            <span className="font-medium">{lang.language}</span>
                            <span className="text-sm text-gray-600">
                              • {lang.level}
                            </span>
                          </div>
                          <button
                            onClick={() => removeLanguage(index)}
                            className="text-gray-400 hover:text-red-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-rose-600 flex items-center justify-center">
                      <Briefcase className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-gray-900">Experience</h2>
                      <p className="text-gray-600 text-sm">
                        Share your background
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="childcareExperience">
                      Childcare Experience *
                    </Label>
                    <Textarea
                      id="childcareExperience"
                      value={profileData.childcareExperience}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          childcareExperience: e.target.value,
                        })
                      }
                      rows={4}
                      placeholder="Describe your experience with children (babysitting, tutoring, etc.)"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="previousExperience">
                      Other Relevant Experience
                    </Label>
                    <Textarea
                      id="previousExperience"
                      value={profileData.previousExperience}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          previousExperience: e.target.value,
                        })
                      }
                      rows={4}
                      placeholder="Any other experience that might be relevant (teaching, healthcare, etc.)"
                    />
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
                      <h2 className="text-gray-900">Your Preferences</h2>
                      <p className="text-gray-600 text-sm">
                        What are you looking for?
                      </p>
                    </div>
                  </div>

                  <div
                    className={`grid gap-4 ${
                      profileData.workType === "aupair" ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"
                    }`}
                  >
                    <div className="space-y-2">
                      <Label htmlFor="availableFrom">Available From *</Label>
                      <Input
                        id="availableFrom"
                        type="date"
                        value={profileData.availableFrom}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            availableFrom: e.target.value,
                          })
                        }
                      />
                    </div>

                    {profileData.workType === "aupair" && (
                      <div className="space-y-2 rounded-xl border-2 border-orange-200 bg-orange-50 p-4">
                        <Label htmlFor="duration" className="text-orange-700">
                          Preferred Duration *
                        </Label>
                        <select
                          id="duration"
                          value={profileData.duration}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              duration: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border rounded-md bg-white"
                        >
                          <option value="">Select duration</option>
                          <option value="3-6 months">3-6 months</option>
                          <option value="6-12 months">6-12 months</option>
                          <option value="1-2 years">1-2 years</option>
                          <option value="2+ years">2+ years</option>
                        </select>
                        <p className="text-sm text-orange-700">
                          Au Pair stays usually last longer, so duration is especially important.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Preferred Locations</Label>
                    <div className="flex gap-2">
                      <Input
                        value={newLocation}
                        onChange={(e) => setNewLocation(e.target.value)}
                        onKeyPress={(e) =>
                          e.key === "Enter" &&
                          (e.preventDefault(), addLocation())
                        }
                        placeholder="e.g., New York, Tokyo"
                      />
                      <Button onClick={addLocation} variant="outline">
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {profileData.preferredLocations.map((location) => (
                        <Badge
                          key={location}
                          className="gap-1 pr-1 bg-gradient-to-r from-orange-500 to-rose-600"
                        >
                          <MapPin className="w-3 h-3" />
                          {location}
                          <button
                            onClick={() => removeLocation(location)}
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
                  disabled={currentStep === 2 && !profileId}
                  className="gap-2 bg-gradient-to-r from-orange-500 to-rose-600 hover:from-orange-600 hover:to-rose-700 disabled:opacity-60"
                >
                  {currentStep === totalSteps
                    ? mode === "create"
                      ? "Complete Profile"
                      : "Save Changes"
                    : "Next"}
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
