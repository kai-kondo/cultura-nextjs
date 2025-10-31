'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ProfileLayout } from '@/components/ProfileLayout';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { CulturaLogo } from '@/components/CulturaLogo';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function ProfileDetailPage() {
  const router = useRouter();
  const params = useParams();
  const profileId = params.id as string;
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

  if (!userType) {
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
            userType={userType}
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
          userType={userType}
        />
      </div>
    </div>
  );
}
