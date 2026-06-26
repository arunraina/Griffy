import Link from "next/link";
import { HardHat, Phone, Mail, MapPin, Facebook, Instagram, Twitter, Youtube } from "lucide-react";

const footerLinks = {
  Marketplace: [
    { label: "Buy Materials", href: "/materials" },
    { label: "Hire Contractors", href: "/contractors" },
    { label: "Hire Labour", href: "/labour" },
    { label: "Post a Project", href: "/post-project" },
  ],
  Company: [
    { label: "About Us", href: "/about" },
    { label: "How It Works", href: "/how-it-works" },
    { label: "Careers", href: "/careers" },
    { label: "Blog", href: "/blog" },
  ],
  Support: [
    { label: "Help Center", href: "/help" },
    { label: "Contact Us", href: "/contact" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-stone-900 text-stone-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-5">
              <div className="w-9 h-9 bg-orange-500 rounded-lg flex items-center justify-center">
                <HardHat className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">
                Griffy<span className="text-orange-400">.</span>
              </span>
            </Link>
            <p className="text-stone-400 text-sm leading-relaxed max-w-xs">
              Your all-in-one construction partner. Find materials, hire skilled contractors, and connect with trusted labour — all in one place.
            </p>
            <div className="mt-6 space-y-2 text-sm">
              <div className="flex items-center gap-2.5 text-stone-400">
                <Phone className="w-4 h-4 text-orange-400 shrink-0" />
                <span>+91 98765 43210</span>
              </div>
              <div className="flex items-center gap-2.5 text-stone-400">
                <Mail className="w-4 h-4 text-orange-400 shrink-0" />
                <span>hello@griffy.in</span>
              </div>
              <div className="flex items-center gap-2.5 text-stone-400">
                <MapPin className="w-4 h-4 text-orange-400 shrink-0" />
                <span>Bengaluru, Karnataka, India</span>
              </div>
            </div>
            <div className="mt-6 flex items-center gap-3">
              {[Facebook, Instagram, Twitter, Youtube].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 rounded-lg bg-stone-800 hover:bg-orange-500 flex items-center justify-center text-stone-400 hover:text-white transition-all duration-200">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-white font-semibold mb-4">{title}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-stone-400 hover:text-orange-400 text-sm transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-stone-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-stone-500 text-sm">
            &copy; {new Date().getFullYear()} Griffy Technologies Pvt. Ltd. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm text-stone-500">
            <Link href="/privacy" className="hover:text-orange-400 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-orange-400 transition-colors">Terms</Link>
            <Link href="/cookies" className="hover:text-orange-400 transition-colors">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
