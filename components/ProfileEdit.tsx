import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import { Card } from "./ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { CulturaLogo } from "./CulturaLogo";
import { 
  User, 
  Globe, 
  Camera, 
  Save,
  Mail,
  MapPin,
  Calendar,
  Phone,
  X,
  ArrowLeft
} from "lucide-react";
import { motion } from "motion/react";

interface ProfileEditProps {
  userType: "family" | "aupair";
  onBack?: () => void;
}

export function ProfileEdit({ userType, onBack }: ProfileEditProps) {
  const [isSaving, setIsSaving] = useState(false);
  
  // Profile data state
  const [profileData, setProfileData] = useState({
    name: userType === "family" ? "The Johnson Family" : "Emma Johnson",
    email: "emma.johnson@example.com",
    phone: "+1 (555) 123-4567",
    location: userType === "family" ? "San Francisco, CA" : "Paris, France",
    birthDate: "1998-05-15",
    bio: userType === "family" 
      ? "We're a warm, active family looking for a caring au pair to join us in beautiful San Francisco!"
      : "Passionate about childcare and cultural exchange. I love swimming, art, and teaching kids!",
    languages: ["English", "French"],
    skills: ["Swimming", "Art", "Cooking"],
  });

  const [newSkill, setNewSkill] = useState("");
  const [newLanguage, setNewLanguage] = useState("");

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate save
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
  };

  const addSkill = () => {
    if (newSkill.trim() && !profileData.skills.includes(newSkill.trim())) {
      setProfileData({
        ...profileData,
        skills: [...profileData.skills, newSkill.trim()]
      });
      setNewSkill("");
    }
  };

  const removeSkill = (skill: string) => {
    setProfileData({
      ...profileData,
      skills: profileData.skills.filter(s => s !== skill)
    });
  };

  const addLanguage = () => {
    if (newLanguage.trim() && !profileData.languages.includes(newLanguage.trim())) {
      setProfileData({
        ...profileData,
        languages: [...profileData.languages, newLanguage.trim()]
      });
      setNewLanguage("");
    }
  };

  const removeLanguage = (lang: string) => {
    setProfileData({
      ...profileData,
      languages: profileData.languages.filter(l => l !== lang)
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-rose-100">
      {/* Header - Mobile */}
      <div className="lg:hidden sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl text-gray-900">Edit Profile</h1>
          </div>
        </div>
      </div>

      {/* Header - Desktop */}
      <div className="hidden lg:block sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={onBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
          <button 
            onClick={onBack}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <CulturaLogo size={32} />
            <span className="font-semibold text-gray-800">Cultura</span>
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-4 md:p-6">
        {/* Main Header - Desktop Only */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 hidden lg:block"
        >
          <h1 className="text-3xl text-gray-900">Edit Profile</h1>
          <p className="text-gray-600">Update your profile information and preferences</p>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6 bg-white/80 backdrop-blur">
            {/* Profile Photo */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-6">
              <div className="relative group">
                <Avatar className="h-24 w-24">
                  <AvatarImage 
                    src={userType === "family" 
                      ? "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=300&h=300&fit=crop" 
                      : "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop"
                    } 
                  />
                  <AvatarFallback>{profileData.name.slice(0, 2)}</AvatarFallback>
                </Avatar>
                <Button 
                  size="icon" 
                  className="absolute bottom-0 right-0 h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Camera className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex-1">
                <h3 className="text-gray-900 mb-1">Profile Photo</h3>
                <p className="text-sm text-gray-600 mb-3">
                  JPG, GIF or PNG. Max size of 5MB
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Camera className="w-4 h-4 mr-2" />
                    Upload
                  </Button>
                  <Button variant="ghost" size="sm">Remove</Button>
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-gray-900 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                Basic Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{userType === "family" ? "Family Name" : "Full Name"}</Label>
                  <Input
                    id="name"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      className="pl-10"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="phone"
                      type="tel"
                      className="pl-10"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="location"
                      className="pl-10"
                      value={profileData.location}
                      onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                    />
                  </div>
                </div>

                {userType === "aupair" && (
                  <div className="space-y-2">
                    <Label htmlFor="birthDate">Date of Birth</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="birthDate"
                        type="date"
                        className="pl-10"
                        value={profileData.birthDate}
                        onChange={(e) => setProfileData({ ...profileData, birthDate: e.target.value })}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">{userType === "family" ? "About Us" : "About Me"}</Label>
                <Textarea
                  id="bio"
                  rows={4}
                  value={profileData.bio}
                  onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                  placeholder="Tell us about yourself..."
                />
                <p className="text-xs text-gray-500">{profileData.bio.length} / 500 characters</p>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Languages */}
            <div className="space-y-4">
              <h3 className="text-gray-900 flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-600" />
                Languages
              </h3>
              <div className="flex flex-wrap gap-2 mb-3">
                {profileData.languages.map((lang) => (
                  <Badge key={lang} variant="secondary" className="gap-1 pr-1">
                    {lang}
                    <button
                      onClick={() => removeLanguage(lang)}
                      className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a language..."
                  value={newLanguage}
                  onChange={(e) => setNewLanguage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addLanguage()}
                />
                <Button onClick={addLanguage}>Add</Button>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Skills */}
            <div className="space-y-4">
              <h3 className="text-gray-900">Skills & Interests</h3>
              <div className="flex flex-wrap gap-2 mb-3">
                {profileData.skills.map((skill) => (
                  <Badge key={skill} className="gap-1 pr-1 bg-gradient-to-r from-orange-500 to-rose-600">
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
              <div className="flex gap-2">
                <Input
                  placeholder="Add a skill..."
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addSkill()}
                />
                <Button onClick={addSkill}>Add</Button>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={onBack}>Cancel</Button>
              <Button 
                onClick={handleSave} 
                disabled={isSaving}
                className="bg-gradient-to-r from-orange-500 to-rose-600"
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
