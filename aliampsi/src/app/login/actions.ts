'use server';

import { redirect } from 'next/navigation';
import { verifyCredentials, createSession } from '@/lib/auth';

export async function loginAction(_prev: unknown, formData: FormData) {
  const email = String(formData.get('email') || '');
  const password = String(formData.get('password') || '');

  if (!email || !password) {
    return { error: 'Ingresá tu correo y contraseña.' };
  }

  const user = await verifyCredentials(email, password);
  if (!user) {
    return { error: 'Correo o contraseña incorrectos.' };
  }

  await createSession(user);
  redirect('/admin');
}
