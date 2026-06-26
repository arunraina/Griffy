import Link from "next/link";
import { ArrowRight, Target, Eye, Heart } from "lucide-react";

export const metadata = {
  title: "About Us | Griffy",
};

const team = [
  { name: "Arun Raina", role: "Founder & CEO", avatar: "AR", bg: "bg-orange-100 text-orange-700" },
  { name: "Priya Iyer", role: "Head of Operations", avatar: "PI", bg: "bg-blue-100 text-blue-700" },
  { name: "Sanjay Gupta", role: "CTO", avatar: "SG", bg: "bg-green-100 text-green-700" },
  { name: "Meena Patel", role: "Head of Partnerships", avatar: "MP", bg: "bg-purple-100 text-purple-700" },
];

const values = [
  { icon: Target, title: "Simplicity", desc: "Construction has always been complicated. We make it simple — one platform, everything you need." },
  { icon: Eye, title: "Transparency", desc: "No hidden costs, no fake profiles. Every price, every rating, every review is real and verified." },
  { icon: Heart, title: "Empathy", desc: "We know building a home is emotional and stressful. Our platform and team are built around care." },
];

export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-stone-900 to-stone-800 text-white py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6">
            We&apos;re on a Mission to Make <span className="text-orange-400">Building Easier</span>
          </h1>
          <p className="text-stone-300 text-xl leading-relaxed max-w-2xl mx-auto">
            Griffy was founded because building a home in India shouldn&apos;t require months of running around, getting cheated on materials, or hiring unreliable contractors. We&apos;re here to change that.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="badge bg-orange-100 text-orange-700 text-sm mb-4">Our Story</span>
              <h2 className="text-3xl font-extrabold text-stone-900 mb-5">
                Born from Frustration, Built with Purpose
              </h2>
              <p className="text-stone-500 leading-relaxed mb-4">
                Our founder spent 8 months building a home in Bengaluru and was shocked at how fragmented, opaque, and unreliable the entire process was. Materials were delivered late and overpriced. Contractors vanished mid-project. Finding a good electrician took weeks.
              </p>
              <p className="text-stone-500 leading-relaxed mb-4">
                That frustration became Griffy — a platform that brings together every part of the home construction ecosystem: materials suppliers, licensed contractors, and skilled daily-wage labour — all under one roof, all verified, all with transparent pricing.
              </p>
              <p className="text-stone-500 leading-relaxed">
                Today, Griffy serves 1,20,000+ homeowners and empowers 65,000+ service providers across India.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: "2021", label: "Founded" },
                { value: "15+", label: "Cities Active" },
                { value: "1.2L+", label: "Homeowners Served" },
                { value: "₹500Cr+", label: "Work Facilitated" },
              ].map((stat) => (
                <div key={stat.label} className="bg-stone-50 rounded-2xl p-6 text-center border border-stone-100">
                  <p className="text-3xl font-extrabold text-orange-500">{stat.value}</p>
                  <p className="text-stone-500 text-sm mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 bg-stone-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="section-heading">Our Values</h2>
            <p className="section-sub mx-auto">These three principles guide every decision we make.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {values.map((v) => (
              <div key={v.title} className="card bg-white p-8 text-center">
                <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center mx-auto mb-5">
                  <v.icon className="w-7 h-7 text-orange-500" />
                </div>
                <h3 className="font-bold text-stone-900 text-lg mb-3">{v.title}</h3>
                <p className="text-stone-500 text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="section-heading">The Team Behind Griffy</h2>
            <p className="section-sub mx-auto">A small, passionate team on a big mission.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {team.map((member) => (
              <div key={member.name} className="text-center">
                <div className={`w-16 h-16 rounded-2xl ${member.bg} font-bold text-xl flex items-center justify-center mx-auto mb-3`}>
                  {member.avatar}
                </div>
                <p className="font-bold text-stone-900 text-sm">{member.name}</p>
                <p className="text-stone-500 text-xs mt-0.5">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-orange-500 text-white text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-extrabold mb-4">Ready to Build with Griffy?</h2>
          <p className="text-orange-100 mb-8">Join lakhs of homeowners who trust Griffy for their construction journey.</p>
          <Link href="/register" className="inline-flex items-center gap-2 bg-white text-orange-500 hover:bg-orange-50 font-bold px-8 py-4 rounded-xl transition-all shadow-lg">
            Get Started Free <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
