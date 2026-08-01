"use client";

import { useEffect, useState } from "react";
import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
} from "firebase/firestore";
import { useRouter } from "next/navigation";
import { Heart, MessageCircle, Users } from "lucide-react";
import { motion } from "motion/react";
import { db } from "@/lib/firebase";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

interface FirestorePost {
  authorName?: string;
  authorAvatar?: string;
  authorUserType?: "family" | "aupair";
  content?: string;
  category?: string;
  likeCount?: number;
  commentCount?: number;
  status?: string;
  deletedAt?: Timestamp | null;
  createdAt?: Timestamp | null;
}

interface HighlightPost {
  id: string;
  authorName: string;
  authorAvatar: string;
  role: string;
  content: string;
  likeCount: number;
  commentCount: number;
  timestamp: string;
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "CU";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase();
}

function formatRelativeTime(timestamp?: Timestamp | null) {
  if (!timestamp?.toDate) return "Just now";
  const diffMs = Date.now() - timestamp.toDate().getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return timestamp.toDate().toLocaleDateString();
}

export function CommunityHighlights() {
  const router = useRouter();
  const [posts, setPosts] = useState<HighlightPost[]>([]);

  useEffect(() => {
    const postsQuery = query(collection(db, "posts"), orderBy("createdAt", "desc"), limit(12));
    const unsubscribe = onSnapshot(
      postsQuery,
      (snapshot) => {
        const rows = snapshot.docs
          .map((docSnap) => ({ id: docSnap.id, data: docSnap.data() as FirestorePost }))
          .filter(({ data }) => (data.status || "active") === "active" && data.deletedAt == null)
          .slice(0, 3)
          .map(({ id, data }) => ({
            id,
            authorName: data.authorName || "Cultura Member",
            authorAvatar: data.authorAvatar || "",
            role: data.authorUserType === "family" ? "Host Family" : "Au Pair",
            content: data.content || "",
            likeCount: Number(data.likeCount || 0),
            commentCount: Number(data.commentCount || 0),
            timestamp: formatRelativeTime(data.createdAt),
          }));
        setPosts(rows);
      },
      () => setPosts([])
    );
    return () => unsubscribe();
  }, []);

  if (posts.length === 0) return null;

  return (
    <section className="mt-12 px-4">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 sm:text-3xl">
              From the community
            </h2>
            <p className="mt-2 text-sm text-gray-500 sm:text-base">
              Recent stories and tips from au pairs and host families
            </p>
          </div>
          <button
            type="button"
            onClick={() => router.push("/community")}
            className="hidden shrink-0 items-center gap-1.5 text-sm font-semibold text-gray-900 hover:underline sm:flex"
          >
            <Users className="h-4 w-4" />
            View community
          </button>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          {posts.map((post, index) => (
            <motion.button
              key={post.id}
              type="button"
              onClick={() => router.push("/community")}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="flex flex-col rounded-2xl border border-gray-100 bg-white p-5 text-left shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="mb-3 flex items-center gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={post.authorAvatar} alt={post.authorName} className="object-cover" />
                  <AvatarFallback>{getInitials(post.authorName)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-gray-900">{post.authorName}</p>
                  <p className="text-xs text-gray-500">
                    {post.role} · {post.timestamp}
                  </p>
                </div>
              </div>

              <p className="mb-4 line-clamp-3 flex-1 text-sm leading-relaxed text-gray-600">
                {post.content}
              </p>

              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Heart className="h-3.5 w-3.5" />
                  {post.likeCount}
                </span>
                <span className="flex items-center gap-1">
                  <MessageCircle className="h-3.5 w-3.5" />
                  {post.commentCount}
                </span>
              </div>
            </motion.button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => router.push("/community")}
          className="mt-6 flex w-full items-center justify-center gap-1.5 text-sm font-semibold text-gray-900 hover:underline sm:hidden"
        >
          <Users className="h-4 w-4" />
          View community
        </button>
      </div>
    </section>
  );
}
