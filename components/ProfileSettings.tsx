import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { Separator } from "./ui/separator";
import { Card } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { 
  User, 
  Bell, 
  Lock, 
  Globe, 
  Camera, 
  Save,
  LogOut,
  Trash2,
  Mail,
  MapPin,
  Calendar,
  Phone,
  X
} from "lucide-react";
import { motion } from "motion/react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "./ui/alert-dialog";

interface ProfileSettingsProps {
  userType: "family" | "aupair";
  onClose?: () => void;
  onLogout?: () => void;
}

export function ProfileSettings({ userType, onClose, onLogout }: ProfileSettingsProps) {
  const [isSaving, setIsSaving] = useState(false);
  
  // Profile data state
  const [profileData, setProfileData] = useState({
    name: userType === "family" ? "The Miller Family" : "Emma Johnson",
    email: "emma.johnson@example.com",
    phone: "+1 (555) 123-4567",
    location: userType === "family" ? "Sydney, Australia" : "Paris, France",
    birthDate: "1998-05-15",
    bio: userType === "family" 
      ? "We're a warm, active family looking for a caring au pair to join us in beautiful Sydney!"
      : "Passionate about childcare and cultural exchange. I love swimming, art, and teaching kids!",
    languages: ["English", "French"],
    skills: ["Swimming", "Art", "Cooking"],
  });

  // Settings state
  const [notifications, setNotifications] = useState({
    newMessages: true,
    matches: true,
    profileViews: false,
    newsletters: true,
  });

  const [privacy, setPrivacy] = useState({
    profileVisible: true,
    showLastSeen: true,
    showReadReceipts: true,
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
      <div className="max-w-5xl mx-auto p-4 md:p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl text-gray-900">Profile & Settings</h1>
            {onClose && (
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            )}
          </div>
          <p className="text-gray-600">Manage your profile information and preferences</p>
        </motion.div>

        {/* Main Content */}
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
            <TabsTrigger value="profile" className="gap-2">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
            <TabsTrigger value="account" className="gap-2">
              <Lock className="w-4 h-4" />
              <span className="hidden sm:inline">Account</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
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
                      <Label htmlFor="name">Full Name</Label>
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
                    <Label htmlFor="bio">About Me</Label>
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
                  <Button variant="outline" onClick={onClose}>Cancel</Button>
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
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-4"
            >
              {/* Notifications */}
              <Card className="p-6 bg-white/80 backdrop-blur">
                <h3 className="text-gray-900 mb-4 flex items-center gap-2">
                  <Bell className="w-5 h-5 text-blue-600" />
                  Notification Preferences
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">New Messages</p>
                      <p className="text-sm text-gray-600">Get notified when you receive new messages</p>
                    </div>
                    <Switch
                      checked={notifications.newMessages}
                      onCheckedChange={(checked) => 
                        setNotifications({ ...notifications, newMessages: checked })
                      }
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">New Matches</p>
                      <p className="text-sm text-gray-600">Get notified about potential matches</p>
                    </div>
                    <Switch
                      checked={notifications.matches}
                      onCheckedChange={(checked) => 
                        setNotifications({ ...notifications, matches: checked })
                      }
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Profile Views</p>
                      <p className="text-sm text-gray-600">Get notified when someone views your profile</p>
                    </div>
                    <Switch
                      checked={notifications.profileViews}
                      onCheckedChange={(checked) => 
                        setNotifications({ ...notifications, profileViews: checked })
                      }
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Newsletters</p>
                      <p className="text-sm text-gray-600">Receive tips and updates via email</p>
                    </div>
                    <Switch
                      checked={notifications.newsletters}
                      onCheckedChange={(checked) => 
                        setNotifications({ ...notifications, newsletters: checked })
                      }
                    />
                  </div>
                </div>
              </Card>

              {/* Privacy */}
              <Card className="p-6 bg-white/80 backdrop-blur">
                <h3 className="text-gray-900 mb-4 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-blue-600" />
                  Privacy Settings
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Profile Visibility</p>
                      <p className="text-sm text-gray-600">Make your profile visible in search results</p>
                    </div>
                    <Switch
                      checked={privacy.profileVisible}
                      onCheckedChange={(checked) => 
                        setPrivacy({ ...privacy, profileVisible: checked })
                      }
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Last Seen</p>
                      <p className="text-sm text-gray-600">Show when you were last active</p>
                    </div>
                    <Switch
                      checked={privacy.showLastSeen}
                      onCheckedChange={(checked) => 
                        setPrivacy({ ...privacy, showLastSeen: checked })
                      }
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Read Receipts</p>
                      <p className="text-sm text-gray-600">Let others know when you've read their messages</p>
                    </div>
                    <Switch
                      checked={privacy.showReadReceipts}
                      onCheckedChange={(checked) => 
                        setPrivacy({ ...privacy, showReadReceipts: checked })
                      }
                    />
                  </div>
                </div>
              </Card>

              <div className="flex justify-end">
                <Button 
                  onClick={handleSave} 
                  disabled={isSaving}
                  className="bg-gradient-to-r from-orange-500 to-rose-600"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? "Saving..." : "Save Settings"}
                </Button>
              </div>
            </motion.div>
          </TabsContent>

          {/* Account Tab */}
          <TabsContent value="account" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-4"
            >
              {/* Password */}
              <Card className="p-6 bg-white/80 backdrop-blur">
                <h3 className="text-gray-900 mb-4 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-blue-600" />
                  Change Password
                </h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input id="current-password" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input id="new-password" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input id="confirm-password" type="password" />
                  </div>
                  <Button className="bg-gradient-to-r from-orange-500 to-rose-600">
                    Update Password
                  </Button>
                </div>
              </Card>

              {/* Danger Zone */}
              <Card className="p-6 bg-white/80 backdrop-blur border-red-200">
                <h3 className="text-red-600 mb-4">Danger Zone</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-medium">Log Out</p>
                      <p className="text-sm text-gray-600">Sign out of your account</p>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline">
                          <LogOut className="w-4 h-4 mr-2" />
                          Log Out
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            You will be signed out of your account. You can log back in anytime.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={onLogout}>
                            Log Out
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                    <div>
                      <p className="font-medium text-red-700">Delete Account</p>
                      <p className="text-sm text-red-600">Permanently delete your account and all data</p>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Account?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your account
                            and remove all your data from our servers.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction className="bg-red-600 hover:bg-red-700">
                            Delete Account
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
