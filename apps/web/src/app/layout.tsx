import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ChatWidget from '@/components/ChatWidget';
import { CartProvider } from '@/context/CartContext';
import { SavedProvider } from '@/context/SavedContext';
import { NotificationProvider } from '@/context/NotificationContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Griffy — India\'s Construction Marketplace',
  description: 'Find contractors, source materials, and hire skilled labour all in one place.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#FDF8F5]`}>
        <CartProvider>
          <SavedProvider>
            <NotificationProvider>
              <Navbar />
              {children}
              <Footer />
              <ChatWidget />
            </NotificationProvider>
          </SavedProvider>
        </CartProvider>
      </body>
    </html>
  );
}
