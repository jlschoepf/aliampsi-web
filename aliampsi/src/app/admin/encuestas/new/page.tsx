import { AdminHeader } from '@/components/admin-ui';
import { PLANTILLAS, preguntasQueSeResponden } from '@/lib/encuestas';
import { crearEncuesta } from '../actions';

export default function NuevaEncuesta() {
  return (
    <>
      <AdminHeader title="Nueva encuesta" subtitle="Elegí desde dónde arrancar. Después podés cambiar todo." />
      <div className="grid gap-4 md:grid-cols-3">
        {PLANTILLAS.map((p) => {
          const n = preguntasQueSeResponden(p.crear().preguntas).length;
          return (
            <form key={p.clave} action={crearEncuesta} className="card flex flex-col p-6">
              <input type="hidden" name="plantilla" value={p.clave} />
              <h2 className="font-display text-lg font-bold">{p.nombre}</h2>
              <p className="mt-2 flex-1 text-sm text-ink-muted">{p.descripcion}</p>
              <p className="mt-3 text-xs text-ink-muted">{n ? `${n} preguntas` : 'Sin preguntas'}</p>
              <button type="submit" className="btn-primary mt-4">Usar esta</button>
            </form>
          );
        })}
      </div>
    </>
  );
}
