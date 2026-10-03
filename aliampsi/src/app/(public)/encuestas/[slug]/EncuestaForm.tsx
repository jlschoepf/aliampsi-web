'use client';

import { useRef, useState } from 'react';
import type { Pregunta } from '@/lib/encuestas';

const OTRO = '__otro__';

export function EncuestaForm({ preguntas, action, previa }: { preguntas: Pregunta[]; action: (fd: FormData) => void; previa: boolean }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [errores, setErrores] = useState<Set<string>>(new Set());
  const [otros, setOtros] = useState<Record<string, boolean>>({});
  const [enviando, setEnviando] = useState(false);

  function falta(p: Pregunta, f: HTMLFormElement): boolean {
    const k = `p_${p.id}`;
    const els = Array.from(f.querySelectorAll<HTMLInputElement>(`[name="${k}"]`));
    if (p.tipo === 'texto' || p.tipo === 'parrafo') return !els.some((e) => e.value.trim());
    const marcados = els.filter((e) => e.checked);
    if (!marcados.length) return true;
    if (marcados.some((e) => e.value === OTRO) && marcados.length === 1) {
      const t = f.querySelector<HTMLInputElement>(`[name="${k}_otro"]`);
      return !t?.value.trim();
    }
    return false;
  }

  function alEnviar(e: React.FormEvent<HTMLFormElement>) {
    if (previa) { e.preventDefault(); return; }
    const f = e.currentTarget;
    const faltan = new Set(preguntas.filter((p) => p.obligatoria && p.tipo !== 'seccion' && falta(p, f)).map((p) => p.id));
    setErrores(faltan);
    if (faltan.size) {
      e.preventDefault();
      const primero = f.querySelector(`#preg-${[...faltan][0]}`);
      primero?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setEnviando(true);
  }

  let numero = 0;
  return (
    <form ref={formRef} action={action} onSubmit={alEnviar} noValidate className="mt-10 space-y-6">
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
      {preguntas.map((p) => {
        if (p.tipo === 'seccion') {
          return (
            <div key={p.id} className="pt-6">
              <h2 className="text-2xl font-bold"><span className="text-coral">·</span> {p.texto}</h2>
              {p.ayuda && <p className="mt-1 text-ink-muted">{p.ayuda}</p>}
            </div>
          );
        }
        numero += 1;
        const k = `p_${p.id}`;
        const hayError = errores.has(p.id);
        return (
          <fieldset key={p.id} id={`preg-${p.id}`} className={`card p-5 sm:p-6 ${hayError ? 'ring-2 ring-coral' : ''}`} aria-describedby={hayError ? `err-${p.id}` : undefined}>
            <legend className="sr-only">{p.texto}</legend>
            <p className="font-semibold text-ink" aria-hidden="true">
              {numero}. {p.texto} {p.obligatoria && <span className="text-coral" title="Obligatoria">*</span>}
            </p>
            {p.ayuda && <p className="mt-1 text-sm text-ink-muted">{p.ayuda}</p>}

            <div className="mt-4">
              {(p.tipo === 'unica' || p.tipo === 'multiple') && (
                <div className="space-y-2">
                  {p.opciones.map((o) => (
                    <label key={o} className="flex min-h-[44px] cursor-pointer items-center gap-3 rounded-lg border border-line bg-white px-4 py-2 hover:border-teal-600 has-[:checked]:border-teal-600 has-[:checked]:bg-sand/40">
                      <input type={p.tipo === 'unica' ? 'radio' : 'checkbox'} name={k} value={o} className="h-4 w-4 accent-[#2E7D74]"
                        onChange={() => { if (p.tipo === 'unica') setOtros((s) => ({ ...s, [p.id]: false })); }} />
                      <span>{o}</span>
                    </label>
                  ))}
                  {p.otro && (
                    <div>
                      <label className="flex min-h-[44px] cursor-pointer items-center gap-3 rounded-lg border border-line bg-white px-4 py-2 hover:border-teal-600 has-[:checked]:border-teal-600 has-[:checked]:bg-sand/40">
                        <input type={p.tipo === 'unica' ? 'radio' : 'checkbox'} name={k} value={OTRO} className="h-4 w-4 accent-[#2E7D74]"
                          onChange={(e) => setOtros((s) => ({ ...s, [p.id]: e.target.checked }))} />
                        <span>Otro</span>
                      </label>
                      {otros[p.id] && (
                        <input type="text" name={`${k}_otro`} maxLength={300} autoFocus placeholder="¿Cuál?" aria-label={`Otro: ${p.texto}`} className="field mt-2" />
                      )}
                    </div>
                  )}
                </div>
              )}

              {(p.tipo === 'escala' || p.tipo === 'nps') && (
                <div>
                  <div className={`grid gap-2 ${p.tipo === 'escala' ? 'grid-cols-5' : 'grid-cols-6 sm:grid-cols-11'}`}>
                    {Array.from({ length: p.tipo === 'escala' ? 5 : 11 }, (_, i) => (p.tipo === 'escala' ? i + 1 : i)).map((n) => (
                      <label key={n} className="flex min-h-[48px] cursor-pointer items-center justify-center rounded-lg border border-line bg-white text-lg font-semibold text-ink hover:border-teal-600 has-[:checked]:border-ink has-[:checked]:bg-ink has-[:checked]:text-paper has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-coral">
                        <input type="radio" name={k} value={n} className="sr-only" aria-label={`${n}`} />
                        {n}
                      </label>
                    ))}
                  </div>
                  {(p.etiquetaMin || p.etiquetaMax) && (
                    <div className="mt-2 flex justify-between text-xs text-ink-muted">
                      <span>{p.tipo === 'escala' ? '1' : '0'} = {p.etiquetaMin}</span>
                      <span>{p.tipo === 'escala' ? '5' : '10'} = {p.etiquetaMax}</span>
                    </div>
                  )}
                </div>
              )}

              {p.tipo === 'texto' && <input type="text" name={k} maxLength={300} className="field" aria-label={p.texto} />}
              {p.tipo === 'parrafo' && <textarea name={k} rows={4} maxLength={4000} className="field" aria-label={p.texto} />}
            </div>

            {hayError && <p id={`err-${p.id}`} role="alert" className="mt-3 text-sm font-medium text-coral-dark">Esta pregunta es obligatoria.</p>}
          </fieldset>
        );
      })}

      <div className="flex flex-col items-start gap-3 pt-2">
        {errores.size > 0 && <p role="alert" className="text-sm font-medium text-coral-dark">Faltan {errores.size === 1 ? 'una respuesta obligatoria' : `${errores.size} respuestas obligatorias`}. Están marcadas arriba.</p>}
        <button type="submit" disabled={enviando || previa} className="btn-coral min-h-[48px] px-8 text-base disabled:opacity-60">
          {previa ? 'Vista previa: no se envía' : enviando ? 'Enviando…' : 'Enviar respuestas'}
        </button>
        <p className="text-xs text-ink-muted">Las preguntas con <span className="text-coral">*</span> son obligatorias.</p>
      </div>
    </form>
  );
}
