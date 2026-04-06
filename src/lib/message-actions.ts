// src/lib/message-actions.ts
import {
    collection,
    doc,
    // getDoc,  <-- removed
    getDocs,
    setDoc,
    addDoc,
    updateDoc,
    query,
    where,
    orderBy,
    onSnapshot,
    serverTimestamp,
    arrayUnion,
    limit,
    Timestamp,
    DocumentData,
    Unsubscribe,
  } from "firebase/firestore";
  import { db } from "@/lib/firebase";
  
  export type ChatParticipantSummary = {
    name: string;
    avatar: string;
    subtitle?: string;
  };
  
  export type ChatThread = {
    id: string;
    participantIds: [string, string];
    participantSummary: Record<string, ChatParticipantSummary>;
    lastMessageText: string;
    lastMessageAt: Timestamp | null;
    createdAt: Timestamp | null;
    updatedAt: Timestamp | null;
  };
  
  export type ChatMessage = {
    id: string;
    senderId: string;
    text?: string;
    imageUrl?: string | null;
    createdAt: Timestamp | null;
    readBy: string[];
  };
  
  export type CreateOrGetThreadInput = {
    me: {
      id: string;
      name: string;
      avatar: string;
      subtitle?: string;
    };
    other: {
      id: string;
      name: string;
      avatar: string;
      subtitle?: string;
    };
  };
  
  function buildThreadId(uidA: string, uidB: string) {
    return [uidA, uidB].sort().join("_");
  }
  
  function ensureValidPair(meId: string, otherId: string) {
    if (!meId || !otherId) {
      throw new Error("Both user IDs are required.");
    }
    if (meId === otherId) {
      throw new Error("You cannot create a thread with yourself.");
    }
  }
  
  function mapThread(id: string, data: DocumentData): ChatThread {
    return {
      id,
      participantIds: data.participantIds,
      participantSummary: data.participantSummary ?? {},
      lastMessageText: data.lastMessageText ?? "",
      lastMessageAt: data.lastMessageAt ?? null,
      createdAt: data.createdAt ?? null,
      updatedAt: data.updatedAt ?? null,
    };
  }
  
  function mapMessage(id: string, data: DocumentData): ChatMessage {
    return {
      id,
      senderId: data.senderId,
      text: data.text ?? "",
      imageUrl: data.imageUrl ?? null,
      createdAt: data.createdAt ?? null,
      readBy: Array.isArray(data.readBy) ? data.readBy : [],
    };
  }
  
  /**
   * 1対1専用 thread を決定的 ID で作成 or 取得
   */
  export async function createOrGetThread(input: CreateOrGetThreadInput) {
    const { me, other } = input;
    ensureValidPair(me.id, other.id);
  
    const threadId = buildThreadId(me.id, other.id);
    const threadRef = doc(db, "threads", threadId);
  
    const createPayload = {
      participantIds: [me.id, other.id].sort(),
      participantSummary: {
        [me.id]: {
          name: me.name,
          avatar: me.avatar,
          subtitle: me.subtitle ?? "",
        },
        [other.id]: {
          name: other.name,
          avatar: other.avatar,
          subtitle: other.subtitle ?? "",
        },
      },
      lastMessageText: "",
      lastMessageAt: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
  
    try {
      await setDoc(threadRef, createPayload);
      return threadId;
    } catch (error) {
      await updateDoc(threadRef, {
        [`participantSummary.${me.id}`]: {
          name: me.name,
          avatar: me.avatar,
          subtitle: me.subtitle ?? "",
        },
        [`participantSummary.${other.id}`]: {
          name: other.name,
          avatar: other.avatar,
          subtitle: other.subtitle ?? "",
        },
        updatedAt: serverTimestamp(),
      });
  
      return threadId;
    }
  }
  
  /**
   * 自分が参加者の thread 一覧をリアルタイム購読
   */
  export function listenThreads(
    myUid: string,
    callback: (threads: ChatThread[]) => void
  ): Unsubscribe {
    const q = query(
      collection(db, "threads"),
      where("participantIds", "array-contains", myUid)
    );
  
    return onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs
          .map((d) => mapThread(d.id, d.data()))
          .sort((a, b) => {
            const aMs = a.updatedAt?.toMillis?.() ?? 0;
            const bMs = b.updatedAt?.toMillis?.() ?? 0;
            return bMs - aMs;
          });
        callback(items);
      },
      (error) => {
        console.error("listenThreads:", error);
        callback([]);
      }
    );
  }
  
  /**
   * thread 内メッセージをリアルタイム購読
   */
  export function listenMessages(
    threadId: string,
    callback: (messages: ChatMessage[]) => void
  ): Unsubscribe {
    const q = query(
      collection(db, "threads", threadId, "messages"),
      orderBy("createdAt", "asc")
    );
  
    return onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((d) => mapMessage(d.id, d.data()));
        callback(items);
      },
      (error) => {
        console.error("listenMessages:", error);
        callback([]);
      }
    );
  }
  
  /**
   * 初回ロード用に thread 一覧を1回だけ取得したいとき
   */
  export async function getThreadsOnce(myUid: string) {
    const q = query(
      collection(db, "threads"),
      where("participantIds", "array-contains", myUid)
    );
  
    const snapshot = await getDocs(q);
    return snapshot.docs
      .map((d) => mapThread(d.id, d.data()))
      .sort((a, b) => {
        const aMs = a.updatedAt?.toMillis?.() ?? 0;
        const bMs = b.updatedAt?.toMillis?.() ?? 0;
        return bMs - aMs;
      });
  }
  
  /**
   * テキストメッセージ送信
   */
  export async function sendTextMessage(params: {
    threadId: string;
    senderId: string;
    text: string;
  }) {
    const { threadId, senderId } = params;
    const text = params.text.trim();
  
    if (!threadId) throw new Error("threadId is required.");
    if (!senderId) throw new Error("senderId is required.");
    if (!text) return;
  
    const threadRef = doc(db, "threads", threadId);
    const messagesRef = collection(db, "threads", threadId, "messages");
  
    await addDoc(messagesRef, {
      senderId,
      text,
      imageUrl: null,
      createdAt: serverTimestamp(),
      readBy: [senderId],
    });
  
    await updateDoc(threadRef, {
      lastMessageText: text,
      lastMessageAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }
  
  /**
   * 画像付きメッセージ用
   * 画像アップロードは Storage 側で行い、URL を受け取る形
   */
  export async function sendImageMessage(params: {
    threadId: string;
    senderId: string;
    imageUrl: string;
    text?: string;
  }) {
    const { threadId, senderId, imageUrl } = params;
    const text = params.text?.trim() ?? "";
  
    if (!threadId) throw new Error("threadId is required.");
    if (!senderId) throw new Error("senderId is required.");
    if (!imageUrl) throw new Error("imageUrl is required.");
  
    const threadRef = doc(db, "threads", threadId);
    const messagesRef = collection(db, "threads", threadId, "messages");
  
    await addDoc(messagesRef, {
      senderId,
      text,
      imageUrl,
      createdAt: serverTimestamp(),
      readBy: [senderId],
    });
  
    await updateDoc(threadRef, {
      lastMessageText: text || "📷 Photo",
      lastMessageAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }
  
  /**
   * 相手メッセージを既読にする
   */
  export async function markMessagesAsRead(threadId: string, myUid: string) {
    const q = query(
      collection(db, "threads", threadId, "messages"),
      orderBy("createdAt", "desc"),
      limit(50)
    );
  
    const snapshot = await getDocs(q);
  
    const targets = snapshot.docs.filter((docSnap) => {
      const data = docSnap.data();
      const readBy = Array.isArray(data.readBy) ? data.readBy : [];
      return data.senderId !== myUid && !readBy.includes(myUid);
    });
  
    await Promise.all(
      targets.map((docSnap) =>
        updateDoc(docSnap.ref, {
          readBy: arrayUnion(myUid),
        })
      )
    );
  }
  
  /**
   * 既読件数から unread を計算したいとき用
   * 初期段階ではクライアント計算の方が安全
   */
  export function countUnreadMessages(messages: ChatMessage[], myUid: string) {
    return messages.filter(
      (m) => m.senderId !== myUid && !m.readBy.includes(myUid)
    ).length;
  }