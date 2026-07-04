import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import { NotificationProvider } from "@/context/NotificationContext";

export const metadata: Metadata = {
  title: {
    default: "Griffy — India's Construction Marketplace",
    template: "%s | Griffy",
  },
  description:
    "Buy construction materials, hire verified contractors & skilled labour for your dream home — all in one place. India's #1 construction marketplace.",
  keywords: [
    "construction materials India", "hire contractor online", "mistri near me",
    "electrician plumber mason", "home building materials", "civil contractor",
    "TMT steel cement sand", "construction labour hire",
  ],
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://griffy.in"),
  alternates: { canonical: "/" },
  openGraph: {
    title: "Griffy — India's Construction Marketplace",
    description: "Buy materials, hire contractors & labour for your dream home.",
    type: "website",
    locale: "en_IN",
    siteName: "Griffy",
  },
  twitter: {
    card: "summary_large_image",
    title: "Griffy — India's Construction Marketplace",
    description: "Buy materials, hire contractors & labour for your dream home.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <NotificationProvider>
            <CartProvider>
              <Navbar />
              <main className="pt-16">{children}</main>
              <Footer />
            </CartProvider>
          </NotificationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
