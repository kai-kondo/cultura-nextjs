import {
    addDoc,
    collection,
    doc,
    onSnapshot,
    query,
    serverTimestamp,
    Timestamp,
    updateDoc,
    where,
    type Unsubscribe,
  } from "firebase/firestore";
  import { db } from "@/lib/firebase";
  
  export type NotificationType = "favorite" | "message";
  
  export type AppNotification = {
    id: string;
    userId: string;
    actorUserId: string;
    actorName: string;
    actorAvatar: string;
    type: NotificationType;
    targetId: string | null;
    text: string | null;
    read: boolean;
    createdAt: Timestamp | null;
  };
  
  function mapNotification(id: string, data: any): AppNotification {
    return {
      id,
      userId: data.userId,
      actorUserId: data.actorUserId,
      actorName: data.actorName ?? "Cultura member",
      actorAvatar: data.actorAvatar ?? "",
      type: data.type,
      targetId: data.targetId ?? null,
      text: data.text ?? null,
      read: Boolean(data.read),
      createdAt: data.createdAt ?? null,
    };
  }
  
  export async function createFavoriteNotification(params: {
    userId: string;
    actorUserId: string;
    actorName: string;
    actorAvatar: string;
    targetId?: string | null;
  }) {
    const { userId, actorUserId, actorName, actorAvatar, targetId = null } = params;
  
    if (!userId || !actorUserId) return;
    if (userId === actorUserId) return;
  
    await addDoc(collection(db, "notifications"), {
      userId,
      actorUserId,
      actorName,
      actorAvatar,
      type: "favorite",
      targetId,
      text: null,
      read: false,
      createdAt: serverTimestamp(),
    });
  }
  
  export async function createMessageNotification(params: {
    userId: string;
    actorUserId: string;
    actorName: string;
    actorAvatar: string;
    targetId: string;
    text?: string | null;
  }) {
    const { userId, actorUserId, actorName, actorAvatar, targetId, text = null } = params;
  
    if (!userId || !actorUserId || !targetId) return;
    if (userId === actorUserId) return;
  
    await addDoc(collection(db, "notifications"), {
      userId,
      actorUserId,
      actorName,
      actorAvatar,
      type: "message",
      targetId,
      text,
      read: false,
      createdAt: serverTimestamp(),
    });
  }
  
  export function listenNotifications(
    userId: string,
    callback: (items: AppNotification[]) => void
  ): Unsubscribe {
    const q = query(
      collection(db, "notifications"),
      where("userId", "==", userId)
    );
  
    return onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs
          .map((d) => mapNotification(d.id, d.data()))
          .sort((a, b) => {
            const aMs = a.createdAt?.toMillis?.() ?? 0;
            const bMs = b.createdAt?.toMillis?.() ?? 0;
            return bMs - aMs;
          });
  
        callback(items);
      },
      (error) => {
        console.error("listenNotifications error:", error);
        callback([]);
      }
    );
  }
  
  export async function markNotificationAsRead(notificationId: string) {
    await updateDoc(doc(db, "notifications", notificationId), {
      read: true,
    });
  }
  
  export async function markNotificationsAsRead(notificationIds: string[]) {
    await Promise.all(notificationIds.map((id) => markNotificationAsRead(id)));
  }