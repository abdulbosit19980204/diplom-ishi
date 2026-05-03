import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Sidebar from '@/components/Sidebar';
import Topbar  from '@/components/Topbar';
import ThemeProvider from '@/components/ThemeProvider';
import { RealtimeProvider } from '@/components/RealtimeProvider';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'ShopAdmin — E-Commerce Boshqaruv Tizimi',
  description: "Premium SaaS dashboard onlayn do'kon boshqaruvi uchun",
  icons: { icon: '/favicon.svg' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz">
      <body className={`${inter.variable} bg-[var(--bg-base)] text-[var(--text-primary)] flex h-screen overflow-hidden`}>
        <ThemeProvider>
          <RealtimeProvider>
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0">
              <Topbar />
              <main className="flex-1 overflow-y-auto">
                {children}
              </main>
            </div>
            <Toaster position="top-right" toastOptions={{ style: { background: '#1e293b', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' } }} />
          </RealtimeProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
