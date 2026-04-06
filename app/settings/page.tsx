'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { AccountSettings } from '@/components/AccountSettings';
import { auth, db } from '@/lib/firebase';
import { signOutUser } from '@/lib/auth-actions';
import type { UserType } from '@/lib/types';

export default function SettingsPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState<UserType | null>(null);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/');
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          setError('User document not found.');
          setLoading(false);
          return;
        }

        const userData = userSnap.data() as {
          userType?: UserType;
          profileRef?: string | null;
        };

        if (!userData.userType) {
          setError('User type is missing.');
          setLoading(false);
          return;
        }

        if (!userData.profileRef) {
          setError('Profile reference is missing.');
          setLoading(false);
          return;
        }

        setUserType(userData.userType);
        const rawProfileRef = userData.profileRef;
        const normalizedProfileId = rawProfileRef.includes('/')
          ? rawProfileRef.split('/').pop() || null
          : rawProfileRef;

        setProfileId(normalizedProfileId);
      } catch (e: any) {
        setError(e?.message || 'Failed to load settings.');
      } finally {
        setLoading(false);
      }
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

  if (error || !userType || !profileId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-rose-100 flex items-center justify-center">
        <div className="rounded-xl border bg-white px-6 py-4 text-sm text-red-600 shadow-sm">
          {error || 'Failed to load settings.'}
        </div>
      </div>
    );
  }

  return (
    <AccountSettings
      userType={userType}
      profileId={profileId}
      onClose={handleBack}
      onLogout={handleLogout}
    />
  );
}