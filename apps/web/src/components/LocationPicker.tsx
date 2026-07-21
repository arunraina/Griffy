'use client';

import { useState } from 'react';
import { INDIAN_STATES, citiesForState } from '@/lib/geoConstants';

const selectCls = 'w-full bg-[#FDF8F5] border border-[#EBE0D8] rounded-lg px-4 py-2.5 text-sm text-[#2C1810] outline-none focus:border-[#C0593A] transition-colors';

interface StateCitySelectProps {
  state: string;
  city: string;
  onStateChange: (state: string) => void;
  onCityChange: (city: string) => void;
  className?: string;
}

// A single state → city pair, both as dropdowns. Picking a state resets the
// city choice to whatever that state actually has, instead of leaving a
// stale free-text value that doesn't belong to the newly selected state.
export function StateCitySelect({ state, city, onStateChange, onCityChange, className }: StateCitySelectProps) {
  const cities = citiesForState(state);
  return (
    <div className={`grid grid-cols-2 gap-3 ${className ?? ''}`}>
      <div>
        <select
          value={state}
          onChange={(e) => { onStateChange(e.target.value); onCityChange(''); }}
          className={selectCls}
        >
          <option value="">State…</option>
          {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <div>
        <select
          value={city}
          onChange={(e) => onCityChange(e.target.value)}
          disabled={!state}
          className={`${selectCls} disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          <option value="">{state ? 'City…' : 'Select a state first'}</option>
          {cities.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
    </div>
  );
}

interface ServiceCitiesPickerProps {
  selected: string[];
  onChange: (cities: string[]) => void;
}

// "Which cities do you serve" — can span multiple states, so this isn't a
// single state→city pair: a state dropdown narrows which cities are offered
// as chips, and picks accumulate into `selected` across however many states
// the admin/provider switches through. Already-picked cities stay listed
// (with a remove) even while a different state's chips are showing.
export function ServiceCitiesPicker({ selected, onChange }: ServiceCitiesPickerProps) {
  const [browsingState, setBrowsingState] = useState('');
  const cities = citiesForState(browsingState);

  function toggle(city: string) {
    onChange(selected.includes(city) ? selected.filter((c) => c !== city) : [...selected, city]);
  }

  return (
    <div className="space-y-2">
      <select
        value={browsingState}
        onChange={(e) => setBrowsingState(e.target.value)}
        className={selectCls}
      >
        <option value="">Select a state to see its cities…</option>
        {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>

      {browsingState && (
        <div className="flex flex-wrap gap-2">
          {cities.map((city) => (
            <button
              key={city}
              type="button"
              onClick={() => toggle(city)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                selected.includes(city)
                  ? 'bg-[#C0593A] border-[#C0593A] text-white'
                  : 'bg-white border-[#EBE0D8] text-[#6B5248] hover:border-[#C0593A]'
              }`}
            >
              {city}
            </button>
          ))}
        </div>
      )}

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {selected.map((city) => (
            <span key={city} className="inline-flex items-center gap-1 text-[11px] font-semibold bg-[#FAEEE9] text-[#9E3F24] px-2 py-1 rounded-full">
              {city}
              <button type="button" onClick={() => toggle(city)} className="hover:text-red-600">✕</button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
