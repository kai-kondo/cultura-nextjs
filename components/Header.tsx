"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { listenNotifications } from "@/lib/notification-actions";
import { DesktopNav } from "./DesktopNav";
import { CulturaLogo } from "./CulturaLogo";
import { Settings, Bell } from "lucide-react";

interface HeaderProps {
  onOpenSettings?: () => void;
  onOpenMyProfile?: () => void;
  onOpenCommunity?: () => void;
  avatarUrl?: string;
}

export function Header({
  onOpenSettings,
  onOpenMyProfile,
  onOpenCommunity,
  avatarUrl,
}: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);

  const handleOpenHome = () => {
    router.push("/home");
  };

  const handleOpenSettings = () => {
    if (onOpenSettings) {
      onOpenSettings();
      return;
    }
    router.push("/settings");
  };

  const handleOpenMyProfile = () => {
    if (onOpenMyProfile) {
      onOpenMyProfile();
      return;
    }
    router.push("/profile/edit");
  };

  const handleOpenCommunity = () => {
    if (onOpenCommunity) {
      onOpenCommunity();
      return;
    }
    router.push("/community");
  };

  const handleOpenNotifications = () => {
    router.push("/notifications");
  };

  useEffect(() => {
    let unsubscribeNotifications: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      unsubscribeNotifications?.();

      if (!user) {
        setHasUnreadNotifications(false);
        return;
      }

      unsubscribeNotifications = listenNotifications(user.uid, (items) => {
        const hasUnread = items.some((item) => !item.read);
        setHasUnreadNotifications(hasUnread);
      });
    });

    return () => {
      unsubscribeAuth();
      unsubscribeNotifications?.();
    };
  }, []);

  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-[1760px] px-4 sm:px-8 lg:px-10">
        <div className="flex h-20 items-center justify-between gap-4">
          <button
            type="button"
            onClick={handleOpenHome}
            className="flex min-w-0 items-center gap-2"
            aria-label="Go to home"
          >
            <CulturaLogo size={30} />
            <p className="truncate text-2xl font-bold tracking-tight text-rose-600">
              Cultura
            </p>
          </button>

          <div className="flex items-center gap-2 lg:hidden">
            <button
              type="button"
              onClick={handleOpenNotifications}
              aria-label="Open notifications"
              className="relative flex h-11 w-11 items-center justify-center rounded-full text-gray-700 transition hover:bg-gray-100"
            >
              <Bell className="h-5 w-5" />
              {hasUnreadNotifications && (
                <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500" />
              )}
            </button>

            <button
              type="button"
              onClick={handleOpenSettings}
              aria-label="Open settings"
              className="flex h-11 w-11 items-center justify-center rounded-full text-gray-700 transition hover:bg-gray-100"
            >
              <Settings className="h-5 w-5" />
            </button>
          </div>

          <div className="hidden lg:flex items-center rounded-full border border-gray-200 px-1.5 py-1.5 shadow-sm transition-shadow hover:shadow-md">
            <DesktopNav
              onOpenSettings={handleOpenSettings}
              onOpenProfile={handleOpenMyProfile}
              onOpenCommunity={handleOpenCommunity}
              avatarUrl={avatarUrl}
              hasUnreadNotifications={hasUnreadNotifications}
              pathname={pathname}
            />
          </div>
        </div>
      </div>
    </header>
  );
}