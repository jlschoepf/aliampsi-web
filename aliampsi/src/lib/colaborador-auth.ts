import 'server-only';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { prisma } from './db';

// Sesión de colaboradores (las asociaciones que envían contenido).
// Es independiente de la sesión de administración.
const COOKIE = 'aliampsi_colab';
const secret = new TextEncoder().encode(process.env.AUTH_SECRET || 'dev-secret-cambia-esto');

export type ColaboradorSession = {
  id: string;
  email: string;
  name: string;
  orgName: string;
};

export async function hashPassword(plain: string) {
  return bcrypt.hash(plain, 10);
}

export async function verifyColaborador(email: string, password: string) {
  const c = await prisma.colaborador.findUnique({ where: { email: email.toLowerCase().trim() } });
  if (!c || !c.active) return null;
  const ok = await bcrypt.compare(password, c.passwordHash);
  if (!ok) return null;
  return { id: c.id, email: c.email, name: c.name, orgName: c.orgName };
}

export async function createColaboradorSession(user: ColaboradorSession) {
  const token = await new SignJWT({ ...user })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(secret);

  cookies().set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function destroyColaboradorSession() {
  cookies().set(COOKIE, '', { path: '/', maxAge: 0 });
}

export async function getColaborador(): Promise<ColaboradorSession | null> {
  const token = cookies().get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return {
      id: String(payload.id),
      email: String(payload.email),
      name: String(payload.name),
      orgName: String(payload.orgName || ''),
    };
  } catch {
    return null;
  }
}

export async function requireColaborador(): Promise<ColaboradorSession> {
  const c = await getColaborador();
  if (!c) redirect('/colaboradores/ingresar');
  return c;
}
