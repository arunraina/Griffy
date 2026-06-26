export default function ConstructionIllustration({ className = "w-full h-full" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="300" fill="#FFF7ED" />
      {/* Ground */}
      <rect x="0" y="240" width="400" height="60" fill="#D6D3D1" />
      <rect x="0" y="236" width="400" height="8" fill="#A8A29E" />
      {/* Building under construction */}
      <rect x="60" y="100" width="200" height="140" fill="#E7E5E4" stroke="#D6D3D1" strokeWidth="2" />
      {/* Floors */}
      <line x1="60" y1="150" x2="260" y2="150" stroke="#D6D3D1" strokeWidth="2" />
      <line x1="60" y1="200" x2="260" y2="200" stroke="#D6D3D1" strokeWidth="2" />
      {/* Window openings */}
      <rect x="80" y="110" width="30" height="30" fill="#BAE6FD" opacity="0.8" />
      <rect x="125" y="110" width="30" height="30" fill="#BAE6FD" opacity="0.8" />
      <rect x="170" y="110" width="30" height="30" fill="#BAE6FD" opacity="0.8" />
      <rect x="215" y="110" width="30" height="30" fill="#BAE6FD" opacity="0.8" />
      <rect x="80" y="160" width="30" height="30" fill="#BAE6FD" opacity="0.8" />
      <rect x="125" y="160" width="30" height="30" fill="#BAE6FD" opacity="0.8" />
      <rect x="170" y="160" width="30" height="30" fill="#BAE6FD" opacity="0.8" />
      <rect x="215" y="160" width="30" height="30" fill="#BAE6FD" opacity="0.8" />
      {/* Scaffolding */}
      <rect x="265" y="80" width="8" height="160" fill="#92400E" />
      <rect x="295" y="80" width="8" height="160" fill="#92400E" />
      <rect x="265" y="100" width="38" height="5" fill="#B45309" />
      <rect x="265" y="135" width="38" height="5" fill="#B45309" />
      <rect x="265" y="170" width="38" height="5" fill="#B45309" />
      <rect x="265" y="205" width="38" height="5" fill="#B45309" />
      {/* Crane */}
      <rect x="310" y="30" width="6" height="220" fill="#F97316" />
      <rect x="250" y="30" width="66" height="6" fill="#F97316" />
      <rect x="310" y="36" width="4" height="8" fill="#EA580C" />
      {/* Crane hook wire */}
      <line x1="260" y1="36" x2="260" y2="90" stroke="#374151" strokeWidth="2" />
      <path d="M255 90 Q260 100 265 90" stroke="#374151" strokeWidth="2" fill="none" />
      {/* Crane counterweight */}
      <rect x="316" y="25" width="20" height="16" rx="3" fill="#DC2626" />
      {/* Worker (mistri) */}
      <circle cx="155" cy="72" r="14" fill="#FED7AA" />
      {/* Hard hat */}
      <ellipse cx="155" cy="65" rx="16" ry="8" fill="#F97316" />
      <rect x="140" y="62" width="30" height="8" rx="2" fill="#EA580C" />
      {/* Body */}
      <rect x="143" y="86" width="24" height="30" rx="4" fill="#FED7AA" />
      {/* Arms */}
      <rect x="128" y="88" width="18" height="6" rx="3" fill="#FED7AA" transform="rotate(-15 128 88)" />
      <rect x="162" y="88" width="18" height="6" rx="3" fill="#FED7AA" transform="rotate(15 162 88)" />
      {/* Tool in hand */}
      <rect x="120" y="92" width="12" height="4" rx="2" fill="#78716C" />
      <rect x="123" y="85" width="4" height="10" rx="1" fill="#78716C" />
      {/* Legs */}
      <rect x="143" y="114" width="10" height="20" rx="3" fill="#1E40AF" />
      <rect x="157" y="114" width="10" height="20" rx="3" fill="#1E40AF" />
      {/* Bricks pile */}
      <rect x="20" y="210" width="40" height="12" rx="2" fill="#DC2626" />
      <rect x="24" y="200" width="36" height="12" rx="2" fill="#EF4444" />
      <rect x="22" y="190" width="38" height="12" rx="2" fill="#DC2626" />
      {/* Cement bag */}
      <rect x="330" y="205" width="45" height="30" rx="5" fill="#A8A29E" />
      <ellipse cx="352" cy="205" rx="22" ry="6" fill="#D6D3D1" />
      <text x="340" y="226" fontSize="9" fill="#78716C" fontFamily="sans-serif" fontWeight="bold">CEMENT</text>
      {/* Tool box */}
      <rect x="330" y="155" width="50" height="35" rx="4" fill="#F59E0B" stroke="#D97706" strokeWidth="1.5" />
      <rect x="340" y="148" width="30" height="10" rx="3" fill="#D97706" />
      <line x1="330" y1="165" x2="380" y2="165" stroke="#D97706" strokeWidth="1.5" />
    </svg>
  );
}
