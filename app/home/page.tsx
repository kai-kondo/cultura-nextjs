'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Home } from '@/components/Home';
import { MobileBottomNav } from '@/components/MobileBottomNav';

// Firebase
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

export default function HomePage() {
  const router = useRouter();
  const [userType, setUserType] = useState<'family' | 'aupair' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setUserType(null);
        setLoading(false);
        router.push('/'); // 未ログイン → ランディング/ログインへ
        return;
      }
      try {
        const snap = await getDoc(doc(db, 'users', user.uid));
        if (!snap.exists()) {
          setUserType(null);
          setLoading(false);
          router.push('/profile-create'); // ユーザーDocなし → プロフィール作成へ
          return;
        }
        const data = snap.data() as { userType?: 'family' | 'aupair'; profileRef?: string };
        if (!data?.userType) {
          setUserType(null);
          setLoading(false);
          router.push('/profile-create');
          return;
        }
        setUserType(data.userType);
      } catch (e) {
        // 読み取りエラー時はログインに戻す（必要に応じてトースト等）
        setUserType(null);
        router.push('/');
      } finally {
        setLoading(false);
      }
    });
    return () => unsub();
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

  if (loading) return null; // TODO: Skeleton
  if (!userType) return null; // リダイレクト中

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
