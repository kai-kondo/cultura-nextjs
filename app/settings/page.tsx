'use client';

import { useRouter } from 'next/navigation';
import { AccountSettings } from '@/components/AccountSettings';

export default function SettingsPage() {
  const router = useRouter();

  const handleBack = () => {
    router.push('/home');
  };

  const handleLogout = () => {
    localStorage.removeItem('userType');
    router.push('/');
  };

  return (
    <AccountSettings
      onBack={handleBack}
      onLogout={handleLogout}
    />
  );
}
