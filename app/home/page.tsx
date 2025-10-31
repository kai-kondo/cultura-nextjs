'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Home } from '@/components/Home';
import { MobileBottomNav } from '@/components/MobileBottomNav';

export default function HomePage() {
  const router = useRouter();
  const [userType, setUserType] = useState<'family' | 'aupair' | null>(null);

  useEffect(() => {
    const type = localStorage.getItem('userType') as 'family' | 'aupair' | null;
    if (!type) {
      router.push('/');
      return;
    }
    setUserType(type);
  }, [router]);

  const handleViewProfile = (id: string) => {
    router.push(`/profile/${id}`);
  };

  const handleOpenSettings = () => {
    router.push('/settings');
  };

  const handleOpenMyProfile = () => {
    router.push('/profile/edit');
  };

  const handleOpenCommunity = () => {
    router.push('/community');
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

  return (
    <div className="relative pb-16 lg:pb-0">
      <Home
        userType={userType}
        onViewProfile={handleViewProfile}
        onOpenSettings={handleOpenSettings}
        onOpenMyProfile={handleOpenMyProfile}
        onOpenCommunity={handleOpenCommunity}
      />
      <MobileBottomNav 
        activeScreen="home"
        onNavigate={handleMobileNavigation}
      />
    </div>
  );
}
