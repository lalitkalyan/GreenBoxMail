import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Header from '../components/Header';
import Footer from '../components/Footer';
import AdTop from '../components/AdTop';
import AdSidebar from '../components/AdSidebar';
import AdBottom from '../components/AdBottom';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'GreenBoxMail',
  description: '10 Minute Disposable Email Service',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 min-h-screen flex flex-col`}
      >
        <Header />
        <AdTop />
        <div className="flex flex-1 w-full max-w-6xl mx-auto px-4">
          <main className="flex-1">{children}</main>
          <AdSidebar />
        </div>
        <AdBottom />
        <Footer />
      </body>
    </html>
  );
}
