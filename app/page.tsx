'use client';

import { useRouter } from 'next/navigation';
import { Login } from '@/components/Login';

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = (type: 'family' | 'aupair') => {
    // userTypeをlocalStorageまたはクッキーに保存
    localStorage.setItem('userType', type);
    router.push('/home');
  };

  const handleSwitchToSignup = () => {
    router.push('/signup');
  };

  return (
    <Login
      onLogin={handleLogin}
      onSwitchToSignup={handleSwitchToSignup}
    />
  );
}
