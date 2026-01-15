import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/Providers';
import { Sidebar } from '@/components/layout';
import { ProfilePopup } from '@/components/layout';
import { MusicPlayer } from '@/components/player';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'MusicGPT',
  description:
    'Create amazing music with AI. Senior Frontend Developer Assessment.',
  icons: {
    icon: '/app/favicon.png',
  },
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
          <main className='ml-60 min-h-screen'>
            {/* Top Header with Profile */}
            <header className='sticky top-0 z-30 flex items-center justify-end px-6 py-4 bg-gradient-to-b from-[#0D0D0D] to-transparent'>
              <ProfilePopup />
            </header>

            {/* Page Content */}
            <div className='px-6 pb-32'>{children}</div>
          </main>

          {/* Floating Music Player */}
          <MusicPlayer />
        </Providers>
      </body>
    </html>
  );
}
