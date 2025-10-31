'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Messages } from '@/components/Messages';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { CulturaLogo } from '@/components/CulturaLogo';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

// Mock data for current user
const getCurrentUser = (userType: 'family' | 'aupair' | null) => {
  if (userType === 'family') {
    return {
      id: 'current-family',
      name: 'The Johnson Family',
      avatar: 'https://images.unsplash.com/photo-1624448445915-97154f5e688c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYXBweSUyMGZhbWlseSUyMHBvcnRyYWl0fGVufDF8fHx8MTc2MTc3NDg5OXww&ixlib=rb-4.1.0&q=80&w=1080',
      subtitle: 'San Francisco, CA 🇺🇸',
    };
  }
  return {
    id: 'current-aupair',
    name: 'You',
    avatar: 'https://images.unsplash.com/photo-1704054006064-2c5b922e7a1e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMHdvbWFuJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzYxNjcyOTM1fDA&ixlib=rb-4.1.0&q=80&w=1080',
    subtitle: 'Au Pair 🌍',
  };
};

// Mock data for threads
const getThreadsWithProfile = (profileId: string, userType: 'family' | 'aupair' | null) => {
  const profiles: any = {
    emma: {
      id: 'emma',
      name: 'Emma',
      avatar: 'https://images.unsplash.com/photo-1704054006064-2c5b922e7a1e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMHdvbWFuJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzYxNjcyOTM1fDA&ixlib=rb-4.1.0&q=80&w=1080',
      subtitle: '🇯🇵 Japan • Au Pair (Swim/Art)',
    },
    lucas: {
      id: 'lucas',
      name: 'Lucas',
      avatar: 'https://images.unsplash.com/photo-1499996860823-5214fcc65f8f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMG1hbiUyMHBvcnRyYWl0fGVufDF8fHx8MTc2MTc3MDYwMnww&ixlib=rb-4.1.0&q=80&w=1080',
      subtitle: '🇧🇷 Brazil • Au Pair (Football/Music)',
    },
    miller: {
      id: 'miller',
      name: 'The Miller Family',
      avatar: 'https://images.unsplash.com/photo-1624448445915-97154f5e688c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYXBweSUyMGZhbWlseSUyMHBvcnRyYWl0fGVufDF8fHx8MTc2MTc3NDg5OXww&ixlib=rb-4.1.0&q=80&w=1080',
      subtitle: '🇺🇸 San Francisco, CA • 2 kids',
    },
  };

  const me = getCurrentUser(userType);
  const other = profiles[profileId] || profiles.emma;

  return [
    {
      id: `thread-${profileId}`,
      participants: [me, other],
      lastMessageAt: new Date().toISOString(),
      unread: 0,
      messages: [
        {
          id: 'm1',
          fromId: me.id,
          text: 'Hi! I saw your profile and would love to connect.',
          createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          read: true,
        },
      ],
    },
  ];
};

export default function MessagesPage() {
  const router = useRouter();
  const params = useParams();
  const profileId = params.id as string;
  const [userType, setUserType] = useState<'family' | 'aupair' | null>(null);

  useEffect(() => {
    const type = localStorage.getItem('userType') as 'family' | 'aupair' | null;
    if (!type) {
      router.push('/');
      return;
    }
    setUserType(type);
  }, [router]);

  const handleBack = () => {
    router.push('/home');
  };

  const handleOpenProfileFromMessage = (id: string) => {
    router.push(`/profile/${id}`);
  };

  const handleMobileNavigation = (screen: 'home' | 'community' | 'messages' | 'profile') => {
    if (screen === 'profile') {
      router.push('/profile/edit');
    } else if (screen === 'messages') {
      router.push('/messages/emma');
    } else if (screen === 'community') {
      router.push('/community');
    } else {
      router.push('/home');
    }
  };

  if (!userType) {
    return null;
  }

  const me = getCurrentUser(userType);
  const threads = getThreadsWithProfile(profileId, userType);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-rose-50 p-4 pb-20 lg:pb-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-4 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
          <button 
            onClick={() => router.push('/home')}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <CulturaLogo size={32} />
            <span className="font-semibold text-gray-800">
              Cultura
            </span>
          </button>
        </div>
        <Messages
          me={me}
          threads={threads}
          onOpenProfile={handleOpenProfileFromMessage}
        />
      </div>
      <MobileBottomNav 
        activeScreen="messages"
        onNavigate={handleMobileNavigation}
      />
    </div>
  );
}
