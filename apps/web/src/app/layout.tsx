import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Griffy',
  description: 'Connect with construction service providers and material suppliers',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
