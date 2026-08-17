'use client';

import { useState } from 'react';

// Web3Forms (plan gratuito) solo acepta envíos hechos desde el navegador,
// por eso la prueba se dispara desde acá y no desde el servidor.
export function AvisoPrueba({
  provider,
  apiKey,
  destino,
  registrar,
  probarServidor,
}: {
  provider: string;
  apiKey: string;
  destino: string;
  registrar: (ok: boolean, detalle: string) => Promise<void>;
  probarServidor: () => Promise<void>;
}) {
  const [estado, setEstado] = useState<{ ok: boolean; detalle: string } | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function probar() {
    setEnviando(true);
    setEstado(null);
    try {
      if (provider === 'web3forms') {
        if (!apiKey) {
          const r = { ok: false, detalle: 'Falta la clave de Web3Forms. Pegala arriba y guardá.' };
          setEstado(r);
          await registrar(r.ok, r.detalle);
          return;
        }
        const res = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({
            access_key: apiKey,
            subject: 'Prueba de avisos — sitio AL·IAM·PSI',
            from_name: 'Sitio AL·IAM·PSI',
            message:
              'Este es un correo de prueba enviado desde el panel de administración para verificar los avisos de nuevos envíos.',
          }),
        });
        const data = (await res.json().catch(() => null)) as { success?: boolean; message?: string } | null;
        const ok = !!(res.ok && data?.success);
        const detalle = ok
          ? `Correo enviado correctamente a la casilla registrada en Web3Forms (${destino}). Revisá también spam.`
          : `Web3Forms respondió ${res.status}: ${data?.message || 'sin detalle'}`;
        setEstado({ ok, detalle });
        await registrar(ok, detalle);
        return;
      }

      // Resend u otros: el envío sí se hace desde el servidor.
      await probarServidor();
    } catch (e) {
      const detalle = `No se pudo conectar con el servicio: ${(e as Error).message}`;
      setEstado({ ok: false, detalle });
      await registrar(false, detalle);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="space-y-3">
      {estado && (
        <div
          className={`rounded-lg border px-4 py-3 text-sm ${
            estado.ok
              ? 'border-teal-600/30 bg-teal-600/5 text-teal-700'
              : 'border-coral/40 bg-coral/10 text-coral-dark'
          }`}
        >
          <p className="font-semibold">{estado.ok ? 'Prueba enviada correctamente' : 'No se pudo enviar'}</p>
          <p className="mt-1 text-ink-muted">{estado.detalle}</p>
        </div>
      )}
      <button type="button" onClick={probar} disabled={enviando} className="btn-primary disabled:opacity-60">
        {enviando ? 'Enviando…' : 'Enviar correo de prueba'}
      </button>
    </div>
  );
}
