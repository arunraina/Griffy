"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, HardHat, ChevronDown } from "lucide-react";

const navLinks = [
  {
    label: "Marketplace",
    href: "#",
    children: [
      { label: "Buy Materials", href: "/materials", desc: "Sand, bricks, cement, steel & more" },
      { label: "Hire Contractors", href: "/contractors", desc: "Licensed project contractors" },
      { label: "Hire Labour", href: "/labour", desc: "Mistri, electricians, plumbers & more" },
    ],
  },
  { label: "How It Works", href: "/how-it-works" },
  { label: "About", href: "/about" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-stone-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center group-hover:bg-orange-600 transition-colors">
              <HardHat className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-stone-900">
              Griffy<span className="text-orange-500">.</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) =>
              link.children ? (
                <div
                  key={link.label}
                  className="relative"
                  onMouseEnter={() => setDropdownOpen(true)}
                  onMouseLeave={() => setDropdownOpen(false)}
                >
                  <button className="flex items-center gap-1 px-4 py-2 text-stone-600 hover:text-orange-500 font-medium rounded-lg hover:bg-orange-50 transition-colors">
                    {link.label}
                    <ChevronDown className={`w-4 h-4 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
                  </button>
                  {dropdownOpen && (
                    <div className="absolute top-full left-0 mt-1 w-72 bg-white rounded-xl shadow-xl border border-stone-100 py-2 z-50">
                      {link.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="flex flex-col px-4 py-3 hover:bg-orange-50 transition-colors group"
                        >
                          <span className="font-semibold text-stone-800 group-hover:text-orange-500">{child.label}</span>
                          <span className="text-sm text-stone-500 mt-0.5">{child.desc}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={link.label}
                  href={link.href}
                  className="px-4 py-2 text-stone-600 hover:text-orange-500 font-medium rounded-lg hover:bg-orange-50 transition-colors"
                >
                  {link.label}
                </Link>
              )
            )}
          </nav>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/login" className="text-stone-600 hover:text-stone-900 font-medium px-3 py-2 transition-colors">
              Sign In
            </Link>
            <Link href="/register" className="btn-primary text-sm py-2">
              Get Started Free
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 text-stone-600 hover:text-stone-900 rounded-lg hover:bg-stone-100 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-stone-100 bg-white px-4 py-4 space-y-1">
          <Link href="/materials" className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-orange-50 font-medium text-stone-700 hover:text-orange-500 transition-colors" onClick={() => setMobileOpen(false)}>
            Buy Materials
          </Link>
          <Link href="/contractors" className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-orange-50 font-medium text-stone-700 hover:text-orange-500 transition-colors" onClick={() => setMobileOpen(false)}>
            Hire Contractors
          </Link>
          <Link href="/labour" className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-orange-50 font-medium text-stone-700 hover:text-orange-500 transition-colors" onClick={() => setMobileOpen(false)}>
            Hire Labour
          </Link>
          <Link href="/how-it-works" className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-orange-50 font-medium text-stone-700 hover:text-orange-500 transition-colors" onClick={() => setMobileOpen(false)}>
            How It Works
          </Link>
          <Link href="/about" className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-orange-50 font-medium text-stone-700 hover:text-orange-500 transition-colors" onClick={() => setMobileOpen(false)}>
            About
          </Link>
          <div className="pt-3 border-t border-stone-100 flex flex-col gap-2">
            <Link href="/login" className="btn-secondary text-center justify-center">Sign In</Link>
            <Link href="/register" className="btn-primary justify-center">Get Started Free</Link>
          </div>
        </div>
      )}
    </header>
  );
}
