"use client";

import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { Separator } from "./ui/separator";
import { Card } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Bell, Lock, Save, LogOut, Trash2, X } from "lucide-react";
import { motion } from "motion/react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";

import { auth, db } from "@/lib/firebase";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { signOutUser } from "@/lib/auth-actions";

interface ProfileSettingsProps {
  onClose?: () => void;
  onLogout?: () => void;
}

// Notification/privacy preferences only — profile fields (name, bio, skills,
// languages, photos, etc.) live exclusively in the /profile/edit wizard now.
export function ProfileSettings({ onClose, onLogout }: ProfileSettingsProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) {
      setError("Not signed in");
      setLoading(false);
      return;
    }

    const unsub = onSnapshot(
      doc(db, "users", uid),
      (snap) => {
        const data = (snap.data() || {}) as any;
        setNotifications({
          newMessages: Boolean(data?.notificationSettings?.newMessages ?? true),
          matches: Boolean(data?.notificationSettings?.matches ?? true),
          profileViews: Boolean(data?.notificationSettings?.profileViews ?? false),
          newsletters: Boolean(data?.notificationSettings?.newsletters ?? true),
        });
        setPrivacy({
          profileVisible: Boolean(data?.privacySettings?.profileVisible ?? true),
          showLastSeen: Boolean(data?.privacySettings?.showLastSeen ?? true),
          showReadReceipts: Boolean(data?.privacySettings?.showReadReceipts ?? true),
        });
        setLoading(false);
      },
      (e) => {
        setError(e.message);
        setLoading(false);
      }
    );

    return () => unsub();
  }, []);

  const handleSave = async () => {
    if (!auth.currentUser) return;
    setIsSaving(true);
    setError(null);
    try {
      await updateDoc(doc(db, "users", auth.currentUser.uid), {
        notificationSettings: { ...notifications },
        privacySettings: { ...privacy },
        updatedAt: new Date(),
      });
    } catch (e: any) {
      setError(e?.message || "Failed to save");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      if (onLogout) return onLogout();
      await signOutUser();
    } catch (e) {
      // no-op
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-rose-100">
      <div className="max-w-5xl mx-auto p-4 md:p-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl text-gray-900">Settings</h1>
            {onClose && (
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            )}
          </div>
          <p className="text-gray-600">Manage your notifications, privacy, and account</p>
        </motion.div>

        {loading ? (
          <Card className="p-6">Loading…</Card>
        ) : (
          <Tabs defaultValue="settings" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:inline-grid">
              <TabsTrigger value="settings" className="gap-2">
                <Bell className="w-4 h-4" />
                <span className="hidden sm:inline">Settings</span>
              </TabsTrigger>
              <TabsTrigger value="account" className="gap-2">
                <Lock className="w-4 h-4" />
                <span className="hidden sm:inline">Account</span>
              </TabsTrigger>
            </TabsList>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-4">
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
                      <Switch checked={notifications.newMessages} onCheckedChange={(checked) => setNotifications({ ...notifications, newMessages: checked })} />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">New Matches</p>
                        <p className="text-sm text-gray-600">Get notified about potential matches</p>
                      </div>
                      <Switch checked={notifications.matches} onCheckedChange={(checked) => setNotifications({ ...notifications, matches: checked })} />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Profile Views</p>
                        <p className="text-sm text-gray-600">Get notified when someone views your profile</p>
                      </div>
                      <Switch checked={notifications.profileViews} onCheckedChange={(checked) => setNotifications({ ...notifications, profileViews: checked })} />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Newsletters</p>
                        <p className="text-sm text-gray-600">Receive tips and updates via email</p>
                      </div>
                      <Switch checked={notifications.newsletters} onCheckedChange={(checked) => setNotifications({ ...notifications, newsletters: checked })} />
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
                      <Switch checked={privacy.profileVisible} onCheckedChange={(checked) => setPrivacy({ ...privacy, profileVisible: checked })} />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Last Seen</p>
                        <p className="text-sm text-gray-600">Show when you were last active</p>
                      </div>
                      <Switch checked={privacy.showLastSeen} onCheckedChange={(checked) => setPrivacy({ ...privacy, showLastSeen: checked })} />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Read Receipts</p>
                        <p className="text-sm text-gray-600">Let others know when you've read their messages</p>
                      </div>
                      <Switch checked={privacy.showReadReceipts} onCheckedChange={(checked) => setPrivacy({ ...privacy, showReadReceipts: checked })} />
                    </div>
                  </div>
                </Card>

                <div className="flex justify-end">
                  <Button onClick={handleSave} disabled={isSaving} className="bg-gradient-to-r from-orange-500 to-rose-600">
                    <Save className="w-4 h-4 mr-2" />
                    {isSaving ? "Saving..." : "Save Settings"}
                  </Button>
                </div>
                {error && <p className="text-sm text-red-600 text-right">{error}</p>}
              </motion.div>
            </TabsContent>

            {/* Account Tab */}
            <TabsContent value="account" className="space-y-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-4">
                {/* Password（実装は後で） */}
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
                    <Button className="bg-gradient-to-r from-orange-500 to-rose-600">Update Password</Button>
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
                            <AlertDialogAction onClick={handleLogout}>Log Out</AlertDialogAction>
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
                              This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
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
        )}
      </div>
    </div>
  );
}
