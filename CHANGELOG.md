# Registro de cambios — aliampsi.com

Numeración: `vAAAA.MM.DD-N` (fecha del despliegue y número correlativo).
La versión vigente vive en `aliampsi/src/lib/version.ts`, junto al historial que se muestra en el panel.

## v2026.10.09-127 — 9/10/2026
- Resultados: sección `#claude` con solapas (`?vista=texto|graficas`); componente `resultados/Graficas.tsx` y `BotonEnviar` (useFormStatus).
- Placa 3 (temas que quieren tratar: `TextosPlaca.temas`, a partir de las respuestas abiertas) y gráficas adicionales `TextosPlaca.extras` (tipos barras, reparto, distribucion, lista) en `/placa/x-<id>`; acciones `crearGraficaPregunta`, `crearGraficaClaude`, `borrarGrafica`. `prepararPlacas` conserva las extras.

## v2026.10.09-126 — 9/10/2026
- Placas de resultados (PNG 1080×1350): `GET /admin/encuestas/[id]/placa/[1|2]` (`?descargar=1`), dibujadas con `next/og` en `lib/placa-imagen.tsx`; datos en `lib/placa.ts` (números de las respuestas; textos breves de Claude en `Encuesta.analisisPlaca`, acción `prepararPlacas`). Logos en `certificados-assets/placa-logo*.png`.

## v2026.10.09-125 — 9/10/2026
- `analizarConClaude`: `max_tokens` 6000 y `thinking: between_tools` (el modelo no acepta `disabled`) (la respuesta volvía sin bloques de texto y se guardaba un análisis vacío con `?ia=ok`); si no hay texto, error con `stop_reason`.

## v2026.10.08-124 — 8/10/2026
- Cola de correos por cupo agotado (Resend 429): `lib/cola-correos.ts` (`procesarCola`, reserva por `updateMany` para no duplicar), `esCupo`/`EN_COLA` en `lib/correo.ts`; `enviarSolicitud` deja `EN_COLA` en vez del error; `enviarValidados` encola el resto al primer 429; recordatorios pendientes en `Encuesta.colaRecordatorio` (tandas de 10).
- `GET /api/cron/correos` (maxDuration 60), llamado cada hora por `.github/workflows/cola-correos.yml` y una vez por día por el cron de Vercel (`aliampsi/vercel.json`).
- Panel: aviso de cola con «Probar ahora» (`reintentarCola`) en Certificados y con «Cancelar» (`cancelarColaRecordatorio`) en Seguimiento; etiqueta «En cola» en la lista de destinatarios.

## v2026.10.08-123 — 8/10/2026
- `analizarConClaude`: modelo por defecto `claude-sonnet-5-5` (sobrescribible con `ANTHROPIC_MODEL`); `maxDuration = 60` en `/admin/encuestas/[id]/resultados`; aviso de sin clave menciona volver a publicar.

## v2026.10.07-122 — 7/10/2026
- Seguimiento de certificados (`/admin/encuestas/[id]/seguimiento`): cruce inscriptos × solicitudes (`lib/seguimiento.ts`, por correo o nombre), contadores, lista con casillas, recordatorio editable con `{nombre}`/`{enlace}`, prueba, envío por lote con Resend (`enviarLote`, `/emails/batch`) y registro en `Encuesta.recordatorios`.

## v2026.10.05-121 — 5/10/2026
- Tarjetas de noticias, congresos y publicaciones en `aspect-[4/3]`. `Portada` automático: llena entre 1,2 y 1,55; fuera de ese rango, entera con fondo desenfocado. `ImageField.aspectoInicial` (CoverField: 4:3).

## v2026.10.05-120 — 5/10/2026
- `ImageField`: formato «Original (sin recortar)» (sube el archivo tal cual); se preselecciona cuando la imagen es vertical o cuadrada (<1.25).

## v2026.10.05-119 — 5/10/2026
- `Portada` (client): detecta la proporción; verticales/cuadradas (<1.25) enteras sobre la misma imagen desenfocada; horizontales con `object-position` según el encuadre. Variante detalle: horizontal sin recorte, vertical en caja de alto máximo.
- `coverFit` (auto|top|center|bottom|contain) y `coverEnCuerpo` en Noticia, Congreso y Publicacion; selector y casilla en los tres formularios.

## v2026.10.05-118 — 5/10/2026
- `/admin/firma`: firma de correo de Johann (`lib/firma.ts`, HTML en tablas con estilos en línea), logo en `public/firma/`, copia con formato (ClipboardItem) o como código.

## v2026.10.04-117 — 4/10/2026
- Modelo `Video`, sección `/admin/videos` (alta por enlace con título automático vía oEmbed, edición, visibilidad, orden con flechas, baja) y `PanelVideos` en la portada (reproductor principal diferido + lista), después de «¿Qué es AL·IAM·PSI?».

## v2026.10.04-116 — 4/10/2026
- Selector de encuestas del editor alineado a la derecha del botón (no se corta).

## v2026.10.04-115 — 4/10/2026
- Editor: nodo `encuesta` (`editor/encuesta.ts`) con vista de tarjeta (título y estado), selector desde la barra («📋 Encuesta») alimentado por `/api/admin/encuestas`. Se guarda como `<p data-encuesta>[encuesta:slug]</p>`, compatible con `partirContenido`. Los códigos viejos se ven como tarjeta.

## v2026.10.04-114 — 4/10/2026
- Carga de inscriptos por archivo (`archivo-actions.ts`, `CampoInscriptos`): CSV/texto, Excel (xlsx, todas las hojas) y PDF (unpdf), reemplazar o agregar. `serverActions.bodySizeLimit` 10 MB.
- `leerInscriptos`: une nombre y apellido en columnas separadas sin duplicar; en texto libre descarta líneas sin correo cuando la mayoría lo tiene y limpia signos sueltos.

## v2026.10.04-113 — 4/10/2026
- Correo del certificado (automático y el de Gmail): invitación a compartirlo en redes y mencionar a AL·IAM·PSI en LinkedIn.

## v2026.10.04-112 — 4/10/2026
- Encuestas: se quita «anónima» del aviso del certificado y de las plantillas; se dice que las respuestas se tratan de forma confidencial.

## v2026.10.04-111 — 4/10/2026
- Piezas del webinar v4 (portada, redes) y banner v5: Johann con foto institucional en medallón, como Nora y Federico.

## v2026.10.04-110 — 4/10/2026
- Fondo del banner v4: notebook más chica y a la derecha (desde ~62% del ancho), fuera de la zona del texto.

## v2026.10.04-109 — 4/10/2026
- Piezas del webinar v3: celdas de Nora y Federico con su retrato de la placa (medallón) y nombre en franja inferior; Johann con su cámara y franja.

## v2026.10.04-108 — 4/10/2026
- `public/noticias/`: portada v2 (nombre nuevo para evitar la caché de imágenes optimizadas), fondo del banner y modelo del certificado (firma difuminada, cinta MODELO).

## v2026.10.04-107 — 4/10/2026
- Editor: nodo `video` (`src/components/editor/video.ts`) con vista de reproductor, pegado de enlaces o `<iframe>` de YouTube/Vimeo, botón 🎬 y conversión de los párrafos que solo tenían el enlace (`prepararHtml`). Se guarda como `<iframe>` con la dirección limpia (sin `?si=`), que `NoticiaBody` ya muestra.

## v2026.10.04-106 — 4/10/2026
- `Congreso.order` (0 = por fecha), `moveCongreso` / `resetOrdenCongresos` con `sortForList`, flechas y aviso en el panel; la portada toma los 3 primeros con ese orden.
- Portadas: `movePortada` y flechas en la galería (el orden en que se ofrecen al elegir portada).

## v2026.10.04-105 — 4/10/2026
- Portada y pieza de redes de la noticia del webinar rehechas: notebook con videollamada (interfaz genérica, sin marcas de terceros).

## v2026.10.03-104 — 3/10/2026
- `CoverField`: se habilita el campo de dirección del `ImageField` (antes `showUrlInput={false}`).

## v2026.10.03-103 — 3/10/2026
- `public/noticias/`: portada (1600×900) y pieza de redes (1080×1350) de la noticia del webinar.

## v2026.10.03-102 — 3/10/2026
- `Encuesta.certModo` (manual | inscriptos | todos; `modoCert()` respeta el `certAuto` anterior) y `Encuesta.inscriptos` (JSON `{nombre, correo}`).
- `lib/inscriptos.ts`: lectura del CSV de Luma/Zoom (por encabezados) o de una persona por línea, sin repetidos; `coincide()` por correo exacto o por nombre (sin tildes, títulos ni conectores, en cualquier orden, exige al menos dos palabras; subconjunto admitido).
- Al completar la encuesta: si coincide, el pedido nace «validada» con el motivo y se envía en el momento; si no, queda «pendiente» con «No coincide con la lista de inscriptos». Gracias con mensaje propio para ese caso.
- Editor: modo de envío, lista de inscriptos con conteo, texto del correo de aviso que enlaza a la noticia que contiene la encuesta (si existe).

## v2026.10.03-101 — 3/10/2026
- `Encuesta.codigoAcceso`: código común (vacío = abierta). Pantalla de ingreso (`CodigoAcceso`, `useFormState`) en la página de la encuesta y en la insertada en noticias; `verificarCodigo` compara normalizado (sin mayúsculas, espacios ni guiones), frena intentos fallidos y guarda en una cookie httpOnly una firma SHA-256 (no el código), que se invalida si el código cambia. `enviarRespuesta` rechaza envíos sin la firma válida.
- Editor: campo con generador (6 caracteres sin ambiguos) y texto de correo para los asistentes. `crearNoticiaConEncuesta` menciona el código si existe.

## v2026.10.03-100 — 3/10/2026
- Encuestas insertadas en noticias: `partirContenido()` corta el texto en cada `[encuesta:slug]` (suelto o dentro de `<p>`), y la página de la noticia muestra `EncuestaEmbebida` en ese lugar (oculta al público si está en borrador, vista previa para administradores, aviso si está cerrada o el código no existe). `maxDuration` en la página de la noticia por el envío de certificados.
- Editor de encuesta: código para copiar y acción `crearNoticiaConEncuesta` (noticia en borrador con intro, código insertado y portada de la encuesta).

## v2026.10.03-99 — 3/10/2026
- Envío de certificados por correo con Resend (`lib/correo.ts`: adjunto PDF, toma la config de Ajustes o `RESEND_API_KEY`/`RESEND_FROM`). `lib/certificados-envio.ts` genera y envía, y registra resultado.
- `Encuesta.certAuto`: envío automático al completar la encuesta (sin validación). Sin duplicados: si el correo ya recibió el certificado de esa encuesta, no se reenvía.
- `SolicitudCertificado.enviadoEn` (solo el día, para no cruzarlo con las respuestas) y `detalle` (último error).
- Panel: estado de la configuración de correo, «Enviarme un certificado de prueba», «Enviar por correo»/«Reenviar» por fila y «Enviar a los validados» (de a 15 por vez).
- `outputFileTracingIncludes` pasa a `'/**'` para que la firma y las tipografías estén en todas las funciones que generan certificados. `maxDuration` en las páginas que generan y envían.

## v2026.10.03-98 — 3/10/2026
- Botón Publicar/Cerrar/Reabrir en el listado y el editor de encuestas. El estado «abierta» se muestra como «Publicada». Al publicar sin respuestas, si la dirección termina en -N y la limpia está libre, se usa la limpia.

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
