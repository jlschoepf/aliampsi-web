'use client';

/**
 * Red de seguridad del sitio público.
 *
 * Si una página falla —por ejemplo, porque la base de datos no responde—, en
 * lugar del mensaje de error crudo del servidor se muestra esta página, que
 * mantiene la identidad institucional y ofrece una vía de contacto.
 */
export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="flex min-h-[70vh] items-center justify-center px-6 py-20">
      <div className="w-full max-w-lg text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">
          AL·IAM·PSI
        </p>

        <h1 className="mt-4 font-serif text-3xl italic leading-tight text-ink">
          Estamos teniendo un problema técnico
        </h1>

        <p className="mt-4 text-ink-muted">
          El sitio no puede mostrar este contenido en este momento. Es una falla
          temporal y ya estamos trabajando para resolverla.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button type="button" onClick={reset} className="btn-coral">
            Reintentar
          </button>
          <a
            href="/"
            className="rounded-full border border-line px-5 py-2.5 text-sm font-medium text-ink-muted transition-colors hover:bg-sand hover:text-ink"
          >
            Ir al inicio
          </a>
        </div>

        <p className="mt-10 text-sm text-ink-muted">
          Si necesitás comunicarte con la Alianza, escribinos a{' '}
          <a href="mailto:info@aliampsi.com" className="font-medium text-teal-700 underline">
            info@aliampsi.com
          </a>
          .
        </p>
      </div>
    </main>
  );
}
