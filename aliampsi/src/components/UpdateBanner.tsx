'use client';

import { useEffect, useState } from 'react';
import { APP_VERSION } from '@/lib/version';

export function UpdateBanner() {
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    let stop = false;

    async function check() {
      try {
        const res = await fetch('/api/version', { cache: 'no-store' });
        if (!res.ok) return;
        const data = (await res.json()) as { version?: string };
        if (!stop && data?.version && data.version !== APP_VERSION) {
          setAvailable(true);
        }
      } catch {
        // sin conexión: reintenta en el próximo ciclo
      }
    }

    check();
    const id = setInterval(check, 60000); // cada 60s
    const onVisible = () => {
      if (document.visibilityState === 'visible') check();
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      stop = true;
      clearInterval(id);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  if (!available) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50 px-4 pb-[env(safe-area-inset-bottom)]"
      role="status"
      aria-live="polite"
    >
      <div className="mx-auto mb-4 flex max-w-md items-center justify-between gap-3 rounded-xl2 bg-ink px-4 py-3 shadow-xl">
        <span className="text-sm font-medium text-paper">
          Hay una versión nueva del panel.
        </span>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="btn-coral shrink-0"
        >
          Actualizar
        </button>
      </div>
    </div>
  );
}
