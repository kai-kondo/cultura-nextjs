'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Community } from '@/components/Community';
import { MobileBottomNav } from '@/components/MobileBottomNav';

export default function CommunityPage() {
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

  const handleOpenSettings = () => {
    router.push('/settings');
  };

  const handleOpenMyProfile = () => {
    router.push('/profile/edit');
  };

  const handleNavigateHome = () => {
    router.push('/home');
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
      <Community
        userType={userType}
        onOpenSettings={handleOpenSettings}
        onOpenMyProfile={handleOpenMyProfile}
        onNavigateHome={handleNavigateHome}
      />
      <MobileBottomNav 
        activeScreen="community"
        onNavigate={handleMobileNavigation}
      />
    </div>
  );
}
