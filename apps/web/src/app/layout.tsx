import type { Metadata } from 'next';
import { Suspense } from 'react';
import Script from 'next/script';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ChatWidget from '@/components/ChatWidget';
import AnalyticsPageview from '@/components/AnalyticsPageview';
import { CartProvider } from '@/context/CartContext';
import { SavedProvider } from '@/context/SavedContext';
import { NotificationProvider } from '@/context/NotificationContext';
import { ChatProvider } from '@/context/ChatContext';
import { AuthProvider } from '@/lib/auth-provider';
import { GA_MEASUREMENT_ID } from '@/lib/analytics';

const inter = Inter({ subsets: ['latin'] });

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://griffy.in';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'Griffy — India\'s Construction Marketplace',
  description: 'Find contractors, source materials, and hire skilled labour all in one place.',
  openGraph: {
    title: 'Griffy — India\'s Construction Marketplace',
    description: 'Find contractors, source materials, and hire skilled labour all in one place.',
    url: SITE_URL,
    siteName: 'Griffy',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Griffy — India\'s Construction Marketplace',
    description: 'Find contractors, source materials, and hire skilled labour all in one place.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#FDF8F5]`}>
        {GA_MEASUREMENT_ID && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`} strategy="afterInteractive" />
            <Script id="ga4-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_MEASUREMENT_ID}');
              `}
            </Script>
          </>
        )}
        <Suspense fallback={null}>
          <AnalyticsPageview />
        </Suspense>
        <AuthProvider>
          <CartProvider>
            <SavedProvider>
              <NotificationProvider>
                <ChatProvider>
                  <Navbar />
                  {children}
                  <Footer />
                  <ChatWidget />
                </ChatProvider>
              </NotificationProvider>
            </SavedProvider>
          </CartProvider>
        </AuthProvider>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
