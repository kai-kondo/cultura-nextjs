'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { ProfileSettings } from '@/components/ProfileSettings';
import { auth } from '@/lib/firebase';
import { signOutUser } from '@/lib/auth-actions';

export default function SettingsPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push('/');
        return;
      }
      setSignedIn(true);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleBack = () => {
    router.push('/home');
  };

  const handleLogout = async () => {
    try {
      localStorage.removeItem('userType');
      await signOutUser();
      router.push('/');
    } catch (e) {
      router.push('/');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-rose-100 flex items-center justify-center">
        <div className="rounded-xl border bg-white px-6 py-4 text-sm text-gray-600 shadow-sm">
          Loading settings...
        </div>
      </div>
    );
  }

  if (!signedIn) return null;

  return <ProfileSettings onClose={handleBack} onLogout={handleLogout} />;
}