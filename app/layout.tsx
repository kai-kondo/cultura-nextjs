import type { Metadata } from 'next';
import { AppShell } from '@/components/AppShell';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'Cultura - Au Pair Matching App',
  description: '育児と文化体験をつなぐオーペアマッチングアプリ',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
