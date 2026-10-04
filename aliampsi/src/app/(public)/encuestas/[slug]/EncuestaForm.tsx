'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { pasos as armarPasos, type Pregunta } from '@/lib/encuestas';

const OTRO = '__otro__';
// Clases fijas para que Tailwind las incluya: columnas según cuántos valores tiene la escala.
const COLS: Record<number, string> = { 2: 'grid-cols-2', 3: 'grid-cols-3', 4: 'grid-cols-4', 5: 'grid-cols-5', 6: 'grid-cols-6', 7: 'grid-cols-4 sm:grid-cols-7', 8: 'grid-cols-4 sm:grid-cols-8', 9: 'grid-cols-5 sm:grid-cols-9', 10: 'grid-cols-5 sm:grid-cols-10', 11: 'grid-cols-6 sm:grid-cols-11' };
const CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

type Props = { preguntas: Pregunta[]; action: (fd: FormData) => void; previa: boolean; certificado?: boolean; clave: string; conInscripcion?: boolean };

export function EncuestaForm({ preguntas, action, previa, certificado = false, clave, conInscripcion = false }: Props) {
  const pasos = useMemo(() => armarPasos(preguntas), [preguntas]);
  const todas = useMemo(() => pasos.flatMap((p) => p.preguntas), [pasos]);
  const total = todas.length;
  const KEY = `encuesta-borrador-${clave}`;

  const formRef = useRef<HTMLFormElement>(null);
  const arribaRef = useRef<HTMLDivElement>(null);
  const [paso, setPaso] = useState(0);
  const [visitado, setVisitado] = useState(0);
  const [respondidas, setRespondidas] = useState<Set<string>>(new Set());
  const [errores, setErrores] = useState<Set<string>>(new Set());
  const [otros, setOtros] = useState<Record<string, boolean>>({});
  const [quiereCert, setQuiereCert] = useState(false);
  const [errCert, setErrCert] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [recuperado, setRecuperado] = useState(false);
  const ultimo = paso === pasos.length - 1;

  // ---------- estado de cada pregunta ----------
  function respondida(p: Pregunta, f: HTMLFormElement): boolean {
    const k = `p_${p.id}`;
    const els = Array.from(f.querySelectorAll<HTMLInputElement>(`[name="${k}"]`));
    if (p.tipo === 'texto' || p.tipo === 'parrafo') return els.some((e) => e.value.trim().length > 0);
    const marcados = els.filter((e) => e.checked);
    if (!marcados.length) return false;
    if (marcados.every((e) => e.value === OTRO)) return !!f.querySelector<HTMLInputElement>(`[name="${k}_otro"]`)?.value.trim();
    return true;
  }
  function recalcular() {
    const f = formRef.current;
    if (f) setRespondidas(new Set(todas.filter((p) => respondida(p, f)).map((p) => p.id)));
  }

  // ---------- borrador en el dispositivo ----------
  function guardar(pasoActual = paso) {
    if (previa) return;
    const f = formRef.current;
    if (!f) return;
    const datos: Record<string, string[]> = {};
    for (const el of Array.from(f.elements) as HTMLInputElement[]) {
      if (!el.name || el.name === 'website') continue;
      if (el.type === 'radio' || el.type === 'checkbox') { if (el.checked) (datos[el.name] ??= []).push(el.value); }
      else if (el.value) datos[el.name] = [el.value];
    }
    try { localStorage.setItem(KEY, JSON.stringify({ datos, paso: pasoActual })); } catch { /* sin almacenamiento: seguimos igual */ }
  }

  useEffect(() => {
    const f = formRef.current;
    if (!f || previa) return;
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const { datos, paso: p } = JSON.parse(raw) as { datos: Record<string, string[]>; paso: number };
        const conOtro: Record<string, boolean> = {};
        let hay = false;
        for (const el of Array.from(f.elements) as HTMLInputElement[]) {
          const v = datos[el.name];
          if (!v) continue;
          hay = true;
          if (el.type === 'radio' || el.type === 'checkbox') {
            el.checked = v.includes(el.value);
            if (el.checked && el.value === OTRO) conOtro[el.name.slice(2)] = true;
            if (el.name === 'cert_quiero' && el.checked) setQuiereCert(true);
          } else el.value = v[0];
        }
        if (hay) {
          setOtros(conOtro);
          const destino = Math.min(Math.max(0, p || 0), pasos.length - 1);
          setPaso(destino); setVisitado(destino); setRecuperado(true);
        }
      }
    } catch { /* borrador ilegible: se ignora */ }
    recalcular();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- navegación ----------
  function irA(i: number) {
    setPaso(i); setVisitado((v) => Math.max(v, i)); setErrores(new Set()); guardar(i);
    requestAnimationFrame(() => arribaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  }
  function faltanEn(i: number): string[] {
    const f = formRef.current;
    return f ? pasos[i].preguntas.filter((p) => p.obligatoria && !respondida(p, f)).map((p) => p.id) : [];
  }
  function marcarYMostrar(ids: string[]) {
    setErrores(new Set(ids));
    requestAnimationFrame(() => formRef.current?.querySelector(`#preg-${ids[0]}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }));
  }
  function siguiente() {
    const faltan = previa ? [] : faltanEn(paso);
    if (faltan.length) return marcarYMostrar(faltan);
    irA(paso + 1);
  }

  function alEnviar(e: React.FormEvent<HTMLFormElement>) {
    if (previa) { e.preventDefault(); return; }
    for (let i = 0; i < pasos.length; i++) {
      const faltan = faltanEn(i);
      if (faltan.length) { e.preventDefault(); if (i !== paso) { setPaso(i); } marcarYMostrar(faltan); return; }
    }
    if (certificado && quiereCert) {
      const f = e.currentTarget;
      const nom = (f.querySelector<HTMLInputElement>('[name="cert_nombre"]')?.value || '').trim();
      const cor = (f.querySelector<HTMLInputElement>('[name="cert_correo"]')?.value || '').trim();
      const ec = nom.length < 3 ? 'Escriba su nombre completo, tal como quiere que figure en el certificado.' : !CORREO.test(cor) ? 'Revise el correo electrónico: ahí le enviaremos el certificado.' : '';
      setErrCert(ec);
      if (ec) { e.preventDefault(); f.querySelector('#bloque-cert')?.scrollIntoView({ behavior: 'smooth', block: 'center' }); return; }
    }
    try { localStorage.removeItem(KEY); } catch { /* nada */ }
    setEnviando(true);
  }

  const pct = total ? Math.round((respondidas.size / total) * 100) : 0;
  const numero = new Map(todas.map((p, i) => [p.id, i + 1]));

  return (
    <div ref={arribaRef} className="scroll-mt-20">
      {/* barra de progreso fija, debajo del encabezado del sitio */}
      <div className="sticky top-16 z-30 -mx-4 mt-8 border-b border-line/70 bg-paper/90 px-4 py-3 backdrop-blur-md sm:-mx-6 sm:px-6">
        <div className="flex items-baseline justify-between gap-3 text-sm">
          <p className="min-w-0 truncate font-semibold text-ink">
            {pasos.length > 1 && <span className="text-ink-muted">Paso {paso + 1} de {pasos.length}</span>}
            {pasos.length > 1 && pasos[paso].titulo && <span className="text-ink-muted"> · </span>}
            {pasos[paso]?.titulo.replace(/^Sección\s*\d+\s*:\s*/i, '')}
          </p>
          <p className="shrink-0 tabular-nums text-ink-muted">{respondidas.size} de {total} · <span className="font-semibold text-ink">{pct}%</span></p>
        </div>
        <div className="mt-2 flex gap-1.5" role="progressbar" aria-label="Avance de la encuesta" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}>
          {pasos.map((p, i) => {
            const hechas = p.preguntas.filter((q) => respondidas.has(q.id)).length;
            const lleno = p.preguntas.length ? (hechas / p.preguntas.length) * 100 : 0;
            const puede = i <= visitado && i !== paso;
            return (
              <button key={i} type="button" disabled={!puede} onClick={() => irA(i)} title={p.titulo || `Paso ${i + 1}`} aria-label={`Ir a ${p.titulo || `paso ${i + 1}`}`}
                className={`h-2 flex-1 overflow-hidden rounded-full bg-sand transition-transform enabled:cursor-pointer enabled:hover:scale-y-150 ${i === paso ? 'ring-1 ring-ink/20' : ''}`}>
                <span className="block h-full rounded-full bg-gradient-to-r from-teal-600 to-coral transition-all duration-500 ease-out" style={{ width: `${lleno}%` }} />
              </button>
            );
          })}
        </div>
      </div>

      {recuperado && (
        <div className="mt-6 flex items-start justify-between gap-3 rounded-xl border border-teal-600/30 bg-teal-600/5 px-4 py-3 text-sm text-ink">
          <p>Recuperamos las respuestas que había dejado sin enviar en este dispositivo. Puede seguir desde donde quedó.</p>
          <button type="button" onClick={() => setRecuperado(false)} className="shrink-0 text-ink-muted hover:text-ink" aria-label="Cerrar aviso">✕</button>
        </div>
      )}
      <p className="sr-only" aria-live="polite">{pasos.length > 1 ? `Paso ${paso + 1} de ${pasos.length}. ${pasos[paso]?.titulo}` : ''}</p>

      <form ref={formRef} action={action} onSubmit={alEnviar} onChange={() => { recalcular(); guardar(); }} noValidate className="mt-8">
        <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />

        {pasos.map((pp, i) => (
          <section key={i} className={i === paso ? 'paso-entra space-y-5' : 'hidden'} aria-hidden={i !== paso}>
            {pp.titulo && (
              <header className="pb-1">
                {pasos.length > 1 && <p className="text-xs font-semibold uppercase tracking-[0.18em] text-coral">Paso {i + 1} de {pasos.length}</p>}
                <h2 className="mt-1 text-2xl font-bold sm:text-3xl">{pp.titulo.replace(/^Sección\s*\d+\s*:\s*/i, '')}</h2>
                {pp.ayuda && <p className="mt-1 text-ink-muted">{pp.ayuda}</p>}
              </header>
            )}

            {pp.preguntas.map((p) => {
              const k = `p_${p.id}`;
              const hayError = errores.has(p.id);
              const lista = respondidas.has(p.id);
              return (
                <fieldset key={p.id} id={`preg-${p.id}`} className={`card scroll-mt-40 p-5 transition-shadow duration-300 sm:p-6 ${hayError ? 'ring-2 ring-coral' : lista ? 'ring-1 ring-teal-600/25' : ''}`} aria-describedby={hayError ? `err-${p.id}` : undefined}>
                  <legend className="sr-only">{p.texto}</legend>
                  <div className="flex items-start gap-3" aria-hidden="true">
                    <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors duration-300 ${lista ? 'bg-teal-600 text-paper' : 'bg-sand text-ink-muted'}`}>
                      {lista ? '✓' : numero.get(p.id)}
                    </span>
                    <div className="min-w-0">
                      <p className="font-semibold text-ink">{p.texto} {p.obligatoria && <span className="text-coral" title="Obligatoria">*</span>}</p>
                      {p.ayuda && <p className="mt-1 text-sm text-ink-muted">{p.ayuda}</p>}
                    </div>
                  </div>

                  <div className="mt-4 sm:pl-10">
                    {(p.tipo === 'unica' || p.tipo === 'multiple') && (
                      <div className="space-y-2">
                        {[...p.opciones, ...(p.otro ? [OTRO] : [])].map((o) => (
                          <label key={o} className="flex min-h-[48px] cursor-pointer items-center gap-3 rounded-xl border border-line bg-white px-4 py-2.5 transition-colors duration-200 hover:border-teal-600 has-[:checked]:border-teal-600 has-[:checked]:bg-teal-600/5 has-[:checked]:font-medium has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-coral">
                            <input type={p.tipo === 'unica' ? 'radio' : 'checkbox'} name={k} value={o} className="h-4 w-4 shrink-0 accent-[#2E7D74]"
                              onChange={(e) => {
                                if (o === OTRO) setOtros((s) => ({ ...s, [p.id]: e.target.checked }));
                                else if (p.tipo === 'unica') setOtros((s) => ({ ...s, [p.id]: false }));
                              }} />
                            <span>{o === OTRO ? p.otroEtiqueta || 'Otro' : o}</span>
                          </label>
                        ))}
                        {p.otro && (
                          <input type="text" name={`${k}_otro`} maxLength={300} placeholder="¿Cuál?" aria-label={`${p.otroEtiqueta || 'Otro'}: especifique`}
                            className={`field ${otros[p.id] ? '' : 'hidden'}`} />
                        )}
                      </div>
                    )}

                    {(p.tipo === 'escala' || p.tipo === 'nps') && (
                      <div>
                        <div className={`grid gap-2 ${COLS[p.maximo - p.minimo + 1] ?? 'grid-cols-5'}`}>
                          {Array.from({ length: p.maximo - p.minimo + 1 }, (_, i2) => p.minimo + i2).map((n) => (
                            <label key={n} className="flex min-h-[48px] cursor-pointer items-center justify-center rounded-xl border border-line bg-white text-lg font-semibold text-ink transition-all duration-200 hover:-translate-y-0.5 hover:border-teal-600 has-[:checked]:-translate-y-0.5 has-[:checked]:border-ink has-[:checked]:bg-ink has-[:checked]:text-paper has-[:checked]:shadow-md has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-coral motion-reduce:transform-none">
                              <input type="radio" name={k} value={n} className="sr-only" aria-label={`${n}`} />
                              {n}
                            </label>
                          ))}
                        </div>
                        {(p.etiquetaMin || p.etiquetaMax) && (
                          <div className="mt-2 flex justify-between gap-4 text-xs text-ink-muted">
                            <span>{p.minimo} = {p.etiquetaMin}</span>
                            <span className="text-right">{p.maximo} = {p.etiquetaMax}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {p.tipo === 'texto' && <input type="text" name={k} maxLength={300} className="field" aria-label={p.texto} />}
                    {p.tipo === 'parrafo' && <textarea name={k} rows={4} maxLength={4000} className="field" aria-label={p.texto} placeholder="Escriba aquí su respuesta (opcional)" />}
                  </div>

                  {hayError && <p id={`err-${p.id}`} role="alert" className="mt-3 text-sm font-medium text-coral-dark sm:pl-10">Esta pregunta es obligatoria.</p>}
                </fieldset>
              );
            })}

            {/* en el último paso: certificado y envío */}
            {i === pasos.length - 1 && certificado && (
              <div id="bloque-cert" className={`card border-teal-600/30 bg-sand/30 p-5 sm:p-6 ${errCert ? 'ring-2 ring-coral' : ''}`}>
                <label className="flex min-h-[44px] cursor-pointer items-start gap-3">
                  <input type="checkbox" name="cert_quiero" checked={quiereCert} onChange={(e) => setQuiereCert(e.target.checked)} className="mt-1 h-5 w-5 accent-[#2E7D74]" />
                  <span>
                    <span className="font-semibold text-ink">Quiero recibir mi certificado de asistencia</span>
                    <span className="mt-1 block text-sm text-ink-muted">
                      {conInscripcion
                        ? 'Use el mismo nombre y correo con los que se inscribió: así le llega el certificado por correo en el momento.'
                        : 'Lo enviaremos por correo electrónico una vez validada su asistencia.'}
                    </span>
                  </span>
                </label>
                <div className={`mt-4 grid gap-4 sm:grid-cols-2 ${quiereCert ? '' : 'hidden'}`}>
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
                  <p className="text-xs text-ink-muted sm:col-span-2">Sus datos se guardan por separado de sus respuestas y solo se usan para validar su inscripción y enviarle el certificado. Sus respuestas serán tratadas de forma confidencial.</p>
                </div>
                {errCert && <p role="alert" className="mt-3 text-sm font-medium text-coral-dark">{errCert}</p>}
              </div>
            )}
          </section>
        ))}

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-6">
          {paso > 0 ? (
            <button type="button" onClick={() => irA(paso - 1)} className="btn-ghost min-h-[48px] px-6">← Anterior</button>
          ) : <span />}
          {ultimo ? (
            <button type="submit" disabled={enviando || previa} className="btn-coral min-h-[52px] px-8 text-base shadow-md transition-transform hover:-translate-y-0.5 disabled:opacity-60 motion-reduce:transform-none">
              {previa ? 'Vista previa: no se envía' : enviando ? 'Enviando…' : 'Enviar respuestas'}
            </button>
          ) : (
            <button type="button" onClick={siguiente} className="btn-coral min-h-[52px] px-8 text-base shadow-md transition-transform hover:-translate-y-0.5 motion-reduce:transform-none">Siguiente →</button>
          )}
        </div>
        {errores.size > 0 && <p role="alert" className="mt-3 text-right text-sm font-medium text-coral-dark">{errores.size === 1 ? 'Falta una respuesta obligatoria' : `Faltan ${errores.size} respuestas obligatorias`}: están marcadas arriba.</p>}
        <p className="mt-3 text-xs text-ink-muted">Las preguntas con <span className="text-coral">*</span> son obligatorias. Sus respuestas se guardan en este dispositivo hasta que las envíe.</p>
      </form>
    </div>
  );
}
