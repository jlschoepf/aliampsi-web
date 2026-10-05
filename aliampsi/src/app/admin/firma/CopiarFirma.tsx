'use client';
import { useState } from 'react';

/** Copia la firma con formato (para pegarla en Gmail) o, como respaldo, el código HTML. */
export function CopiarFirma({ html, texto }: { html: string; texto: string }) {
  const [estado, setEstado] = useState('');
  async function copiar(modo: 'formato' | 'codigo') {
    try {
      if (modo === 'formato' && 'ClipboardItem' in window) {
        await navigator.clipboard.write([new ClipboardItem({ 'text/html': new Blob([html], { type: 'text/html' }), 'text/plain': new Blob([texto], { type: 'text/plain' }) })]);
      } else {
        await navigator.clipboard.writeText(html);
      }
      setEstado(modo === 'formato' ? 'Firma copiada. Pegala en Gmail.' : 'Código HTML copiado.');
    } catch {
      setEstado('No se pudo copiar automáticamente: seleccioná la firma de arriba con el mouse y copiala.');
    }
    setTimeout(() => setEstado(''), 4000);
  }
  return (
    <div className="flex flex-wrap items-center gap-3">
      <button type="button" onClick={() => copiar('formato')} className="btn-primary">Copiar firma</button>
      <button type="button" onClick={() => copiar('codigo')} className="btn-ghost text-sm">Copiar código HTML</button>
      {estado && <span role="status" className="text-sm font-medium text-teal-700">{estado}</span>}
    </div>
  );
}
