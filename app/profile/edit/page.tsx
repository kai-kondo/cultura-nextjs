'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProfileEdit } from '@/components/ProfileEdit';
import { MobileBottomNav } from '@/components/MobileBottomNav';

export default function ProfileEditPage() {
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

  const handleBack = () => {
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
      <ProfileEdit userType={userType} onBack={handleBack} />
      <MobileBottomNav 
        activeScreen="profile"
        onNavigate={handleMobileNavigation}
      />
    </div>
  );
}
