'use client';

import { useState } from 'react';
import Link from 'next/link';

const TICKER = [
  { label: 'UltraTech Cement', price: '₹380/bag',    change: '+₹5',   up: true  },
  { label: 'Tata TMT 12mm',    price: '₹67/kg',      change: '-₹2',   up: false },
  { label: 'Kajaria 600×600',  price: '₹48/sqft',    change: '—',     up: null  },
  { label: 'Asian Paints 20L', price: '₹3,400/can',  change: '-₹100', up: false },
  { label: 'River Sand',       price: '₹45/cft',     change: '+₹3',   up: true  },
  { label: 'Century Ply 18mm', price: '₹1,850/sheet',change: '+₹50',  up: true  },
  { label: 'Jaquar Basin Mixer',price: '₹2,800/pc',  change: '—',     up: null  },
  { label: 'Havells Wire 2.5', price: '₹1,950/roll', change: '-₹50',  up: false },
  { label: 'JSW TMT Fe500',    price: '₹65/kg',      change: '+₹1',   up: true  },
  { label: 'Fly Ash Brick',    price: '₹8/pc',       change: '—',     up: null  },
];

const CITY_RATES: Record<string, number> = {
  'Delhi NCR': 1.00, 'Mumbai': 1.08, 'Bangalore': 1.05, 'Hyderabad': 0.97,
  'Chennai': 1.03, 'Pune': 1.04, 'Gurgaon': 1.02, 'Noida': 1.01,
  'Srinagar / Kashmir': 1.22, 'Jammu': 1.14, 'Leh / Ladakh': 1.35,
  'Jaipur': 0.95, 'Ahmedabad': 0.97, 'Kolkata': 1.04, 'Lucknow': 0.98,
  'Chandigarh': 1.00, 'Shimla': 1.12, 'Manali': 1.18, 'Other': 1.00,
};

const TYPE_RATES: Record<string, [number, number]> = {
  'Basic (₹1,200–1,500/sqft)':    [1200, 1500],
  'Standard (₹1,500–1,800/sqft)': [1500, 1800],
  'Premium (₹1,800–2,500/sqft)':  [1800, 2500],
  'Luxury (₹2,500+/sqft)':        [2500, 3500],
};

export function HomePriceTicker() {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 mb-3">
        <p className="text-sm font-semibold text-[#2C1810]">Today's Material Prices</p>
        <span className="text-xs text-green-600 bg-green-50 border border-green-100 px-2.5 py-0.5 rounded-full font-medium">● Live rates</span>
      </div>
      <div className="flex gap-6 overflow-x-auto pb-1 scrollbar-hide">
        {TICKER.map(item => (
          <div key={item.label} className="flex-shrink-0 border-r border-gray-100 pr-6 last:border-0">
            <p className="text-xs text-gray-400 whitespace-nowrap">{item.label}</p>
            <p className="text-sm font-bold text-gray-900">{item.price}</p>
            {item.change !== '—' && (
              <p className={`text-[11px] font-medium ${item.up ? 'text-red-500' : 'text-green-500'}`}>{item.change}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function CostCalculator() {
  const [area,     setArea]     = useState('');
  const [type,     setType]     = useState('Standard (₹1,500–1,800/sqft)');
  const [city,     setCity]     = useState('Delhi NCR');
  const [result,   setResult]   = useState<{ low: number; high: number } | null>(null);

  function calculate() {
    const sqft = parseFloat(area);
    if (!sqft || sqft <= 0) return;
    const [low, high] = TYPE_RATES[type] ?? [1500, 1800];
    const factor = CITY_RATES[city] ?? 1.0;
    setResult({ low: Math.round(sqft * low * factor), high: Math.round(sqft * high * factor) });
  }

  return (
    <div className="bg-[#FDF8F5] rounded-2xl p-8 border border-[#EBE0D8]">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-[#2C1810] mb-2">Built-up Area (sqft)</label>
          <input type="number" value={area} onChange={e => setArea(e.target.value)} placeholder="e.g. 1500"
            className="w-full border border-[#EBE0D8] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#C0593A] bg-white" />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#2C1810] mb-2">Construction Type</label>
          <select value={type} onChange={e => setType(e.target.value)}
            className="w-full border border-[#EBE0D8] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#C0593A] bg-white">
            {Object.keys(TYPE_RATES).map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-[#2C1810] mb-2">Your City</label>
          <select value={city} onChange={e => setCity(e.target.value)}
            className="w-full border border-[#EBE0D8] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#C0593A] bg-white">
            {Object.keys(CITY_RATES).map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>
      <button onClick={calculate}
        className="w-full py-3.5 rounded-xl text-white font-semibold text-sm bg-[#C0593A] hover:bg-[#9E3F24] transition-colors">
        Calculate Cost Estimate
      </button>
      {result && (
        <div className="mt-5 bg-white border border-[#EBE0D8] rounded-xl p-5 text-center">
          <p className="text-xs text-[#A08070] mb-1 font-medium uppercase tracking-wide">Estimated Cost</p>
          <p className="text-3xl font-bold text-[#C0593A]" style={{ fontFamily: 'Georgia, serif' }}>
            ₹{result.low.toLocaleString('en-IN')} – ₹{result.high.toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-gray-400 mt-2">
            For {area} sqft in {city} · {type.split('(')[0].trim()}
          </p>
          <Link href="/estimate" className="inline-block text-xs font-semibold text-[#C0593A] hover:underline mt-3">
            See full cost breakdown by category →
          </Link>
        </div>
      )}
      <p className="text-xs text-center text-gray-400 mt-3">
        * Estimates based on current market rates. Get exact quotes from verified contractors on Griffy.
      </p>
    </div>
  );
}
