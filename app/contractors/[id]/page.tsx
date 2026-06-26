import Link from "next/link";
import { Star, MapPin, CheckCircle2, Phone, Calendar, Shield, ArrowLeft, Clock, Award, ChevronRight, MessageSquare } from "lucide-react";

const contractor = {
  id: "1",
  name: "Rajan Constructions",
  owner: "Rajan P",
  specialty: "Civil Contractor",
  location: "HSR Layout, Bengaluru, KA",
  experience: "14 years",
  rating: 4.9,
  reviews: 287,
  projects: 143,
  priceRange: "₹800–1200/sq ft",
  bio: "We are a full-service civil construction company based in Bengaluru, specialising in residential home construction from foundation to finishing. Founded in 2010, we have delivered 143+ projects across Bengaluru, Mysuru, and Mangaluru. Our team of 40+ skilled workers is available for new builds, renovations, and extensions.",
  skills: ["RCC Construction", "Foundation Work", "Brickwork & Plastering", "Waterproofing", "Flooring", "Roofing", "Aluminium & Glass Work"],
  languages: ["Kannada", "Hindi", "English"],
  verified: true,
  available: true,
  licenseNo: "KA-CONT-2034-BLR",
  avatar: "RC",
  completedProjects: [
    { name: "3BHK Duplex, HSR Layout", year: "2024", sqft: "2,400 sq ft", emoji: "🏠" },
    { name: "4BHK Villa, Whitefield", year: "2023", sqft: "3,800 sq ft", emoji: "🏡" },
    { name: "Commercial Complex, Indiranagar", year: "2023", sqft: "6,200 sq ft", emoji: "🏗️" },
    { name: "Row House, Electronic City", year: "2022", sqft: "1,800 sq ft", emoji: "🏘️" },
  ],
  reviewsList: [
    { author: "Suresh K", rating: 5, date: "May 2025", text: "Rajan and his team were excellent. Completed our 3BHK on time and within budget. Quality of work is outstanding. Highly recommend!", avatar: "SK", avatarBg: "bg-blue-100 text-blue-600" },
    { author: "Anita M", rating: 5, date: "Mar 2025", text: "Very professional team. Communication was excellent throughout the project. The finishing work is top class.", avatar: "AM", avatarBg: "bg-pink-100 text-pink-600" },
    { author: "Vijay R", rating: 4, date: "Jan 2025", text: "Good work overall. Slight delay due to material delivery but Rajan kept us informed at all times.", avatar: "VR", avatarBg: "bg-green-100 text-green-600" },
  ],
};

export async function generateMetadata({ params }: { params: { id: string } }) {
  return { title: `${contractor.name} | Griffy`, description: contractor.bio };
}

export default function ContractorDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="min-h-screen bg-stone-50">
      {/* Back */}
      <div className="bg-white border-b border-stone-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-2 text-sm text-stone-500">
            <Link href="/" className="hover:text-orange-500">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <Link href="/contractors" className="hover:text-orange-500">Contractors</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-stone-900 font-medium">{contractor.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header card */}
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
              <div className="flex items-start gap-5">
                <div className="w-20 h-20 rounded-2xl bg-orange-100 text-orange-600 font-extrabold text-2xl flex items-center justify-center shrink-0">
                  {contractor.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-2xl font-extrabold text-stone-900">{contractor.name}</h1>
                    {contractor.verified && <Shield className="w-5 h-5 text-blue-500" />}
                  </div>
                  <p className="text-stone-500 mt-0.5">{contractor.owner} · {contractor.specialty}</p>

                  <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-3 text-sm text-stone-600">
                    <span className="flex items-center gap-1.5">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      <span className="font-bold text-stone-900">{contractor.rating}</span>
                      <span className="text-stone-500">({contractor.reviews} reviews)</span>
                    </span>
                    <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-stone-400" />{contractor.location}</span>
                    <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-stone-400" />{contractor.experience} exp</span>
                    <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-500" />{contractor.projects} projects done</span>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-4">
                    <span className="badge bg-orange-100 text-orange-700 text-xs">Top Pro</span>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${contractor.available ? "bg-green-100 text-green-700" : "bg-stone-100 text-stone-500"}`}>
                      {contractor.available ? "● Available for projects" : "● Currently busy"}
                    </span>
                    <span className="badge bg-blue-100 text-blue-700 text-xs flex items-center gap-1">
                      <Shield className="w-3 h-3" /> License #{contractor.licenseNo}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* About */}
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
              <h2 className="font-bold text-stone-900 text-lg mb-3">About</h2>
              <p className="text-stone-600 leading-relaxed">{contractor.bio}</p>

              <h3 className="font-bold text-stone-900 mt-5 mb-3">Skills & Specialties</h3>
              <div className="flex flex-wrap gap-2">
                {contractor.skills.map((skill) => (
                  <span key={skill} className="px-3 py-1.5 bg-stone-100 text-stone-700 text-sm font-medium rounded-full">{skill}</span>
                ))}
              </div>

              <div className="mt-5 flex items-center gap-2 text-sm text-stone-500">
                <span className="font-semibold text-stone-700">Languages:</span>
                {contractor.languages.join(", ")}
              </div>
            </div>

            {/* Completed Projects */}
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
              <h2 className="font-bold text-stone-900 text-lg mb-4">Completed Projects</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {contractor.completedProjects.map((p) => (
                  <div key={p.name} className="flex items-center gap-3 bg-stone-50 rounded-xl p-4">
                    <span className="text-2xl">{p.emoji}</span>
                    <div>
                      <p className="font-semibold text-stone-800 text-sm">{p.name}</p>
                      <p className="text-xs text-stone-500">{p.sqft} · {p.year}</p>
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
                  <span className="font-bold text-stone-900">{contractor.rating}</span>
                  <span className="text-stone-500 text-sm">({contractor.reviews})</span>
                </div>
              </div>
              <div className="space-y-5">
                {contractor.reviewsList.map((r, i) => (
                  <div key={i} className={`${i < contractor.reviewsList.length - 1 ? "pb-5 border-b border-stone-50" : ""}`}>
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

          {/* Sidebar — Book / Contact */}
          <aside className="space-y-5">
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6 sticky top-24">
              <div className="text-center mb-5 pb-5 border-b border-stone-50">
                <p className="text-sm text-stone-500 mb-1">Starting from</p>
                <p className="text-3xl font-extrabold text-stone-900">{contractor.priceRange}</p>
                <p className="text-xs text-stone-400 mt-1">Price varies by project size & material</p>
              </div>

              <div className="space-y-3 mb-5">
                {[
                  { icon: Clock, text: "Typically responds in 2 hours" },
                  { icon: Award, text: "14+ years of proven experience" },
                  { icon: CheckCircle2, text: "143 projects completed" },
                  { icon: Shield, text: "Licensed & background verified" },
                ].map((item) => (
                  <div key={item.text} className="flex items-center gap-2.5 text-sm text-stone-600">
                    <item.icon className="w-4 h-4 text-green-500 shrink-0" />
                    {item.text}
                  </div>
                ))}
              </div>

              <button className="w-full btn-primary justify-center mb-3">
                Request a Quote
              </button>
              <button className="w-full flex items-center justify-center gap-2 border-2 border-stone-200 hover:border-blue-300 text-stone-700 hover:text-blue-600 font-semibold py-3 rounded-xl transition-all">
                <Phone className="w-4 h-4" /> Call Now
              </button>
              <button className="w-full flex items-center justify-center gap-2 mt-2 text-stone-500 hover:text-stone-700 font-medium py-2 transition-colors text-sm">
                <MessageSquare className="w-4 h-4" /> Send a Message
              </button>
            </div>

            {/* Similar contractors */}
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
              <p className="font-bold text-stone-900 mb-3 text-sm">Similar Contractors</p>
              <div className="space-y-3">
                {[
                  { name: "BuildRight Constructions", rating: 4.7, location: "Bengaluru" },
                  { name: "Prasad Civil Works", rating: 4.6, location: "Bengaluru" },
                ].map((s) => (
                  <Link key={s.name} href="/contractors" className="flex items-center gap-3 hover:bg-stone-50 p-2 rounded-xl transition-colors">
                    <div className="w-9 h-9 rounded-xl bg-stone-100 text-stone-600 text-xs font-bold flex items-center justify-center">
                      {s.name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-stone-800">{s.name}</p>
                      <p className="text-xs text-stone-500">{s.location} · ⭐ {s.rating}</p>
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
