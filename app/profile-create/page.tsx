'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuPairProfileCreate } from '@/components/AuPairProfileCreate';
import { FamilyProfileCreate } from '@/components/FamilyProfileCreate';

export default function ProfileCreatePage() {
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

  const handleComplete = () => {
    router.push('/home');
  };

  if (!userType) {
    return null;
  }

  if (userType === 'aupair') {
    return <AuPairProfileCreate onComplete={handleComplete} />;
  }

  return <FamilyProfileCreate onComplete={handleComplete} />;
}
