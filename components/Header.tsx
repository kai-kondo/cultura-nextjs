"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { listenNotifications } from "@/lib/notification-actions";
import { DesktopNav } from "./DesktopNav";
import { CulturaLogo } from "./CulturaLogo";

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
    <header className="sticky top-0 z-30 border-b border-orange-100/80 bg-white/90 backdrop-blur-xl supports-[backdrop-filter]:bg-white/75">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between gap-4">
          <button
            type="button"
            onClick={handleOpenHome}
            className="group flex min-w-0 items-center gap-3 rounded-2xl px-2 py-2 transition-colors hover:bg-orange-50"
            aria-label="Go to home"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-orange-100 bg-white shadow-sm transition-transform group-hover:scale-[1.02]">
              <CulturaLogo size={28} />
            </div>
            <div className="min-w-0 text-left">
              <p className="truncate text-[11px] font-medium uppercase tracking-[0.24em] text-orange-500">
                Au Pair Platform
              </p>
              <p className="truncate text-xl font-semibold text-slate-900">
                Cultura
              </p>
            </div>
          </button>

          <DesktopNav
            onOpenSettings={handleOpenSettings}
            onOpenProfile={handleOpenMyProfile}
            onOpenCommunity={handleOpenCommunity}
            avatarUrl={avatarUrl}
            hasUnreadNotifications={hasUnreadNotifications}
          />
        </div>
      </div>
    </header>
  );
}