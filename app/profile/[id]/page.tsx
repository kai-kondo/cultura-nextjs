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
        if (!cancelled && ap.exists()) {
          setResolvedType('aupair');
          setLoading(false);
          return;
        }
        // 2) Fallback to familyProfiles
        const fp = await getDoc(doc(db, 'familyProfiles', profileId));
        if (!cancelled && fp.exists()) {
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
    // Unknown profile id; navigate back to home
    router.push('/home');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-rose-50">
      {/* Mobile/Tablet Layout */}
      <div className="lg:hidden p-4 min-h-screen pb-20">
        <div className="w-full max-w-2xl mx-auto mb-4">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
        </div>

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
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
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
