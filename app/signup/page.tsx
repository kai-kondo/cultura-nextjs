'use client';

import { useRouter } from 'next/navigation';
import { Signup } from '@/components/Signup';

export default function SignupPage() {
  const router = useRouter();

  const handleSignupComplete = (type: 'family' | 'aupair') => {
    localStorage.setItem('userType', type);
    router.push('/profile-create');
  };

  const handleSwitchToLogin = () => {
    router.push('/');
  };

  return (
    <Signup
      onSignupComplete={handleSignupComplete}
      onSwitchToLogin={handleSwitchToLogin}
    />
  );
}
