'use server';

import { AuthError } from 'next-auth';
import { signIn } from '@/lib/auth';

export type LoginInput = {
  email: string;
  password: string;
};

export type LoginErrorCode = 'invalid_credentials' | 'backend_unreachable';

export type LoginResult =
  | { ok: true }
  | { ok: false; code: LoginErrorCode };

function toCode(raw: string | null | undefined): LoginErrorCode {
  return raw === 'backend_unreachable'
    ? 'backend_unreachable'
    : 'invalid_credentials';
}

/**
 * Inicia sesión contra el backend a través de NextAuth.
 *
 * Ojo con la forma del resultado: `signIn` de `next-auth` v5 (la version de
 * servidor, no la de `next-auth/react`) **no** devuelve `{ error, ok }`.
 * Con `redirect: false` devuelve una URL, y cuando falla puede lanzar un
 * `AuthError`. Aquí se normalizan ambos casos.
 */
export async function loginUser({
  email,
  password,
}: LoginInput): Promise<LoginResult> {
  let result: unknown;

  try {
    result = await signIn('credentials', { email, password, redirect: false });
  } catch (error) {
    if (error instanceof AuthError) {
      return { ok: false, code: toCode((error as AuthError & { code?: string }).code) };
    }
    throw error;
  }

  // Caso normal: la URL de callback. En un fallo trae `?error=...&code=...`.
  if (typeof result === 'string') {
    const url = new URL(result, 'http://localhost');
    if (!url.searchParams.has('error')) return { ok: true };
    return { ok: false, code: toCode(url.searchParams.get('code')) };
  }

  // Por si una version futura devuelve el objeto documentado.
  const maybe = result as { error?: string; code?: string } | null | undefined;
  if (maybe?.error) {
    return { ok: false, code: toCode(maybe.code) };
  }

  return { ok: true };
}
