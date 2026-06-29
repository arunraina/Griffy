import Link from "next/link";
import { Star, MapPin, CheckCircle2, Phone, Calendar, Shield, Clock, Award, ChevronRight, MessageSquare, Wrench } from "lucide-react";

const worker = {
  id: "1",
  name: "Mohammed Aslam",
  trade: "Mason / Mistri",
  location: "HSR Layout, Bengaluru, KA",
  experience: "9 years",
  rating: 4.8,
  reviews: 134,
  jobsDone: 312,
  dailyRate: 1200,
  weeklyRate: 7000,
  availability: "available",
  bio: "Experienced mason with 9+ years in brick-laying, plastering, tile fixing, and structural repairs. I have worked on 300+ residential and commercial projects in Bengaluru. Available for daily contracts, weekly, or long-term site-based work. I take care of material estimation and ensure zero wastage.",
  skills: ["Brick Masonry", "Plastering", "Tile Fixing", "Wall Finishing", "Concrete Pouring", "Waterproofing", "RCC Repair"],
  languages: ["Kannada", "Hindi", "Urdu", "Tamil (basic)"],
  verified: true,
  licenseNo: "KA-LBR-1982-BLR",
  avatar: "MA",
  workImages: [
    { emoji: "🧱", label: "Brick wall, HSR project" },
    { emoji: "🏠", label: "Plastering, Whitefield" },
    { emoji: "🪟", label: "Tile fixing, JP Nagar" },
    { emoji: "🏗️", label: "RCC column repair" },
  ],
  completedJobs: [
    { title: "4BHK Brick masonry", client: "Suresh R.", date: "May 2025", duration: "18 days" },
    { title: "Bathroom tile fixing", client: "Priya N.", date: "Apr 2025", duration: "3 days" },
    { title: "Wall plastering (full house)", client: "Ravi M.", date: "Mar 2025", duration: "10 days" },
    { title: "Terrace waterproofing", client: "Anand S.", date: "Feb 2025", duration: "5 days" },
  ],
  reviewsList: [
    { author: "Suresh R.", rating: 5, date: "May 2025", text: "Mohammed sir is extremely skilled and punctual. He finished 18 days of brickwork in 15 days. Quality was outstanding, 0 rework needed.", avatar: "SR", avatarBg: "bg-blue-100 text-blue-600" },
    { author: "Priya N.", rating: 5, date: "Apr 2025", text: "Very clean tile work. He explained everything and made sure the grout lines were perfect. Highly recommend.", avatar: "PN", avatarBg: "bg-pink-100 text-pink-600" },
    { author: "Ravi M.", rating: 4, date: "Mar 2025", text: "Good work but arrived 30 min late on the first day. After that, no issues. Final result was clean and professional.", avatar: "RM", avatarBg: "bg-green-100 text-green-600" },
  ],
};

export async function generateMetadata({ params }: { params: { id: string } }) {
  return { title: `${worker.name} — ${worker.trade} | Griffy`, description: worker.bio };
}

export default function LabourDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="min-h-screen bg-stone-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-stone-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-2 text-sm text-stone-500">
            <Link href="/" className="hover:text-orange-500">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <Link href="/labour" className="hover:text-orange-500">Hire Labour</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-stone-900 font-medium">{worker.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile card */}
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
              <div className="flex items-start gap-5">
                <div className="w-20 h-20 rounded-2xl bg-orange-100 text-orange-600 font-extrabold text-2xl flex items-center justify-center shrink-0">
                  {worker.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-2xl font-extrabold text-stone-900">{worker.name}</h1>
                    {worker.verified && <Shield className="w-5 h-5 text-blue-500" />}
                  </div>
                  <p className="text-stone-500 mt-0.5 flex items-center gap-1.5">
                    <Wrench className="w-4 h-4 text-orange-400" /> {worker.trade}
                  </p>

                  <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-3 text-sm text-stone-600">
                    <span className="flex items-center gap-1.5">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      <span className="font-bold text-stone-900">{worker.rating}</span>
                      <span className="text-stone-500">({worker.reviews} reviews)</span>
                    </span>
                    <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-stone-400" />{worker.location}</span>
                    <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-stone-400" />{worker.experience} exp</span>
                    <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-500" />{worker.jobsDone} jobs done</span>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-4">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${worker.availability === "available" ? "bg-green-100 text-green-700" : "bg-stone-100 text-stone-500"}`}>
                      {worker.availability === "available" ? "● Available now" : "● Not available"}
                    </span>
                    <span className="badge bg-blue-100 text-blue-700 text-xs flex items-center gap-1">
                      <Shield className="w-3 h-3" /> ID Verified
                    </span>
                    <span className="badge bg-orange-100 text-orange-700 text-xs">Top Rated</span>
                  </div>
                </div>
              </div>
            </div>

            {/* About */}
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
              <h2 className="font-bold text-stone-900 text-lg mb-3">About</h2>
              <p className="text-stone-600 leading-relaxed">{worker.bio}</p>

              <h3 className="font-bold text-stone-900 mt-5 mb-3">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {worker.skills.map((skill) => (
                  <span key={skill} className="px-3 py-1.5 bg-stone-100 text-stone-700 text-sm font-medium rounded-full">{skill}</span>
                ))}
              </div>

              <div className="mt-5 flex items-center gap-2 text-sm text-stone-500">
                <span className="font-semibold text-stone-700">Languages:</span>
                {worker.languages.join(", ")}
              </div>
            </div>

            {/* Work samples */}
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
              <h2 className="font-bold text-stone-900 text-lg mb-4">Work Samples</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {worker.workImages.map((img, i) => (
                  <div key={i} className="aspect-square bg-stone-50 rounded-xl flex flex-col items-center justify-center gap-2 border border-stone-100">
                    <span className="text-4xl">{img.emoji}</span>
                    <span className="text-xs text-stone-500 text-center px-2">{img.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Job history */}
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
              <h2 className="font-bold text-stone-900 text-lg mb-4">Recent Jobs</h2>
              <div className="space-y-3">
                {worker.completedJobs.map((job, i) => (
                  <div key={i} className="flex items-center gap-4 bg-stone-50 rounded-xl p-4">
                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-stone-800 text-sm">{job.title}</p>
                      <p className="text-xs text-stone-500">Client: {job.client} · {job.date} · {job.duration}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews */}
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-bold text-stone-900 text-lg">Reviews</h2>
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />)}
                  </div>
                  <span className="font-bold text-stone-900">{worker.rating}</span>
                  <span className="text-stone-500 text-sm">({worker.reviews})</span>
                </div>
              </div>
              <div className="space-y-5">
                {worker.reviewsList.map((r, i) => (
                  <div key={i} className={`${i < worker.reviewsList.length - 1 ? "pb-5 border-b border-stone-50" : ""}`}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl ${r.avatarBg} text-xs font-bold flex items-center justify-center`}>{r.avatar}</div>
                        <div>
                          <p className="font-semibold text-stone-900 text-sm">{r.author}</p>
                          <p className="text-xs text-stone-400">{r.date}</p>
                        </div>
                      </div>
                      <div className="flex">
                        {[...Array(r.rating)].map((_, j) => <Star key={j} className="w-4 h-4 text-yellow-400 fill-yellow-400" />)}
                      </div>
                    </div>
                    <p className="text-stone-600 text-sm leading-relaxed">{r.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="space-y-5">
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6 sticky top-24">
              <div className="text-center mb-5 pb-5 border-b border-stone-50">
                <p className="text-sm text-stone-500 mb-1">Daily rate</p>
                <p className="text-3xl font-extrabold text-stone-900">₹{worker.dailyRate.toLocaleString("en-IN")}</p>
                <p className="text-xs text-stone-400 mt-1">Weekly: ₹{worker.weeklyRate.toLocaleString("en-IN")} · Excl. travel</p>
              </div>

              <div className="space-y-3 mb-5">
                {[
                  { icon: Clock, text: "Typically responds in 1 hour" },
                  { icon: Award, text: `${worker.experience} of proven experience` },
                  { icon: CheckCircle2, text: `${worker.jobsDone} jobs completed` },
                  { icon: Shield, text: "Aadhaar & background verified" },
                ].map((item) => (
                  <div key={item.text} className="flex items-center gap-2.5 text-sm text-stone-600">
                    <item.icon className="w-4 h-4 text-green-500 shrink-0" />
                    {item.text}
                  </div>
                ))}
              </div>

              <Link href={`/book/${worker.id}?type=labour`} className="w-full btn-primary justify-center flex mb-3">
                Book Now
              </Link>
              <button className="w-full flex items-center justify-center gap-2 border-2 border-stone-200 hover:border-blue-300 text-stone-700 hover:text-blue-600 font-semibold py-3 rounded-xl transition-all">
                <Phone className="w-4 h-4" /> Call Now
              </button>
              <button className="w-full flex items-center justify-center gap-2 mt-2 text-stone-500 hover:text-stone-700 font-medium py-2 transition-colors text-sm">
                <MessageSquare className="w-4 h-4" /> Send a Message
              </button>
            </div>

            {/* Similar workers */}
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
              <p className="font-bold text-stone-900 mb-3 text-sm">Similar Workers</p>
              <div className="space-y-3">
                {[
                  { name: "Ramesh B.", trade: "Mason", rating: 4.6, rate: "₹1,100/day" },
                  { name: "Abdul K.", trade: "Plasterer", rating: 4.5, rate: "₹1,050/day" },
                ].map((s) => (
                  <Link key={s.name} href="/labour" className="flex items-center gap-3 hover:bg-stone-50 p-2 rounded-xl transition-colors">
                    <div className="w-9 h-9 rounded-xl bg-stone-100 text-stone-600 text-xs font-bold flex items-center justify-center">
                      {s.name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-stone-800">{s.name} · {s.trade}</p>
                      <p className="text-xs text-stone-500">⭐ {s.rating} · {s.rate}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
