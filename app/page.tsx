import Link from "next/link";
import {
  Search, Package, HardHat, Users, Star, ArrowRight,
  CheckCircle2, ShieldCheck, Truck, Clock, ChevronRight,
  Zap, MapPin
} from "lucide-react";

const stats = [
  { value: "10,000+", label: "Verified Suppliers" },
  { value: "5,000+", label: "Skilled Contractors" },
  { value: "50,000+", label: "Labour Professionals" },
  { value: "1,20,000+", label: "Projects Completed" },
];

const categories = [
  {
    icon: "🪨",
    title: "Sand & Aggregate",
    count: "240+ suppliers",
    href: "/materials?cat=sand",
    color: "bg-yellow-50 border-yellow-200",
    iconBg: "bg-yellow-100",
  },
  {
    icon: "🧱",
    title: "Bricks & Blocks",
    count: "180+ suppliers",
    href: "/materials?cat=bricks",
    color: "bg-red-50 border-red-200",
    iconBg: "bg-red-100",
  },
  {
    icon: "🏗️",
    title: "Cement & Concrete",
    count: "320+ suppliers",
    href: "/materials?cat=cement",
    color: "bg-stone-50 border-stone-200",
    iconBg: "bg-stone-100",
  },
  {
    icon: "🔩",
    title: "Steel & TMT Bars",
    count: "150+ suppliers",
    href: "/materials?cat=steel",
    color: "bg-blue-50 border-blue-200",
    iconBg: "bg-blue-100",
  },
  {
    icon: "🪵",
    title: "Wood & Timber",
    count: "90+ suppliers",
    href: "/materials?cat=wood",
    color: "bg-amber-50 border-amber-200",
    iconBg: "bg-amber-100",
  },
  {
    icon: "🪟",
    title: "Glass & Windows",
    count: "110+ suppliers",
    href: "/materials?cat=glass",
    color: "bg-cyan-50 border-cyan-200",
    iconBg: "bg-cyan-100",
  },
];

const services = [
  {
    icon: Package,
    title: "Buy Materials",
    desc: "Shop thousands of verified construction materials — sand, bricks, cement, steel, wood, tiles, and more. Get competitive prices delivered to your site.",
    href: "/materials",
    color: "text-orange-500",
    bg: "bg-orange-50",
    cta: "Browse Materials",
  },
  {
    icon: HardHat,
    title: "Hire Contractors",
    desc: "Connect with licensed, experienced contractors for your project — civil, structural, electrical, or plumbing. Compare quotes and profiles.",
    href: "/contractors",
    color: "text-blue-500",
    bg: "bg-blue-50",
    cta: "Find Contractors",
  },
  {
    icon: Users,
    title: "Hire Labour",
    desc: "Find skilled daily-wage workers — masons (mistri), electricians, plumbers, carpenters, painters, and more. Available by day or week.",
    href: "/labour",
    color: "text-green-500",
    bg: "bg-green-50",
    cta: "Hire Labour",
  },
];

const steps = [
  {
    step: "01",
    title: "Post Your Need",
    desc: "Describe your project — what materials you need, what kind of contractors or labour you're looking for.",
    icon: Search,
  },
  {
    step: "02",
    title: "Get Matched",
    desc: "Our platform instantly connects you with verified suppliers, contractors, and labour in your area.",
    icon: Zap,
  },
  {
    step: "03",
    title: "Compare & Book",
    desc: "Review profiles, ratings, prices, and availability. Book securely with our escrow-protected payments.",
    icon: CheckCircle2,
  },
  {
    step: "04",
    title: "Build Your Dream",
    desc: "Work begins. Track progress, communicate via the app, and release payment only when satisfied.",
    icon: HardHat,
  },
];

const testimonials = [
  {
    name: "Rajesh Kumar",
    role: "Homeowner, Bengaluru",
    rating: 5,
    quote:
      "Griffy saved me at least 3 months of running around. I found a great contractor, ordered all my materials, and hired electricians — all from one platform. Highly recommend!",
    avatar: "RK",
  },
  {
    name: "Priya Nair",
    role: "Homeowner, Kochi",
    rating: 5,
    quote:
      "The material prices are genuinely competitive and the delivery was on time. The mistri team from Griffy was very professional. My house is exactly how I dreamed it.",
    avatar: "PN",
  },
  {
    name: "Amit Sharma",
    role: "Civil Contractor, Delhi",
    rating: 5,
    quote:
      "As a contractor I get steady project leads through Griffy. The platform is transparent, payments are secure, and clients are serious. My business has grown 40% since joining.",
    avatar: "AS",
  },
];

const trustedBy = ["Ultratech", "ACC Cement", "JSW Steel", "Asian Paints", "Havells", "Kajaria"];

export default function Home() {
  return (
    <div className="overflow-x-hidden">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 text-white min-h-[90vh] flex items-center">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-orange-500/20 border border-orange-500/30 text-orange-300 text-sm font-medium px-4 py-2 rounded-full mb-6">
              <span className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
              India&apos;s #1 Construction Marketplace
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
              Build Your{" "}
              <span className="text-orange-400">Dream Home</span>{" "}
              — We&apos;ve Got Everything
            </h1>

            <p className="text-stone-300 text-xl leading-relaxed mb-10 max-w-2xl">
              Buy construction materials at factory prices, hire trusted contractors, and connect with skilled labour — all in one platform. Your construction partner from foundation to finish.
            </p>

            {/* Search bar */}
            <div className="bg-white rounded-2xl p-2 flex flex-col sm:flex-row gap-2 shadow-2xl mb-8 max-w-2xl">
              <div className="flex items-center gap-2 flex-1 px-3">
                <MapPin className="w-5 h-5 text-stone-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Enter your city or pincode"
                  className="flex-1 text-stone-700 placeholder-stone-400 outline-none bg-transparent py-2"
                />
              </div>
              <div className="w-px bg-stone-200 hidden sm:block" />
              <div className="flex items-center gap-2 flex-1 px-3">
                <Search className="w-5 h-5 text-stone-400 shrink-0" />
                <input
                  type="text"
                  placeholder="What do you need? (materials, contractor...)"
                  className="flex-1 text-stone-700 placeholder-stone-400 outline-none bg-transparent py-2"
                />
              </div>
              <button className="btn-primary rounded-xl whitespace-nowrap">
                Search Now
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-stone-400">
              <span>Popular:</span>
              {["Sand", "Bricks", "TMT Steel", "Electrician", "Plumber", "Civil Contractor"].map((tag) => (
                <Link
                  key={tag}
                  href={`/search?q=${tag}`}
                  className="hover:text-orange-400 transition-colors underline underline-offset-2"
                >
                  {tag}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Floating card */}
        <div className="hidden lg:block absolute right-16 top-1/2 -translate-y-1/2 w-72">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-5 space-y-4">
            <p className="text-sm font-semibold text-stone-200">Recent Activity</p>
            {[
              { emoji: "🏠", text: "Rahul booked a Civil Contractor in Pune", time: "2 min ago" },
              { emoji: "🧱", text: "500 Red Bricks ordered in Hyderabad", time: "5 min ago" },
              { emoji: "⚡", text: "Electrician hired in Noida", time: "8 min ago" },
              { emoji: "🔨", text: "Mistri team booked for 5 days in Chennai", time: "12 min ago" },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="text-xl">{item.emoji}</span>
                <div>
                  <p className="text-xs text-stone-200 leading-tight">{item.text}</p>
                  <p className="text-xs text-stone-500 mt-0.5">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-orange-500 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center text-white">
            {stats.map((s) => (
              <div key={s.label}>
                <p className="text-3xl md:text-4xl font-extrabold">{s.value}</p>
                <p className="text-orange-100 text-sm mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-orange-500 font-semibold text-sm uppercase tracking-widest mb-3">Everything You Need</p>
            <h2 className="section-heading">One Platform, Complete Solution</h2>
            <p className="section-sub mx-auto">
              From raw materials to skilled hands — Griffy covers every stage of your home construction journey.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {services.map((s) => (
              <div key={s.title} className="card p-8 group">
                <div className={`w-14 h-14 ${s.bg} rounded-2xl flex items-center justify-center mb-6`}>
                  <s.icon className={`w-7 h-7 ${s.color}`} />
                </div>
                <h3 className="text-xl font-bold text-stone-900 mb-3">{s.title}</h3>
                <p className="text-stone-500 leading-relaxed mb-6">{s.desc}</p>
                <Link
                  href={s.href}
                  className={`inline-flex items-center gap-2 ${s.color} font-semibold hover:gap-3 transition-all`}
                >
                  {s.cta} <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Material Categories */}
      <section className="py-24 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-12 gap-4">
            <div>
              <p className="text-orange-500 font-semibold text-sm uppercase tracking-widest mb-3">Materials Marketplace</p>
              <h2 className="section-heading">Browse by Category</h2>
              <p className="section-sub mt-2">Factory-direct prices from verified suppliers across India.</p>
            </div>
            <Link href="/materials" className="btn-outline whitespace-nowrap">
              View All Categories
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.title}
                href={cat.href}
                className={`card border ${cat.color} p-5 text-center group hover:border-orange-300`}
              >
                <div className={`w-12 h-12 ${cat.iconBg} rounded-xl flex items-center justify-center mx-auto mb-3 text-2xl group-hover:scale-110 transition-transform`}>
                  {cat.icon}
                </div>
                <p className="font-semibold text-stone-800 text-sm">{cat.title}</p>
                <p className="text-xs text-stone-500 mt-1">{cat.count}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-orange-500 font-semibold text-sm uppercase tracking-widest mb-3">Simple Process</p>
            <h2 className="section-heading">How Griffy Works</h2>
            <p className="section-sub mx-auto">Get your project started in 4 simple steps.</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 relative">
            <div className="hidden md:block absolute top-8 left-[calc(12.5%+1.5rem)] right-[calc(12.5%+1.5rem)] h-px bg-dashed border-t-2 border-dashed border-orange-200" />
            {steps.map((step, i) => (
              <div key={step.step} className="relative text-center">
                <div className="w-16 h-16 rounded-2xl bg-orange-500 text-white flex items-center justify-center mx-auto mb-5 shadow-lg shadow-orange-200">
                  <step.icon className="w-8 h-8" />
                </div>
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-stone-900 text-white text-xs font-bold flex items-center justify-center">
                  {i + 1}
                </div>
                <h3 className="font-bold text-stone-900 text-lg mb-2">{step.title}</h3>
                <p className="text-stone-500 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/register" className="btn-primary text-base px-8 py-3.5">
              Start Building Today <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Trust signals */}
      <section className="py-20 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: ShieldCheck, color: "text-green-500", bg: "bg-green-50", title: "Verified Partners", desc: "All suppliers, contractors, and labour are background-verified and rated by real customers." },
              { icon: Truck, color: "text-blue-500", bg: "bg-blue-50", title: "On-Time Delivery", desc: "Material deliveries tracked in real-time. Most deliveries within 24–48 hours of order." },
              { icon: Clock, color: "text-purple-500", bg: "bg-purple-50", title: "Secure Payments", desc: "Escrow-protected payments. Your money is released only when the work is done and you're satisfied." },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-4 card p-6">
                <div className={`w-12 h-12 ${item.bg} rounded-xl flex items-center justify-center shrink-0`}>
                  <item.icon className={`w-6 h-6 ${item.color}`} />
                </div>
                <div>
                  <h3 className="font-bold text-stone-900 mb-1">{item.title}</h3>
                  <p className="text-stone-500 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-orange-500 font-semibold text-sm uppercase tracking-widest mb-3">Happy Customers</p>
            <h2 className="section-heading">What Our Clients Say</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t) => (
              <div key={t.name} className="card p-7">
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <blockquote className="text-stone-600 text-sm leading-relaxed mb-5">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 font-bold text-sm flex items-center justify-center">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-stone-900 text-sm">{t.name}</p>
                    <p className="text-stone-500 text-xs">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trusted brands */}
      <section className="py-14 bg-stone-50 border-y border-stone-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-stone-500 text-sm font-medium mb-8">Trusted materials from India&apos;s leading brands</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
            {trustedBy.map((brand) => (
              <span key={brand} className="text-stone-400 font-bold text-lg tracking-wide hover:text-stone-600 transition-colors cursor-default">
                {brand}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-br from-orange-500 to-orange-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-5">
            Ready to Build Your Dream Home?
          </h2>
          <p className="text-orange-100 text-lg mb-10 max-w-2xl mx-auto">
            Join 1,20,000+ homeowners across India who trust Griffy for their construction needs. Get started — it&apos;s free.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 bg-white text-orange-500 hover:bg-orange-50 font-bold px-8 py-4 rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              Get Started Free <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/how-it-works"
              className="inline-flex items-center justify-center gap-2 border-2 border-white/50 text-white hover:bg-white/10 font-semibold px-8 py-4 rounded-xl transition-all"
            >
              Learn How It Works <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
