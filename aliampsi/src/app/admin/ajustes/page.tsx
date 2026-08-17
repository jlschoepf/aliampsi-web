import { AdminHeader, Field, TextArea, SubmitButton } from '@/components/admin-ui';
import { ImageField } from '@/components/ImageField';
import { getSettings } from '@/lib/settings';
import { updateSettings, probarAviso } from './actions';
import { formatDate } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function AjustesPage({ searchParams }: { searchParams: { ok?: string; prueba?: string } }) {
  const s = await getSettings();
  const destinoAvisos = s.notifyEmail || s.contactEmail;
  const estadoAviso = s.notifyStatus || '';
  const estadoOk = estadoAviso.startsWith('ok|');
  const estadoDetalle = estadoAviso.includes('|') ? estadoAviso.split('|').slice(1).join('|') : estadoAviso;

  return (
    <>
      <AdminHeader title="Ajustes" subtitle="Datos de contacto, redes y textos que aparecen en el sitio." />

      {searchParams?.ok && (
        <div className="mb-6 rounded-lg bg-teal-600/10 px-4 py-3 text-sm font-medium text-teal-700">
          Cambios guardados.
        </div>
      )}

      <form action={updateSettings} className="card space-y-6 p-6">
        <div>
          <h2 className="font-display text-lg font-bold text-ink">Página de contacto</h2>
          <p className="text-sm text-ink-muted">El título y el texto que se muestran arriba en «Contacto».</p>
        </div>
        <Field label="Título" name="contactTitle" defaultValue={s.contactTitle} />
        <TextArea label="Texto" name="contactText" rows={3} defaultValue={s.contactText} />

        <div className="border-t border-line pt-6">
          <h2 className="font-display text-lg font-bold text-ink">Datos de contacto</h2>
          <p className="text-sm text-ink-muted">Se usan en Contacto y en el pie del sitio.</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Correo electrónico" name="contactEmail" type="email" defaultValue={s.contactEmail} hint="También es a donde llega el formulario." />
          <Field label="WhatsApp" name="whatsapp" defaultValue={s.whatsapp} hint="Ej: +54 9 11 5043-7954. El enlace se arma solo." />
        </div>

        <div className="border-t border-line pt-6">
          <h2 className="font-display text-lg font-bold text-ink">Redes sociales</h2>
          <p className="text-sm text-ink-muted">Pegá el enlace completo. Dejá vacío para ocultar una red.</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Instagram" name="instagram" type="url" defaultValue={s.instagram} placeholder="https://instagram.com/…" />
          <Field label="Facebook" name="facebook" type="url" defaultValue={s.facebook} placeholder="https://facebook.com/…" />
          <Field label="YouTube" name="youtube" type="url" defaultValue={s.youtube} placeholder="https://youtube.com/…" />
          <Field label="LinkedIn" name="linkedin" type="url" defaultValue={s.linkedin} placeholder="https://linkedin.com/…" />
        </div>

        <div className="border-t border-line pt-6">
          <h2 className="font-display text-lg font-bold text-ink">Pie del sitio</h2>
          <p className="text-sm text-ink-muted">El texto que aparece bajo el logo, en el pie de todas las páginas.</p>
        </div>
        <TextArea label="Texto del pie" name="footerText" rows={3} defaultValue={s.footerText} />

        <div className="border-t border-line pt-6">
          <h2 className="font-display text-lg font-bold text-ink">Quiénes somos</h2>
          <p className="text-sm text-ink-muted">Los textos de la página «Quiénes somos». (La línea de tiempo se edita en «Historia».)</p>
        </div>
        <Field label="Título" name="qsTitle" defaultValue={s.qsTitle} />
        <TextArea label="Introducción" name="qsIntro" rows={3} defaultValue={s.qsIntro} />
        <div className="grid gap-5 sm:grid-cols-2">
          <TextArea label="Nuestra misión" name="qsMision" rows={4} defaultValue={s.qsMision} />
          <TextArea label="Nuestro compromiso" name="qsCompromiso" rows={4} defaultValue={s.qsCompromiso} />
        </div>

        <div className="rounded-lg border border-line bg-sand/30 p-4">
          <p className="mb-4 text-sm font-semibold text-ink">Pilares (las 3 tarjetas)</p>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Pilar 1 — título" name="qsPilar1Title" defaultValue={s.qsPilar1Title} />
              <div className="sm:col-span-2"><Field label="Pilar 1 — texto" name="qsPilar1Text" defaultValue={s.qsPilar1Text} /></div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Pilar 2 — título" name="qsPilar2Title" defaultValue={s.qsPilar2Title} />
              <div className="sm:col-span-2"><Field label="Pilar 2 — texto" name="qsPilar2Text" defaultValue={s.qsPilar2Text} /></div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Pilar 3 — título" name="qsPilar3Title" defaultValue={s.qsPilar3Title} />
              <div className="sm:col-span-2"><Field label="Pilar 3 — texto" name="qsPilar3Text" defaultValue={s.qsPilar3Text} /></div>
            </div>
          </div>
        </div>

        <div className="border-t border-line pt-6">
          <h2 className="font-display text-lg font-bold text-ink">SEO y buscadores</h2>
          <p className="text-sm text-ink-muted">
            Cómo se ve tu sitio en Google y al compartirlo. Si dejás un campo vacío, se usan los valores por defecto.
          </p>
        </div>
        <Field
          label="Título por defecto"
          name="seoTitle"
          defaultValue={s.seoTitle}
          placeholder="AL·IAM·PSI — Alianza Iberoamericana de Psiquiatría Infantojuvenil"
          hint="El título general del sitio (pestaña del navegador y buscadores)."
        />
        <TextArea
          label="Descripción por defecto"
          name="seoDescription"
          rows={2}
          defaultValue={s.seoDescription}
          hint="El texto que aparece bajo el título en Google (ideal: 120–160 caracteres)."
        />
        <ImageField
          label="Imagen para compartir (por defecto)"
          name="seoImage"
          defaultValue={s.seoImage}
          hint="Se muestra al compartir el sitio en WhatsApp, Facebook o LinkedIn. Ideal horizontal 1200×630."
        />

        <div id="avisos" className="rounded-lg border border-line bg-sand/30 p-4">
          <p className="mb-1 text-sm font-semibold text-ink">Avisos de envíos</p>
          <p className="mb-4 text-xs text-ink-muted">
            Cuando una asociación envía contenido desde el formulario público, mandamos un correo a esta casilla.
            Guardá el correo y después probalo con el botón que está debajo del formulario.
          </p>
          <Field
            label="Correo para avisos"
            name="notifyEmail"
            type="email"
            defaultValue={s.notifyEmail}
            placeholder="avisos@aliampsi.com"
            hint="Si lo dejás vacío, se usa el correo de contacto del sitio."
          />
        </div>

        <div className="rounded-lg border border-line bg-sand/30 p-4">
          <p className="mb-1 text-sm font-semibold text-ink">Conexión con Google</p>
          <p className="mb-4 text-xs text-ink-muted">
            Para verificar el sitio en Search Console y medir visitas con Analytics.
          </p>
          <div className="space-y-4">
            <Field
              label="Verificación de Google Search Console"
              name="gscVerification"
              defaultValue={s.gscVerification}
              placeholder="Ej: AbCdEf123... (solo el código)"
              hint="En Search Console elegí «Etiqueta HTML» y pegá acá solo el valor content del meta google-site-verification."
            />
            <Field
              label="ID de Google Analytics"
              name="gaId"
              defaultValue={s.gaId}
              placeholder="G-XXXXXXXXXX"
              hint="El identificador de medición de Google Analytics 4 (empieza con G-). Dejá vacío para no medir."
            />
          </div>
        </div>

        <div className="pt-2">
          <SubmitButton>Guardar ajustes</SubmitButton>
        </div>
      </form>

      {/* Verificación del correo de avisos (fuera del formulario principal) */}
      <div className="card mt-6 space-y-4 p-6">
        <div>
          <h2 className="font-display text-lg font-bold text-ink">Probar los avisos por correo</h2>
          <p className="mt-1 text-sm text-ink-muted">
            Envía un correo de prueba a <strong>{destinoAvisos || 'ninguna casilla configurada'}</strong> y te muestra
            el resultado acá mismo.
          </p>
        </div>

        {searchParams?.prueba === 'ok' && (
          <p className="rounded-lg bg-teal-600/10 px-4 py-3 text-sm font-medium text-teal-700">
            Prueba enviada. Revisá la casilla (y la carpeta de spam).
          </p>
        )}
        {searchParams?.prueba === 'error' && (
          <p className="rounded-lg border border-coral/40 bg-coral/10 px-4 py-3 text-sm font-medium text-coral-dark">
            No se pudo enviar. Mirá el detalle debajo.
          </p>
        )}

        {estadoAviso && (
          <div className={`rounded-lg border px-4 py-3 text-sm ${estadoOk ? 'border-teal-600/30 bg-teal-600/5 text-teal-700' : 'border-coral/40 bg-coral/10 text-coral-dark'}`}>
            <p className="font-semibold">
              Último intento: {estadoOk ? 'correcto' : 'con error'}
              {s.notifyAt ? ` · ${formatDate(s.notifyAt)}` : ''}
            </p>
            <p className="mt-1 text-ink-muted">{estadoDetalle}</p>
          </div>
        )}

        <form action={probarAviso}>
          <SubmitButton>Enviar correo de prueba</SubmitButton>
        </form>

        <div className="rounded-lg bg-sand/40 p-4 text-xs text-ink-muted">
          <p className="mb-1 font-semibold text-ink">Si no llega el correo</p>
          <p>
            Usamos FormSubmit, un servicio gratuito que exige <strong>confirmar la casilla la primera vez</strong>:
            fijate si recibiste un correo de activación de FormSubmit (revisá spam) y confirmalo. Después volvé a
            probar. Para envíos más confiables y con remitente propio, se puede conectar Resend cargando la clave
            RESEND_API_KEY.
          </p>
        </div>
      </div>
    </>
  );
}
