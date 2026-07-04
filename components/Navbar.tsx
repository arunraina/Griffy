"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, X, HardHat, ChevronDown, ShoppingCart, LogOut, User, Package, LayoutDashboard } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { initials } from "@/lib/constants";

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
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { count } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleLogout() {
    logout();
    setUserMenuOpen(false);
    router.push("/");
  }

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

          {/* CTA / User Menu */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/cart" className="relative p-2 text-stone-600 hover:text-orange-500 transition-colors">
              <ShoppingCart className="w-5 h-5" />
              {count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-orange-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {count > 9 ? "9+" : count}
                </span>
              )}
            </Link>

            {isAuthenticated && user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-stone-100 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-orange-500 text-white text-sm font-bold flex items-center justify-center">
                    {initials(user.fullName)}
                  </div>
                  <span className="text-sm font-semibold text-stone-700 max-w-[100px] truncate">{user.fullName.split(" ")[0]}</span>
                  <ChevronDown className={`w-4 h-4 text-stone-400 transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
                </button>

                {userMenuOpen && (
                  <div className="absolute top-full right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-stone-100 py-2 z-50">
                    <div className="px-4 py-2 border-b border-stone-100 mb-1">
                      <p className="font-semibold text-stone-900 text-sm truncate">{user.fullName}</p>
                      <p className="text-xs text-stone-500 truncate">{user.email}</p>
                    </div>
                    <Link href="/dashboard" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 hover:bg-stone-50 text-stone-700 hover:text-orange-500 transition-colors text-sm">
                      <LayoutDashboard className="w-4 h-4" /> Dashboard
                    </Link>
                    <Link href="/profile" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 hover:bg-stone-50 text-stone-700 hover:text-orange-500 transition-colors text-sm">
                      <User className="w-4 h-4" /> Profile
                    </Link>
                    <Link href="/orders" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 hover:bg-stone-50 text-stone-700 hover:text-orange-500 transition-colors text-sm">
                      <Package className="w-4 h-4" /> My Orders
                    </Link>
                    <div className="border-t border-stone-100 mt-1 pt-1">
                      <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 text-red-600 transition-colors text-sm">
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/login" className="text-stone-600 hover:text-stone-900 font-medium px-3 py-2 transition-colors">
                  Sign In
                </Link>
                <Link href="/register" className="btn-primary text-sm py-2">
                  Get Started Free
                </Link>
              </>
            )}
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
            {isAuthenticated && user ? (
              <>
                <Link href="/dashboard" className="btn-secondary text-center justify-center" onClick={() => setMobileOpen(false)}>Dashboard</Link>
                <Link href="/orders" className="btn-secondary text-center justify-center" onClick={() => setMobileOpen(false)}>My Orders</Link>
                <button onClick={() => { logout(); setMobileOpen(false); router.push("/"); }} className="text-red-600 font-semibold text-sm py-2">
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="btn-secondary text-center justify-center" onClick={() => setMobileOpen(false)}>Sign In</Link>
                <Link href="/register" className="btn-primary justify-center" onClick={() => setMobileOpen(false)}>Get Started Free</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
