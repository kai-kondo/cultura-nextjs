"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Send, UserRound } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";

export type MessageParticipant = {
  id: string;
  name: string;
  avatar: string;
  subtitle?: string;
};

export type MessageItem = {
  id: string;
  fromId: string;
  text: string;
  imageUrl: string | null;
  createdAt: string;
  read: boolean;
};

export type MessageThread = {
  id: string;
  participants: [MessageParticipant, MessageParticipant];
  lastMessageAt: string;
  unread: number;
  messages: MessageItem[];
  tags?: string[];
};

/** One row in the left conversation list (backed by Firestore threads). */
export type MessageConversationListItem = {
  threadId: string;
  /** Other participant (for avatar / label). */
  other: MessageParticipant;
  lastPreview: string;
  lastMessageAtIso: string;
  unread: number;
};

export type MessagesProps = {
  me: MessageParticipant;
  threads: MessageThread[];
  activeThreadId?: string | null;
  loading?: boolean;
  sending?: boolean;
  onSendMessage: (args: { threadId: string; text: string }) => void | Promise<void>;
  onOpenProfile: () => void;
  /** When set, shown as the left column on large screens. */
  conversationList?: MessageConversationListItem[];
  /** Navigate to `/messages/[routeId]` (other user’s uid). */
  onSelectConversation?: (routeId: string) => void;
};

function formatMessageTime(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  } catch {
    return "";
  }
}

function formatListDate(iso: string) {
  try {
    const d = new Date(iso);
    const now = new Date();
    const sameDay =
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear();
    if (sameDay) {
      return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
    }
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  } catch {
    return "";
  }
}

export function Messages({
  me,
  threads,
  activeThreadId,
  loading = false,
  sending = false,
  onSendMessage,
  onOpenProfile,
  conversationList = [],
  onSelectConversation,
}: MessagesProps) {
  const router = useRouter();
  const [draft, setDraft] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const activeThread = useMemo(() => {
    if (threads.length === 0) return null;
    if (activeThreadId) {
      return threads.find((t) => t.id === activeThreadId) ?? threads[0];
    }
    return threads[0];
  }, [threads, activeThreadId]);

  const other = useMemo(() => {
    if (!activeThread) return null;
    return (
      activeThread.participants.find((p) => p.id !== me.id) ?? activeThread.participants[1] ?? null
    );
  }, [activeThread, me.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeThread?.messages.length, activeThread?.id]);

  const handleSend = async () => {
    const text = draft.trim();
    if (!text || !activeThread || sending) return;
    setDraft("");
    await onSendMessage({ threadId: activeThread.id, text });
  };

  const showChatLoader = loading && !activeThread;
  const showSidebar = conversationList.length > 0 && typeof onSelectConversation === "function";

  return (
    <div className="flex h-[min(760px,calc(100vh-5.5rem))] min-h-[500px] flex-col overflow-hidden rounded-[28px] border border-orange-100/80 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)] lg:flex-row">
      {showSidebar ? (
        <aside
          className="hidden h-full w-[min(100%,340px)] shrink-0 flex-col border-r border-orange-100/80 bg-[#fffaf8] lg:flex"
          aria-label="Conversations"
        >
          <div className="border-b border-orange-100/80 px-5 py-4">
            <p className="text-[13px] font-semibold tracking-wide text-orange-600">Chats</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">Messages</p>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">
            {conversationList.map((row) => {
              const selected = row.threadId === activeThreadId;
              return (
                <button
                  key={row.threadId}
                  type="button"
                  onClick={() => onSelectConversation!(row.other.id)}
                  className={`mx-2 my-1.5 flex w-[calc(100%-1rem)] items-center gap-3 rounded-2xl px-3 py-3 text-left transition-all ${
                    selected
                      ? "bg-white shadow-[0_8px_24px_rgba(251,113,133,0.12)] ring-1 ring-orange-100"
                      : "bg-transparent hover:bg-white"
                  }`}
                >
                  <Avatar className="h-12 w-12 shrink-0 border border-orange-100 shadow-sm">
                    <AvatarImage src={row.other.avatar} alt="" />
                    <AvatarFallback className="bg-orange-100 text-orange-800 text-xs">
                      {row.other.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="truncate font-medium text-gray-900">{row.other.name}</p>
                      <span className="shrink-0 text-[11px] text-gray-500">
                        {formatListDate(row.lastMessageAtIso)}
                      </span>
                    </div>
                    <p className="truncate text-sm text-gray-600">
                      {row.lastPreview || "No messages yet"}
                    </p>
                  </div>
                  {row.unread > 0 ? (
                    <span className="mt-1 flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-rose-500 px-1.5 text-[10px] font-semibold text-white shadow-sm">
                      {row.unread > 99 ? "99+" : row.unread}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </aside>
      ) : null}

      <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-white">
      <div className="flex items-center gap-3 border-b border-orange-100/80 bg-white px-4 py-3 sm:px-5">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="shrink-0 rounded-full text-gray-700 hover:bg-orange-50"
          aria-label="Back to home"
          onClick={() => router.push("/home")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        {other ? (
          <>
            <Avatar className="h-11 w-11 border border-orange-100 shadow-sm">
              <AvatarImage src={other.avatar} alt="" />
              <AvatarFallback className="bg-orange-100 text-orange-800">
                {other.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-gray-900">{other.name}</p>
              {other.subtitle ? (
                <p className="truncate text-xs text-gray-600">{other.subtitle}</p>
              ) : null}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="shrink-0 rounded-full border-orange-200 bg-white text-orange-800 hover:bg-orange-50"
              onClick={onOpenProfile}
            >
              <UserRound className="mr-1.5 h-4 w-4" />
              Profile
            </Button>
          </>
        ) : (
          <div className="flex flex-1 items-center gap-2 text-sm text-gray-600">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-orange-600" />
                Loading conversation…
              </>
            ) : (
              "No conversation"
            )}
          </div>
        )}
      </div>

      <div className="relative flex min-h-0 flex-1 flex-col bg-[#fffdfc]">
        {showChatLoader ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-gray-600">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            <p className="text-sm">Loading messages…</p>
          </div>
        ) : activeThread ? (
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-[radial-gradient(circle_at_top,_rgba(251,113,133,0.06),_transparent_32%),radial-gradient(circle_at_bottom,_rgba(249,115,22,0.06),_transparent_28%)] px-4 py-5 sm:px-5">
              {activeThread.messages.length === 0 ? (
                <p className="text-center text-sm text-gray-500">No messages yet. Say hello!</p>
              ) : null}
              {activeThread.messages.map((message) => {
                const mine = message.fromId === me.id;
                return (
                  <div key={message.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-sm shadow-sm sm:max-w-[72%] ${
                        mine
                          ? "rounded-br-md bg-gradient-to-br from-orange-500 to-rose-500 text-white shadow-[0_10px_24px_rgba(249,115,22,0.22)]"
                          : "rounded-bl-md border border-orange-100/80 bg-white text-gray-900 shadow-[0_6px_18px_rgba(15,23,42,0.06)]"
                      }`}
                    >
                      {message.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={message.imageUrl}
                          alt=""
                          className="mb-2 max-h-48 w-full rounded-lg object-cover"
                        />
                      ) : null}
                      {message.text ? (
                        <p className="whitespace-pre-wrap break-words leading-relaxed">{message.text}</p>
                      ) : null}
                      <div
                        className={`mt-1 flex items-center justify-end gap-2 text-[10px] ${
                          mine ? "text-white/80" : "text-gray-500"
                        }`}
                      >
                        <span>{formatMessageTime(message.createdAt)}</span>
                        {mine ? <span>{message.read ? "Read" : "Sent"}</span> : null}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            <div className="border-t border-orange-100/80 bg-white px-4 py-4 sm:px-5">
              <div className="flex items-end gap-3 rounded-[26px] border border-orange-100 bg-[#fffaf8] p-2 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      void handleSend();
                    }
                  }}
                  placeholder="Type a message…"
                  rows={1}
                  disabled={sending || loading}
                  className="min-h-[44px] flex-1 resize-none border-0 bg-transparent px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-0 disabled:opacity-60"
                />
                <Button
                  type="button"
                  size="icon"
                  className="h-11 w-11 shrink-0 rounded-full bg-gradient-to-r from-orange-500 to-rose-600 shadow-[0_10px_24px_rgba(249,115,22,0.22)] hover:from-orange-600 hover:to-rose-700"
                  disabled={sending || loading || !draft.trim()}
                  onClick={() => void handleSend()}
                  aria-label="Send message"
                >
                  {sending ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-center px-4 text-center text-sm text-gray-500">
            Unable to load this conversation.
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
