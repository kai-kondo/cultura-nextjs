'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { ProfileEdit } from '@/components/ProfileEdit';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import type { UserType } from '@/lib/types';

export default function ProfileEditPage() {
  const router = useRouter();
  const [userType, setUserType] = useState<UserType | null>(null);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/login');
        return;
      }
      const snap = await getDoc(doc(db, 'users', user.uid));
      if (snap.exists()) {
        const data = snap.data();
        setUserType(data.userType as UserType);
        if (data.profileRef) {
          const [, id] = (data.profileRef as string).split('/');
          setProfileId(id);
        }
      } else {
        router.push('/profile-create');
      }
      setLoading(false);
    });
    return () => unsub();
  }, [router]);

  const handleBack = () => router.push('/home');

  const handleMobileNavigation = (screen: 'home' | 'community' | 'messages' | 'profile') => {
    if (screen === 'profile') router.push('/profile/edit');
    else if (screen === 'messages') router.push('/messages/emma');
    else if (screen === 'community') router.push('/community');
    else router.push('/home');
  };

  if (loading) return <div className='p-6'>Loading...</div>;
  if (!userType || !profileId) return null;

  return (
    <div className='relative pb-16 lg:pb-0'>
      <ProfileEdit userType={userType} profileId={profileId} onBack={handleBack} />
      <MobileBottomNav activeScreen='profile' onNavigate={handleMobileNavigation} />
    </div>
  );
}
