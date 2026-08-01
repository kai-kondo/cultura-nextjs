"use client";

import { useRouter } from "next/navigation";
import { Bell, Settings, Users, User } from "lucide-react";
import { Button } from "./ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";

export interface DesktopNavProps {
  onOpenSettings: () => void;
  onOpenProfile: () => void;
  onOpenCommunity: () => void;
  avatarUrl?: string;
  hasUnreadNotifications?: boolean;
  pathname?: string;
}

export function DesktopNav({
  onOpenSettings,
  onOpenProfile,
  onOpenCommunity,
  avatarUrl,
  hasUnreadNotifications,
  pathname,
}: DesktopNavProps) {
  const router = useRouter();

  const isCommunityActive = pathname === "/community";
  const isNotificationsActive = pathname === "/notifications";
  const isProfileActive =
    pathname === "/profile/edit" || pathname?.startsWith("/profile/") || false;
  const isSettingsActive = pathname === "/settings";

  return (
    <nav
      className="hidden items-center gap-2 lg:flex"
      aria-label="Main navigation"
    >
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className={`h-11 rounded-full px-3 transition-all ${
          isCommunityActive
            ? "gap-2 bg-gray-100 text-gray-900 hover:bg-gray-100"
            : "w-11 px-0 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
        }`}
        onClick={onOpenCommunity}
        aria-label="Community"
      >
        <Users className="h-5 w-5" />
        {isCommunityActive ? <span>Community</span> : null}
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        className={`relative h-11 rounded-full px-3 transition-all ${
          isNotificationsActive
            ? "gap-2 bg-gray-100 text-gray-900 hover:bg-gray-100"
            : "w-11 px-0 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
        }`}
        onClick={() => router.push("/notifications")}
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {isNotificationsActive ? <span>Notifications</span> : null}
        {hasUnreadNotifications ? (
          <span
            className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-white"
            aria-hidden
          />
        ) : null}
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        className={`h-11 rounded-full px-3 transition-all ${
          isProfileActive
            ? "gap-2 bg-gray-100 text-gray-900 hover:bg-gray-100"
            : "w-11 px-0 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
        }`}
        onClick={onOpenProfile}
        aria-label="My profile"
      >
        <Avatar className="h-8 w-8 border border-gray-200">
          {avatarUrl ? <AvatarImage src={avatarUrl} alt="" /> : null}
          <AvatarFallback className="bg-gray-200 text-gray-700">
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
        {isProfileActive ? <span>Profile</span> : null}
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        className={`h-11 rounded-full px-3 transition-all ${
          isSettingsActive
            ? "gap-2 bg-gray-100 text-gray-900 hover:bg-gray-100"
            : "w-11 px-0 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
        }`}
        onClick={onOpenSettings}
        aria-label="Settings"
      >
        <Settings className="h-5 w-5" />
        {isSettingsActive ? <span>Settings</span> : null}
      </Button>
    </nav>
  );
}
