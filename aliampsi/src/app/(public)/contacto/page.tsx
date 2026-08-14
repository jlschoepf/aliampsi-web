export const metadata = { title: 'Contacto' };

export default function ContactoPage() {
  return (
    <section className="wrap grid gap-12 py-16 lg:grid-cols-2 lg:py-20">
      <div>
        <p className="eyebrow"><span className="text-coral">·</span> Contacto</p>
        <h1 className="mt-4 text-4xl font-extrabold sm:text-5xl">Sumate a la Alianza</h1>
        <p className="mt-4 text-lg text-ink-muted">
          Si representás una asociación de psiquiatría infantojuvenil y querés formar parte de
          AL·IAM·PSI, escribinos. También podés contactarnos por cualquier consulta.
        </p>

        <div className="mt-8 space-y-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-teal-600">Correo</p>
            <a href="mailto:info@aliampsi.com" className="font-display text-2xl font-bold text-ink hover:text-coral">
              info@aliampsi.com
            </a>
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-teal-600">WhatsApp</p>
            <a href="https://wa.me/5491150437954" target="_blank" rel="noreferrer" className="font-display text-xl font-bold text-ink hover:text-coral">
              +54 9 11 5043-7954
            </a>
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-teal-600">Redes</p>
            <div className="mt-1 flex flex-wrap gap-3 text-sm">
              <a href="https://www.instagram.com/aliampsi" target="_blank" rel="noreferrer" className="hover:text-coral">Instagram</a>
              <span className="text-line">·</span>
              <a href="https://facebook.com/aliampsi" target="_blank" rel="noreferrer" className="hover:text-coral">Facebook</a>
              <span className="text-line">·</span>
              <a href="https://www.youtube.com/channel/UCjGLu6VjxUikSSVq2lUmreQ" target="_blank" rel="noreferrer" className="hover:text-coral">YouTube</a>
              <span className="text-line">·</span>
              <a href="https://linkedin.com/company/aliampsi" target="_blank" rel="noreferrer" className="hover:text-coral">LinkedIn</a>
            </div>
          </div>
        </div>
      </div>

      <form
        action="https://formsubmit.co/info@aliampsi.com"
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
