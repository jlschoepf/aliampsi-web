'use client';

import { useRef, useState } from 'react';
import { upload } from '@vercel/blob/client';

function Label({ htmlFor, children, required }: { htmlFor: string; children: React.ReactNode; required?: boolean }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-ink">
      {children} {required && <span className="text-coral">*</span>}
    </label>
  );
}

export function EnvioForm({ action, web3Key }: { action: (formData: FormData) => void; web3Key?: string }) {
  const [tipo, setTipo] = useState('noticia');
  const [cover, setCover] = useState('');
  const [doc, setDoc] = useState('');
  const [upImg, setUpImg] = useState(false);
  const [upDoc, setUpDoc] = useState(false);
  const [sending, setSending] = useState(false);
  const imgRef = useRef<HTMLInputElement>(null);
  const docRef = useRef<HTMLInputElement>(null);

  async function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (imgRef.current) imgRef.current.value = '';
    if (!file) return;
    setUpImg(true);
    try {
      const r = await upload(file.name, file, { access: 'public', handleUploadUrl: '/api/upload-envio' });
      setCover(r.url);
    } catch {
      window.alert('No se pudo subir la imagen. Probá con un archivo más liviano (hasta 10 MB).');
    } finally {
      setUpImg(false);
    }
  }

  async function handleDoc(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (docRef.current) docRef.current.value = '';
    if (!file) return;
    setUpDoc(true);
    try {
      const r = await upload(file.name, file, { access: 'public', handleUploadUrl: '/api/upload-envio' });
      setDoc(r.url);
    } catch {
      window.alert('No se pudo subir el documento. Debe ser PDF de hasta 10 MB.');
    } finally {
      setUpDoc(false);
    }
  }

  const docName = doc ? decodeURIComponent(doc.split('/').pop() || 'documento') : '';

  return (
    <form
      action={action}
      onSubmit={(e) => {
        setSending(true);
        // Aviso al equipo desde el navegador (requisito del plan gratuito de Web3Forms).
        if (web3Key) {
          const f = e.currentTarget;
          const get = (n: string) => (f.elements.namedItem(n) as HTMLInputElement | HTMLTextAreaElement | null)?.value || '';
          try {
            fetch('https://api.web3forms.com/submit', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
              keepalive: true,
              body: JSON.stringify({
                access_key: web3Key,
                subject: `Nuevo envío en el sitio: ${get('title')}`,
                from_name: 'Sitio AL·IAM·PSI',
                email: get('contactEmail') || undefined,
                message: [
                  'Llegó un nuevo contenido desde el formulario público.',
                  '',
                  `Tipo: ${get('tipo')}${get('tipoOtro') ? ` — ${get('tipoOtro')}` : ''}`,
                  `Título: ${get('title')}`,
                  `Institución: ${get('orgName')}`,
                  `Contacto: ${get('contactName')} (${get('contactEmail')})`,
                  get('summary') ? `Resumen: ${get('summary')}` : '',
                  '',
                  'Revisalo en el panel: /admin/envios',
                ]
                  .filter(Boolean)
                  .join('\n'),
              }),
            })
              .then(async (res) => {
                const data = await res.json().catch(() => null);
                const ok = !!(res.ok && data?.success);
                fetch('/api/aviso-estado', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  keepalive: true,
                  body: JSON.stringify({
                    ok,
                    detalle: ok
                      ? 'Aviso enviado al recibirse un envío del formulario público.'
                      : `Web3Forms respondió ${res.status}`,
                  }),
                }).catch(() => {});
              })
              .catch(() => {});
          } catch {
            // El aviso nunca debe impedir el envío.
          }
        }
      }}
      className="card mt-8 space-y-6 p-6 sm:p-8"
    >
      {/* Campo trampa anti-spam: las personas no lo ven */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

      <div>
        <Label htmlFor="tipo" required>¿Qué querés enviar?</Label>
        <select
          id="tipo"
          name="tipo"
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          className="field"
        >
          <option value="noticia">Una noticia o novedad</option>
          <option value="congreso">Un congreso o actividad</option>
          <option value="publicacion">Una publicación o documento</option>
          <option value="otro">Otro (contanos qué es)</option>
        </select>
      </div>

      {tipo === 'otro' && (
        <div>
          <Label htmlFor="tipoOtro" required>¿De qué se trata?</Label>
          <input
            id="tipoOtro"
            name="tipoOtro"
            required
            maxLength={120}
            className="field"
            placeholder="Ej: convocatoria, curso, premio, comunicado…"
          />
        </div>
      )}

      <div>
        <Label htmlFor="title" required>Título</Label>
        <input id="title" name="title" required maxLength={200} className="field" placeholder="Título de la noticia o actividad" />
      </div>

      <div>
        <Label htmlFor="summary">Resumen breve</Label>
        <textarea id="summary" name="summary" rows={2} maxLength={400} className="field" placeholder="Una o dos líneas que resuman el contenido" />
      </div>

      <div>
        <Label htmlFor="body" required>Texto completo</Label>
        <textarea id="body" name="body" rows={10} required className="field" placeholder="Escribí acá el contenido. Podés separar párrafos con saltos de línea." />
        <p className="mt-1.5 text-xs text-ink-muted">El equipo de la Alianza revisará y dará formato antes de publicar.</p>
      </div>

      {tipo === 'congreso' && (
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <Label htmlFor="location">Lugar</Label>
            <input id="location" name="location" className="field" placeholder="Ciudad, país" />
          </div>
          <div>
            <Label htmlFor="eventDate">Fecha o período</Label>
            <input id="eventDate" name="eventDate" className="field" placeholder="Ej: 12 al 14 de octubre de 2026" />
          </div>
        </div>
      )}

      <div>
        <Label htmlFor="linkUrl">Enlace relacionado</Label>
        <input id="linkUrl" name="linkUrl" type="text" className="field" placeholder="https://… (inscripción, nota original, revista)" />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="imgFile">Imagen (opcional)</Label>
          {cover && (
            <div className="mb-2 flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={cover} alt="" className="h-14 w-24 rounded border border-line object-cover" />
              <button type="button" onClick={() => setCover('')} className="text-sm font-medium text-coral hover:text-coral-dark">
                Quitar
              </button>
            </div>
          )}
          <label className="btn-ghost cursor-pointer">
            {upImg ? 'Subiendo…' : 'Subir imagen'}
            <input ref={imgRef} id="imgFile" type="file" accept="image/*" className="hidden" onChange={handleImage} disabled={upImg} />
          </label>
          <input type="hidden" name="coverImage" value={cover} />
          <p className="mt-1.5 text-xs text-ink-muted">JPG, PNG o WEBP, hasta 10 MB.</p>
        </div>

        <div>
          <Label htmlFor="docFile">Documento PDF (opcional)</Label>
          {doc && (
            <p className="mb-2 flex items-center gap-3 text-sm">
              <span className="truncate text-teal-600">📎 {docName}</span>
              <button type="button" onClick={() => setDoc('')} className="font-medium text-coral hover:text-coral-dark">
                Quitar
              </button>
            </p>
          )}
          <label className="btn-ghost cursor-pointer">
            {upDoc ? 'Subiendo…' : 'Subir documento'}
            <input ref={docRef} id="docFile" type="file" accept="application/pdf" className="hidden" onChange={handleDoc} disabled={upDoc} />
          </label>
          <input type="hidden" name="document" value={doc} />
          <p className="mt-1.5 text-xs text-ink-muted">PDF, hasta 10 MB.</p>
        </div>
      </div>

      <div className="border-t border-line pt-6">
        <h2 className="text-sm font-semibold text-ink">Datos de contacto</h2>
        <p className="mb-4 text-xs text-ink-muted">Para poder consultarte si hace falta antes de publicar.</p>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <Label htmlFor="orgName" required>Asociación o institución</Label>
            <input id="orgName" name="orgName" required className="field" placeholder="Ej: Sociedad Uruguaya de Psiquiatría…" />
          </div>
          <div>
            <Label htmlFor="contactName" required>Nombre de quien envía</Label>
            <input id="contactName" name="contactName" required className="field" placeholder="Nombre y apellido" />
          </div>
          <div>
            <Label htmlFor="contactEmail" required>Correo electrónico</Label>
            <input id="contactEmail" name="contactEmail" type="email" required className="field" placeholder="nombre@institucion.org" />
          </div>
          <div>
            <Label htmlFor="contactPhone">Teléfono (opcional)</Label>
            <input id="contactPhone" name="contactPhone" className="field" placeholder="+598 …" />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button type="submit" disabled={sending || upImg || upDoc} className="btn-coral disabled:opacity-60">
          {sending ? 'Enviando…' : 'Enviar propuesta'}
        </button>
        <p className="text-xs text-ink-muted">Revisamos cada envío antes de publicarlo.</p>
      </div>
    </form>
  );
}
