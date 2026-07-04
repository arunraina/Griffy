import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import { NotificationProvider } from "@/context/NotificationContext";

export const metadata: Metadata = {
  title: "Griffy — Your Construction Partner",
  description:
    "Buy construction materials, hire skilled contractors, and connect with trusted labour for your dream home — all in one place.",
  keywords: "construction materials, contractors, labour, mistri, electrician, plumber, home building",
  openGraph: {
    title: "Griffy — Your Construction Partner",
    description: "Buy materials, hire contractors & labour for your dream home.",
    type: "website",
  },
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
