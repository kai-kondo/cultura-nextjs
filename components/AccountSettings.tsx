import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { Separator } from "./ui/separator";
import { Card } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { CulturaLogo } from "./CulturaLogo";
import { 
  Bell, 
  Lock, 
  Save,
  LogOut,
  Trash2,
  ArrowLeft,
  Shield
} from "lucide-react";
import { motion } from "motion/react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "./ui/alert-dialog";

interface AccountSettingsProps {
  onBack?: () => void;
  onLogout?: () => void;
}

export function AccountSettings({ onBack, onLogout }: AccountSettingsProps) {
  const [isSaving, setIsSaving] = useState(false);

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

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate save
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
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
            <h1 className="text-xl text-gray-900">Settings</h1>
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
          <h1 className="text-3xl text-gray-900">Settings & Account</h1>
          <p className="text-gray-600">Manage your preferences and account settings</p>
        </motion.div>

        {/* Main Content */}
        <Tabs defaultValue="notifications" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="privacy" className="gap-2">
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Privacy</span>
            </TabsTrigger>
            <TabsTrigger value="account" className="gap-2">
              <Lock className="w-4 h-4" />
              <span className="hidden sm:inline">Account</span>
            </TabsTrigger>
          </TabsList>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
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

                <div className="flex justify-end mt-6">
                  <Button 
                    onClick={handleSave} 
                    disabled={isSaving}
                    className="bg-gradient-to-r from-orange-500 to-rose-600"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isSaving ? "Saving..." : "Save Settings"}
                  </Button>
                </div>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Privacy Tab */}
          <TabsContent value="privacy" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="p-6 bg-white/80 backdrop-blur">
                <h3 className="text-gray-900 mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-600" />
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

                <div className="flex justify-end mt-6">
                  <Button 
                    onClick={handleSave} 
                    disabled={isSaving}
                    className="bg-gradient-to-r from-orange-500 to-rose-600"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isSaving ? "Saving..." : "Save Settings"}
                  </Button>
                </div>
              </Card>
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
