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
}

export function DesktopNav({
  onOpenSettings,
  onOpenProfile,
  onOpenCommunity,
  avatarUrl,
  hasUnreadNotifications,
}: DesktopNavProps) {
  const router = useRouter();

  return (
    <nav
      className="hidden items-center gap-1 lg:flex"
      aria-label="Main navigation"
    >
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="gap-2 text-gray-700 hover:bg-orange-50 hover:text-orange-800"
        onClick={onOpenCommunity}
      >
        <Users className="h-4 w-4" />
        Community
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="relative text-gray-700 hover:bg-orange-50 hover:text-orange-800"
        onClick={() => router.push("/notifications")}
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {hasUnreadNotifications ? (
          <span
            className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white"
            aria-hidden
          />
        ) : null}
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-10 w-10 rounded-full text-gray-700 hover:bg-orange-50 hover:text-orange-800"
        onClick={onOpenProfile}
        aria-label="My profile"
      >
        <Avatar className="h-8 w-8 border border-orange-100">
          {avatarUrl ? (
            <AvatarImage src={avatarUrl} alt="" />
          ) : null}
          <AvatarFallback className="bg-orange-100 text-orange-800">
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="text-gray-700 hover:bg-orange-50 hover:text-orange-800"
        onClick={onOpenSettings}
        aria-label="Settings"
      >
        <Settings className="h-5 w-5" />
      </Button>
    </nav>
  );
}
