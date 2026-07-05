import Link from 'next/link';

const COLUMNS = [
  {
    heading: 'Discover',
    links: [
      { label: 'Contractors', href: '/contractors' },
      { label: 'Materials',   href: '/materials' },
      { label: 'Services',    href: '/service-experts' },
      { label: 'Labour',      href: '/contractors?type=labour' },
      { label: 'Leaderboard', href: '/leaderboard' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'About',    href: '/about' },
      { label: 'Team',     href: '/team' },
      { label: 'Careers',  href: '/careers' },
      { label: 'Blog',     href: '/blog' },
      { label: 'Press',    href: '/press' },
    ],
  },
  {
    heading: 'Support',
    links: [
      { label: 'Help Center',     href: '/help' },
      { label: 'Contact Us',      href: '/contact' },
      { label: 'Privacy Policy',  href: '/privacy' },
      { label: 'Terms',           href: '/terms' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-[#1a1a1a] text-gray-400">
      <div className="max-w-[1200px] mx-auto px-6 pt-14 pb-8">

        {/* Top row: logo + columns + social */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">

          {/* Brand */}
          <div className="lg:col-span-2">
            <span className="text-[#C0593A] font-bold text-2xl tracking-tight">Griffy</span>
            <p className="text-gray-500 text-sm mt-3 leading-relaxed max-w-xs">
              India's construction marketplace — find contractors, source materials, and hire skilled labour all in one place.
            </p>
          </div>

          {/* Link columns */}
          {COLUMNS.map(col => (
            <div key={col.heading}>
              <h4 className="text-white text-sm font-semibold mb-4">{col.heading}</h4>
              <ul className="space-y-3">
                {col.links.map(l => (
                  <li key={l.label}>
                    <Link href={l.href}
                      className="text-gray-400 text-sm hover:text-white transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Social */}
          <div>
            <h4 className="text-white text-sm font-semibold mb-4">Connect</h4>
            <div className="flex flex-col gap-3">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2.5 text-sm text-gray-400 hover:text-white transition-colors">
                <InstagramIcon /> Instagram
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2.5 text-sm text-gray-400 hover:text-white transition-colors">
                <LinkedInIcon /> LinkedIn
              </a>
              <a href="https://x.com" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2.5 text-sm text-gray-400 hover:text-white transition-colors">
                <XIcon /> Twitter / X
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-gray-600 text-xs">© 2026 Griffy. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <Link href="/privacy" className="text-gray-600 text-xs hover:text-gray-400 transition-colors">Privacy</Link>
            <Link href="/terms"   className="text-gray-600 text-xs hover:text-gray-400 transition-colors">Terms</Link>
            <Link href="/contact" className="text-gray-600 text-xs hover:text-gray-400 transition-colors">Contact</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}

function InstagramIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <circle cx="12" cy="12" r="4"/>
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none"/>
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/>
      <circle cx="4" cy="4" r="2"/>
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  );
}
