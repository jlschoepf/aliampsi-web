'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Users, CalendarDays, Building2, Globe, Award, BookOpen,
  GraduationCap, Heart, Star, Sparkles, type LucideIcon,
} from 'lucide-react';

type Stat = { id: string; value: string; label: string; icon: string };

const ICONS: Record<string, LucideIcon> = {
  users: Users, calendar: CalendarDays, building: Building2, globe: Globe,
  award: Award, book: BookOpen, graduation: GraduationCap, heart: Heart,
  star: Star, sparkles: Sparkles,
};

function guessIcon(label: string): string {
  const l = label.toLowerCase();
  if (/socia|institu/.test(l)) return 'building';
  if (/congres|jornada|evento|activid/.test(l)) return 'calendar';
  if (/miembro|socio|profesional|persona/.test(l)) return 'users';
  if (/alcance|regi|pa[ií]s|iberoam|mundo/.test(l)) return 'globe';
  if (/premio|galard/.test(l)) return 'award';
  if (/public|revista|libro|art[ií]culo/.test(l)) return 'book';
  if (/form|beca|pasant[ií]|capacit/.test(l)) return 'graduation';
  return 'sparkles';
}

function parseNumeric(value: string): { prefix: string; target: number } | null {
  const m = value.trim().match(/^(\+)?([\d.,]+)$/);
  if (!m) return null;
  const digits = m[2].replace(/[.,]/g, '');
  if (!/^\d+$/.test(digits)) return null;
  return { prefix: m[1] || '', target: parseInt(digits, 10) };
}

const fmt = (n: number) => n.toLocaleString('es-AR');

function StatItem({ stat, run }: { stat: Stat; run: boolean }) {
  const numeric = parseNumeric(stat.value);
  const [n, setN] = useState(0);
  const Icon = ICONS[stat.icon] || ICONS[guessIcon(stat.label)] || Sparkles;

  useEffect(() => {
    const parsed = parseNumeric(stat.value);
    if (!parsed || !run) return;
    let raf = 0;
    const start = performance.now();
    const dur = 1400;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(parsed.target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [stat.value, run]);

  return (
    <div className="text-center">
      <div className="relative mx-auto mb-3.5 flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-coral to-coral-dark shadow-md shadow-coral/25 ring-1 ring-white/10">
        {/* Emblema de AL·IAM·PSI como marca de agua (sutil) */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/emblem.png"
          alt=""
          className="pointer-events-none absolute inset-0 h-full w-full scale-95 object-contain opacity-[0.12] brightness-0 invert"
        />
        <Icon className="relative h-[18px] w-[18px] text-paper" strokeWidth={2} />
      </div>
      <div className="font-display text-[2rem] font-extrabold tabular-nums leading-none tracking-tight text-paper sm:text-[2.5rem]">
        {numeric ? (
          <span className="relative inline-block">
            <span className="invisible" aria-hidden="true">{numeric.prefix}{fmt(numeric.target)}</span>
            <span className="absolute inset-0 flex items-center justify-center">{numeric.prefix}{fmt(n)}</span>
          </span>
        ) : (
          stat.value
        )}
      </div>
      <div className="mt-2 text-[13px] font-medium tracking-wide text-paper/60">{stat.label}</div>
    </div>
  );
}

export function StatsCounter({ stats }: { stats: Stat[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [run, setRun] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setRun(true);
            obs.disconnect();
          }
        }
      },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} className="mx-auto flex max-w-4xl flex-wrap items-start justify-center gap-x-16 gap-y-10">
      {stats.map((s) => (
        <StatItem key={s.id} stat={s} run={run} />
      ))}
    </div>
  );
}
