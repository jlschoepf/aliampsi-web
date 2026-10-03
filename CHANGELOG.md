# Registro de cambios — aliampsi.com

Numeración: `vAAAA.MM.DD-N` (fecha del despliegue y número correlativo).
La versión vigente vive en `aliampsi/src/lib/version.ts`, junto al historial que se muestra en el panel.

## v2026.10.03-97 — 3/10/2026
- Formulario público rehecho: un paso por sección (`pasos()` en `lib/encuestas.ts`), barra de progreso fija bajo el encabezado (segmentos por paso, % respondido), tilde por pregunta respondida, validación por paso, borrador en `localStorage` (clave por encuesta, se borra al enviar), transición `paso-entra` respetando `prefers-reduced-motion`, duración estimada en la página.
- `Pregunta.otroEtiqueta`: texto configurable de la opción con campo libre; se usa en el formulario y en los resultados.
- Editor: «Cargar preguntas desde una plantilla» (acción `cargarPlantilla`) para aplicar cambios de plantilla a una encuesta ya creada.
- Plantilla del webinar (pedido de Johann): sin SPU; «Otra sociedad científica» con campo; «Maestro/a o docente» en formación de grado.

## v2026.10.03-96 — 3/10/2026
- Página pública de la encuesta: se quita el rótulo «Encuesta anónima» sobre el título.

## v2026.10.03-95 — 3/10/2026
- Portada de la encuesta del webinar: medallón de Melián recortado con el radio y el centro reales (145 px; antes 142, que cortaba el borde derecho).

## v2026.10.03-94 — 3/10/2026
- Encuesta: campo `portada` (ImageField en el editor; imagen arriba de la encuesta y en `og:image`). Plantilla del webinar con `/encuestas/portada-webinar-violencia-escolar.jpg`.
- **Certificados de asistencia.** `Encuesta.certificado`, `certActividad`, `certDetalle`; modelo `SolicitudCertificado` (nombre, correo, estado pendiente/validada/rechazada/enviada, fecha solo con el día) **sin relación con `RespuestaEncuesta`**, para no romper el anonimato.
- Público: bloque opcional al final de la encuesta (nombre como figura en el certificado + correo), validado en cliente y servidor.
- Panel `/admin/encuestas/[id]/certificados`: contadores por estado, validación manual o masiva pegando la lista de asistentes (Zoom/Luma; se extraen los correos), corrección del nombre, PDF individual o de todos los validados, correo redactado para Gmail, marcar enviado.
- `src/lib/certificado.ts` (pdf-lib + @pdf-lib/fontkit): mismo diseño que el certificado de expositores. Firma, logos y tipografías en `certificados-assets/` (no público), incluidos en la función con `outputFileTracingIncludes`.

## v2026.10.03-93 — 3/10/2026
- Escalas con rango configurable (`minimo` 0/1, `maximo` 2–10) en `Pregunta`; formulario, editor, resultados y texto para Claude usan el rango real. El NPS queda fijo en 0–10.
- Plantilla del webinar rehecha con la estructura de la «Encuesta Anónima de Satisfacción - SUPIA» (planilla de respuestas compartida por Diego): perfil, contenido y expositores (claridad/didáctica y dominio del tema por cada uno), organización, valoración general 1–10, abiertas y NPS. Opciones de las preguntas 11 y 12 supuestas (la planilla no tenía respuestas).
- Resultados: la tarjeta «Satisfacción general» toma la escala más amplia.

## v2026.10.03-92 — 3/10/2026
- **Módulo de encuestas.** Modelos `Encuesta` (preguntas en JSON, estado borrador/abierta/cerrada, análisis guardado) y `RespuestaEncuesta` (datos en JSON por id de pregunta).
- Público: `/encuestas/[slug]` con validación en el cliente y en el servidor, trampa anti-robots, cookie suave para no repetir en el mismo dispositivo, vista previa para administradores y página de gracias.
- Panel: `/admin/encuestas` (listado), `/new` (plantillas: webinar «Salud Mental y violencia escolar», satisfacción genérica, en blanco), editor de preguntas (7 tipos: sección, única, múltiple, escala 1–5, NPS 0–10, texto, párrafo), resultados con gráficos y NPS, exportación CSV (`;` + BOM para Excel en español).
- Análisis con Claude: acción de servidor contra la API de mensajes. Requiere `ANTHROPIC_API_KEY` en Vercel; modelo por defecto `claude-sonnet-5`, cambiable con `ANTHROPIC_MODEL`. Sin clave, el panel ofrece los resultados en texto para pegar en Claude.

## v2026.09.27-91 — 27/9/2026
- **Restaurado el orden manual** de publicaciones (revierte `eb136e2`, que lo había quitado durante el incidente de la base) y **agregado a noticias**: campo `order Int @default(0)` en `Noticia`, acciones `moveNoticia` / `resetOrdenNoticias`, flechas en el panel.
- `sortForList`: destacados primero, luego posición fijada (>0) ascendente, luego fecha descendente. El panel y las acciones usan la misma función, así lo que se ve al mover coincide con el sitio.
- La portada toma las 3 primeras noticias con ese mismo orden.
- Nota de base: al revertir el 14/9, `prisma db push` no pudo borrar `Publicacion.order` (tenía datos y el build no usa `--accept-data-loss`), así que la columna siguió en Neon y el push fallaba en cada build. Con el campo de vuelta en el esquema, esquema y base coinciden otra vez.

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
