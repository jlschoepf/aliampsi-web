// Código de acceso de las encuestas: se compara sin importar mayúsculas, espacios ni guiones.
// Al ingresarlo bien, el dispositivo guarda una firma (no el código): si el código cambia, hay que volver a ingresarlo.
import { createHash } from 'crypto';

export const normalizarCodigo = (c: string) => c.toUpperCase().replace(/[\s-]+/g, '');

export const firmaAcceso = (encuestaId: string, codigo: string) =>
  createHash('sha256').update(`${encuestaId}:${normalizarCodigo(codigo)}`).digest('hex').slice(0, 32);

export const cookieAcceso = (encuestaId: string) => `enc_acceso_${encuestaId}`;
