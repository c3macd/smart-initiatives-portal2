
'use client';
import React from 'react';

export function Card({ title, children }: React.PropsWithChildren<{ title: string }>) {
  return (
    <div className="bg-white rounded-2xl shadow p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base md:text-lg font-bold">{title}</h2>
      </div>
      {children}
    </div>
  );
}

export function Input({ label, value, onChange, type = 'text', placeholder }:{ label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string; }) {
  return (
    <label className="block text-sm">
      <span className="text-slate-700">{label}</span>
      <input
        className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-slate-300"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        type={type}
        placeholder={placeholder}
      />
    </label>
  );
}

export function Static({ label, value }:{ label: string; value: string; }) {
  return (
    <label className="block text-sm">
      <span className="text-slate-700">{label}</span>
      <div className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">{value}</div>
    </label>
  );
}

export function Select({ label, value, onChange, options }:{ label: string; value: string | readonly string[] | undefined; onChange: (v: string) => void; options: readonly string[] | string[]; }) {
  return (
    <label className="block text-sm">
      <span className="text-slate-700">{label}</span>
      <select
        className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-slate-300"
        value={value as string}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">— اختر —</option>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </label>
  );
}

export function GateRow({ label, pass }:{ label: string; pass: boolean }) {
  return (
    <div className="flex items-center justify-between py-1">
      <div className="text-sm">{label}</div>
      <div className={`text-sm font-bold ${pass ? 'text-emerald-600' : 'text-rose-600'}`}>{pass ? '✓' : '✖'}</div>
    </div>
  );
}

export function ScoreBar({ label, val, max }:{ label: string; val: number; max: number }) {
  const pct = Math.max(0, Math.min(100, (val / max) * 100));
  return (
    <div className="mb-2">
      <div className="flex items-center justify-between text-sm">
        <span>{label}</span>
        <span className="tabular-nums">{val}/{max}</span>
      </div>
      <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
        <div className="h-2 bg-slate-900" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
