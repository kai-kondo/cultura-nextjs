'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Community } from '@/components/Community';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

export default function CommunityPage() {
  const router = useRouter();
  const [userType, setUserType] = useState<'family' | 'aupair' | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/');
        return;
      }
      const snap = await getDoc(doc(db, 'users', user.uid));
      if (!snap.exists()) {
        router.push('/profile-create');
        return;
      }
      const data = snap.data() as { userType?: 'family' | 'aupair'; profileRef?: string | null };
      let type = data.userType ?? null;
      if (!type && data.profileRef) {
        if (data.profileRef.startsWith('auPairProfiles/')) type = 'aupair';
        if (data.profileRef.startsWith('familyProfiles/')) type = 'family';
      }
      if (!type) {
        router.push('/profile-create');
        return;
      }
      setUserType(type);
      localStorage.setItem('userType', type);
    });
    return () => unsub();
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
