import { AdminHeader } from '@/components/admin-ui';
import { FIRMA_JOHANN, firmaHtml } from '@/lib/firma';
import { CopiarFirma } from './CopiarFirma';

export default function FirmaCorreo() {
  const html = firmaHtml(FIRMA_JOHANN);
  const texto = `${FIRMA_JOHANN.nombre}\n${FIRMA_JOHANN.cargo}\nAlianza Iberoamericana de Psiquiatría Infantojuvenil y Profesiones Afines\naliampsi.com · linkedin.com/company/aliampsi`;
  return (
    <>
      <AdminHeader title="Firma de correo" subtitle="La firma del Dr. Johann Schoepf con la identidad de la Alianza, lista para pegar en Gmail." />
      <div className="card mb-6 p-8">
        <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-ink-muted">Vista previa</p>
        <div className="rounded-lg border border-line bg-white p-6" dangerouslySetInnerHTML={{ __html: html }} />
      </div>
      <div className="card mb-6 p-6">
        <CopiarFirma html={html} texto={texto} />
      </div>
      <div className="card p-6 text-sm text-ink">
        <p className="font-semibold">Cómo ponerla en Gmail (cuenta aliampsi2021@gmail.com)</p>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-ink-muted">
          <li>Tocá «Copiar firma».</li>
          <li>En Gmail: el engranaje → «Ver toda la configuración» → pestaña «General» → sección «Firma».</li>
          <li>Editá la firma existente (o creá una nueva), borrá lo anterior y pegá.</li>
          <li>Debajo, en «Valores predeterminados de firma», elegila para mensajes nuevos y para respuestas.</li>
          <li>Bajá hasta el final y tocá «Guardar cambios».</li>
        </ol>
      </div>
    </>
  );
}
