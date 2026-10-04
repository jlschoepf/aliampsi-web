'use client';

import { useMemo, useRef, useState } from 'react';
import { inscriptosATexto, leerInscriptos } from '@/lib/inscriptos';
import { leerArchivoInscriptos } from '../archivo-actions';

export function CampoInscriptos({ defaultValue }: { defaultValue: string }) {
  const [texto, setTexto] = useState(defaultValue);
  const [aviso, setAviso] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null);
  const [leyendo, setLeyendo] = useState(false);
  const [modo, setModo] = useState<'reemplazar' | 'agregar'>(defaultValue.trim() ? 'agregar' : 'reemplazar');
  const input = useRef<HTMLInputElement>(null);
  const lista = useMemo(() => leerInscriptos(texto), [texto]);

  async function alElegir(e: React.ChangeEvent<HTMLInputElement>) {
    const archivo = e.target.files?.[0];
    if (!archivo) return;
    setLeyendo(true); setAviso(null);
    const fd = new FormData(); fd.append('archivo', archivo);
    try {
      const r = await leerArchivoInscriptos(fd);
      if (!r.ok) setAviso({ tipo: 'error', texto: r.mensaje });
      else {
        const nuevo = modo === 'agregar' && texto.trim() ? inscriptosATexto(leerInscriptos(`${texto}\n${r.texto}`)) : r.texto;
        setTexto(nuevo);
        setAviso({ tipo: 'ok', texto: `Leí ${r.cantidad} inscriptos de «${archivo.name}»${r.sinCorreo ? ` (${r.sinCorreo} sin correo)` : ''}. Revisá la lista y tocá «Guardar cambios» para que quede cargada.` });
      }
    } catch {
      setAviso({ tipo: 'error', texto: 'No se pudo leer el archivo. Probá de nuevo o pegá la lista a mano.' });
    }
    setLeyendo(false);
    if (input.current) input.current.value = '';
  }

  return (
    <div>
      <label className="field-label" htmlFor="inscriptos">
        Lista de inscriptos · {lista.length} cargados{lista.length ? ` (${lista.filter((i) => !i.correo).length} sin correo)` : ''}
      </label>
      <div className="mb-2 flex flex-wrap items-center gap-3 rounded-lg border border-dashed border-line bg-sand/30 p-3">
        <button type="button" onClick={() => input.current?.click()} disabled={leyendo} className="btn-primary text-sm disabled:opacity-60">
          {leyendo ? 'Leyendo…' : 'Cargar archivo'}
        </button>
        <span className="text-sm text-ink-muted">CSV (por ejemplo, el de Luma), Excel o PDF</span>
        {texto.trim() && (
          <span className="flex items-center gap-3 text-sm">
            <label className="flex items-center gap-1"><input type="radio" checked={modo === 'agregar'} onChange={() => setModo('agregar')} /> agregar a la lista</label>
            <label className="flex items-center gap-1"><input type="radio" checked={modo === 'reemplazar'} onChange={() => setModo('reemplazar')} /> reemplazarla</label>
          </span>
        )}
        <input ref={input} type="file" accept=".csv,.tsv,.txt,.xlsx,.xlsm,.xls,.ods,.pdf,text/csv,application/pdf" onChange={alElegir} className="hidden" />
      </div>
      {aviso && <p role="status" className={`mb-2 rounded-lg px-3 py-2 text-sm font-medium ${aviso.tipo === 'ok' ? 'bg-teal-600/10 text-teal-700' : 'bg-coral/10 text-coral-dark'}`}>{aviso.texto}</p>}
      <textarea id="inscriptos" name="inscriptos" value={texto} onChange={(e) => setTexto(e.target.value)} rows={8} className="field font-mono text-xs" placeholder={'Nombre Apellido, correo@ejemplo.com\n…'} />
      <p className="mt-1 text-xs text-ink-muted">También podés pegar la lista acá, una persona por línea. Se compara por correo y, si no coincide, por nombre (sin importar tildes, títulos ni el orden). Al guardar se ordena y se quitan los repetidos.</p>
    </div>
  );
}
