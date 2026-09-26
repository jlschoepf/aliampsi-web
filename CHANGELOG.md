# Registro de cambios — aliampsi.com

Numeración: `vAAAA.MM.DD-N` (fecha del despliegue y número correlativo).
La versión vigente vive en `aliampsi/src/lib/version.ts`, junto al historial que se muestra en el panel.

## v2026.09.26-90 — 26/9/2026
- **Arreglo:** `unstable_cache` serializa a JSON, así que en cada acierto de caché los campos `DateTime` llegaban como strings. `sortForList` llamaba `.getTime()` sobre ellos y rompía `/noticias`, `/publicaciones` y `/congresos` de forma intermitente (fallaba en cada lectura cacheada dentro de la ventana de 60 s; la primera lectura, fresca, funcionaba).
- `cachear()` ahora revive las fechas ISO a `Date` en un solo lugar (`lib/cache.ts`), para todas las consultas cacheadas.
- Defensa extra en `lib/content.ts`: `sortForList` e `isVisibleNow` aceptan fecha o string.
- Historial de versiones visible en el tablero del panel.

## v2026.09.24-89 — 24/9/2026
- Caché de consultas públicas (`unstable_cache`, 60 s, etiqueta `contenido-publico`) en menú, ajustes, portada, listados, asociaciones y Comisión Directiva. Invalidación con `revalidateTag` desde las acciones del panel. Motivo: el consumo de cómputo de Neon que dejó el sitio caído.

## v2026.09.24-87 / 88 — 24/9/2026
- Tablero del panel reescrito (estado del contenido por tipo, envíos, participación de la red).
- `@vercel/analytics` instalado.

## v2026.08.31-86 — 31/8/2026
- Build endurecido: `prisma db push` tolerante a fallos y seeds externos fuera del build.

## v2026.08.31-85 — 31/8/2026
- Orden manual de publicaciones (campo `order`). Revertido durante el incidente de la base; pendiente de reaplicar.

## v2026.08.31-84 — 31/8/2026
- Enlace (slug) editable en noticias, con vista previa y aviso si la noticia ya está publicada.
