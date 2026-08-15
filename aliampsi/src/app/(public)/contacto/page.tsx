import { getSettings, waLink } from '@/lib/settings';

export const metadata = { title: 'Contacto' };
export const dynamic = 'force-dynamic';

export default async function ContactoPage() {
  const s = await getSettings();
  const wa = waLink(s.whatsapp);
  const socials = [
    { href: s.instagram, label: 'Instagram' },
    { href: s.facebook, label: 'Facebook' },
    { href: s.youtube, label: 'YouTube' },
    { href: s.linkedin, label: 'LinkedIn' },
  ].filter((x) => x.href);

  return (
    <section className="wrap grid gap-12 py-16 lg:grid-cols-2 lg:py-20">
      <div>
        <p className="eyebrow"><span className="text-coral">·</span> Contacto</p>
        <h1 className="mt-4 text-4xl font-extrabold sm:text-5xl">{s.contactTitle}</h1>
        <p className="mt-4 text-lg text-ink-muted">{s.contactText}</p>

        <div className="mt-8 space-y-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-teal-600">Correo</p>
            <a href={`mailto:${s.contactEmail}`} className="font-display text-2xl font-bold text-ink hover:text-coral">
              {s.contactEmail}
            </a>
          </div>
          {wa && (
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-teal-600">WhatsApp</p>
              <a href={wa} target="_blank" rel="noreferrer" className="font-display text-xl font-bold text-ink hover:text-coral">
                {s.whatsapp}
              </a>
            </div>
          )}
          {socials.length > 0 && (
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-teal-600">Redes</p>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-sm">
                {socials.map((x, i) => (
                  <span key={x.label} className="flex items-center gap-3">
                    {i > 0 && <span className="text-line">·</span>}
                    <a href={x.href} target="_blank" rel="noreferrer" className="hover:text-coral">{x.label}</a>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <form
        action={`https://formsubmit.co/${s.contactEmail}`}
        method="POST"
        className="card space-y-4 p-6"
      >
        <div>
          <label className="field-label" htmlFor="nombre">Nombre y apellido</label>
          <input id="nombre" name="nombre" required className="field" placeholder="Tu nombre" />
        </div>
        <div>
          <label className="field-label" htmlFor="institucion">Institución / asociación</label>
          <input id="institucion" name="institucion" className="field" placeholder="Nombre de la institución" />
        </div>
        <div>
          <label className="field-label" htmlFor="email">Correo electrónico</label>
          <input id="email" name="email" type="email" required className="field" placeholder="tu@correo.com" />
        </div>
        <div>
          <label className="field-label" htmlFor="mensaje">Mensaje</label>
          <textarea id="mensaje" name="mensaje" rows={5} required className="field" placeholder="Contanos en qué podemos ayudarte" />
        </div>
        <button type="submit" className="btn-coral w-full">Enviar mensaje</button>
        <p className="text-center text-xs text-ink-muted">
          El formulario usa un servicio externo de reenvío de correo. Podés reemplazarlo por tu
          propio backend si lo preferís.
        </p>
      </form>
    </section>
  );
}
