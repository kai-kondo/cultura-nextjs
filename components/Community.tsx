"use client";

import { useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  increment,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  type Timestamp,
  type Unsubscribe,
} from "firebase/firestore";
import { auth, db, storage } from "@/lib/firebase";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Textarea } from "./ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Separator } from "./ui/separator";
import {
  Heart,
  MessageCircle,
  Bookmark,
  Image as ImageIcon,
  Smile,
  TrendingUp,
  Users,
  BookOpen,
  Loader2,
  Send,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface CommunityProps {
  userType: "family" | "aupair";
  onOpenSettings?: () => void;
  onOpenMyProfile?: () => void;
  onNavigateHome?: () => void;
}

interface Post {
  id: string;
  author: {
    name: string;
    avatar: string;
    role: string;
    location: string;
  };
  content: string;
  image?: string;
  timestamp: string;
  category: string;
  likes: number;
  comments: number;
  isLiked: boolean;
  isBookmarked: boolean;
  tags: string[];
  isMine: boolean;
}

interface FirestorePost {
  authorUid?: string;
  authorUserType?: "family" | "aupair";
  authorProfileRef?: string | null;
  authorName?: string;
  authorAvatar?: string;
  authorLocation?: string;
  content?: string;
  imageUrls?: string[];
  category?: string;
  tags?: string[];
  likeCount?: number;
  commentCount?: number;
  visibility?: string;
  status?: string;
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
}

interface FirestoreComment {
  postId?: string;
  authorUid?: string;
  authorUserType?: "family" | "aupair";
  authorProfileRef?: string | null;
  authorName?: string;
  authorAvatar?: string;
  content?: string;
  likeCount?: number;
  status?: string;
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
}

interface CommentItem {
  id: string;
  postId: string;
  author: {
    name: string;
    avatar: string;
    role: string;
  };
  content: string;
  timestamp: string;
}

const PLACEHOLDER_AVATAR =
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150";

function getInitials(name?: string) {
  if (!name) return "CU";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "CU";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase();
}

function resolveProfileImage(profileData: Record<string, any>, fallback?: string | null) {
  const candidates = [
    profileData.profileImage,
    profileData.avatar,
    profileData.photoURL,
    profileData.photo,
    profileData.profilePhoto,
    profileData.image,
    Array.isArray(profileData.gallery) ? profileData.gallery[0] : null,
    Array.isArray(profileData.photos) ? profileData.photos[0] : null,
    fallback,
  ];

  const found = candidates.find((value) => typeof value === "string" && value.trim().length > 0);
  return typeof found === "string" ? found : "";
}

const categories = [
  { id: "all", label: "All Posts", icon: Users },
  { id: "questions", label: "Questions", icon: MessageCircle },
  { id: "tips", label: "Tips & Advice", icon: BookOpen },
  { id: "experience", label: "Experiences", icon: Heart },
];

const trendingTopics = [
  { tag: "Language Learning", count: 234 },
  { tag: "Culture Shock", count: 189 },
  { tag: "Host Family Tips", count: 156 },
  { tag: "Travel", count: 143 },
  { tag: "Homesickness", count: 98 },
];

function formatRelativeTime(timestamp?: Timestamp | null) {
  if (!timestamp?.toDate) return "Just now";

  const date = timestamp.toDate();
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes === 1 ? "" : "s"} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;

  return date.toLocaleDateString();
}

function normalizeCategory(category?: string) {
  if (!category) return "experience";
  const normalized = category.toLowerCase();
  if (["questions", "tips", "experience"].includes(normalized)) {
    return normalized;
  }
  if (normalized === "advice") return "tips";
  return "experience";
}

function getCategoryLabel(category: string) {
  const match = categories.find((item) => item.id === category);
  return match?.label || "Post";
}

function roleLabel(userType?: "family" | "aupair") {
  return userType === "family" ? "Host Family" : "Au Pair";
}

function mapPost(
  id: string,
  data: FirestorePost,
  likedPostIds: Set<string>,
  bookmarkedPostIds: Set<string>,
  currentUid?: string | null
): Post {
  const image = Array.isArray(data.imageUrls) && data.imageUrls.length > 0 ? data.imageUrls[0] : undefined;

  return {
    id,
    author: {
      name: data.authorName || "Cultura Member",
      avatar: data.authorAvatar || "",
      role: roleLabel(data.authorUserType),
      location: data.authorLocation || "Unknown location",
    },
    content: data.content || "",
    image,
    timestamp: formatRelativeTime(data.createdAt),
    category: normalizeCategory(data.category),
    likes: Number(data.likeCount || 0),
    comments: Number(data.commentCount || 0),
    isLiked: likedPostIds.has(id),
    isBookmarked: bookmarkedPostIds.has(id),
    tags: Array.isArray(data.tags) ? data.tags : [],
    isMine: !!currentUid && data.authorUid === currentUid,
  };
}

function mapComment(id: string, data: FirestoreComment): CommentItem {
  return {
    id,
    postId: data.postId || "",
    author: {
      name: data.authorName || "Cultura Member",
      avatar: data.authorAvatar || "",
      role: roleLabel(data.authorUserType),
    },
    content: data.content || "",
    timestamp: formatRelativeTime(data.createdAt),
  };
}

async function resolveCurrentAuthor(user: User, userType: "family" | "aupair") {
  const userSnap = await getDoc(doc(db, "users", user.uid));
  const profileRef = userSnap.exists() ? (userSnap.data().profileRef as string | null | undefined) : null;

  let authorName = user.displayName || (userType === "family" ? "My Family" : "Me");
  let authorAvatar = user.photoURL || "";
  let authorLocation = "Your Location";
  let authorProfileRef: string | null = profileRef || null;

  if (profileRef) {
    const [collectionName, profileId] = profileRef.split("/");
    if (collectionName && profileId) {
      const profileSnap = await getDoc(doc(db, collectionName, profileId));
      if (profileSnap.exists()) {
        const profileData = profileSnap.data() as Record<string, any>;

        if (collectionName === "auPairProfiles") {
          authorName = profileData.name || authorName;
          authorAvatar = resolveProfileImage(profileData, authorAvatar);
          authorLocation = [
            profileData.currentLocation?.city,
            profileData.currentLocation?.country,
          ]
            .filter(Boolean)
            .join(", ") || authorLocation;
        }

        if (collectionName === "familyProfiles") {
          authorName = profileData.familyName || authorName;
          authorAvatar = resolveProfileImage(profileData, authorAvatar);
          authorLocation = [profileData.location?.city, profileData.location?.country]
            .filter(Boolean)
            .join(", ") || authorLocation;
        }
      }
    }
  }

  return {
    authorUid: user.uid,
    authorUserType: userType,
    authorProfileRef,
    authorName,
    authorAvatar,
    authorLocation,
  };
}

export function Community({ userType }: CommunityProps) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [postDocs, setPostDocs] = useState<Array<{ id: string; data: FirestorePost }>>([]);
  const [likedPostIds, setLikedPostIds] = useState<Set<string>>(new Set());
  const [bookmarkedPostIds, setBookmarkedPostIds] = useState<Set<string>>(new Set());
  const [openCommentPostIds, setOpenCommentPostIds] = useState<Set<string>>(new Set());
  const [commentsByPostId, setCommentsByPostId] = useState<Record<string, CommentItem[]>>({});
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [submittingCommentPostId, setSubmittingCommentPostId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState("all");
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostCategory, setNewPostCategory] = useState<"questions" | "tips" | "experience">("experience");
  const [newPostImage, setNewPostImage] = useState<File | null>(null);
  const [newPostImagePreview, setNewPostImagePreview] = useState("");
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [submittingPost, setSubmittingPost] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    const postsQuery = query(collection(db, "posts"), orderBy("createdAt", "desc"));

    const unsubscribePosts = onSnapshot(
      postsQuery,
      (snapshot) => {
        const nextPosts = snapshot.docs
          .map((postDoc) => ({
            id: postDoc.id,
            data: postDoc.data() as FirestorePost,
          }))
          .filter((post) => (post.data.status || "active") === "active");

        setPostDocs(nextPosts);
        setLoadingPosts(false);
      },
      (snapshotError) => {
        console.error("community posts error:", snapshotError);
        setError("Failed to load community posts.");
        setLoadingPosts(false);
      }
    );

    return () => unsubscribePosts();
  }, []);

  useEffect(() => {
    if (!firebaseUser?.uid) {
      setLikedPostIds(new Set());
      return;
    }

    const likesQuery = query(
      collection(db, "postLikes"),
      where("userId", "==", firebaseUser.uid)
    );

    const unsubscribeLikes = onSnapshot(
      likesQuery,
      (snapshot) => {
        setLikedPostIds(new Set(snapshot.docs.map((likeDoc) => String(likeDoc.data().postId || ""))));
      },
      (likesError) => {
        console.error("community likes error:", likesError);
      }
    );

    return () => unsubscribeLikes();
  }, [firebaseUser?.uid]);

  useEffect(() => {
    if (!firebaseUser?.uid) {
      setBookmarkedPostIds(new Set());
      return;
    }

    const bookmarksQuery = query(
      collection(db, "bookmarks"),
      where("userId", "==", firebaseUser.uid)
    );

    const unsubscribeBookmarks = onSnapshot(
      bookmarksQuery,
      (snapshot) => {
        setBookmarkedPostIds(
          new Set(snapshot.docs.map((bookmarkDoc) => String(bookmarkDoc.data().postId || "")))
        );
      },
      (bookmarksError) => {
        console.error("community bookmarks error:", bookmarksError);
      }
    );

    return () => unsubscribeBookmarks();
  }, [firebaseUser?.uid]);

  useEffect(() => {
    const unsubscribers: Unsubscribe[] = [];

    openCommentPostIds.forEach((postId) => {
      const commentsQuery = query(
        collection(db, "comments"),
        where("postId", "==", postId),
        orderBy("createdAt", "asc")
      );

      const unsubscribeComments = onSnapshot(
        commentsQuery,
        (snapshot) => {
          const nextComments = snapshot.docs
            .map((commentDoc) => mapComment(commentDoc.id, commentDoc.data() as FirestoreComment))
            .filter((comment) => comment.postId === postId);

          setCommentsByPostId((prev) => ({
            ...prev,
            [postId]: nextComments,
          }));
        },
        (commentsError) => {
          console.error("community comments error:", commentsError);
        }
      );

      unsubscribers.push(unsubscribeComments);
    });

    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }, [openCommentPostIds]);

  const posts = useMemo(
    () =>
      postDocs.map((post) =>
        mapPost(post.id, post.data, likedPostIds, bookmarkedPostIds, firebaseUser?.uid || null)
      ),
    [postDocs, likedPostIds, bookmarkedPostIds, firebaseUser?.uid]
  );

  const filteredPosts = useMemo(() => {
    if (activeCategory === "all") return posts;
    return posts.filter((post) => post.category === activeCategory);
  }, [activeCategory, posts]);

  const categoryCounts = useMemo(() => {
    return {
      all: posts.length,
      questions: posts.filter((post) => post.category === "questions").length,
      tips: posts.filter((post) => post.category === "tips").length,
      experience: posts.filter((post) => post.category === "experience").length,
    };
  }, [posts]);

  const handleLike = async (postId: string) => {
    if (!firebaseUser?.uid) {
      setError("Please sign in to like posts.");
      return;
    }

    setError(null);
    const likeDocId = `${postId}_${firebaseUser.uid}`;
    const likeRef = doc(db, "postLikes", likeDocId);
    const postRef = doc(db, "posts", postId);
    const alreadyLiked = likedPostIds.has(postId);

    try {
      if (alreadyLiked) {
        await deleteDoc(likeRef);
        await updateDoc(postRef, {
          likeCount: increment(-1),
          updatedAt: serverTimestamp(),
        });
      } else {
        await setDoc(likeRef, {
          postId,
          userId: firebaseUser.uid,
          createdAt: serverTimestamp(),
        });
        await updateDoc(postRef, {
          likeCount: increment(1),
          updatedAt: serverTimestamp(),
        });
      }
    } catch (likeError) {
      console.error("community like error:", likeError);
      setError("Failed to update like.");
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!firebaseUser?.uid) {
      setError("Please sign in to delete posts.");
      return;
    }

    const targetPost = postDocs.find((post) => post.id === postId);
    if (!targetPost || targetPost.data.authorUid !== firebaseUser.uid) {
      setError("You can only delete your own posts.");
      return;
    }

    const confirmed = window.confirm("Delete this post?");
    if (!confirmed) return;

    setError(null);

    try {
      await deleteDoc(doc(db, "posts", postId));

      setOpenCommentPostIds((prev) => {
        const next = new Set(prev);
        next.delete(postId);
        return next;
      });

      setCommentsByPostId((prev) => {
        const next = { ...prev };
        delete next[postId];
        return next;
      });

      setCommentDrafts((prev) => {
        const next = { ...prev };
        delete next[postId];
        return next;
      });
    } catch (deleteError) {
      console.error("community delete post error:", deleteError);
      setError("Failed to delete post.");
    }
  };

  const handleBookmark = async (postId: string) => {
    if (!firebaseUser?.uid) {
      setError("Please sign in to save posts.");
      return;
    }

    setError(null);
    const bookmarkDocId = `${postId}_${firebaseUser.uid}`;
    const bookmarkRef = doc(db, "bookmarks", bookmarkDocId);
    const alreadyBookmarked = bookmarkedPostIds.has(postId);

    try {
      if (alreadyBookmarked) {
        await deleteDoc(bookmarkRef);
      } else {
        await setDoc(bookmarkRef, {
          postId,
          userId: firebaseUser.uid,
          createdAt: serverTimestamp(),
        });
      }
    } catch (bookmarkError) {
      console.error("community bookmark error:", bookmarkError);
      setError("Failed to update saved post.");
    }
  };

  const handleToggleComments = (postId: string) => {
    setOpenCommentPostIds((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) {
        next.delete(postId);
      } else {
        next.add(postId);
      }
      return next;
    });
  };

  const handleCreateComment = async (postId: string) => {
    const draft = commentDrafts[postId]?.trim() || "";
    if (!draft) return;
    if (!firebaseUser) {
      setError("Please sign in to comment.");
      return;
    }

    setSubmittingCommentPostId(postId);
    setError(null);

    try {
      const author = await resolveCurrentAuthor(firebaseUser, userType);

      await addDoc(collection(db, "comments"), {
        postId,
        ...author,
        content: draft,
        likeCount: 0,
        status: "active",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      await updateDoc(doc(db, "posts", postId), {
        commentCount: increment(1),
        updatedAt: serverTimestamp(),
      });

      setCommentDrafts((prev) => ({
        ...prev,
        [postId]: "",
      }));

      setOpenCommentPostIds((prev) => {
        const next = new Set(prev);
        next.add(postId);
        return next;
      });
    } catch (commentError) {
      console.error("community create comment error:", commentError);
      setError("Failed to create comment.");
    } finally {
      setSubmittingCommentPostId(null);
    }
  };

  const handleSelectPostImage = (file: File | null) => {
    setNewPostImage(file);
  
    if (!file) {
      setNewPostImagePreview("");
      return;
    }
  
    const objectUrl = URL.createObjectURL(file);
    setNewPostImagePreview(objectUrl);
  };
  
  const clearPostImage = () => {
    setNewPostImage(null);
    setNewPostImagePreview("");
  };

  const handleCreatePost = async () => {
    if (!newPostContent.trim() && !newPostImage) return;
    if (!firebaseUser) {
      setError("Please sign in to create a post.");
      return;
    }
  
    setSubmittingPost(true);
    setError(null);
  
    try {
      const author = await resolveCurrentAuthor(firebaseUser, userType);
      let uploadedImageUrls: string[] = [];
  
      if (newPostImage) {
        const extension = newPostImage.name.split(".").pop() || "jpg";
        const imageRef = ref(
          storage,
          `community-posts/${firebaseUser.uid}/${Date.now()}.${extension}`
        );
  
        await uploadBytes(imageRef, newPostImage);
        const downloadUrl = await getDownloadURL(imageRef);
        uploadedImageUrls = [downloadUrl];
      }
  
      await addDoc(collection(db, "posts"), {
        ...author,
        content: newPostContent.trim(),
        imageUrls: uploadedImageUrls,
        category: newPostCategory,
        tags: [],
        likeCount: 0,
        commentCount: 0,
        visibility: "public",
        status: "active",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
  
      setNewPostContent("");
      setNewPostCategory("experience");
      clearPostImage();
      setIsCreatePostOpen(false);
    } catch (createError) {
      console.error("community create post error:", createError);
      setError("Failed to create post.");
    } finally {
      setSubmittingPost(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-rose-50">
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <aside className="lg:col-span-3 space-y-4">
            <Card className="p-4 bg-white/60 backdrop-blur-sm">
              <h3 className="text-gray-700 mb-4">Categories</h3>
              <nav className="space-y-2">
                {categories.map((category) => {
                  const Icon = category.icon;
                  const isActive = activeCategory === category.id;
                  return (
                    <button
                      key={category.id}
                      onClick={() => setActiveCategory(category.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                        isActive
                          ? "bg-gradient-to-r from-orange-500 to-rose-500 text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-sm flex-1 text-left">{category.label}</span>
                      <span
                        className={`text-xs rounded-full px-2 py-0.5 ${
                          isActive
                            ? "bg-white/20 text-white"
                            : "bg-orange-100 text-orange-700"
                        }`}
                      >
                        {categoryCounts[category.id as keyof typeof categoryCounts] ?? 0}
                      </span>
                    </button>
                  );
                })}
              </nav>
            </Card>

            {/* <Card className="p-4 bg-white/60 backdrop-blur-sm hidden lg:block">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-orange-500" />
                <h3 className="text-gray-700">Trending Topics</h3>
              </div>
              <div className="space-y-3">
                {trendingTopics.map((topic, index) => (
                  <button
                    key={index}
                    className="w-full text-left hover:bg-gray-100 rounded-lg p-2 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">#{topic.tag}</span>
                      <span className="text-xs text-gray-500">{topic.count}</span>
                    </div>
                  </button>
                ))}
              </div>
            </Card> */}
          </aside>

          <div className="lg:col-span-6 space-y-6">
            {error ? (
              <Card className="p-4 border-red-200 bg-red-50 text-sm text-red-600">
                {error}
              </Card>
            ) : null}

            <Card className="p-4 bg-white/60 backdrop-blur-sm">
              <div className="flex gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={firebaseUser?.photoURL || ""} alt="Your avatar" className="object-cover" />
                  <AvatarFallback>{getInitials(firebaseUser?.displayName || (userType === "family" ? "Your Family" : "You"))}</AvatarFallback>
                </Avatar>
                <Dialog open={isCreatePostOpen} onOpenChange={setIsCreatePostOpen}>
                  <DialogTrigger asChild>
                    <button className="flex-1 text-left px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-500 transition-colors">
                      What&apos;s on your mind?
                    </button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                      <DialogTitle>Create Post</DialogTitle>
                      <DialogDescription>
                        Share your thoughts, experiences, or questions with the community.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={firebaseUser?.photoURL || ""} alt="Your avatar" className="object-cover" />
                          <AvatarFallback>{getInitials(firebaseUser?.displayName || (userType === "family" ? "Your Family" : "You"))}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-sm">{userType === "family" ? "Your Family" : "You"}</div>
                          <div className="text-xs text-gray-500">{roleLabel(userType)}</div>
                        </div>
                      </div>
                      <Textarea
                        placeholder="What would you like to share with the community?"
                        value={newPostContent}
                        onChange={(e) => setNewPostContent(e.target.value)}
                        className="min-h-[150px] resize-none"
                        disabled={submittingPost}
                      />

                    <div className="space-y-3">
                      <label className="block text-sm text-gray-600">Post image</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleSelectPostImage(e.target.files?.[0] || null)}
                        disabled={submittingPost}
                        className="block w-full text-sm text-gray-600 file:mr-4 file:rounded-lg file:border-0 file:bg-orange-100 file:px-4 file:py-2 file:text-sm file:text-orange-700 hover:file:bg-orange-200"
                      />

                      {newPostImagePreview ? (
                        <div className="overflow-hidden rounded-xl border border-orange-100 bg-orange-50/50">
                          <img
                            src={newPostImagePreview}
                            alt="Selected post preview"
                            className="max-h-72 w-full object-cover"
                          />
                          <div className="flex justify-end border-t border-orange-100 bg-white/80 p-2">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:bg-red-50 hover:text-red-600"
                              onClick={clearPostImage}
                              disabled={submittingPost}
                            >
                              Remove image
                            </Button>
                          </div>
                        </div>
                      ) : null}
                    </div>
                      <div className="space-y-2">
                        <label className="block text-sm text-gray-600">Category</label>
                        <div className="flex flex-wrap gap-2">
                          {categories
                            .filter((category) => category.id !== "all")
                            .map((category) => {
                              const isSelected = newPostCategory === category.id;
                              return (
                                <button
                                  key={category.id}
                                  type="button"
                                  onClick={() =>
                                    setNewPostCategory(
                                      category.id as "questions" | "tips" | "experience"
                                    )
                                  }
                                  className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                                    isSelected
                                      ? "border-orange-500 bg-gradient-to-r from-orange-500 to-rose-500 text-white"
                                      : "border-orange-100 bg-white text-gray-700 hover:bg-orange-50"
                                  }`}
                                >
                                  {category.label}
                                </button>
                              );
                            })}
                        </div>
                      </div>
                      <Button
                        className="w-full bg-gradient-to-r from-orange-500 to-rose-600"
                        onClick={() => void handleCreatePost()}
                        disabled={!newPostContent.trim() && !newPostImage || submittingPost}
                      >
                        {submittingPost ? <Loader2 className="w-4 h-4 animate-spin" /> : "Post"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <Separator className="my-4" />
              <div className="flex items-center justify-around">
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 text-gray-600 hover:text-orange-500"
                onClick={() => setIsCreatePostOpen(true)}
              >
                <ImageIcon className="w-5 h-5" />
                <span className="hidden sm:inline">Photo</span>
              </Button>
                <Button variant="ghost" size="sm" className="gap-2 text-gray-600 hover:text-amber-500" disabled>
                  <Smile className="w-5 h-5" />
                  <span className="hidden sm:inline">Feeling</span>
                </Button>
              </div>
            </Card>

            {loadingPosts ? (
              <Card className="p-12 bg-white/60 backdrop-blur-sm text-center">
                <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-orange-500" />
                <p className="text-gray-500">Loading community posts...</p>
              </Card>
            ) : null}

            <AnimatePresence mode="popLayout">
              {!loadingPosts && filteredPosts.map((post) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="bg-white/60 backdrop-blur-sm overflow-hidden">
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex gap-3">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={post.author.avatar || ""} alt={post.author.name} className="object-cover" />
                            <AvatarFallback>{getInitials(post.author.name)}</AvatarFallback>
                          </Avatar>
                          <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-gray-800">{post.author.name}</span>
                            <Badge variant="secondary" className="text-xs">
                              {post.author.role}
                            </Badge>
                            <Badge className="text-xs bg-gradient-to-r from-orange-500 to-rose-500 text-white border-0">
                              {getCategoryLabel(post.category)}
                            </Badge>
                          </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <span>{post.author.location}</span>
                              <span>•</span>
                              <span>{post.timestamp}</span>
                            </div>
                          </div>
                        </div>
                        {post.isMine ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-sm text-red-500 hover:bg-red-50 hover:text-red-600"
                            onClick={() => void handleDeletePost(post.id)}
                          >
                            Delete
                          </Button>
                        ) : (
                          <Button variant="ghost" size="sm" disabled>
                            <span className="text-xl">•••</span>
                          </Button>
                        )}
                      </div>

                      <p className="text-gray-700 mb-3 whitespace-pre-wrap">{post.content}</p>

                      {post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {post.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    {post.image && (
                      <div className="w-full">
                        <img
                          src={post.image}
                          alt="Post content"
                          className="w-full h-auto object-cover max-h-[500px]"
                        />
                      </div>
                    )}

                    <div className="px-4 py-2 flex items-center justify-between text-sm text-gray-500 border-t border-gray-200">
                      <button className="hover:underline">
                        {post.likes} {post.likes === 1 ? "like" : "likes"}
                      </button>
                      <button className="hover:underline">
                        {post.comments} {post.comments === 1 ? "comment" : "comments"}
                      </button>
                    </div>

                    <Separator />
                    <div className="p-2 flex items-center justify-around">
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`gap-2 flex-1 ${post.isLiked ? "text-red-500" : "text-gray-600"}`}
                        onClick={() => void handleLike(post.id)}
                      >
                        <Heart className={`w-5 h-5 ${post.isLiked ? "fill-current" : ""}`} />
                        <span className="hidden sm:inline">Like</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`gap-2 flex-1 ${openCommentPostIds.has(post.id) ? "text-orange-500" : "text-gray-600"}`}
                        onClick={() => handleToggleComments(post.id)}
                      >
                        <MessageCircle className="w-5 h-5" />
                        <span className="hidden sm:inline">Comment</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`gap-2 flex-1 ${post.isBookmarked ? "text-orange-500" : "text-gray-600"}`}
                        onClick={() => void handleBookmark(post.id)}
                      >
                        <Bookmark className={`w-5 h-5 ${post.isBookmarked ? "fill-current" : ""}`} />
                        <span className="hidden sm:inline">Save</span>
                      </Button>
                    </div>
                    {openCommentPostIds.has(post.id) && (
                      <div className="border-t border-gray-200 bg-white/70 px-4 py-4">
                        <div className="space-y-3">
                          {(commentsByPostId[post.id] || []).length === 0 ? (
                            <p className="text-sm text-gray-500">No comments yet. Start the conversation.</p>
                          ) : (
                            (commentsByPostId[post.id] || []).map((comment) => (
                              <div key={comment.id} className="flex gap-3 rounded-xl bg-orange-50/60 p-3">
                                <Avatar className="w-9 h-9 shrink-0">
                                  <AvatarImage src={comment.author.avatar || ""} alt={comment.author.name} className="object-cover" />
                                  <AvatarFallback>{getInitials(comment.author.name)}</AvatarFallback>
                                </Avatar>
                                <div className="min-w-0 flex-1">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-sm text-gray-800">{comment.author.name}</span>
                                    <Badge variant="secondary" className="text-[10px]">
                                      {comment.author.role}
                                    </Badge>
                                    <span className="text-xs text-gray-500">{comment.timestamp}</span>
                                  </div>
                                  <p className="mt-1 whitespace-pre-wrap text-sm text-gray-700">{comment.content}</p>
                                </div>
                              </div>
                            ))
                          )}

                          <div className="flex gap-3 pt-1">
                            <Avatar className="w-9 h-9 shrink-0">
                              <AvatarImage src={firebaseUser?.photoURL || ""} alt="Your avatar" className="object-cover" />
                              <AvatarFallback>{getInitials(firebaseUser?.displayName || (userType === "family" ? "Your Family" : "You"))}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-2">
                              <Textarea
                                placeholder="Write a comment..."
                                value={commentDrafts[post.id] || ""}
                                onChange={(e) =>
                                  setCommentDrafts((prev) => ({
                                    ...prev,
                                    [post.id]: e.target.value,
                                  }))
                                }
                                className="min-h-[84px] resize-none bg-white"
                                disabled={submittingCommentPostId === post.id}
                              />
                              <div className="flex justify-end">
                                <Button
                                  size="sm"
                                  className="gap-2 bg-gradient-to-r from-orange-500 to-rose-600"
                                  onClick={() => void handleCreateComment(post.id)}
                                  disabled={submittingCommentPostId === post.id || !(commentDrafts[post.id] || "").trim()}
                                >
                                  {submittingCommentPostId === post.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <Send className="w-4 h-4" />
                                  )}
                                  <span>Comment</span>
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>

            {!loadingPosts && filteredPosts.length === 0 && (
              <Card className="p-12 bg-white/60 backdrop-blur-sm text-center">
                <div className="text-6xl mb-4">📭</div>
                <h3 className="text-gray-700 mb-2">No posts yet</h3>
                <p className="text-gray-500">Be the first to share something in this category!</p>
              </Card>
            )}
          </div>

          <aside className="lg:col-span-3 space-y-4 hidden lg:block">
          <Card className="p-4 bg-white/60 backdrop-blur-sm">
            <h3 className="text-gray-700 mb-4">Community Guidelines</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span>Be kind to every family and au pair</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span>Share honest experiences and helpful advice</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span>Respect different cultures, homes, and boundaries</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500">✗</span>
                <span>No harassment, discrimination, or spam</span>
              </li>
            </ul>
          </Card>

            <Card className="p-4 bg-white/60 backdrop-blur-sm">
              <h3 className="text-gray-700 mb-4">Popular Resources</h3>
              <div className="space-y-3">
                <button className="w-full text-left p-3 bg-gradient-to-r from-orange-50 to-rose-50 rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2 mb-1">
                    <BookOpen className="w-4 h-4 text-orange-500" />
                    <span className="text-sm text-gray-700">Au Pair Handbook</span>
                  </div>
                  <p className="text-xs text-gray-600">Essential guide for newcomers</p>
                </button>
                <button className="w-full text-left p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-gray-700">Host Family Tips</span>
                  </div>
                  <p className="text-xs text-gray-600">Making the most of your experience</p>
                </button>
              </div>
            </Card>
          </aside>
        </div>
      </main>
    </div>
  );
}
