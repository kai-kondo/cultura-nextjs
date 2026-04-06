import type { Metadata } from 'next';
import { Toaster } from '@/components/ui/sonner';
import { Header } from '@/components/Header';
import { MessageCircle } from "lucide-react";
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
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-rose-50 to-amber-50">
          <Header />
          <main>{children}</main>
          <Toaster />

          {/* Floating Messages Button (Desktop only) */}
          <a
            href="/messages/emma"
            aria-label="Open messages"
            className="fixed bottom-6 right-6 z-40 hidden h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-rose-600 text-white shadow-lg hover:from-orange-600 hover:to-rose-700 lg:flex"
          >
            <MessageCircle className="h-6 w-6" />
          </a>
        </div>
      </body>
    </html>
  );
}
