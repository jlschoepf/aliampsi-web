import { AdminHeader, Field, TextArea, SubmitButton } from '@/components/admin-ui';
import { getSettings } from '@/lib/settings';
import { updateSettings } from './actions';

export const dynamic = 'force-dynamic';

export default async function AjustesPage({ searchParams }: { searchParams: { ok?: string } }) {
  const s = await getSettings();

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

        <div className="pt-2">
          <SubmitButton>Guardar ajustes</SubmitButton>
        </div>
      </form>
    </>
  );
}
