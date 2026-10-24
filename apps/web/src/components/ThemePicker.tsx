"use client";
import { useEffect, useState } from "react";
import { Palette } from "lucide-react";
export type ThemeName = "midnight" | "daylight" | "ocean" | "violet" | "ember";
export const themes: { value: ThemeName; label: string; color: string }[] = [
  { value: "midnight", label: "Midnight", color: "#121c28" },
  { value: "daylight", label: "Daylight", color: "#f2f5f9" },
  { value: "ocean", label: "Ocean", color: "#0b3944" },
  { value: "violet", label: "Violet", color: "#2b1c48" },
  { value: "ember", label: "Ember", color: "#4a291f" },
];
export function applyTheme(value: ThemeName) {
  document.documentElement.dataset.theme = value;
  try { window.localStorage.setItem("iftech-theme", value); } catch {}
}
export function ThemePicker({ className = "" }: { className?: string }) {
  const [theme, setTheme] = useState<ThemeName>("midnight");
  useEffect(() => {
    const stored = window.localStorage.getItem("iftech-theme");
    const value = themes.some(t => t.value === stored) ? (stored as ThemeName) : "midnight";
    setTheme(value);
    applyTheme(value);
  }, []);
  return <label className={`if-theme-control ${className}`} title="Color theme">
    <Palette size={16} aria-hidden="true"/>
    <span className="if-theme-label">Theme</span>
    <select aria-label="Color theme" value={theme} onChange={e => { const v=e.target.value as ThemeName; setTheme(v); applyTheme(v); }}>
      {themes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
    </select>
  </label>;
}
