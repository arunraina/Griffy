import Link from "next/link";
import { Search, Star, MapPin, Phone, Calendar, ChevronRight, Filter, Clock, CheckCircle2 } from "lucide-react";

const trades = [
  { label: "All Trades", value: "all" },
  { label: "Mason / Mistri", value: "mason" },
  { label: "Electrician", value: "electrician" },
  { label: "Plumber", value: "plumber" },
  { label: "Carpenter", value: "carpenter" },
  { label: "Painter", value: "painter" },
  { label: "Tiler", value: "tiler" },
  { label: "Welder", value: "welder" },
  { label: "Helper", value: "helper" },
];

const workers = [
  {
    id: 1,
    name: "Mohammed Rafiq",
    trade: "Mason / Mistri",
    location: "Bengaluru, KA",
    experience: "12 years",
    rating: 4.8,
    reviews: 167,
    rate: 900,
    rateUnit: "per day",
    skills: ["Brickwork", "Plastering", "Tiling", "Waterproofing"],
    avatar: "MR",
    avatarBg: "bg-orange-100 text-orange-700",
    badge: "Top Mistri",
    badgeColor: "bg-orange-100 text-orange-700",
    available: true,
    completedJobs: 340,
    languages: ["Hindi", "Kannada", "Urdu"],
  },
  {
    id: 2,
    name: "Sanjay Electricals",
    trade: "Electrician",
    location: "Mumbai, MH",
    experience: "8 years",
    rating: 4.7,
    reviews: 234,
    rate: 750,
    rateUnit: "per day",
    skills: ["House Wiring", "Switchboard", "Conduit", "Earthing"],
    avatar: "SE",
    avatarBg: "bg-yellow-100 text-yellow-700",
    badge: "Licensed",
    badgeColor: "bg-blue-100 text-blue-700",
    available: true,
    completedJobs: 510,
    languages: ["Hindi", "Marathi"],
  },
  {
    id: 3,
    name: "Ramu Plumbing",
    trade: "Plumber",
    location: "Hyderabad, TS",
    experience: "6 years",
    rating: 4.6,
    reviews: 98,
    rate: 650,
    rateUnit: "per day",
    skills: ["CPVC Fitting", "Bathroom", "Drain", "Water Tank"],
    avatar: "RP",
    avatarBg: "bg-cyan-100 text-cyan-700",
    badge: null,
    badgeColor: "",
    available: false,
    completedJobs: 220,
    languages: ["Telugu", "Hindi"],
  },
  {
    id: 4,
    name: "Arjun Carpenter",
    trade: "Carpenter",
    location: "Chennai, TN",
    experience: "15 years",
    rating: 4.9,
    reviews: 310,
    rate: 1100,
    rateUnit: "per day",
    skills: ["Furniture", "Doors & Windows", "Modular", "Polish"],
    avatar: "AC",
    avatarBg: "bg-amber-100 text-amber-700",
    badge: "Expert",
    badgeColor: "bg-amber-100 text-amber-700",
    available: true,
    completedJobs: 450,
    languages: ["Tamil", "Telugu"],
  },
  {
    id: 5,
    name: "Deepak Painter",
    trade: "Painter",
    location: "Delhi, DL",
    experience: "9 years",
    rating: 4.7,
    reviews: 189,
    rate: 700,
    rateUnit: "per day",
    skills: ["Interior", "Exterior", "Texture", "Enamel"],
    avatar: "DP",
    avatarBg: "bg-purple-100 text-purple-700",
    badge: null,
    badgeColor: "",
    available: true,
    completedJobs: 380,
    languages: ["Hindi", "Punjabi"],
  },
  {
    id: 6,
    name: "Kumar Tiling",
    trade: "Tiler",
    location: "Kochi, KL",
    experience: "7 years",
    rating: 4.8,
    reviews: 145,
    rate: 850,
    rateUnit: "per day",
    skills: ["Floor Tiles", "Wall Tiles", "Waterproofing", "Grouting"],
    avatar: "KT",
    avatarBg: "bg-stone-100 text-stone-700",
    badge: "Precision Work",
    badgeColor: "bg-green-100 text-green-700",
    available: true,
    completedJobs: 290,
    languages: ["Malayalam", "Tamil"],
  },
  {
    id: 7,
    name: "Bunty Welder",
    trade: "Welder",
    location: "Pune, MH",
    experience: "11 years",
    rating: 4.6,
    reviews: 87,
    rate: 950,
    rateUnit: "per day",
    skills: ["Arc Welding", "MS Gate", "Railing", "Structural"],
    avatar: "BW",
    avatarBg: "bg-red-100 text-red-700",
    badge: null,
    badgeColor: "",
    available: true,
    completedJobs: 175,
    languages: ["Hindi", "Marathi"],
  },
  {
    id: 8,
    name: "Ramesh Helper",
    trade: "Helper",
    location: "Bengaluru, KA",
    experience: "3 years",
    rating: 4.4,
    reviews: 56,
    rate: 400,
    rateUnit: "per day",
    skills: ["Material Carrying", "Mixing", "Cleaning", "Support Work"],
    avatar: "RH",
    avatarBg: "bg-stone-100 text-stone-600",
    badge: null,
    badgeColor: "",
    available: true,
    completedJobs: 90,
    languages: ["Kannada", "Hindi"],
  },
];

export const metadata = {
  title: "Hire Labour | Griffy",
  description: "Find skilled daily-wage workers — masons, electricians, plumbers, carpenters, painters and more for your construction project.",
};

export default function LabourPage() {
  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-900 to-green-800 text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-sm text-green-300 mb-5">
            <Link href="/" className="hover:text-white">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-white">Labour</span>
          </nav>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-3">Hire Skilled Labour</h1>
          <p className="text-green-200 text-lg max-w-2xl">
            Connect with trusted masons (mistri), electricians, plumbers, carpenters, painters, and more. Hire by the day or week.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3 max-w-2xl">
            <div className="flex-1 bg-white rounded-xl flex items-center gap-2 px-4">
              <Search className="w-5 h-5 text-stone-400 shrink-0" />
              <input
                type="text"
                placeholder="Search trade (e.g. mistri, electrician, plumber)"
                className="flex-1 py-3 text-stone-700 placeholder-stone-400 outline-none bg-transparent"
              />
            </div>
            <div className="bg-white rounded-xl flex items-center gap-2 px-4">
              <MapPin className="w-5 h-5 text-stone-400 shrink-0" />
              <input
                type="text"
                placeholder="City"
                className="w-32 py-3 text-stone-700 placeholder-stone-400 outline-none bg-transparent"
              />
            </div>
            <button className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors whitespace-nowrap">
              Search
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Trade filter */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-8">
          {trades.map((trade) => (
            <button
              key={trade.value}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                trade.value === "all"
                  ? "bg-green-600 text-white border-green-600"
                  : "bg-white text-stone-600 border-stone-200 hover:border-green-300 hover:text-green-600"
              }`}
            >
              {trade.label}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between mb-6">
          <p className="text-stone-600 text-sm">
            <span className="font-semibold text-stone-900">{workers.length}</span> workers available
          </p>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 text-sm font-medium text-stone-600 border border-stone-200 rounded-lg px-3 py-2 hover:bg-white transition-colors">
              <Filter className="w-4 h-4" /> Filters
            </button>
            <select className="text-sm font-medium text-stone-600 border border-stone-200 rounded-lg px-3 py-2 bg-white outline-none">
              <option>Sort: Relevance</option>
              <option>Rating: High to Low</option>
              <option>Rate: Low to High</option>
              <option>Experience: High to Low</option>
            </select>
          </div>
        </div>

        {/* Workers grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {workers.map((w) => (
            <div key={w.id} className="card bg-white p-5 flex flex-col">
              {/* Top */}
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-2xl ${w.avatarBg} font-bold text-sm flex items-center justify-center`}>
                  {w.avatar}
                </div>
                <div className="flex flex-col items-end gap-1">
                  {w.badge && (
                    <span className={`badge ${w.badgeColor} text-xs`}>{w.badge}</span>
                  )}
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${w.available ? "bg-green-100 text-green-700" : "bg-stone-100 text-stone-500"}`}>
                    {w.available ? "● Available" : "○ Busy"}
                  </span>
                </div>
              </div>

              <h3 className="font-bold text-stone-900">{w.name}</h3>
              <p className="text-orange-500 text-sm font-semibold">{w.trade}</p>

              <div className="flex items-center gap-3 mt-2 text-xs text-stone-500">
                <span className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                  <span className="font-semibold text-stone-700">{w.rating}</span> ({w.reviews})
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" /> {w.location.split(",")[0]}
                </span>
              </div>

              <div className="flex items-center gap-3 mt-1 text-xs text-stone-500">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> {w.experience}
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> {w.completedJobs} jobs
                </span>
              </div>

              {/* Skills */}
              <div className="flex flex-wrap gap-1.5 mt-3">
                {w.skills.slice(0, 3).map((skill) => (
                  <span key={skill} className="text-xs bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full">
                    {skill}
                  </span>
                ))}
                {w.skills.length > 3 && (
                  <span className="text-xs text-stone-400 px-2 py-0.5">+{w.skills.length - 3}</span>
                )}
              </div>

              {/* Languages */}
              <div className="flex items-center gap-1 mt-2 text-xs text-stone-400">
                <span>Speaks:</span>
                {w.languages.map((lang, i) => (
                  <span key={lang}>{lang}{i < w.languages.length - 1 ? "," : ""}</span>
                ))}
              </div>

              {/* Rate + Actions */}
              <div className="mt-auto pt-4 border-t border-stone-100 flex items-center justify-between">
                <div>
                  <p className="text-xl font-extrabold text-stone-900">₹{w.rate}</p>
                  <p className="text-xs text-stone-500">{w.rateUnit}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 rounded-lg border border-stone-200 hover:border-green-300 text-stone-500 hover:text-green-600 transition-colors">
                    <Phone className="w-4 h-4" />
                  </button>
                  <button className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-3 py-2 rounded-lg transition-colors">
                    <Clock className="w-3.5 h-3.5" /> Book
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <button className="btn-secondary px-10">
            Load More Workers
          </button>
        </div>
      </div>
    </div>
  );
}
