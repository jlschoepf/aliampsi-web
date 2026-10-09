// Dibujo de las placas de resultados (lo usa la ruta /admin/encuestas/[id]/placa/[n]).
import { ImageResponse } from 'next/og';
import fs from 'node:fs/promises';
import path from 'node:path';
import { coma, hayTextos, type DatosExtra, type DatosPlaca } from '@/lib/placa';


const DIR = path.join(process.cwd(), 'certificados-assets');
const C = { paper: '#FAF7F2', ink: '#123B3C', soft: '#1E4E4C', muted: '#5A6B67', teal: '#2E7D74', tealClaro: '#5FB3A7', coral: '#EC6A52', coralOsc: '#D2543D', sand: '#EFE9DE', line: '#E2DACC', menta: '#9CC7C0', gris: '#D9D1C2' };
const COLORES = [C.ink, C.teal, C.coral, C.gris];

export async function recursos() {
  const leer = (f: string) => fs.readFile(path.join(DIR, f));
  const [bric, i4, i6, i7, logo, logoBlanco] = await Promise.all([
    leer('Bricolage-800.ttf'), leer('Inter-400.ttf'), leer('Inter-600.ttf'), leer('Inter-700.ttf'), leer('placa-logo.png'), leer('placa-logo-blanco.png'),
  ]);
  const uri = (b: Buffer) => `data:image/png;base64,${b.toString('base64')}`;
  return {
    fonts: [
      { name: 'Bric', data: bric, weight: 800 as const, style: 'normal' as const },
      { name: 'Inter', data: i4, weight: 400 as const, style: 'normal' as const },
      { name: 'Inter', data: i6, weight: 600 as const, style: 'normal' as const },
      { name: 'Inter', data: i7, weight: 700 as const, style: 'normal' as const },
    ],
    logo: uri(logo),
    logoBlanco: uri(logoBlanco),
  };
}

const kicker = (color: string, size = 22) => ({ fontFamily: 'Inter', fontWeight: 600, fontSize: size, letterSpacing: 3, textTransform: 'uppercase' as const, color });

export function Placa1({ d, logo }: { d: DatosPlaca; logo: string }) {
  const tarjetas = [
    d.general && { valor: coma(d.general.valor), sufijo: `/${d.general.maximo}`, etiqueta: 'Satisfacción general', destacada: true },
    d.nps !== null && { valor: `${d.nps > 0 ? '+' : ''}${d.nps}`, sufijo: '', etiqueta: 'Índice de recomendación (NPS)', destacada: false },
    { valor: String(d.total), sufijo: '', etiqueta: 'Personas respondieron la encuesta', destacada: false },
  ].filter(Boolean) as { valor: string; sufijo: string; etiqueta: string; destacada: boolean }[];
  const reparto = d.npsReparto;
  const recomiendan = reparto ? Math.round((reparto.promotores / Math.max(1, reparto.promotores + reparto.pasivos + reparto.detractores)) * 100) : null;
  return (
    <div style={{ width: 1080, height: 1350, display: 'flex', flexDirection: 'column', background: C.ink, color: '#fff', padding: '72px 76px', position: 'relative', fontFamily: 'Inter' }}>
      <div style={{ position: 'absolute', right: -220, top: -220, width: 640, height: 640, borderRadius: 320, background: 'radial-gradient(circle, rgba(46,125,116,0.55), rgba(46,125,116,0) 70%)', display: 'flex' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <img src={logo} height={78} width={237} alt="" />
        <span style={kicker(C.menta)}>Resultados · Encuesta</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', marginTop: 54 }}>
        <span style={{ fontFamily: 'Bric', fontWeight: 800, fontSize: 60, lineHeight: 1.04, letterSpacing: -1 }}>{d.actividad}</span>
        <span style={{ fontFamily: 'Bric', fontWeight: 800, fontSize: 60, lineHeight: 1.04, letterSpacing: -1, color: C.coral }}>así lo vivieron</span>
      </div>
      <span style={{ fontSize: 25, color: '#B9D3CE', marginTop: 16 }}>Lo que respondieron {d.total} participantes de la encuesta de satisfacción.</span>

      <div style={{ display: 'flex', gap: 18, marginTop: 44 }}>
        {tarjetas.map((t, i) => (
          <div key={i} style={{ flex: i === 0 ? 1.15 : 1, display: 'flex', flexDirection: 'column', borderRadius: 28, padding: '28px 28px 26px', background: t.destacada ? C.coral : 'rgba(255,255,255,0.06)', border: `1px solid ${t.destacada ? C.coral : 'rgba(255,255,255,0.12)'}` }}>
            <div style={{ display: 'flex', alignItems: 'baseline' }}>
              <span style={{ fontFamily: 'Bric', fontWeight: 800, fontSize: 100, lineHeight: 0.95, letterSpacing: -2 }}>{t.valor}</span>
              {t.sufijo && <span style={{ fontFamily: 'Bric', fontWeight: 800, fontSize: 38, opacity: 0.75, marginLeft: 4 }}>{t.sufijo}</span>}
            </div>
            <span style={{ fontWeight: 600, fontSize: 21, lineHeight: 1.3, marginTop: 14, color: t.destacada ? '#fff' : '#D7E6E3' }}>{t.etiqueta}</span>
          </div>
        ))}
      </div>

      {d.barras.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 48, marginBottom: 14 }}>
            <span style={kicker(C.menta)}>Cómo lo valoraron</span>
            <span style={{ fontSize: 19, color: C.menta }}>Promedio del 1 al {d.barras[0].maximo}</span>
          </div>
          {d.barras.map((b, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 18, padding: '11px 0', borderBottom: i < d.barras.length - 1 ? '1px solid rgba(255,255,255,0.08)' : 'none' }}>
              <div style={{ width: 330, display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontWeight: 600, fontSize: 22, lineHeight: 1.2 }}>{b.titulo}</span>
                {b.detalle && <span style={{ fontSize: 17, color: C.menta, marginTop: 2 }}>{b.detalle}</span>}
              </div>
              <div style={{ flex: 1, height: 16, borderRadius: 99, background: 'rgba(255,255,255,0.1)', display: 'flex' }}>
                <div style={{ width: `${(b.valor / b.maximo) * 100}%`, height: 16, borderRadius: 99, background: i < 2 ? `linear-gradient(90deg, ${C.coralOsc}, ${C.coral})` : `linear-gradient(90deg, ${C.teal}, ${C.tealClaro})`, display: 'flex' }} />
              </div>
              <span style={{ width: 86, fontFamily: 'Bric', fontWeight: 800, fontSize: 30, display: 'flex', justifyContent: 'flex-end' }}>{coma(b.valor, 2)}</span>
            </div>
          ))}
        </div>
      )}

      <div style={{ position: 'absolute', left: 76, right: 76, bottom: 56, display: 'flex', justifyContent: 'space-between', fontSize: 19, color: C.menta, borderTop: '1px solid rgba(255,255,255,0.12)', paddingTop: 22 }}>
        <span style={{ display: 'flex' }}>{recomiendan !== null ? <><b style={{ color: '#fff', fontWeight: 600, marginRight: 6 }}>{recomiendan}%</b> recomendaría AL·IAM·PSI a un colega (puntaje 9 o 10)</> : 'Alianza Iberoamericana de Psiquiatría Infantojuvenil y Profesiones Afines'}</span>
        <span>aliampsi.com</span>
      </div>
    </div>
  );
}

function Lista({ titulo, items, color }: { titulo: string; items: { t: string; d?: string }[]; color: string }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <span style={{ ...kicker(C.menta, 18), marginBottom: 14 }}>{titulo}</span>
      {items.map((it, i) => (
        <div key={i} style={{ display: 'flex', gap: 16, marginBottom: 14 }}>
          <div style={{ width: 14, height: 14, borderRadius: 4, background: color, marginTop: 8, display: 'flex', flexShrink: 0 }} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontWeight: 600, fontSize: 22, lineHeight: 1.3 }}>{it.t}</span>
            {it.d && <span style={{ fontSize: 17, lineHeight: 1.35, color: '#B9D3CE', marginTop: 3 }}>{it.d}</span>}
          </div>
        </div>
      ))}
    </div>
  );
}

export function Placa2({ d, logo }: { d: DatosPlaca; logo: string }) {
  const t = d.textos;
  return (
    <div style={{ width: 1080, height: 1350, display: 'flex', flexDirection: 'column', background: C.paper, color: C.ink, padding: '72px 76px', position: 'relative', fontFamily: 'Inter' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <img src={logo} height={78} width={237} alt="" />
        <span style={kicker(C.teal)}>Resultados · Encuesta</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', marginTop: 50 }}>
        <span style={{ fontFamily: 'Bric', fontWeight: 800, fontSize: 58, lineHeight: 1.04, letterSpacing: -1 }}>Quiénes participaron</span>
        <span style={{ fontFamily: 'Bric', fontWeight: 800, fontSize: 58, lineHeight: 1.04, letterSpacing: -1, color: C.coral }}>y qué nos pidieron</span>
      </div>

      {d.tortas.length > 0 && (
        <div style={{ display: 'flex', gap: 20, marginTop: 38 }}>
          {d.tortas.map((g, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#fff', border: `1px solid ${C.line}`, borderRadius: 28, padding: '26px 30px' }}>
              <span style={kicker(C.teal, 18)}>{g.titulo}</span>
              <div style={{ display: 'flex', height: 22, borderRadius: 99, overflow: 'hidden', margin: '18px 0 16px' }}>
                {g.partes.map((p, j) => <div key={j} style={{ width: `${p.pct}%`, background: COLORES[j] || C.gris, display: 'flex' }} />)}
              </div>
              {g.partes.map((p, j) => (
                <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <div style={{ width: 14, height: 14, borderRadius: 7, background: COLORES[j] || C.gris, display: 'flex' }} />
                  <span style={{ flex: 1, fontSize: 20, color: C.soft }}>{p.etiqueta}</span>
                  <span style={{ fontFamily: 'Bric', fontWeight: 800, fontSize: 24 }}>{p.pct}%</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {hayTextos(t) && (
        <div style={{ display: 'flex', gap: 30, marginTop: 20, background: C.ink, color: '#fff', borderRadius: 28, padding: '30px 34px 16px' }}>
          {!!t.valorado?.length && <Lista titulo="Lo que más valoraron" items={t.valorado} color={C.tealClaro} />}
          {!!t.pedidos?.length && <Lista titulo="Lo que piden para la próxima" items={t.pedidos} color={C.coral} />}
        </div>
      )}

      {t.cita && (
        <div style={{ display: 'flex', gap: 22, marginTop: 20, background: C.sand, borderRadius: 28, padding: '26px 32px' }}>
          <span style={{ fontFamily: 'Bric', fontWeight: 800, fontSize: 90, lineHeight: 0.9, color: C.coral, marginTop: 6 }}>“</span>
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <span style={{ fontWeight: 600, fontSize: 24, lineHeight: 1.4 }}>{t.cita}</span>
            <span style={{ fontSize: 18, color: C.muted, marginTop: 8 }}>Respuesta de una persona participante</span>
          </div>
        </div>
      )}

      <div style={{ position: 'absolute', left: 76, right: 76, bottom: 56, display: 'flex', justifyContent: 'space-between', fontSize: 19, color: C.muted, borderTop: `1px solid ${C.line}`, paddingTop: 22 }}>
        <span>{d.actividad} · {d.total} respuestas</span>
        <span>aliampsi.com</span>
      </div>
    </div>
  );
}


export function Placa3({ d, logo }: { d: DatosPlaca; logo: string }) {
  const temas = d.textos.temas || [];
  const [primero, ...resto] = temas;
  const filas: { t: string; d?: string }[][] = [];
  for (let i = 0; i < resto.length; i += 2) filas.push(resto.slice(i, i + 2));
  return (
    <div style={{ width: 1080, height: 1350, display: 'flex', flexDirection: 'column', background: C.paper, color: C.ink, padding: '72px 76px', position: 'relative', fontFamily: 'Inter' }}>
      <div style={{ position: 'absolute', left: -260, bottom: -260, width: 700, height: 700, borderRadius: 350, background: 'radial-gradient(circle, rgba(236,106,82,0.16), rgba(236,106,82,0) 70%)', display: 'flex' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <img src={logo} height={78} width={237} alt="" />
        <span style={kicker(C.teal)}>Próximas actividades</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', marginTop: 50 }}>
        <span style={{ fontFamily: 'Bric', fontWeight: 800, fontSize: 58, lineHeight: 1.04, letterSpacing: -1 }}>Los temas que</span>
        <span style={{ fontFamily: 'Bric', fontWeight: 800, fontSize: 58, lineHeight: 1.04, letterSpacing: -1, color: C.coral }}>quieren tratar</span>
      </div>
      <span style={{ fontSize: 24, lineHeight: 1.4, color: C.muted, marginTop: 16 }}>Las áreas temáticas que propusieron las personas que respondieron la encuesta, de la más pedida a la menos pedida.</span>

      {primero && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 28, marginTop: 40, background: C.ink, color: '#fff', borderRadius: 28, padding: '34px 36px' }}>
          <span style={{ fontFamily: 'Bric', fontWeight: 800, fontSize: 96, lineHeight: 0.9, color: C.coral }}>01</span>
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <span style={kicker(C.menta, 17)}>El más pedido</span>
            <span style={{ fontFamily: 'Bric', fontWeight: 800, fontSize: 40, lineHeight: 1.1, marginTop: 8 }}>{primero.t}</span>
            {primero.d && <span style={{ fontSize: 20, lineHeight: 1.4, color: '#B9D3CE', marginTop: 8 }}>{primero.d}</span>}
          </div>
        </div>
      )}

      {filas.map((fila, i) => (
        <div key={i} style={{ display: 'flex', gap: 20, marginTop: 20 }}>
          {fila.map((tm, j) => (
            <div key={j} style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#fff', border: `1px solid ${C.line}`, borderRadius: 28, padding: '26px 30px' }}>
              <span style={{ fontFamily: 'Bric', fontWeight: 800, fontSize: 40, lineHeight: 1, color: C.teal }}>{String(i * 2 + j + 2).padStart(2, '0')}</span>
              <span style={{ fontWeight: 700, fontSize: 25, lineHeight: 1.25, marginTop: 12 }}>{tm.t}</span>
              {tm.d && <span style={{ fontSize: 18, lineHeight: 1.4, color: C.muted, marginTop: 6 }}>{tm.d}</span>}
            </div>
          ))}
          {fila.length === 1 && <div style={{ flex: 1, display: 'flex' }} />}
        </div>
      ))}

      <div style={{ position: 'absolute', left: 76, right: 76, bottom: 56, display: 'flex', justifyContent: 'space-between', fontSize: 19, color: C.muted, borderTop: `1px solid ${C.line}`, paddingTop: 22 }}>
        <span>Surge de las respuestas abiertas · {d.actividad}</span>
        <span>aliampsi.com</span>
      </div>
    </div>
  );
}

/** Devuelve la placa n (1 o 2) como respuesta PNG de 1080×1350. */
export async function dibujarPlaca(d: DatosPlaca, n: 1 | 2 | 3) {
  const r = await recursos();
  return new ImageResponse(n === 1 ? <Placa1 d={d} logo={r.logoBlanco} /> : n === 2 ? <Placa2 d={d} logo={r.logo} /> : <Placa3 d={d} logo={r.logo} />, { width: 1080, height: 1350, fonts: r.fonts });
}

/** Gráfica adicional (de una pregunta o pedida a Claude), con la misma estética que las placas fijas. */
export function PlacaExtra({ d, logo }: { d: DatosExtra; logo: string }) {
  const e = d.extra;
  const maxN = Math.max(1, ...d.distribucion.map((x) => x.n));
  return (
    <div style={{ width: 1080, height: 1350, display: 'flex', flexDirection: 'column', background: C.paper, color: C.ink, padding: '72px 76px', position: 'relative', fontFamily: 'Inter' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <img src={logo} height={78} width={237} alt="" />
        <span style={kicker(C.teal)}>Resultados · Encuesta</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', marginTop: 50 }}>
        <span style={{ fontFamily: 'Bric', fontWeight: 800, fontSize: 58, lineHeight: 1.04, letterSpacing: -1 }}>{e.titulo}</span>
        {e.destacado && <span style={{ fontFamily: 'Bric', fontWeight: 800, fontSize: 58, lineHeight: 1.04, letterSpacing: -1, color: C.coral }}>{e.destacado}</span>}
      </div>
      {e.bajada && <span style={{ fontSize: 24, lineHeight: 1.4, color: C.muted, marginTop: 16 }}>{e.bajada}</span>}

      {e.tipo === 'barras' && (
        <div style={{ display: 'flex', flexDirection: 'column', marginTop: 40, background: '#fff', border: `1px solid ${C.line}`, borderRadius: 28, padding: '20px 32px' }}>
          {d.barras.map((b, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 18, padding: '16px 0', borderBottom: i < d.barras.length - 1 ? `1px solid ${C.line}` : 'none' }}>
              <div style={{ width: 320, display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontWeight: 600, fontSize: 23, lineHeight: 1.2 }}>{b.titulo}</span>
                {b.detalle && <span style={{ fontSize: 17, color: C.muted, marginTop: 2 }}>{b.detalle}</span>}
              </div>
              <div style={{ flex: 1, height: 18, borderRadius: 99, background: C.sand, display: 'flex' }}>
                <div style={{ width: `${(b.valor / b.maximo) * 100}%`, height: 18, borderRadius: 99, background: i === 0 ? `linear-gradient(90deg, ${C.coralOsc}, ${C.coral})` : `linear-gradient(90deg, ${C.teal}, ${C.tealClaro})`, display: 'flex' }} />
              </div>
              <span style={{ width: 92, fontFamily: 'Bric', fontWeight: 800, fontSize: 32, display: 'flex', justifyContent: 'flex-end' }}>{coma(b.valor, 2)}</span>
            </div>
          ))}
          {d.barras[0] && <span style={{ fontSize: 18, color: C.muted, marginTop: 10, marginBottom: 6 }}>Promedio del {d.barras[0].maximo === 10 ? '0' : '1'} al {d.barras[0].maximo}</span>}
        </div>
      )}

      {e.tipo === 'reparto' && (
        <div style={{ display: 'flex', flexDirection: 'column', marginTop: 40, background: '#fff', border: `1px solid ${C.line}`, borderRadius: 28, padding: '22px 32px' }}>
          {d.reparto.map((p, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', padding: '13px 0', borderBottom: i < d.reparto.length - 1 ? `1px solid ${C.line}` : 'none' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontWeight: 600, fontSize: 23, lineHeight: 1.25, maxWidth: 700 }}>{p.etiqueta}</span>
                <span style={{ fontFamily: 'Bric', fontWeight: 800, fontSize: 32 }}>{p.pct}%</span>
              </div>
              <div style={{ height: 14, borderRadius: 99, background: C.sand, display: 'flex', marginTop: 10 }}>
                <div style={{ width: `${Math.max(p.pct, 1)}%`, height: 14, borderRadius: 99, background: i === 0 ? C.coral : i === 1 ? C.teal : C.ink, display: 'flex' }} />
              </div>
            </div>
          ))}
          <span style={{ fontSize: 18, color: C.muted, marginTop: 10, marginBottom: 6 }}>Sobre {d.respondieron} personas que respondieron esta pregunta</span>
        </div>
      )}

      {e.tipo === 'distribucion' && d.rango && (
        <div style={{ display: 'flex', flexDirection: 'column', marginTop: 40, background: C.ink, color: '#fff', borderRadius: 28, padding: '32px 36px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
            <span style={{ fontFamily: 'Bric', fontWeight: 800, fontSize: 96, lineHeight: 0.95, color: C.coral }}>{coma(d.promedio || 0)}</span>
            <span style={{ fontSize: 24, color: '#B9D3CE' }}>promedio, del {d.rango.minimo} al {d.rango.maximo}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 420, marginTop: 30 }}>
            {d.distribucion.map((x, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: 420 }}>
                <span style={{ fontFamily: 'Bric', fontWeight: 800, fontSize: 24, marginBottom: 8, color: x.n ? '#fff' : 'rgba(255,255,255,0.35)' }}>{x.n}</span>
                <div style={{ width: '100%', height: Math.max(4, (x.n / maxN) * 340), borderRadius: 12, background: x.n === maxN ? `linear-gradient(180deg, ${C.coral}, ${C.coralOsc})` : `linear-gradient(180deg, ${C.tealClaro}, ${C.teal})`, display: 'flex' }} />
                <span style={{ fontWeight: 600, fontSize: 22, marginTop: 12, color: C.menta }}>{x.valor}</span>
              </div>
            ))}
          </div>
          <span style={{ fontSize: 18, color: C.menta, marginTop: 18 }}>Cantidad de personas por puntaje · {d.respondieron} respuestas</span>
        </div>
      )}

      {e.tipo === 'lista' && (
        <div style={{ display: 'flex', flexDirection: 'column', marginTop: 36 }}>
          {(e.items || []).map((it, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 14, background: i === 0 ? C.ink : '#fff', color: i === 0 ? '#fff' : C.ink, border: `1px solid ${i === 0 ? C.ink : C.line}`, borderRadius: 24, padding: '20px 28px' }}>
              <span style={{ fontFamily: 'Bric', fontWeight: 800, fontSize: 44, lineHeight: 1, color: i === 0 ? C.coral : C.teal, width: 64 }}>{String(i + 1).padStart(2, '0')}</span>
              <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                <span style={{ fontWeight: 700, fontSize: 25, lineHeight: 1.25 }}>{it.t}</span>
                {it.d && <span style={{ fontSize: 18, lineHeight: 1.4, color: i === 0 ? '#B9D3CE' : C.muted, marginTop: 4 }}>{it.d}</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ position: 'absolute', left: 76, right: 76, bottom: 56, display: 'flex', justifyContent: 'space-between', fontSize: 19, color: C.muted, borderTop: `1px solid ${C.line}`, paddingTop: 22 }}>
        <span>{d.actividad} · {d.total} respuestas</span>
        <span>aliampsi.com</span>
      </div>
    </div>
  );
}

/** Devuelve una gráfica adicional como PNG de 1080×1350. */
export async function dibujarExtra(d: DatosExtra) {
  const r = await recursos();
  return new ImageResponse(<PlacaExtra d={d} logo={r.logo} />, { width: 1080, height: 1350, fonts: r.fonts });
}
