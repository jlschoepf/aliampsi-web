'use client';

import { useRef, useState } from 'react';
import type { Pregunta } from '@/lib/encuestas';

const OTRO = '__otro__';
// Clases fijas para que Tailwind las incluya: columnas según cuántos valores tiene la escala.
const COLS: Record<number, string> = { 2: 'grid-cols-2', 3: 'grid-cols-3', 4: 'grid-cols-4', 5: 'grid-cols-5', 6: 'grid-cols-6', 7: 'grid-cols-4 sm:grid-cols-7', 8: 'grid-cols-4 sm:grid-cols-8', 9: 'grid-cols-5 sm:grid-cols-9', 10: 'grid-cols-5 sm:grid-cols-10', 11: 'grid-cols-6 sm:grid-cols-11' };

export function EncuestaForm({ preguntas, action, previa, certificado = false }: { preguntas: Pregunta[]; action: (fd: FormData) => void; previa: boolean; certificado?: boolean }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [errores, setErrores] = useState<Set<string>>(new Set());
  const [otros, setOtros] = useState<Record<string, boolean>>({});
  const [enviando, setEnviando] = useState(false);
  const [quiereCert, setQuiereCert] = useState(false);
  const [errCert, setErrCert] = useState('');

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
    let ec = '';
    if (certificado && quiereCert) {
      const nom = (f.querySelector<HTMLInputElement>('[name="cert_nombre"]')?.value || '').trim();
      const cor = (f.querySelector<HTMLInputElement>('[name="cert_correo"]')?.value || '').trim();
      if (nom.length < 3) ec = 'Escriba su nombre completo, tal como quiere que figure en el certificado.';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(cor)) ec = 'Revise el correo electrónico: ahí le enviaremos el certificado.';
    }
    setErrCert(ec);
    if (ec && !faltan.size) { e.preventDefault(); f.querySelector('#bloque-cert')?.scrollIntoView({ behavior: 'smooth', block: 'center' }); return; }
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
                  <div className={`grid gap-2 ${COLS[p.maximo - p.minimo + 1] ?? 'grid-cols-5'}`}>
                    {Array.from({ length: p.maximo - p.minimo + 1 }, (_, i) => p.minimo + i).map((n) => (
                      <label key={n} className="flex min-h-[48px] cursor-pointer items-center justify-center rounded-lg border border-line bg-white text-lg font-semibold text-ink hover:border-teal-600 has-[:checked]:border-ink has-[:checked]:bg-ink has-[:checked]:text-paper has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-coral">
                        <input type="radio" name={k} value={n} className="sr-only" aria-label={`${n}`} />
                        {n}
                      </label>
                    ))}
                  </div>
                  {(p.etiquetaMin || p.etiquetaMax) && (
                    <div className="mt-2 flex justify-between text-xs text-ink-muted">
                      <span>{p.minimo} = {p.etiquetaMin}</span>
                      <span>{p.maximo} = {p.etiquetaMax}</span>
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

      {certificado && (
        <div id="bloque-cert" className={`card border-teal-600/30 bg-sand/30 p-5 sm:p-6 ${errCert ? 'ring-2 ring-coral' : ''}`}>
          <label className="flex min-h-[44px] cursor-pointer items-start gap-3">
            <input type="checkbox" name="cert_quiero" checked={quiereCert} onChange={(e) => setQuiereCert(e.target.checked)} className="mt-1 h-5 w-5 accent-[#2E7D74]" />
            <span>
              <span className="font-semibold text-ink">Quiero recibir mi certificado de asistencia</span>
              <span className="mt-1 block text-sm text-ink-muted">Lo enviaremos por correo electrónico una vez validada su asistencia.</span>
            </span>
          </label>
          {quiereCert && (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="field-label" htmlFor="cert_nombre">Nombre y apellido <span className="text-coral">*</span></label>
                <input id="cert_nombre" name="cert_nombre" type="text" maxLength={120} autoComplete="name" className="field" placeholder="Ej.: Dra. Ana López" />
                <p className="mt-1 text-xs text-ink-muted">Tal como quiere que figure en el certificado.</p>
              </div>
              <div>
                <label className="field-label" htmlFor="cert_correo">Correo electrónico <span className="text-coral">*</span></label>
                <input id="cert_correo" name="cert_correo" type="email" maxLength={160} autoComplete="email" className="field" placeholder="nombre@correo.com" />
                <p className="mt-1 text-xs text-ink-muted">Use el mismo con el que se inscribió.</p>
              </div>
              <p className="text-xs text-ink-muted sm:col-span-2">
                Estos datos se guardan por separado y no quedan vinculados a sus respuestas: la encuesta sigue siendo anónima. Solo los usamos para validar su asistencia y enviarle el certificado.
              </p>
            </div>
          )}
          {errCert && <p role="alert" className="mt-3 text-sm font-medium text-coral-dark">{errCert}</p>}
        </div>
      )}

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
