'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { UserState } from '@griffy/shared';
import type { Me } from '@/lib/users';
import { greeting, firstName } from '@/lib/dashboard';
import { MATERIAL_CATEGORIES } from '@/lib/providerConstants';
import { createMyMaterial, type Material } from '@/lib/materials';

const SETUP_TARGET = 3;

export default function MaterialSupplierOnboarding({
  me, materials, onMaterialsChange,
}: {
  state: UserState; me: Me; materials: Material[]; onMaterialsChange: (materials: Material[]) => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState(MATERIAL_CATEGORIES[0]?.value ?? '');
  const [price, setPrice] = useState('');
  const [unit, setUnit] = useState('');
  const [stock, setStock] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const categoryLabel = MATERIAL_CATEGORIES.find((c) => c.value === category)?.label ?? category;

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !price || !unit || !stock) return;
    setBusy(true);
    setError('');
    try {
      const created = await createMyMaterial({
        name, category: categoryLabel, subcategory: categoryLabel,
        price: Number(price), unit, stock: Number(stock),
      });
      onMaterialsChange([...materials, created]);
      setName(''); setPrice(''); setUnit(''); setStock(''); setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add product');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#FDF8F5] px-6 py-10">
      <div className="max-w-[700px] mx-auto space-y-6">
        <div className="bg-white rounded-2xl border border-[#EBE0D8] p-6">
          <h1 className="text-lg font-bold text-[#2C1810] mb-1">
            Set up your Griffy store 🏪, {firstName(me.name)}
          </h1>
          <p className="text-sm text-[#6B5248]">
            {materials.length === 0
              ? 'Add your first products so homeowners and contractors can find you.'
              : `${materials.length}/${SETUP_TARGET} products added — a few more and your store is fully set up.`}
          </p>
        </div>

        {materials.length > 0 && (
          <div className="bg-white rounded-2xl border border-[#EBE0D8] p-6">
            <p className="text-sm font-bold text-[#2C1810] mb-3">Your products</p>
            <div className="space-y-2">
              {materials.map((m) => (
                <div key={m.id} className="flex items-center justify-between gap-3 text-sm">
                  <p className="text-[#2C1810]">{m.name}</p>
                  <p className="text-[#6B5248]">₹{Number(m.price).toLocaleString('en-IN')}/{m.unit} · {m.stock} in stock</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-[#EBE0D8] p-6">
          {!showForm ? (
            <button
              onClick={() => setShowForm(true)}
              className="w-full bg-[#C0593A] hover:bg-[#9E3F24] text-white text-sm font-bold py-3 rounded-xl transition-colors"
            >
              + Add a Product
            </button>
          ) : (
            <form onSubmit={handleAdd} className="space-y-3">
              <p className="text-sm font-bold text-[#2C1810]">Add a product</p>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Product name (e.g. UltraTech Cement)"
                className="w-full bg-[#FDF8F5] border border-[#EBE0D8] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#C0593A]" required />
              <select value={category} onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#FDF8F5] border border-[#EBE0D8] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#C0593A]">
                {MATERIAL_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.icon} {c.label}</option>)}
              </select>
              <div className="grid grid-cols-3 gap-2">
                <input value={price} onChange={(e) => setPrice(e.target.value)} type="number" placeholder="Price (₹)"
                  className="bg-[#FDF8F5] border border-[#EBE0D8] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#C0593A]" required />
                <input value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="Unit (bag, kg...)"
                  className="bg-[#FDF8F5] border border-[#EBE0D8] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#C0593A]" required />
                <input value={stock} onChange={(e) => setStock(e.target.value)} type="number" placeholder="Stock qty"
                  className="bg-[#FDF8F5] border border-[#EBE0D8] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#C0593A]" required />
              </div>
              {error && <p className="text-xs text-red-600">{error}</p>}
              <div className="flex gap-2">
                <button type="submit" disabled={busy} className="flex-1 bg-[#C0593A] hover:bg-[#9E3F24] disabled:opacity-60 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors">
                  {busy ? 'Adding…' : 'Add Product'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="text-sm text-[#6B5248] px-3">Cancel</button>
              </div>
            </form>
          )}
        </div>

        {materials.length >= SETUP_TARGET && (
          <div className="bg-white rounded-2xl border border-[#EBE0D8] p-6 text-center">
            <p className="text-sm font-bold text-[#2C1810] mb-2">Your store is live! 🎉</p>
            <Link href="/materials" className="text-xs font-semibold text-[#C0593A] hover:underline">
              View the materials marketplace →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
