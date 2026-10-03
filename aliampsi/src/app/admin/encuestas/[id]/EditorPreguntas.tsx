'use client';

import { useState } from 'react';
import { TIPOS, preguntaVacia, type Pregunta, type TipoPregunta } from '@/lib/encuestas';

const nombreTipo = (t: TipoPregunta) => TIPOS.find((x) => x.tipo === t)?.nombre ?? t;

export function EditorPreguntas({ inicial, conRespuestas }: { inicial: Pregunta[]; conRespuestas: number }) {
  const [lista, setLista] = useState<Pregunta[]>(inicial);
  const cambiar = (i: number, parcial: Partial<Pregunta>) => setLista((l) => l.map((p, k) => (k === i ? { ...p, ...parcial } : p)));
  const mover = (i: number, d: number) => setLista((l) => { const a = [...l]; const j = i + d; if (j < 0 || j >= a.length) return a; [a[i], a[j]] = [a[j], a[i]]; return a; });
  const cambiarTipo = (i: number, tipo: TipoPregunta) => setLista((l) => l.map((p, k) => {
    if (k !== i) return p;
    const base = preguntaVacia(tipo);
    const conOpciones = tipo === 'unica' || tipo === 'multiple';
    return { ...base, id: p.id, texto: p.texto, ayuda: p.ayuda, opciones: conOpciones && p.opciones.length ? p.opciones : base.opciones };
  }));
  let n = 0;

  return (
    <div>
      <input type="hidden" name="preguntas" value={JSON.stringify(lista)} />
      {conRespuestas > 0 && (
        <p className="mb-4 rounded-lg border border-coral/40 bg-coral/10 px-4 py-3 text-sm text-coral-dark">
          Esta encuesta ya tiene {conRespuestas} respuestas. Podés corregir textos sin problema, pero si cambiás opciones o borrás preguntas, los resultados anteriores de esas preguntas dejan de coincidir.
        </p>
      )}
      <div className="space-y-3">
        {lista.map((p, i) => {
          const esSeccion = p.tipo === 'seccion';
          if (!esSeccion) n += 1;
          return (
            <div key={p.id} className={`rounded-xl border p-4 ${esSeccion ? 'border-teal-600/40 bg-sand/40' : 'border-line bg-white'}`}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-ink-muted">
                  <span>{esSeccion ? 'Sección' : `Pregunta ${n}`}</span>
                  <select value={p.tipo} onChange={(e) => cambiarTipo(i, e.target.value as TipoPregunta)} className="rounded-md border border-line bg-white px-2 py-1 text-sm text-ink" aria-label="Tipo de pregunta">
                    {TIPOS.map((t) => <option key={t.tipo} value={t.tipo}>{t.nombre}</option>)}
                  </select>
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <button type="button" onClick={() => mover(i, -1)} disabled={i === 0} className="rounded px-2 py-1 hover:bg-sand disabled:opacity-30" aria-label="Subir">▲</button>
                  <button type="button" onClick={() => mover(i, 1)} disabled={i === lista.length - 1} className="rounded px-2 py-1 hover:bg-sand disabled:opacity-30" aria-label="Bajar">▼</button>
                  <button type="button" onClick={() => setLista((l) => [...l.slice(0, i + 1), { ...p, id: preguntaVacia().id }, ...l.slice(i + 1)])} className="rounded px-2 py-1 text-ink-muted hover:bg-sand">Duplicar</button>
                  <button type="button" onClick={() => { if (confirm('¿Quitar esta pregunta?')) setLista((l) => l.filter((_, k) => k !== i)); }} className="rounded px-2 py-1 text-coral-dark hover:bg-coral/10">Quitar</button>
                </div>
              </div>

              <input value={p.texto} onChange={(e) => cambiar(i, { texto: e.target.value })} placeholder={esSeccion ? 'Título de la sección' : 'Texto de la pregunta'} aria-label="Texto" className="field mt-3 font-medium" />
              <input value={p.ayuda} onChange={(e) => cambiar(i, { ayuda: e.target.value })} placeholder="Aclaración opcional, debajo de la pregunta" aria-label="Aclaración" className="field mt-2 text-sm" />

              {(p.tipo === 'unica' || p.tipo === 'multiple') && (
                <div className="mt-3">
                  <label className="field-label">Opciones, una por línea</label>
                  <textarea value={p.opciones.join('\n')} onChange={(e) => cambiar(i, { opciones: e.target.value.split('\n') })} onBlur={() => cambiar(i, { opciones: p.opciones.map((o) => o.trim()).filter(Boolean) })} rows={Math.max(3, p.opciones.length + 1)} className="field text-sm" />
                  <label className="mt-2 flex items-center gap-2 text-sm"><input type="checkbox" checked={p.otro} onChange={(e) => cambiar(i, { otro: e.target.checked })} /> Agregar «Otro» con campo para escribir</label>
                </div>
              )}
              {(p.tipo === 'escala' || p.tipo === 'nps') && (
                <div className="mt-3 space-y-2">
                  {p.tipo === 'escala' && (
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <span className="text-ink-muted">Escala del</span>
                      <select value={p.minimo} onChange={(e) => cambiar(i, { minimo: Number(e.target.value) })} className="rounded-md border border-line bg-white px-2 py-1" aria-label="Desde">
                        {[0, 1].map((v) => <option key={v} value={v}>{v}</option>)}
                      </select>
                      <span className="text-ink-muted">al</span>
                      <select value={p.maximo} onChange={(e) => cambiar(i, { maximo: Number(e.target.value) })} className="rounded-md border border-line bg-white px-2 py-1" aria-label="Hasta">
                        {[2, 3, 4, 5, 6, 7, 8, 9, 10].filter((v) => v > p.minimo).map((v) => <option key={v} value={v}>{v}</option>)}
                      </select>
                    </div>
                  )}
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div><label className="field-label">Qué significa el {p.minimo}</label><input value={p.etiquetaMin} onChange={(e) => cambiar(i, { etiquetaMin: e.target.value })} className="field text-sm" /></div>
                    <div><label className="field-label">Qué significa el {p.maximo}</label><input value={p.etiquetaMax} onChange={(e) => cambiar(i, { etiquetaMax: e.target.value })} className="field text-sm" /></div>
                  </div>
                </div>
              )}
              {!esSeccion && (
                <label className="mt-3 flex items-center gap-2 text-sm"><input type="checkbox" checked={p.obligatoria} onChange={(e) => cambiar(i, { obligatoria: e.target.checked })} /> Obligatoria</label>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-4 rounded-xl border border-dashed border-line p-4">
        <p className="text-sm font-semibold text-ink-muted">Agregar</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {TIPOS.map((t) => (
            <button key={t.tipo} type="button" title={t.ayuda} onClick={() => setLista((l) => [...l, preguntaVacia(t.tipo)])} className="rounded-lg border border-line bg-white px-3 py-1.5 text-sm hover:border-teal-600">+ {nombreTipo(t.tipo)}</button>
          ))}
        </div>
      </div>
    </div>
  );
}
