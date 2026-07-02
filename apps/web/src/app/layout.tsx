import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Griffy — India\'s Construction Marketplace',
  description: 'Find contractors, source materials, and hire skilled labour all in one place.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#FDF8F5]`}>
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
