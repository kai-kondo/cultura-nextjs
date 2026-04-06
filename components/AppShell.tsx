'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { MessageCircle } from 'lucide-react';
import { Header } from '@/components/Header';
import { Toaster } from '@/components/ui/sonner';

const HIDE_GLOBAL_UI_PATHS = new Set(['/', '/signup']);

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const shouldHideGlobalUI = HIDE_GLOBAL_UI_PATHS.has(pathname);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-rose-50 to-amber-50">
      {!shouldHideGlobalUI && <Header />}
      <main>{children}</main>
      <Toaster />

      {!shouldHideGlobalUI && (
        <a
          href="/messages/emma"
          aria-label="Open messages"
          className="fixed bottom-6 right-6 z-40 hidden h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-rose-600 text-white shadow-lg hover:from-orange-600 hover:to-rose-700 lg:flex"
        >
          <MessageCircle className="h-6 w-6" />
        </a>
      )}
    </div>
  );
}
