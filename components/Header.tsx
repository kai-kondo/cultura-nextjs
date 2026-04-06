"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
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
    <header className="sticky top-0 z-30 border-b border-orange-100/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(255,250,248,0.92)_100%)] shadow-[0_10px_30px_rgba(15,23,42,0.04)] backdrop-blur-xl supports-[backdrop-filter]:bg-[linear-gradient(180deg,rgba(255,255,255,0.84)_0%,rgba(255,250,248,0.78)_100%)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-[88px] items-center justify-between gap-4 py-3">
          <button
            type="button"
            onClick={handleOpenHome}
            className="group flex min-w-0 items-center gap-3 rounded-[24px] border border-orange-100/80 bg-white/80 px-3 py-3 shadow-[0_8px_24px_rgba(15,23,42,0.05)] transition-all hover:-translate-y-[1px] hover:border-orange-200 hover:bg-white hover:shadow-[0_14px_34px_rgba(249,115,22,0.12)]"
            aria-label="Go to home"
          >
            <div className="relative flex h-14 w-14 items-center justify-center rounded-[20px] border border-orange-100 bg-[linear-gradient(135deg,rgba(255,255,255,1)_0%,rgba(255,247,237,1)_100%)] shadow-sm transition-transform duration-200 group-hover:scale-[1.03]">
              <div className="absolute inset-0 rounded-[20px] bg-[radial-gradient(circle_at_top,rgba(251,146,60,0.16),transparent_60%)]" />
              <div className="relative">
                <CulturaLogo size={30} />
              </div>
            </div>

            <div className="min-w-0 text-left">
              <div className="flex flex-wrap items-center gap-2">
                <p className="truncate text-[11px] font-semibold uppercase tracking-[0.26em] text-orange-500">
                  Au Pair Platform
                </p>
                <span className="hidden rounded-full border border-orange-100 bg-orange-50 px-2 py-0.5 text-[10px] font-medium text-orange-600 sm:inline-flex">
                  Match • Connect • Grow
                </span>
              </div>
              <p className="truncate text-[30px] leading-none font-semibold tracking-tight text-slate-900 sm:text-[32px]">
                Cultura
              </p>
            </div>
          </button>

          <div className="flex items-center rounded-[22px] border border-orange-100/70 bg-white/75 px-2 py-2 shadow-[0_8px_24px_rgba(15,23,42,0.04)] backdrop-blur-sm">
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