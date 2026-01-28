import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/Providers';
import {
  Sidebar,
  ProfilePopup,
  MobileProfile,
  MobileHeader,
} from '@/components/layout';
import { MusicPlayer } from '@/components/player';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'MusicGPT',
  description:
    'Create amazing music with AI. Senior Frontend Developer Assessment.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en' className='dark'>
      <body
        className={`${inter.variable} font-sans antialiased bg-[#0D0D0D] text-white`}
      >
        <Providers>
          {/* Sidebar */}
          <Sidebar />

          {/* Main Content Area */}
          <main className='md:ml-60 min-h-screen'>
            {/* Mobile Header */}
            <MobileHeader />

            {/* Desktop Header with Profile */}
            <header className='hidden md:flex sticky top-0 z-30 items-center justify-end px-6 py-4 bg-primary-50'>
              <ProfilePopup />
            </header>

            {/* Page Content */}
            <div className='px-4 md:px-6 pb-32 mx-auto '>{children}</div>
          </main>

          {/* Mobile Profile Page */}
          <MobileProfile />

          {/* Floating Music Player */}
          <MusicPlayer />
        </Providers>
      </body>
    </html>
  );
}
