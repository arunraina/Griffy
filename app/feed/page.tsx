"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Bell, Search, Package, HardHat, Users, Star, MapPin, ChevronRight,
  TrendingUp, Clock, CheckCircle2, ArrowRight, Zap, Heart, Share2, MessageSquare,
  ShoppingCart, Plus, Home, LayoutDashboard
} from "lucide-react";

const notifications = [
  { id: 1, text: "Your order #GRF-2891 has been dispatched", time: "2 min ago", type: "order", read: false },
  { id: 2, text: "Rajan Constructions sent you a quote", time: "1 hr ago", type: "quote", read: false },
  { id: 3, text: "Your profile was viewed by 12 contractors", time: "3 hrs ago", type: "view", read: true },
];

const feedItems = [
  {
    id: 1, type: "material_deal",
    title: "Flash Sale: River Sand at ₹1,400/ton (22% off)",
    supplier: "Kaveri Aggregates", location: "Bengaluru", emoji: "🏖️",
    badge: "Limited Time", badgeColor: "bg-red-100 text-red-700",
    stats: { likes: 48, comments: 12, saves: 31 },
    cta: "Order Now", ctaHref: "/materials",
    time: "30 min ago", category: "Sand & Aggregate",
  },
  {
    id: 2, type: "contractor_new",
    title: "New Top-Rated Civil Contractor in your area",
    name: "Build Masters Pvt Ltd",
    location: "Whitefield, Bengaluru",
    rating: 4.9, reviews: 87,
    emoji: "🔨",
    badge: "New on Griffy", badgeColor: "bg-green-100 text-green-700",
    stats: { likes: 23, comments: 5, saves: 19 },
    cta: "View Profile", ctaHref: "/contractors",
    time: "1 hr ago", category: "Civil Contractor",
  },
  {
    id: 3, type: "tip",
    title: "Pro Tip: How to check cement quality before buying",
    excerpt: "Bad cement is one of the top reasons for structural problems. Here's a quick 3-step quality test any homeowner can do before accepting delivery...",
    badge: "Griffy Guide", badgeColor: "bg-blue-100 text-blue-700",
    emoji: "💡",
    stats: { likes: 134, comments: 28, saves: 92 },
    cta: "Read More", ctaHref: "/blog",
    time: "2 hrs ago", category: "Tips & Guides",
  },
  {
    id: 4, type: "labour_available",
    title: "3 Electricians now available in Bengaluru this week",
    emoji: "⚡",
    badge: "Available Now", badgeColor: "bg-orange-100 text-orange-700",
    workers: [
      { name: "Sanjay E.", rate: "₹750/day", rating: 4.7 },
      { name: "Ravi K.", rate: "₹700/day", rating: 4.6 },
      { name: "Mohan S.", rate: "₹800/day", rating: 4.8 },
    ],
    stats: { likes: 19, comments: 3, saves: 14 },
    cta: "Hire Now", ctaHref: "/labour",
    time: "3 hrs ago", category: "Electrician",
  },
  {
    id: 5, type: "success_story",
    title: "Priya built her dream home in 14 months ✨",
    excerpt: "\"I managed everything — materials, contractors, and daily labour — through Griffy. Saved ₹3.5 lakhs compared to quotes I got offline.\"",
    name: "Priya Nair", location: "Kochi, KL",
    emoji: "🏡",
    badge: "Success Story", badgeColor: "bg-purple-100 text-purple-700",
    stats: { likes: 287, comments: 64, saves: 108 },
    cta: "Read Story", ctaHref: "/blog",
    time: "5 hrs ago", category: "Story",
  },
  {
    id: 6, type: "material_deal",
    title: "UltraTech OPC 53 Cement — Bulk Order Discount",
    supplier: "UltraTech Dealer — Mumbai", location: "Mumbai, MH", emoji: "🏗️",
    badge: "Bulk Savings", badgeColor: "bg-yellow-100 text-yellow-700",
    stats: { likes: 35, comments: 8, saves: 22 },
    cta: "Get Quote", ctaHref: "/materials",
    time: "6 hrs ago", category: "Cement",
  },
];

const quickActions = [
  { label: "Buy Materials", icon: Package, href: "/materials", color: "bg-orange-500", count: "10K+ products" },
  { label: "Find Contractor", icon: HardHat, href: "/contractors", color: "bg-blue-500", count: "5K+ pros" },
  { label: "Hire Labour", icon: Users, href: "/labour", color: "bg-green-500", count: "50K+ workers" },
  { label: "Post Project", icon: Plus, href: "/post-project", color: "bg-purple-500", count: "Get quotes fast" },
];

const myOrders = [
  { id: "GRF-2891", item: "River Sand × 10 tons", status: "In Transit", statusColor: "text-blue-600 bg-blue-50", emoji: "🚚", date: "Expected today" },
  { id: "GRF-2756", item: "Civil Contractor — Booking", status: "In Progress", statusColor: "text-orange-600 bg-orange-50", emoji: "🔨", date: "Day 12 of 45" },
  { id: "GRF-2601", item: "Red Bricks × 2000 pcs", status: "Delivered", statusColor: "text-green-600 bg-green-50", emoji: "✅", date: "Delivered Jun 15" },
];

type FeedItem = typeof feedItems[number];

function FeedCard({ item, liked, saved, onLike, onSave }: { item: FeedItem; liked: boolean; saved: boolean; onLike: () => void; onSave: () => void }) {
  return (
    <div className="bg-white rounded-2xl border border-stone-100 shadow-sm hover:shadow-md transition-all overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between p-5 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-xl">{item.emoji}</div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`badge ${item.badgeColor} text-xs`}>{item.badge}</span>
              <span className="text-xs text-stone-400">{item.category}</span>
            </div>
            <p className="text-xs text-stone-400 mt-0.5">{item.time}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-5 pb-4">
        <h3 className="font-bold text-stone-900 text-base leading-snug mb-2">{item.title}</h3>

        {"excerpt" in item && item.excerpt && (
          <p className="text-stone-500 text-sm leading-relaxed mb-3">{item.excerpt}</p>
        )}

        {"supplier" in item && (
          <div className="flex items-center gap-3 text-sm text-stone-500 mb-2">
            <span className="font-medium text-stone-700">{item.supplier}</span>
            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{item.location}</span>
          </div>
        )}

        {"rating" in item && (
          <div className="flex items-center gap-2 text-sm mb-2">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-3.5 h-3.5 ${i < Math.floor(item.rating as number) ? "text-yellow-400 fill-yellow-400" : "text-stone-200"}`} />
              ))}
            </div>
            <span className="font-semibold text-stone-800">{item.rating}</span>
            <span className="text-stone-400">({item.reviews} reviews)</span>
          </div>
        )}

        {"workers" in item && item.workers && (
          <div className="space-y-2 mb-3">
            {item.workers.map((w) => (
              <div key={w.name} className="flex items-center justify-between bg-stone-50 rounded-xl px-3 py-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-yellow-100 text-yellow-700 text-xs font-bold flex items-center justify-center">{w.name[0]}</div>
                  <span className="text-sm font-medium text-stone-800">{w.name}</span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-orange-600 font-semibold">{w.rate}</span>
                  <span className="flex items-center gap-0.5 text-stone-500">
                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />{w.rating}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-stone-50 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onLike} className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${liked ? "text-red-500" : "text-stone-400 hover:text-red-400"}`}>
            <Heart className={`w-4 h-4 ${liked ? "fill-red-500" : ""}`} />
            {item.stats.likes + (liked ? 1 : 0)}
          </button>
          <button className="flex items-center gap-1.5 text-xs font-medium text-stone-400 hover:text-blue-500 transition-colors">
            <MessageSquare className="w-4 h-4" /> {item.stats.comments}
          </button>
          <button onClick={onSave} className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${saved ? "text-orange-500" : "text-stone-400 hover:text-orange-400"}`}>
            <Star className={`w-4 h-4 ${saved ? "fill-orange-500" : ""}`} />
            {item.stats.saves + (saved ? 1 : 0)}
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-1.5 text-stone-400 hover:text-stone-600 transition-colors">
            <Share2 className="w-4 h-4" />
          </button>
          <Link href={item.ctaHref} className="text-xs font-semibold text-orange-500 hover:text-orange-600 flex items-center gap-1">
            {item.cta} <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function FeedPage() {
  const [liked, setLiked] = useState<Record<number, boolean>>({});
  const [saved, setSaved] = useState<Record<number, boolean>>({});
  const [showNotifications, setShowNotifications] = useState(false);
  const [activeTab, setActiveTab] = useState<"for-you" | "materials" | "contractors" | "labour">("for-you");

  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Feed top bar */}
      <div className="bg-white border-b border-stone-100 sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            {/* Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto">
              {(["for-you", "materials", "contractors", "labour"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`whitespace-nowrap px-4 py-2 text-sm font-semibold rounded-lg transition-all capitalize ${
                    activeTab === tab ? "bg-orange-500 text-white" : "text-stone-600 hover:bg-stone-100"
                  }`}
                >
                  {tab === "for-you" ? "For You" : tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-3 relative">
              <Link href="/search" className="p-2 text-stone-500 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors">
                <Search className="w-5 h-5" />
              </Link>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-stone-500 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
              >
                <Bell className="w-5 h-5" />
                {unread > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {unread}
                  </span>
                )}
              </button>

              {/* Notification dropdown */}
              {showNotifications && (
                <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-stone-100 py-2 z-50">
                  <p className="px-4 py-2 text-sm font-bold text-stone-900 border-b border-stone-50">Notifications</p>
                  {notifications.map((n) => (
                    <div key={n.id} className={`flex items-start gap-3 px-4 py-3 hover:bg-stone-50 ${!n.read ? "bg-orange-50/50" : ""}`}>
                      <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${!n.read ? "bg-orange-500" : "bg-transparent"}`} />
                      <div>
                        <p className="text-sm text-stone-800">{n.text}</p>
                        <p className="text-xs text-stone-400 mt-0.5">{n.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 xl:grid-cols-4 gap-8">

          {/* Left sidebar */}
          <aside className="hidden lg:block lg:col-span-1 space-y-5">
            {/* User card */}
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 font-bold text-lg flex items-center justify-center">
                  AR
                </div>
                <div>
                  <p className="font-bold text-stone-900">Arun Raina</p>
                  <p className="text-xs text-stone-500">Homeowner · Bengaluru</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-stone-50">
                {[{ label: "Orders", val: "3" }, { label: "Saved", val: "12" }, { label: "Reviews", val: "5" }].map((s) => (
                  <div key={s.label} className="text-center">
                    <p className="font-bold text-stone-900 text-lg">{s.val}</p>
                    <p className="text-xs text-stone-500">{s.label}</p>
                  </div>
                ))}
              </div>
              <Link href="/profile" className="mt-4 flex items-center justify-center gap-1.5 text-sm font-medium text-orange-500 hover:text-orange-600 transition-colors">
                View Profile <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Quick actions */}
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
              <p className="text-sm font-bold text-stone-900 mb-3">Quick Actions</p>
              <div className="space-y-2">
                {quickActions.map((action) => (
                  <Link key={action.label} href={action.href}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-stone-50 transition-colors group">
                    <div className={`w-9 h-9 ${action.color} rounded-xl flex items-center justify-center`}>
                      <action.icon className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-stone-800 text-sm group-hover:text-orange-500 transition-colors">{action.label}</p>
                      <p className="text-xs text-stone-400">{action.count}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-stone-300 group-hover:text-orange-400 transition-colors" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Trending */}
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-orange-500" />
                <p className="text-sm font-bold text-stone-900">Trending Searches</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {["TMT Steel", "Mistri Bengaluru", "Civil Contractor", "Cement Price", "AAC Blocks", "Waterproofing"].map((tag) => (
                  <Link key={tag} href={`/search?q=${tag}`}
                    className="text-xs px-3 py-1.5 bg-stone-50 hover:bg-orange-50 text-stone-600 hover:text-orange-500 rounded-full border border-stone-200 hover:border-orange-200 transition-all">
                    #{tag.replace(/ /g, "")}
                  </Link>
                ))}
              </div>
            </div>
          </aside>

          {/* Main feed */}
          <main className="lg:col-span-2 space-y-5">
            {/* Welcome banner */}
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-5 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-lg">Good morning, Arun! 👋</p>
                  <p className="text-orange-100 text-sm mt-1">Your order #GRF-2891 is on the way. Expected today.</p>
                </div>
                <Link href="/search" className="bg-white/20 hover:bg-white/30 rounded-xl px-4 py-2 text-sm font-semibold transition-colors whitespace-nowrap">
                  Find Materials
                </Link>
              </div>
            </div>

            {/* Feed items */}
            {feedItems.map((item) => (
              <FeedCard
                key={item.id}
                item={item}
                liked={!!liked[item.id]}
                saved={!!saved[item.id]}
                onLike={() => setLiked((p) => ({ ...p, [item.id]: !p[item.id] }))}
                onSave={() => setSaved((p) => ({ ...p, [item.id]: !p[item.id] }))}
              />
            ))}

            <div className="text-center py-4">
              <button className="btn-secondary px-8">Load more</button>
            </div>
          </main>

          {/* Right sidebar */}
          <aside className="hidden xl:block xl:col-span-1 space-y-5">
            {/* My orders */}
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-bold text-stone-900">My Orders</p>
                <Link href="/orders" className="text-xs text-orange-500 hover:text-orange-600 font-medium">View all</Link>
              </div>
              <div className="space-y-3">
                {myOrders.map((order) => (
                  <div key={order.id} className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl">
                    <span className="text-xl">{order.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-stone-800 truncate">{order.item}</p>
                      <p className="text-xs text-stone-500">{order.date}</p>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${order.statusColor}`}>
                      {order.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Nearby labour */}
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-bold text-stone-900">Available Near You</p>
                <Link href="/labour" className="text-xs text-orange-500 hover:text-orange-600 font-medium">See all</Link>
              </div>
              <div className="space-y-3">
                {[
                  { name: "Rafiq M.", trade: "Mason", rate: "₹900/day", avatar: "RM", avail: true },
                  { name: "Sanjay K.", trade: "Electrician", rate: "₹750/day", avatar: "SK", avail: true },
                  { name: "Arjun C.", trade: "Carpenter", rate: "₹1100/day", avatar: "AC", avail: false },
                ].map((w) => (
                  <div key={w.name} className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-stone-100 text-stone-600 text-xs font-bold flex items-center justify-center">
                      {w.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-stone-800">{w.name}</p>
                      <p className="text-xs text-stone-500">{w.trade} · {w.rate}</p>
                    </div>
                    <span className={`w-2 h-2 rounded-full ${w.avail ? "bg-green-400" : "bg-stone-300"}`} />
                  </div>
                ))}
              </div>
              <Link href="/labour" className="mt-4 flex items-center justify-center gap-1 text-sm font-medium text-orange-500 hover:text-orange-600">
                Browse All Labour <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* App promo */}
            <div className="bg-gradient-to-br from-stone-900 to-stone-800 rounded-2xl p-5 text-white">
              <Zap className="w-8 h-8 text-orange-400 mb-3" />
              <p className="font-bold mb-1">Get the Griffy App</p>
              <p className="text-stone-400 text-xs mb-4">Track orders, chat with contractors, and hire labour on the go.</p>
              <button className="w-full bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors">
                Download Free
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
