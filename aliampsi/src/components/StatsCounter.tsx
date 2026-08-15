'use client';

import { useEffect, useRef, useState } from 'react';

type Stat = { id: string; value: string; label: string };

function parseNumeric(value: string): { prefix: string; target: number } | null {
  const m = value.trim().match(/^(\+)?(\d+)$/);
  if (!m) return null;
  return { prefix: m[1] || '', target: parseInt(m[2], 10) };
}

function StatItem({ stat, run }: { stat: Stat; run: boolean }) {
  const numeric = parseNumeric(stat.value);
  const [n, setN] = useState(0);

  useEffect(() => {
    const parsed = parseNumeric(stat.value);
    if (!parsed || !run) return;
    let raf = 0;
    const start = performance.now();
    const dur = 1200;
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
      <div className="font-display text-4xl font-extrabold tabular-nums text-paper sm:text-5xl">
        {numeric ? (
          <span className="relative inline-block">
            {/* Reserva el ancho del valor final para que el texto no se mueva al contar */}
            <span className="invisible" aria-hidden="true">
              {numeric.prefix}
              {numeric.target}
            </span>
            <span className="absolute inset-0 flex items-center justify-center">
              {numeric.prefix}
              {n}
            </span>
          </span>
        ) : (
          stat.value
        )}
      </div>
      <div className="mt-2 text-sm font-medium text-paper/70">{stat.label}</div>
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
    <div
      ref={ref}
      className="mx-auto flex max-w-4xl flex-wrap items-start justify-center gap-x-16 gap-y-10"
    >
      {stats.map((s) => (
        <StatItem key={s.id} stat={s} run={run} />
      ))}
    </div>
  );
}
