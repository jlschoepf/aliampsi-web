'use client';

import { useState } from 'react';
import type { FilaSeguimiento } from '@/lib/seguimiento';

/** Lista de inscriptos sin certificado, con casillas para elegir a quiénes mandar el recordatorio. */
export function ListaDestinatarios({ filas, enCola = [] }: { filas: FilaSeguimiento[]; enCola?: string[] }) {
  const cola = new Set(enCola);
  const [marcados, setMarcados] = useState<Set<string>>(() => new Set(filas.filter((f) => f.correo && !f.recordado && !cola.has(f.correo)).map((f) => f.correo)));
  const conCorreo = filas.filter((f) => f.correo);
  const todos = (v: boolean, soloSinRecordar = false) =>
    setMarcados(new Set(v ? conCorreo.filter((f) => !soloSinRecordar || (!f.recordado && !cola.has(f.correo))).map((f) => f.correo) : []));
  const fecha = (iso: string) => new Date(iso).toLocaleDateString('es-UY', { day: 'numeric', month: 'short' });

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-3 text-sm">
        <span className="font-semibold text-ink">{marcados.size} marcados</span>
        <button type="button" onClick={() => todos(true)} className="text-teal-700 hover:underline">Marcar todos</button>
        <button type="button" onClick={() => todos(true, true)} className="text-teal-700 hover:underline">Solo los que no recibieron recordatorio</button>
        <button type="button" onClick={() => todos(false)} className="text-ink-muted hover:underline">Desmarcar todos</button>
      </div>
      <div className="max-h-[480px] divide-y divide-line overflow-y-auto rounded-lg border border-line bg-white">
        {filas.map((f, i) => (
          <label key={(f.correo || f.nombre) + i} className={`flex items-center gap-3 px-4 py-2.5 text-sm ${f.correo ? 'cursor-pointer hover:bg-sand/40' : 'opacity-60'}`}>
            <input type="checkbox" name="correo" value={f.correo} disabled={!f.correo} checked={!!f.correo && marcados.has(f.correo)}
              onChange={(e) => setMarcados((s) => { const n = new Set(s); if (e.target.checked) n.add(f.correo); else n.delete(f.correo); return n; })}
              className="h-4 w-4 accent-[#2E7D74]" />
            <span className="min-w-0 flex-1">
              <span className="font-medium text-ink">{f.nombre || '(sin nombre)'}</span>
              <span className="ml-2 text-ink-muted">{f.correo || 'sin correo: no se le puede escribir'}</span>
            </span>
            {f.estado === 'pedido-pendiente' && <span className="rounded-full bg-coral/10 px-2 py-0.5 text-xs font-semibold text-coral-dark">Pidió, pendiente de validar</span>}
            {cola.has(f.correo) && <span className="rounded-full bg-sand px-2 py-0.5 text-xs font-semibold text-ink">En cola</span>}
            {f.recordado && <span className="rounded-full bg-ink/5 px-2 py-0.5 text-xs font-semibold text-ink-muted">Recordado el {fecha(f.recordado)}</span>}
          </label>
        ))}
      </div>
    </div>
  );
}
