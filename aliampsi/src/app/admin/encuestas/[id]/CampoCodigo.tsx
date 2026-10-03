'use client';
import { useState } from 'react';

// Sin letras ni números que se confunden al leerlos en un correo (O/0, I/1, L).
const ALFABETO = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const generar = () => Array.from(crypto.getRandomValues(new Uint32Array(6)), (n) => ALFABETO[n % ALFABETO.length]).join('');

export function CampoCodigo({ defaultValue }: { defaultValue: string }) {
  const [valor, setValor] = useState(defaultValue);
  return (
    <div>
      <label className="field-label" htmlFor="codigoAcceso">Código de acceso</label>
      <div className="flex flex-wrap gap-2">
        <input id="codigoAcceso" name="codigoAcceso" value={valor} onChange={(e) => setValor(e.target.value.toUpperCase())} maxLength={40}
          placeholder="Sin código: encuesta abierta" className="field max-w-xs font-semibold uppercase tracking-[0.15em]" autoComplete="off" />
        <button type="button" onClick={() => setValor(generar())} className="btn-ghost text-sm">Generar uno</button>
        {valor && <button type="button" onClick={() => setValor('')} className="text-sm text-ink-muted hover:text-ink">Quitar</button>}
      </div>
      <p className="mt-1 text-xs text-ink-muted">Si lo completás, solo puede responder quien lo ingrese. No distingue mayúsculas ni espacios. Guardá los cambios para que se aplique.</p>
    </div>
  );
}
