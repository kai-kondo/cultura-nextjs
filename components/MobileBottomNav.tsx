import { Home, Users, MessageCircle, User } from "lucide-react";

interface MobileBottomNavProps {
  activeScreen: string;
  onNavigate: (screen: "home" | "community" | "messages" | "profile") => void;
}

export function MobileBottomNav({ activeScreen, onNavigate }: MobileBottomNavProps) {
  const navItems = [
    { id: "home", icon: Home, label: "Home" },
    { id: "community", icon: Users, label: "Community" },
    { id: "messages", icon: MessageCircle, label: "Messages" },
    { id: "profile", icon: User, label: "Profile" },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeScreen === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id as any)}
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
