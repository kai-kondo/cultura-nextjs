// Messages.tsx
import * as React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Separator } from "./ui/separator";
import { ScrollArea } from "./ui/scroll-area";
import {
  Search,
  Send,
  Paperclip,
  Image as ImageIcon,
  Smile,
  Phone,
  Video,
  Ellipsis,
  CheckCheck,
  ArrowLeft,
  Heart,
} from "lucide-react";

type Participant = {
  id: string;
  name: string;
  avatar: string;
  subtitle?: string; // location, role etc.
};

type Message = {
  id: string;
  fromId: string;
  text?: string;
  imageUrl?: string;
  createdAt: string; // ISO
  read?: boolean;
};

type Thread = {
  id: string;
  participants: [Participant, Participant]; // you + other
  lastMessageAt: string;
  unread: number;
  messages: Message[];
  tags?: string[]; // “Surf”, “Japanese” etc
};

interface MessagesProps {
  me: Participant;
  threads: Thread[];
  onOpenProfile?: (otherId: string) => void;
}

export function Messages({ me, threads, onOpenProfile }: MessagesProps) {
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState(threads[0]?.id);
  const active = useMemo(
    () => threads.find((t) => t.id === activeId),
    [threads, activeId]
  );

  const other =
    active?.participants.find((p) => p.id !== me.id) || active?.participants[0];

  // Filtered conversations
  const filtered = useMemo(() => {
    if (!query.trim()) return threads;
    const q = query.toLowerCase();
    return threads.filter((t) => {
      const o = t.participants.find((p) => p.id !== me.id)!;
      return (
        o.name.toLowerCase().includes(q) ||
        (o.subtitle || "").toLowerCase().includes(q)
      );
    });
  }, [threads, query, me.id]);

  return (
    <div className="grid h-[calc(100vh-120px)] grid-cols-1 md:grid-cols-[360px_minmax(0,1fr)] bg-gradient-to-br from-orange-50 via-amber-50 to-rose-100 rounded-2xl overflow-hidden border border-orange-100">
      {/* Left: thread list */}
      <aside className="hidden md:flex flex-col bg-white/90 backdrop-blur border-r">
        <div className="p-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search conversations"
              className="pl-9"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>
        <Separator />
        <ScrollArea className="flex-1">
          <ul className="p-2 space-y-1">
            {filtered.map((t) => {
              const o = t.participants.find((p) => p.id !== me.id)!;
              const activeStyle =
                t.id === activeId
                  ? "bg-blue-50 border-blue-200"
                  : "hover:bg-gray-50";
              return (
                <li key={t.id}>
                  <button
                    onClick={() => setActiveId(t.id)}
                    className={`w-full text-left p-3 rounded-xl border ${activeStyle} transition-colors`}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={o.avatar} alt={o.name} />
                        <AvatarFallback>{o.name.slice(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-gray-900 truncate">
                            {o.name}
                          </p>
                          <span className="text-[11px] text-gray-500">
                            {new Date(t.lastMessageAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 truncate">
                          {o.subtitle}
                        </p>
                      </div>
                      {t.unread > 0 && (
                        <span className="ml-2 inline-flex min-w-[1.5rem] justify-center rounded-full bg-blue-600 px-2 py-1 text-[10px] font-semibold text-white">
                          {t.unread}
                        </span>
                      )}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </ScrollArea>
      </aside>

      {/* Right: chat area */}
      <main className="flex flex-col bg-white/80 backdrop-blur">
        {/* Chat header */}
        <div className="flex items-center gap-3 px-3 md:px-4 py-3 border-b bg-white/70">
          <button
            className="md:hidden rounded-full p-2 hover:bg-gray-100"
            onClick={() => setActiveId(undefined as any)}
            aria-label="Back"
            title="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <Avatar 
            className="h-9 w-9 cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all" 
            onClick={() => onOpenProfile?.(other?.id || '')}
          >
            <AvatarImage src={other?.avatar || ""} alt={other?.name || ""} />
            <AvatarFallback>{other?.name?.slice(0, 2) || "AU"}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onOpenProfile?.(other?.id || '')}>
            <p className="font-medium text-gray-900 truncate hover:text-blue-600 transition-colors">{other?.name}</p>
            <p className="text-xs text-gray-500 truncate">
              {other?.subtitle || "Cultural Au Pair"}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" aria-label="Audio call">
              <Phone className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" aria-label="Video call">
              <Video className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="View Profile"
              onClick={() => onOpenProfile?.(other?.id || '')}
              title="View Profile"
            >
              <Ellipsis className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <MessageList me={me} messages={active?.messages || []} />

        {/* Composer */}
        <Composer />
      </main>
    </div>
  );
}

/* ---------- Subcomponents ---------- */

function MessageList({ me, messages }: { me: Participant; messages: Message[] }) {
  const ref = useRef<HTMLDivElement>(null);

  // auto-scroll to bottom when new messages
  useEffect(() => {
    ref.current?.scrollTo({ top: ref.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  // group by date
  const groups = useMemo(() => {
    const map = new Map<string, Message[]>();
    messages.forEach((m) => {
      const d = new Date(m.createdAt);
      const key = d.toLocaleDateString();
      const arr = map.get(key) || [];
      arr.push(m);
      map.set(key, arr);
    });
    return Array.from(map.entries());
  }, [messages]);

  return (
    <div ref={ref} className="flex-1 overflow-y-auto px-3 md:px-6 py-4 space-y-6">
      {groups.map(([date, msgs]) => (
        <div key={date} className="space-y-3">
          <div className="sticky top-2 z-[1] flex justify-center">
            <span className="rounded-full bg-white/80 backdrop-blur px-3 py-1 text-[11px] text-gray-600 border">
              {date}
            </span>
          </div>
          {msgs.map((m) => {
            const isMe = m.fromId === me.id;
            return (
              <div key={m.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[78%] rounded-2xl px-3 py-2 shadow-sm ${
                    isMe
                      ? "bg-gradient-to-br from-orange-500 to-rose-600 text-white"
                      : "bg-white border"
                  }`}
                >
                  {m.text && (
                    <p className={`text-sm leading-relaxed break-words ${isMe ? "" : "text-gray-800"}`}>
                      {m.text}
                    </p>
                  )}
                  {m.imageUrl && (
                    <img
                      src={m.imageUrl}
                      alt="attachment"
                      className="rounded-lg mt-1 max-h-64 object-cover"
                    />
                  )}
                  <div className={`mt-1 flex items-center gap-1 ${isMe ? "text-white/80" : "text-gray-500"}`}>
                    <span className="text-[10px]">
                      {new Date(m.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {isMe && m.read && <CheckCheck className="w-3.5 h-3.5" aria-label="Read" />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ))}

      {/* typing indicator (demo) */}
      <div className="flex items-center gap-2 text-gray-500">
        <div className="h-6 w-10 rounded-full bg-gray-200 animate-pulse" />
        <span className="text-xs">Typing…</span>
      </div>
    </div>
  );
}

function Composer() {
  const [text, setText] = useState("");
  const submit = () => {
    if (!text.trim()) return;
    // TODO: send API
    setText("");
  };

  return (
    <div className="border-t bg-white/80 backdrop-blur px-3 md:px-4 py-3">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" title="Attach file" aria-label="Attach file">
          <Paperclip className="w-5 h-5" />
        </Button>
        <Button variant="ghost" size="icon" title="Insert image" aria-label="Insert image">
          <ImageIcon className="w-5 h-5" />
        </Button>
        <Button variant="ghost" size="icon" title="Reaction" aria-label="Reaction">
          <Smile className="w-5 h-5" />
        </Button>

        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), submit())}
          placeholder="Write a message…"
          className="flex-1"
        />

        <Button
          onClick={submit}
          className="bg-gradient-to-r from-orange-500 to-rose-600 hover:from-orange-600 hover:to-rose-700 text-white"
          aria-label="Send message"
        >
          <Send className="w-4 h-4 mr-1" />
          Send
        </Button>
      </div>
    </div>
  );
}



/* ---------- Demo usage ---------- */
// 下記のダミーデータを消して、実データに差し替えれば即使えます。
export function DemoMessages() {
  const me: Participant = {
    id: "me",
    name: "Kai",
    avatar: "https://i.pravatar.cc/120?img=3",
    subtitle: "Ocean Grove • EN/JP",
  };
  const other: Participant = {
    id: "emma",
    name: "Emma",
    avatar: "https://i.pravatar.cc/120?img=5",
    subtitle: "Sydney • Au Pair (Swim/Art)",
  };
  const threads: Thread[] = [
    {
      id: "t1",
      participants: [me, other],
      lastMessageAt: new Date().toISOString(),
      unread: 2,
      messages: [
        {
          id: "m1",
          fromId: "emma",
          text: "Hi! I saw your profile and it looks like a great fit.",
          createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        },
        {
          id: "m2",
          fromId: "me",
          text: "Awesome! We live near the beach and our kids love swimming.",
          createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
          read: true,
        },
        {
          id: "m3",
          fromId: "emma",
          text: "Sounds perfect. I can do after-school hours Mon–Thu.",
          createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
        },
      ],
    },
  ];

  return <Messages me={me} threads={threads} onOpenProfile={(id) => console.log("open", id)} />;
}