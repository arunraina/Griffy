'use client';

import { useEffect, useState } from 'react';
import { fetchAdminMetrics, type AdminMetrics } from '@/lib/admin';
import { Skeleton } from '@/components/Skeleton';

function formatINR(n: number): string {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)} L`;
  return `₹${n.toLocaleString('en-IN')}`;
}

function DailyBarChart({ data, label }: { data: { date: string; count: number }[]; label: string }) {
  const max = Math.max(1, ...data.map((d) => d.count));
  return (
    <div className="bg-white rounded-2xl border border-[#EBE0D8] p-5">
      <p className="text-sm font-bold text-[#2C1810] mb-1">{label}</p>
      <p className="text-xs text-[#A08070] mb-4">Last 30 days · {data.reduce((s, d) => s + d.count, 0)} total</p>
      <div className="flex items-end gap-[2px] h-32">
        {data.map((d) => (
          <div key={d.date} className="flex-1 group relative">
            <div
              className="bg-[#C0593A]/80 hover:bg-[#C0593A] rounded-t-sm transition-colors"
              style={{ height: `${Math.max(2, (d.count / max) * 100)}%` }}
            />
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-[#2C1810] text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-10">
              {d.date}: {d.count}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatCard({ icon, value, label }: { icon: string; value: string | number; label: string }) {
  return (
    <div className="bg-white border border-[#EBE0D8] rounded-2xl p-5">
      <span className="text-2xl mb-2 block">{icon}</span>
      <p className="text-2xl font-bold text-[#2C1810]">{value}</p>
      <p className="text-xs text-[#6B5248] mt-0.5">{label}</p>
    </div>
  );
}

export default function AdminMetricsPage() {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAdminMetrics()
      .then(setMetrics)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'));
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-[#2C1810]">Growth Metrics</h1>
        <p className="text-sm text-[#6B5248] mt-0.5">Signups, GMV, bookings, and marketplace supply — last 30 days and all-time.</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-4">{error}</div>
      )}

      {!metrics ? (
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
          </div>
          <Skeleton className="h-40 rounded-2xl" />
        </div>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard icon="💰" value={formatINR(metrics.gmv.last30d)} label="GMV (last 30 days)" />
            <StatCard icon="📈" value={formatINR(metrics.gmv.allTime)} label="GMV (all time)" />
            <StatCard icon="🛠️" value={formatINR(metrics.bookingsValueAllTime)} label="Booking value (all time)" />
            <StatCard icon="👥" value={metrics.usersByRole.reduce((s, r) => s + r.count, 0)} label="Total users" />
          </div>

          <div className="grid lg:grid-cols-3 gap-4 mb-6">
            <DailyBarChart data={metrics.newUsersByDay} label="New signups" />
            <DailyBarChart data={metrics.newOrdersByDay} label="New orders" />
            <DailyBarChart data={metrics.newBookingsByDay} label="New bookings" />
          </div>

          <div className="grid lg:grid-cols-2 gap-4 mb-6">
            <div className="bg-white rounded-2xl border border-[#EBE0D8] p-5">
              <p className="text-sm font-bold text-[#2C1810] mb-3">Active supply by category</p>
              <div className="space-y-2">
                {[
                  ['Contractors', metrics.activeListings.contractors],
                  ['Labour', metrics.activeListings.labour],
                  ['Service Experts', metrics.activeListings.serviceExperts],
                  ['Material Suppliers', metrics.activeListings.materialSuppliers],
                  ['Materials Listed', metrics.activeListings.materials],
                  ['Land Listings', metrics.activeListings.lands],
                  ['Property Listings', metrics.activeListings.properties],
                ].map(([label, count]) => (
                  <div key={label as string} className="flex items-center justify-between text-sm">
                    <span className="text-[#6B5248]">{label}</span>
                    <span className="font-semibold text-[#2C1810]">{count as number}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#EBE0D8] p-5">
              <p className="text-sm font-bold text-[#2C1810] mb-3">Users by role</p>
              <div className="space-y-2">
                {metrics.usersByRole.map((r) => (
                  <div key={r.role} className="flex items-center justify-between text-sm">
                    <span className="text-[#6B5248]">{r.role}</span>
                    <span className="font-semibold text-[#2C1810]">{r.count}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-[#F0E8E2] mt-3 pt-3 flex items-center justify-between text-sm">
                <span className="text-[#6B5248]">Projects posted / Bids submitted</span>
                <span className="font-semibold text-[#2C1810]">{metrics.totalProjects} / {metrics.totalBids}</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
