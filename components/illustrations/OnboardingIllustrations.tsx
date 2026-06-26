export function HomeownerIllustration() {
  return (
    <svg viewBox="0 0 200 180" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect width="200" height="180" fill="#FFF7ED" rx="16" />
      <rect x="50" y="70" width="100" height="80" fill="#FAFAF9" stroke="#E7E5E4" strokeWidth="2" />
      <polygon points="35,75 100,20 165,75" fill="#F97316" />
      <rect x="80" y="100" width="40" height="50" rx="20" ry="3" fill="#FB923C" />
      <rect x="55" y="85" width="35" height="30" rx="3" fill="#BAE6FD" />
      <rect x="110" y="85" width="35" height="30" rx="3" fill="#BAE6FD" />
      {/* Person */}
      <circle cx="100" cy="158" r="10" fill="#FED7AA" />
      <rect x="90" y="168" width="20" height="3" rx="1.5" fill="#4ADE80" />
    </svg>
  );
}

export function ContractorIllustration() {
  return (
    <svg viewBox="0 0 200 180" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect width="200" height="180" fill="#EFF6FF" rx="16" />
      {/* Hard hat */}
      <ellipse cx="100" cy="70" rx="45" ry="22" fill="#F97316" />
      <rect x="57" y="66" width="86" height="20" rx="4" fill="#EA580C" />
      <rect x="65" y="60" width="70" height="12" rx="6" fill="#FED7AA" />
      {/* Blueprint */}
      <rect x="40" y="95" width="120" height="75" rx="6" fill="#DBEAFE" stroke="#93C5FD" strokeWidth="2" />
      <line x1="55" y1="110" x2="145" y2="110" stroke="#3B82F6" strokeWidth="1.5" />
      <line x1="55" y1="125" x2="145" y2="125" stroke="#3B82F6" strokeWidth="1.5" />
      <line x1="55" y1="140" x2="120" y2="140" stroke="#3B82F6" strokeWidth="1.5" />
      <rect x="60" y="112" width="25" height="12" stroke="#3B82F6" strokeWidth="1.5" fill="none" />
      <rect x="95" y="112" width="35" height="12" stroke="#3B82F6" strokeWidth="1.5" fill="none" />
    </svg>
  );
}

export function LabourIllustration() {
  return (
    <svg viewBox="0 0 200 180" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect width="200" height="180" fill="#F0FDF4" rx="16" />
      {/* Wrench */}
      <rect x="80" y="30" width="16" height="80" rx="8" fill="#6B7280" transform="rotate(30 80 30)" />
      <circle cx="70" cy="38" r="18" fill="none" stroke="#6B7280" strokeWidth="10" />
      {/* Hammer */}
      <rect x="105" y="80" width="12" height="60" rx="4" fill="#92400E" transform="rotate(-20 105 80)" />
      <rect x="90" y="68" width="36" height="20" rx="4" fill="#78716C" transform="rotate(-20 90 68)" />
      {/* Trowel */}
      <polygon points="130,120 145,95 155,105 140,130" fill="#9CA3AF" />
      <rect x="138" y="128" width="8" height="30" rx="4" fill="#92400E" />
      {/* Badge */}
      <circle cx="100" cy="145" r="22" fill="#16A34A" />
      <path d="M88 145 L96 153 L114 137" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function SupplierIllustration() {
  return (
    <svg viewBox="0 0 200 180" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect width="200" height="180" fill="#FFFBEB" rx="16" />
      {/* Truck */}
      <rect x="20" y="90" width="120" height="60" rx="6" fill="#F97316" />
      <rect x="140" y="105" width="45" height="45" rx="6" fill="#EA580C" />
      <rect x="143" y="110" width="38" height="30" rx="4" fill="#BAE6FD" />
      {/* Wheels */}
      <circle cx="55" cy="155" r="16" fill="#1C1917" />
      <circle cx="55" cy="155" r="8" fill="#78716C" />
      <circle cx="145" cy="155" r="16" fill="#1C1917" />
      <circle cx="145" cy="155" r="8" fill="#78716C" />
      {/* Cargo */}
      <rect x="30" y="60" width="35" height="35" rx="4" fill="#FBBF24" />
      <rect x="75" y="55" width="35" height="40" rx="4" fill="#D97706" />
      <rect x="120" y="62" width="30" height="32" rx="4" fill="#FBBF24" />
      {/* Road */}
      <rect x="0" y="170" width="200" height="10" fill="#D6D3D1" />
    </svg>
  );
}

export function SuccessIllustration() {
  return (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <circle cx="100" cy="100" r="90" fill="#F0FDF4" />
      <circle cx="100" cy="100" r="70" fill="#DCFCE7" />
      <circle cx="100" cy="100" r="50" fill="#16A34A" />
      <path d="M75 100 L92 118 L128 82" stroke="white" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
      {/* Stars */}
      <text x="22" y="45" fontSize="20">⭐</text>
      <text x="155" y="38" fontSize="16">⭐</text>
      <text x="170" y="155" fontSize="14">⭐</text>
      <text x="12" y="162" fontSize="18">⭐</text>
    </svg>
  );
}
