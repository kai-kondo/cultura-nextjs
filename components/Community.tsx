import { useState } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Avatar } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Textarea } from "./ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Separator } from "./ui/separator";
import { DesktopNav } from "./DesktopNav";
import { CulturaLogo } from "./CulturaLogo";
import {
  Heart,
  MessageCircle,
  Bookmark,
  Send,
  Image as ImageIcon,
  Smile,
  TrendingUp,
  Users,
  BookOpen,
  Search,
  Filter
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface CommunityProps {
  userType: 'family' | 'aupair';
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
}

const mockPosts: Post[] = [
  {
    id: "1",
    author: {
      name: "Emma Johnson",
      avatar: "https://images.unsplash.com/photo-1704054006064-2c5b922e7a1e?w=150",
      role: "Au Pair",
      location: "Tokyo, Japan"
    },
    content: "Just arrived in Tokyo! 🇯🇵 Any tips for learning Japanese quickly? The family I'm with is so welcoming, but I want to communicate better with the kids. What resources do you recommend?",
    timestamp: "2 hours ago",
    category: "Questions",
    likes: 24,
    comments: 12,
    isLiked: false,
    isBookmarked: false,
    tags: ["Language Learning", "Japan", "Tips"]
  },
  {
    id: "2",
    author: {
      name: "The Tanaka Family",
      avatar: "https://images.unsplash.com/photo-1609220136736-443140cffec6?w=150",
      role: "Host Family",
      location: "Tokyo, Japan"
    },
    content: "We're hosting our first au pair next month! 🎉 Any advice from experienced host families on making the transition smooth? We have two girls (ages 4 and 7) and want to make sure everyone feels comfortable.",
    image: "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=800",
    timestamp: "5 hours ago",
    category: "Advice",
    likes: 45,
    comments: 28,
    isLiked: true,
    isBookmarked: true,
    tags: ["First Time", "Host Family", "Tips"]
  },
  {
    id: "3",
    author: {
      name: "Sophie Martin",
      avatar: "https://images.unsplash.com/photo-1664312572933-0563f14484a1?w=150",
      role: "Au Pair",
      location: "Paris, France"
    },
    content: "Amazing weekend trip to Mont Saint-Michel with my host family! 🏰 This is why I love being an au pair - experiencing incredible places while building meaningful connections. The kids were so excited!",
    image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800",
    timestamp: "1 day ago",
    category: "Experience",
    likes: 128,
    comments: 34,
    isLiked: false,
    isBookmarked: false,
    tags: ["Travel", "France", "Experience"]
  },
  {
    id: "4",
    author: {
      name: "Marco Rossi",
      avatar: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=150",
      role: "Au Pair",
      location: "Barcelona, Spain"
    },
    content: "Best resources for learning Spanish while working as an au pair? 📚 I'm in Barcelona and want to improve faster. The kids are helping me practice, but I'd love structured lessons too. Any recommendations for online courses or local classes?",
    timestamp: "2 days ago",
    category: "Questions",
    likes: 67,
    comments: 19,
    isLiked: true,
    isBookmarked: true,
    tags: ["Language Learning", "Spain", "Resources"]
  },
  {
    id: "5",
    author: {
      name: "Lisa Chen",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
      role: "Host Family",
      location: "San Francisco, USA"
    },
    content: "Pro tip for host families: Create a 'culture box' with items from your au pair's home country. Our au pair from Brazil was so touched when we decorated her room with Brazilian flags and snacks. It made her feel at home instantly! 💚💛",
    timestamp: "3 days ago",
    category: "Tips",
    likes: 89,
    comments: 23,
    isLiked: false,
    isBookmarked: false,
    tags: ["Culture", "Host Family", "Welcome"]
  }
];

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

export function Community({ userType, onOpenSettings, onOpenMyProfile, onNavigateHome }: CommunityProps) {
  const [posts, setPosts] = useState<Post[]>(mockPosts);
  const [activeCategory, setActiveCategory] = useState("all");
  const [newPostContent, setNewPostContent] = useState("");
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  const handleLike = (postId: string) => {
    setPosts(posts.map(post =>
      post.id === postId
        ? { ...post, isLiked: !post.isLiked, likes: post.isLiked ? post.likes - 1 : post.likes + 1 }
        : post
    ));
  };

  const handleBookmark = (postId: string) => {
    setPosts(posts.map(post =>
      post.id === postId
        ? { ...post, isBookmarked: !post.isBookmarked }
        : post
    ));
  };

  const handleCreatePost = () => {
    if (newPostContent.trim()) {
      const newPost: Post = {
        id: Date.now().toString(),
        author: {
          name: userType === 'family' ? "My Family" : "Me",
          avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
          role: userType === 'family' ? "Host Family" : "Au Pair",
          location: "Your Location"
        },
        content: newPostContent,
        timestamp: "Just now",
        category: "General",
        likes: 0,
        comments: 0,
        isLiked: false,
        isBookmarked: false,
        tags: []
      };
      setPosts([newPost, ...posts]);
      setNewPostContent("");
      setIsCreatePostOpen(false);
    }
  };

  const filteredPosts = activeCategory === "all"
    ? posts
    : posts.filter(post => post.category.toLowerCase() === activeCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-rose-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            {/* Logo */}
            <button
              onClick={onNavigateHome}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <CulturaLogo size={40} />
              <span className="font-semibold text-gray-800">Cultura</span>
            </button>

            <div className="flex-1" />

            {/* Desktop Navigation */}
            <DesktopNav
              onOpenSettings={onOpenSettings}
              onOpenProfile={onOpenMyProfile}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar - Categories */}
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
                          ? 'bg-blue-500 text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-sm">{category.label}</span>
                    </button>
                  );
                })}
              </nav>
            </Card>

            {/* Trending Topics */}
            <Card className="p-4 bg-white/60 backdrop-blur-sm hidden lg:block">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-blue-500" />
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
            </Card>
          </aside>

          {/* Main Feed */}
          <div className="lg:col-span-6 space-y-6">
            {/* Create Post Card */}
            <Card className="p-4 bg-white/60 backdrop-blur-sm">
              <div className="flex gap-3">
                <Avatar className="w-10 h-10">
                  <img
                    src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"
                    alt="Your avatar"
                    className="object-cover"
                  />
                </Avatar>
                <Dialog open={isCreatePostOpen} onOpenChange={setIsCreatePostOpen}>
                  <DialogTrigger asChild>
                    <button className="flex-1 text-left px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-500 transition-colors">
                      What's on your mind?
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
                          <img
                            src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"
                            alt="Your avatar"
                            className="object-cover"
                          />
                        </Avatar>
                        <div>
                          <div className="text-sm">{userType === 'family' ? "Your Family" : "You"}</div>
                          <div className="text-xs text-gray-500">{userType === 'family' ? "Host Family" : "Au Pair"}</div>
                        </div>
                      </div>
                      <Textarea
                        placeholder="What would you like to share with the community?"
                        value={newPostContent}
                        onChange={(e) => setNewPostContent(e.target.value)}
                        className="min-h-[150px] resize-none"
                      />
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="gap-2">
                          <ImageIcon className="w-4 h-4" />
                          Photo
                        </Button>
                        <Button variant="outline" size="sm" className="gap-2">
                          <Smile className="w-4 h-4" />
                          Feeling
                        </Button>
                      </div>
                      <Button
                        className="w-full bg-gradient-to-r from-orange-500 to-rose-600"
                        onClick={handleCreatePost}
                        disabled={!newPostContent.trim()}
                      >
                        Post
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <Separator className="my-4" />
              <div className="flex items-center justify-around">
                <Button variant="ghost" size="sm" className="gap-2 text-gray-600 hover:text-blue-500">
                  <ImageIcon className="w-5 h-5" />
                  <span className="hidden sm:inline">Photo</span>
                </Button>
                <Button variant="ghost" size="sm" className="gap-2 text-gray-600 hover:text-yellow-500">
                  <Smile className="w-5 h-5" />
                  <span className="hidden sm:inline">Feeling</span>
                </Button>
              </div>
            </Card>

            {/* Posts */}
            <AnimatePresence mode="popLayout">
              {filteredPosts.map((post) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="bg-white/60 backdrop-blur-sm overflow-hidden">
                    {/* Post Header */}
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex gap-3">
                          <Avatar className="w-12 h-12">
                            <img
                              src={post.author.avatar}
                              alt={post.author.name}
                              className="object-cover"
                            />
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-gray-800">{post.author.name}</span>
                              <Badge variant="secondary" className="text-xs">
                                {post.author.role}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <span>{post.author.location}</span>
                              <span>•</span>
                              <span>{post.timestamp}</span>
                            </div>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <span className="text-xl">•••</span>
                        </Button>
                      </div>

                      {/* Post Content */}
                      <p className="text-gray-700 mb-3 whitespace-pre-wrap">{post.content}</p>

                      {/* Tags */}
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

                    {/* Post Image */}
                    {post.image && (
                      <div className="w-full">
                        <img
                          src={post.image}
                          alt="Post content"
                          className="w-full h-auto object-cover max-h-[500px]"
                        />
                      </div>
                    )}

                    {/* Post Stats */}
                    <div className="px-4 py-2 flex items-center justify-between text-sm text-gray-500 border-t border-gray-200">
                      <button className="hover:underline">
                        {post.likes} {post.likes === 1 ? 'like' : 'likes'}
                      </button>
                      <button className="hover:underline">
                        {post.comments} {post.comments === 1 ? 'comment' : 'comments'}
                      </button>
                    </div>

                    {/* Post Actions */}
                    <Separator />
                    <div className="p-2 flex items-center justify-around">
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`gap-2 flex-1 ${post.isLiked ? 'text-red-500' : 'text-gray-600'}`}
                        onClick={() => handleLike(post.id)}
                      >
                        <Heart className={`w-5 h-5 ${post.isLiked ? 'fill-current' : ''}`} />
                        <span className="hidden sm:inline">Like</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-2 text-gray-600 flex-1"
                      >
                        <MessageCircle className="w-5 h-5" />
                        <span className="hidden sm:inline">Comment</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`gap-2 flex-1 ${post.isBookmarked ? 'text-blue-500' : 'text-gray-600'}`}
                        onClick={() => handleBookmark(post.id)}
                      >
                        <Bookmark className={`w-5 h-5 ${post.isBookmarked ? 'fill-current' : ''}`} />
                        <span className="hidden sm:inline">Save</span>
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>

            {filteredPosts.length === 0 && (
              <Card className="p-12 bg-white/60 backdrop-blur-sm text-center">
                <div className="text-6xl mb-4">📭</div>
                <h3 className="text-gray-700 mb-2">No posts yet</h3>
                <p className="text-gray-500">Be the first to share something in this category!</p>
              </Card>
            )}
          </div>

          {/* Right Sidebar - Suggestions */}
          <aside className="lg:col-span-3 space-y-4 hidden lg:block">
            <Card className="p-4 bg-white/60 backdrop-blur-sm">
              <h3 className="text-gray-700 mb-4">Community Guidelines</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Be respectful and kind</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Share helpful experiences</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Support each other</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500">✗</span>
                  <span>No spam or harassment</span>
                </li>
              </ul>
            </Card>

            <Card className="p-4 bg-white/60 backdrop-blur-sm">
              <h3 className="text-gray-700 mb-4">Popular Resources</h3>
              <div className="space-y-3">
                <button className="w-full text-left p-3 bg-gradient-to-r from-orange-50 to-rose-50 rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2 mb-1">
                    <BookOpen className="w-4 h-4 text-blue-500" />
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
