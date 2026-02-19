import { Button } from "./ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Bell, Settings, LogOut, User, Heart, Users } from "lucide-react";

interface DesktopNavProps {
  onLogout?: () => void;
  onOpenSettings?: () => void;
  onOpenProfile?: () => void;
  onOpenCommunity?: () => void;
  avatarUrl?: string;
}

export function DesktopNav({
  onLogout,
  onOpenSettings,
  onOpenProfile,
  onOpenCommunity,
  avatarUrl,
}: DesktopNavProps) {
  return (
    <nav className="hidden lg:flex items-center gap-4">
      {/* Community */}
      <Button variant="ghost" size="icon" onClick={onOpenCommunity}>
        <Users className="w-5 h-5" />
      </Button>

      {/* Notifications */}
      <Button variant="ghost" size="icon" className="relative">
        <Bell className="w-5 h-5" />
        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
      </Button>

      {/* Favorites */}
      <Button variant="ghost" size="icon">
        <Heart className="w-5 h-5" />
      </Button>

      {/* User Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar>
              <AvatarImage
                src={
                  avatarUrl ||
                  "https://images.unsplash.com/photo-1704054006064-2c5b922e7a1e?w=100"
                }
              />
              <AvatarFallback>ME</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">My Account</p>
              <p className="text-xs leading-none text-muted-foreground">
                family@example.com
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onOpenProfile}>
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onOpenSettings}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </nav>
  );
}
