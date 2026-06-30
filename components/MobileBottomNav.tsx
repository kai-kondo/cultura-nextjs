'use client';

import { Home, Users, MessageCircle, User } from "lucide-react";

import { useRouter } from 'next/navigation';

interface MobileBottomNavProps {
  activeScreen: string;
  hasUnreadMessages?: boolean;
  onNavigate?: (screen: "home" | "community" | "messages" | "profile") => void;
}

export function MobileBottomNav({ activeScreen, hasUnreadMessages, onNavigate }: MobileBottomNavProps) {
  const router = useRouter();
  const navItems = [
    { id: "home", icon: Home, label: "Home", badge: false },
    { id: "community", icon: Users, label: "Community", badge: false },
    { id: "messages", icon: MessageCircle, label: "Messages", badge: !!hasUnreadMessages },
    { id: "profile", icon: User, label: "Profile", badge: false },
  ];
  const routeMap: Record<"home" | "community" | "messages" | "profile", string> = {
    home: "/home",
    community: "/community",
    messages: "/messages",
    profile: "/profile/edit",
  };

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeScreen === item.id;

          return (
            <button
              key={item.id}
              onClick={() => {
                const nextScreen = item.id as "home" | "community" | "messages" | "profile";
                if (onNavigate) {
                  onNavigate(nextScreen);
                  return;
                }
                router.push(routeMap[nextScreen]);
              }}
              className={`
                flex flex-col items-center justify-center flex-1 h-full
                transition-all duration-200 ease-in-out
                ${isActive ? "text-orange-600" : "text-gray-500"}
                hover:text-orange-500 active:scale-95
              `}
            >
              <div className={`
                relative flex items-center justify-center
                ${isActive ? "transform -translate-y-0.5" : ""}
              `}>
                <Icon
                  className={`
                    w-6 h-6 transition-all duration-200
                    ${isActive ? "stroke-[2.5]" : "stroke-[2]"}
                  `}
                />
                {item.badge && !isActive && (
                  <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-orange-500" />
                )}
                {isActive && (
                  <div className="absolute -bottom-1 w-1 h-1 bg-gradient-to-r from-orange-500 to-rose-500 rounded-full" />
                )}
              </div>
              <span className={`
                text-xs mt-1 transition-all duration-200
                ${isActive ? "font-semibold" : "font-normal"}
              `}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
