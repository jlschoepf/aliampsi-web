import 'server-only';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { prisma } from './db';

const COOKIE = 'aliampsi_session';
const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET || 'dev-secret-cambia-esto'
);

export type SessionUser = { id: string; email: string; name: string | null };

export async function verifyCredentials(email: string, password: string) {
  const admin = await prisma.admin.findUnique({ where: { email: email.toLowerCase().trim() } });
  if (!admin) return null;
  const ok = await bcrypt.compare(password, admin.passwordHash);
  if (!ok) return null;
  return { id: admin.id, email: admin.email, name: admin.name };
}

export async function createSession(user: SessionUser) {
  const token = await new SignJWT({ ...user })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);

  cookies().set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function destroySession() {
  cookies().set(COOKIE, '', { path: '/', maxAge: 0 });
}

export async function getSession(): Promise<SessionUser | null> {
  const token = cookies().get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return { id: String(payload.id), email: String(payload.email), name: (payload.name as string) ?? null };
  } catch {
    return null;
  }
}

export async function requireAdmin(): Promise<SessionUser> {
  const session = await getSession();
  if (!session) redirect('/login');
  return session;
}
