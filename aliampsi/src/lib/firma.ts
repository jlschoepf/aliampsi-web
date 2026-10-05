// Firma de correo con la identidad de AL·IAM·PSI. HTML en tablas y estilos en línea, que es lo que
// respetan Gmail y los demás clientes de correo. El logo se sirve desde el sitio (Gmail no acepta imágenes incrustadas).
const esc = (t: string) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export type DatosFirma = { nombre: string; cargo: string; web: string; linkedin: string };

export const FIRMA_JOHANN: DatosFirma = {
  nombre: 'Dr. Johann Schoepf',
  cargo: 'Presidente de AL·IAM·PSI',
  web: 'https://aliampsi.com',
  linkedin: 'https://www.linkedin.com/company/aliampsi',
};

export function firmaHtml(d: DatosFirma, base = 'https://aliampsi.com'): string {
  const f = "font-family:Arial,Helvetica,sans-serif";
  return `<table cellpadding="0" cellspacing="0" border="0" style="${f};border-collapse:collapse">
<tr>
<td style="padding:4px 18px 4px 0;vertical-align:middle"><a href="${esc(d.web)}" style="text-decoration:none"><img src="${base}/firma/aliampsi-firma.png" width="180" alt="AL·IAM·PSI" style="display:block;width:180px;height:auto;border:0"></a></td>
<td style="border-left:2px solid #2E7D74;padding:4px 0 4px 18px;vertical-align:middle">
<div style="${f};font-size:16px;font-weight:bold;color:#123B3C;line-height:1.3">${esc(d.nombre)}</div>
<div style="${f};font-size:13px;color:#C2462C;line-height:1.5">${esc(d.cargo)}</div>
<div style="${f};font-size:12px;color:#5A6B67;line-height:1.5">Alianza Iberoamericana de Psiquiatría Infantojuvenil y Profesiones Afines</div>
<div style="${f};font-size:13px;line-height:1.8;padding-top:4px"><a href="${esc(d.web)}" style="color:#2E7D74;font-weight:bold;text-decoration:none">aliampsi.com</a><span style="color:#B8C7C1">&nbsp;&nbsp;|&nbsp;&nbsp;</span><a href="${esc(d.linkedin)}" style="color:#2E7D74;font-weight:bold;text-decoration:none">LinkedIn</a></div>
</td>
</tr>
</table>`;
}
