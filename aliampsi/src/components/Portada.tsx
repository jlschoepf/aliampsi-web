'use client';

import { useEffect, useRef, useState } from 'react';

export type Encuadre = 'auto' | 'top' | 'center' | 'bottom' | 'contain';
const POS: Record<string, string> = { top: 'object-top', center: 'object-center', bottom: 'object-bottom' };

/**
 * Portada que se adapta al formato de la imagen. Las verticales o cuadradas (flyers) se ven ENTERAS,
 * con la misma imagen desenfocada de fondo, en lugar de quedar recortadas. Las horizontales llenan el
 * espacio con el encuadre elegido en el panel.
 * - variante «tarjeta»: alto fijo (lo da className, por ejemplo h-44).
 * - variante «detalle»: horizontal a ancho completo sin recorte; vertical en un recuadro de alto máximo.
 */
export function Portada({ src, alt, encuadre = 'auto', className = '', variante = 'tarjeta' }: {
  src: string; alt: string; encuadre?: string | null; className?: string; variante?: 'tarjeta' | 'detalle';
}) {
  const ref = useRef<HTMLImageElement>(null);
  const [proporcion, setProporcion] = useState<number | null>(null);
  const medir = () => { const im = ref.current; if (im && im.naturalWidth) setProporcion(im.naturalWidth / im.naturalHeight); };
  useEffect(() => { if (ref.current?.complete) medir(); }, [src]);

  const modo = (encuadre || 'auto') as Encuadre;
  // Las tarjetas son 4:3 (1,33). Llena el recuadro lo que está cerca de ese formato; lo vertical y lo muy
  // apaisado (por ejemplo, un diseño 16:9 con texto en los bordes) se muestra entero para no cortarlo.
  const entera = modo === 'contain' || (modo === 'auto' && proporcion !== null && (proporcion < 1.2 || proporcion > 1.55));

  if (variante === 'detalle' && !(modo === 'contain' || (proporcion !== null && proporcion < 1.2))) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img ref={ref} onLoad={medir} src={src} alt={alt} className={`w-full rounded-xl2 border border-line ${className}`} />;
  }

  const caja = variante === 'detalle' ? `h-[min(70vh,620px)] rounded-xl2 border border-line ${className}` : className;
  return (
    <div className={`relative w-full overflow-hidden ${caja}`}>
      {entera && (
        // fondo: la misma imagen, agrandada y desenfocada
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full scale-125 object-cover opacity-80 blur-2xl" />
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img ref={ref} onLoad={medir} src={src} alt={alt}
        className={`relative h-full w-full ${entera ? 'object-contain drop-shadow-xl' : `object-cover ${POS[modo] || 'object-center'}`}`} />
    </div>
  );
}
