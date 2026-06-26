import Link from "next/link";
import { Search, Star, MapPin, CheckCircle2, Phone, Calendar, ChevronRight, Filter, Shield } from "lucide-react";

const contractorTypes = [
  { label: "All", value: "all" },
  { label: "Civil Contractor", value: "civil" },
  { label: "Structural Engineer", value: "structural" },
  { label: "Electrical Contractor", value: "electrical" },
  { label: "Plumbing Contractor", value: "plumbing" },
  { label: "Interior Designer", value: "interior" },
  { label: "Architect", value: "architect" },
  { label: "Painting Contractor", value: "painting" },
];

const contractors = [
  {
    id: 1,
    name: "Rajan Constructions",
    owner: "Rajan P",
    specialty: "Civil Contractor",
    location: "Bengaluru, KA",
    experience: "14 years",
    rating: 4.9,
    reviews: 287,
    projects: 143,
    priceRange: "₹800–1200/sq ft",
    badge: "Top Pro",
    badgeColor: "bg-orange-100 text-orange-700",
    avatar: "RC",
    avatarBg: "bg-orange-100 text-orange-600",
    skills: ["RCC Construction", "Foundation", "Brickwork", "Plastering"],
    verified: true,
    available: true,
  },
  {
    id: 2,
    name: "Mehta & Associates",
    owner: "Vikram Mehta",
    specialty: "Structural Engineer",
    location: "Mumbai, MH",
    experience: "20 years",
    rating: 4.8,
    reviews: 412,
    projects: 230,
    priceRange: "₹1200–2000/sq ft",
    badge: "Licensed",
    badgeColor: "bg-blue-100 text-blue-700",
    avatar: "MA",
    avatarBg: "bg-blue-100 text-blue-600",
    skills: ["Structural Design", "Load Calculation", "BIS Standards", "CAD"],
    verified: true,
    available: true,
  },
  {
    id: 3,
    name: "Powerline Electricals",
    owner: "Suresh K",
    specialty: "Electrical Contractor",
    location: "Hyderabad, TS",
    experience: "10 years",
    rating: 4.7,
    reviews: 198,
    projects: 310,
    priceRange: "₹80–150/sq ft",
    badge: null,
    badgeColor: "",
    avatar: "PE",
    avatarBg: "bg-yellow-100 text-yellow-600",
    skills: ["House Wiring", "3-Phase", "Solar Integration", "Panel Setup"],
    verified: true,
    available: false,
  },
  {
    id: 4,
    name: "AquaFix Plumbing",
    owner: "Ajay Sharma",
    specialty: "Plumbing Contractor",
    location: "Delhi, DL",
    experience: "8 years",
    rating: 4.6,
    reviews: 153,
    projects: 280,
    priceRange: "₹60–100/sq ft",
    badge: "Fast Response",
    badgeColor: "bg-green-100 text-green-700",
    avatar: "AF",
    avatarBg: "bg-cyan-100 text-cyan-600",
    skills: ["CPVC Piping", "STP", "Water Proofing", "Bore Well"],
    verified: true,
    available: true,
  },
  {
    id: 5,
    name: "Studio Interio",
    owner: "Priya Nambiar",
    specialty: "Interior Designer",
    location: "Kochi, KL",
    experience: "12 years",
    rating: 4.9,
    reviews: 345,
    projects: 180,
    priceRange: "₹1500–4000/sq ft",
    badge: "Top Rated",
    badgeColor: "bg-yellow-100 text-yellow-700",
    avatar: "SI",
    avatarBg: "bg-pink-100 text-pink-600",
    skills: ["Modular Kitchen", "False Ceiling", "Wardrobe", "3D Design"],
    verified: true,
    available: true,
  },
  {
    id: 6,
    name: "ColorPro Painters",
    owner: "Mohan Das",
    specialty: "Painting Contractor",
    location: "Chennai, TN",
    experience: "6 years",
    rating: 4.5,
    reviews: 121,
    projects: 420,
    priceRange: "₹18–35/sq ft",
    badge: null,
    badgeColor: "",
    avatar: "CP",
    avatarBg: "bg-purple-100 text-purple-600",
    skills: ["Asian Paints", "Texture", "Wall Putty", "Exterior"],
    verified: true,
    available: true,
  },
];

export const metadata = {
  title: "Hire Contractors | Griffy",
  description: "Find licensed civil, electrical, plumbing, and structural contractors for your home building project.",
};

export default function ContractorsPage() {
  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-sm text-blue-300 mb-5">
            <Link href="/" className="hover:text-white">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-white">Contractors</span>
          </nav>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-3">Find Contractors</h1>
          <p className="text-blue-200 text-lg max-w-2xl">
            Hire verified, experienced contractors for your construction project. Compare profiles, reviews, and get quotes in minutes.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3 max-w-2xl">
            <div className="flex-1 bg-white rounded-xl flex items-center gap-2 px-4">
              <Search className="w-5 h-5 text-stone-400 shrink-0" />
              <input
                type="text"
                placeholder="Search by name, specialty, or location"
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
        {/* Specialty filter */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-8">
          {contractorTypes.map((type) => (
            <button
              key={type.value}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                type.value === "all"
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-stone-600 border-stone-200 hover:border-blue-300 hover:text-blue-600"
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between mb-6">
          <p className="text-stone-600 text-sm">
            <span className="font-semibold text-stone-900">{contractors.length}</span> contractors found
          </p>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 text-sm font-medium text-stone-600 border border-stone-200 rounded-lg px-3 py-2 hover:bg-white transition-colors">
              <Filter className="w-4 h-4" /> Filters
            </button>
            <select className="text-sm font-medium text-stone-600 border border-stone-200 rounded-lg px-3 py-2 bg-white outline-none">
              <option>Sort: Relevance</option>
              <option>Rating: High to Low</option>
              <option>Experience: High to Low</option>
              <option>Price: Low to High</option>
            </select>
          </div>
        </div>

        {/* Contractor cards */}
        <div className="grid lg:grid-cols-2 gap-6">
          {contractors.map((c) => (
            <div key={c.id} className="card bg-white p-6">
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className={`w-14 h-14 rounded-2xl ${c.avatarBg} font-bold text-lg flex items-center justify-center shrink-0`}>
                  {c.avatar}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-stone-900 text-lg">{c.name}</h3>
                        {c.verified && (
                          <Shield className="w-4 h-4 text-blue-500 shrink-0" aria-label="Verified" />
                        )}
                      </div>
                      <p className="text-stone-500 text-sm">{c.owner} · {c.specialty}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {c.badge && (
                        <span className={`badge ${c.badgeColor} text-xs`}>{c.badge}</span>
                      )}
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${c.available ? "bg-green-100 text-green-700" : "bg-stone-100 text-stone-500"}`}>
                        {c.available ? "● Available" : "○ Busy"}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-sm text-stone-500">
                    <span className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      <span className="font-semibold text-stone-700">{c.rating}</span>
                      <span>({c.reviews} reviews)</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" /> {c.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" /> {c.experience} exp
                    </span>
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-green-500" /> {c.projects} projects
                    </span>
                  </div>

                  {/* Skills */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    {c.skills.map((skill) => (
                      <span key={skill} className="text-xs bg-stone-100 text-stone-600 px-2.5 py-1 rounded-full">
                        {skill}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-stone-100">
                    <div>
                      <p className="text-xs text-stone-500">Price Range</p>
                      <p className="font-bold text-stone-900">{c.priceRange}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="flex items-center gap-1.5 border border-stone-200 hover:border-blue-300 text-stone-600 hover:text-blue-600 text-sm font-medium px-4 py-2 rounded-lg transition-colors">
                        <Phone className="w-4 h-4" /> Call
                      </button>
                      <Link
                        href={`/contractors/${c.id}`}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
                      >
                        View Profile
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <button className="btn-secondary px-10">
            Load More Contractors
          </button>
        </div>
      </div>
    </div>
  );
}
