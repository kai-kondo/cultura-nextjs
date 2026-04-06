"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import {
  listenNotifications,
  markNotificationsAsRead,
  type AppNotification,
} from "@/lib/notification-actions";
import { NotificationsList } from "@/components/NotificationsList";
import { MobileBottomNav } from "@/components/MobileBottomNav";

export default function NotificationsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<AppNotification[]>([]);

  useEffect(() => {
    let unsubscribeNotifications: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/");
        return;
      }

      unsubscribeNotifications = listenNotifications(user.uid, (notifications) => {
        setItems(notifications);
        setLoading(false);
      });
    });

    return () => {
      unsubscribeAuth();
      unsubscribeNotifications?.();
    };
  }, [router]);

  const handleOpenNotification = async (item: AppNotification) => {
    if (!item.read) {
      await markNotificationsAsRead([item.id]);
    }

    if (item.type === "favorite") {
      if (item.actorUserId) {
        const actorUserSnap = await getDoc(doc(db, "users", item.actorUserId));
        const actorProfileRef = actorUserSnap.exists()
          ? (actorUserSnap.data().profileRef as string | undefined)
          : undefined;

        const actorProfileId = actorProfileRef?.includes("/")
          ? actorProfileRef.split("/").pop() || null
          : actorProfileRef || null;

        if (actorProfileId) {
          router.push(`/profile/${actorProfileId}`);
          return;
        }
      }
    }

    if (item.type === "message") {
      const threadOrUserId = item.targetId || item.actorUserId;
      if (threadOrUserId) {
        router.push(`/messages/${threadOrUserId}`);
      }
    }
  };

  const handleMarkAllRead = async () => {
    const unreadIds = items.filter((item) => !item.read).map((item) => item.id);
    if (unreadIds.length === 0) return;
    await markNotificationsAsRead(unreadIds);
  };

  const handleMobileNavigation = (
    screen: "home" | "community" | "messages" | "profile"
  ) => {
    if (screen === "profile") {
      router.push("/profile/edit");
    } else if (screen === "messages") {
      router.push("/messages/emma");
    } else if (screen === "community") {
      router.push("/community");
    } else {
      router.push("/home");
    }
  };

  return (
    <div className="relative pb-16 lg:pb-0">
      <NotificationsList
        items={items}
        loading={loading}
        onOpenNotification={handleOpenNotification}
        onMarkAllRead={handleMarkAllRead}
      />
      <MobileBottomNav
        activeScreen="messages"
        onNavigate={handleMobileNavigation}
      />
    </div>
  );
}