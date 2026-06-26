export default function HouseIllustration({ className = "w-full h-full" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 400 320" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Sky background */}
      <rect width="400" height="320" fill="#FFF7ED" />
      {/* Sun */}
      <circle cx="340" cy="60" r="36" fill="#FED7AA" />
      <circle cx="340" cy="60" r="26" fill="#FDBA74" />
      {/* Clouds */}
      <ellipse cx="80" cy="80" rx="40" ry="20" fill="white" opacity="0.9" />
      <ellipse cx="110" cy="72" rx="28" ry="18" fill="white" opacity="0.9" />
      <ellipse cx="55" cy="76" rx="24" ry="16" fill="white" opacity="0.9" />
      <ellipse cx="250" cy="100" rx="32" ry="16" fill="white" opacity="0.8" />
      <ellipse cx="278" cy="93" rx="22" ry="14" fill="white" opacity="0.8" />
      {/* Ground */}
      <rect x="0" y="240" width="400" height="80" fill="#D6D3D1" />
      <rect x="0" y="236" width="400" height="10" fill="#A8A29E" />
      {/* Grass */}
      <ellipse cx="200" cy="240" rx="200" ry="12" fill="#86EFAC" opacity="0.6" />
      {/* House body */}
      <rect x="100" y="150" width="200" height="110" fill="#FAFAF9" stroke="#E7E5E4" strokeWidth="2" />
      {/* Roof */}
      <polygon points="80,155 200,60 320,155" fill="#F97316" />
      <polygon points="80,155 200,60 320,155" fill="none" stroke="#EA580C" strokeWidth="3" />
      {/* Roof detail */}
      <polygon points="80,155 95,155 200,73 305,155 320,155 200,60" fill="#EA580C" opacity="0.3" />
      {/* Chimney */}
      <rect x="240" y="80" width="28" height="55" fill="#D6D3D1" stroke="#A8A29E" strokeWidth="1.5" />
      <rect x="236" y="77" width="36" height="8" fill="#A8A29E" />
      {/* Smoke */}
      <path d="M252 72 Q248 58 255 48 Q262 38 258 25" stroke="#D6D3D1" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.7" />
      <path d="M262 68 Q268 55 264 44 Q260 33 266 22" stroke="#D6D3D1" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.5" />
      {/* Door */}
      <rect x="170" y="195" width="60" height="65" rx="30" ry="5" fill="#FB923C" stroke="#EA580C" strokeWidth="2" />
      <rect x="170" y="225" width="60" height="35" fill="#FB923C" />
      <circle cx="224" cy="228" r="4" fill="#FED7AA" />
      {/* Windows */}
      <rect x="115" y="175" width="50" height="45" rx="4" fill="#BAE6FD" stroke="#7DD3FC" strokeWidth="2" />
      <line x1="140" y1="175" x2="140" y2="220" stroke="#7DD3FC" strokeWidth="1.5" />
      <line x1="115" y1="198" x2="165" y2="198" stroke="#7DD3FC" strokeWidth="1.5" />
      <rect x="235" y="175" width="50" height="45" rx="4" fill="#BAE6FD" stroke="#7DD3FC" strokeWidth="2" />
      <line x1="260" y1="175" x2="260" y2="220" stroke="#7DD3FC" strokeWidth="1.5" />
      <line x1="235" y1="198" x2="285" y2="198" stroke="#7DD3FC" strokeWidth="1.5" />
      {/* Flower left */}
      <rect x="95" y="230" width="4" height="15" fill="#4ADE80" />
      <circle cx="97" cy="228" r="8" fill="#F472B6" opacity="0.8" />
      <circle cx="97" cy="221" r="5" fill="#FBCFE8" />
      {/* Flower right */}
      <rect x="305" y="230" width="4" height="15" fill="#4ADE80" />
      <circle cx="307" cy="228" r="8" fill="#F472B6" opacity="0.8" />
      <circle cx="307" cy="221" r="5" fill="#FBCFE8" />
      {/* Path */}
      <rect x="185" y="260" width="30" height="50" fill="#E7E5E4" />
    </svg>
  );
}
