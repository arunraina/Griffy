import { FEATURE_FLAGS } from '@/lib/featureFlags';

export default function AdminFlagsPage() {
  const categories = Object.entries(FEATURE_FLAGS);

  return (
    <div className="min-h-screen bg-[#FDF8F5] px-6 py-10">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <p className="text-xs font-bold text-[#C0593A] uppercase tracking-widest mb-1">Admin</p>
          <h1 className="text-3xl font-bold text-[#2C1810]" style={{ fontFamily: 'Georgia, serif' }}>
            Feature Flags
          </h1>
          <p className="text-sm text-[#6B5248] mt-2">
            Read-only view. To change flags, edit{' '}
            <code className="bg-[#F0E8E2] text-[#9E3F24] px-1.5 py-0.5 rounded text-xs font-mono">
              apps/web/src/lib/featureFlags.ts
            </code>{' '}
            and restart the server.
          </p>
        </div>

        {/* Flag table */}
        <div className="space-y-4">
          {categories.map(([catKey, cat]) => (
            <div key={catKey}
              className="bg-white rounded-2xl overflow-hidden shadow-sm"
              style={{ borderLeft: `4px solid ${cat.enabled ? '#C0593A' : '#D1D5DB'}` }}>

              {/* Category row */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#F0E8E2]">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{cat.icon}</span>
                  <div>
                    <p className="font-bold text-[#2C1810] text-sm">{cat.name}</p>
                    <p className="text-xs text-[#A08070]">{cat.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <code className="text-[10px] bg-[#F0E8E2] text-[#6B5248] px-2 py-0.5 rounded font-mono">{catKey}</code>
                  {cat.enabled ? (
                    <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                      ON
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-400 text-xs font-semibold px-2.5 py-1 rounded-full">
                      <span className="w-1.5 h-1.5 bg-gray-300 rounded-full" />
                      OFF
                    </span>
                  )}
                </div>
              </div>

              {/* Subcategory rows */}
              {Object.entries(cat.subcategories).map(([subKey, sub]) => (
                <div key={subKey}
                  className="flex items-center justify-between px-5 py-3 border-b border-[#F8F4F1] last:border-b-0 pl-14">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{sub.icon}</span>
                    <p className="text-sm text-[#3D2B22]">{sub.name}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <code className="text-[10px] bg-[#F0E8E2] text-[#6B5248] px-2 py-0.5 rounded font-mono">{subKey}</code>
                    {sub.enabled ? (
                      <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                        ON
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-400 text-xs font-semibold px-2.5 py-1 rounded-full">
                        <span className="w-1.5 h-1.5 bg-gray-300 rounded-full" />
                        OFF
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-6 flex items-center gap-6 text-xs text-[#A08070]">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#C0593A] inline-block" />
            Colored left border = category ON
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-gray-300 inline-block" />
            Gray left border = category OFF (subcategory flags ignored)
          </span>
        </div>
      </div>
    </div>
  );
}
