"use client";

import { useMemo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Bell, Heart, MessageCircle } from "lucide-react";
import type { AppNotification } from "@/lib/notification-actions";

type Props = {
  items: AppNotification[];
  loading?: boolean;
  onOpenNotification?: (item: AppNotification) => void;
  onMarkAllRead?: () => void;
};

function formatRelativeDate(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 1000 / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m`;
  if (diffHour < 24) return `${diffHour}h`;
  return `${diffDay}d`;
}

function buildNotificationText(item: AppNotification) {
  if (item.type === "favorite") {
    return `${item.actorName} liked your profile`;
  }

  if (item.type === "message") {
    return `${item.actorName} sent you a message`;
  }

  return `${item.actorName} sent a notification`;
}

export function NotificationsList({
  items,
  loading = false,
  onOpenNotification,
  onMarkAllRead,
}: Props) {
  const unreadCount = useMemo(
    () => items.filter((item) => !item.read).length,
    [items]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-rose-100">
      <div className="mx-auto max-w-3xl px-4 py-6">
        <Card className="overflow-hidden border-orange-100 bg-white shadow-xl">
          <div className="border-b bg-white px-5 py-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-orange-600" />
                  <h1 className="text-xl font-semibold text-gray-900">Notifications</h1>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  {unreadCount > 0
                    ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
                    : "You’re all caught up"}
                </p>
              </div>

              {unreadCount > 0 && (
                <Button variant="outline" onClick={onMarkAllRead}>
                  Mark all read
                </Button>
              )}
            </div>
          </div>

          <div className="divide-y">
            {loading ? (
              <div className="px-5 py-10 text-center text-sm text-gray-500">
                Loading notifications...
              </div>
            ) : items.length === 0 ? (
              <div className="px-5 py-12 text-center text-sm text-gray-500">
                No notifications yet.
              </div>
            ) : (
              items.map((item) => {
                const createdAtIso = item.createdAt?.toDate().toISOString();
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onOpenNotification?.(item)}
                    className={`flex w-full items-center gap-4 px-5 py-4 text-left transition hover:bg-orange-50/40 ${
                      !item.read ? "bg-orange-50/30" : "bg-white"
                    }`}
                  >
                    <Avatar className="h-11 w-11 shrink-0">
                      <AvatarImage src={item.actorAvatar} alt={item.actorName} />
                      <AvatarFallback>{item.actorName.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        {item.type === "favorite" ? (
                          <Heart className="h-4 w-4 text-pink-500" />
                        ) : (
                          <MessageCircle className="h-4 w-4 text-orange-500" />
                        )}
                        <p className="truncate text-sm text-gray-900">
                          {buildNotificationText(item)}
                        </p>
                      </div>

                      {item.type === "message" && item.text && (
                        <p className="mt-1 truncate text-sm text-gray-500">
                          {item.text}
                        </p>
                      )}
                    </div>

                    <div className="flex shrink-0 items-center gap-3">
                      {!item.read && <span className="h-2.5 w-2.5 rounded-full bg-orange-500" />}
                      <span className="text-xs text-gray-400">
                        {formatRelativeDate(createdAtIso)}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}