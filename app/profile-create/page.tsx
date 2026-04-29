'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuPairProfileCreate } from '@/components/AuPairProfileCreate';
import { FamilyProfileCreate } from '@/components/FamilyProfileCreate';

export default function ProfileCreatePage() {
  const router = useRouter();
  const [userType, setUserType] = useState<'family' | 'aupair' | null>(null);


  const handleComplete = () => {
    router.push('/home');
  };

  if (!userType) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-rose-50 to-amber-50 px-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-lg">
          <h1 className="text-2xl font-semibold text-slate-900">Choose your role</h1>
          <p className="mt-2 text-sm text-slate-600">
            Select how you want to use Cultura before creating your profile.
          </p>

          <div className="mt-6 flex flex-col gap-3">
            <button
              type="button"
              onClick={() => setUserType('aupair')}
              className="w-full rounded-xl bg-orange-500 px-4 py-3 font-medium text-white transition hover:bg-orange-600"
            >
              I&apos;m a Childcare Provider
            </button>

            <button
              type="button"
              onClick={() => setUserType('family')}
              className="w-full rounded-xl bg-rose-500 px-4 py-3 font-medium text-white transition hover:bg-rose-600"
            >
              I&apos;m a Host Family
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (userType === 'aupair') {
    return <AuPairProfileCreate onComplete={handleComplete} />;
  }

  return <FamilyProfileCreate onComplete={handleComplete} />;
}
