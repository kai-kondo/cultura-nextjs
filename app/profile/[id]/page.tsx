'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ProfileLayout } from '@/components/ProfileLayout';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { CulturaLogo } from '@/components/CulturaLogo';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { db, auth } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function ProfileDetailPage() {
  const router = useRouter();
  const params = useParams();
  const profileId = params.id as string;
  const [resolvedType, setResolvedType] = useState<'family' | 'aupair' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function resolveType() {
      try {
        // 1) Try auPairProfiles first
        const ap = await getDoc(doc(db, 'auPairProfiles', profileId));
        if (!cancelled && ap.exists() && ap.data()?.isDeleted !== true) {
          setResolvedType('aupair');
          setLoading(false);
          return;
        }
        // 2) Fallback to familyProfiles
        const fp = await getDoc(doc(db, 'familyProfiles', profileId));
        if (!cancelled && fp.exists() && fp.data()?.isDeleted !== true) {
          setResolvedType('family');
          setLoading(false);
          return;
        }
        // 3) As a last resort, if the viewer is logged in, use their userType + profileRef match
        const uid = auth.currentUser?.uid;
        if (uid) {
          const u = await getDoc(doc(db, 'users', uid));
          const data: any = u.exists() ? u.data() : null;
          if (data?.profileRef) {
            const ref: string = data.profileRef; // e.g., "auPairProfiles/xxxx"
            const [col, id] = ref.split('/');
            if (id === profileId) {
              if (col === 'auPairProfiles') setResolvedType('aupair');
              if (col === 'familyProfiles') setResolvedType('family');
              setLoading(false);
              return;
            }
          }
        }
        if (!cancelled) {
          setResolvedType(null);
          setLoading(false);
        }
      } catch (e) {
        if (!cancelled) {
          setResolvedType(null);
          setLoading(false);
        }
      }
    }
    resolveType();
    return () => { cancelled = true; };
  }, [db, profileId]);

  const handleBack = () => {
    router.push('/home');
  };

  const handleMessageClick = (id: string) => {
    router.push(`/messages/${id}`);
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

  if (loading) return null; // or a skeleton component if available
  if (resolvedType === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-rose-50">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            This account is no longer available
          </h2>
          <p className="text-gray-500 mb-4">
            The profile may have been deleted.
          </p>
          <Button onClick={() => router.push('/home')}>
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-rose-50">
      {/* Mobile/Tablet Layout */}
      <div className="lg:hidden p-4 min-h-screen pb-20">

        <div className="w-full max-w-2xl mx-auto">
          <ProfileLayout
            profileId={profileId}
            onMessageClick={handleMessageClick}
            userType={resolvedType}
          />
        </div>

        <MobileBottomNav
          activeScreen="home"
          onNavigate={handleMobileNavigation}
        />
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:block">
        <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
          
        </div>

        <ProfileLayout
          profileId={profileId}
          onMessageClick={handleMessageClick}
          userType={resolvedType}
        />
      </div>
    </div>
  );
}
