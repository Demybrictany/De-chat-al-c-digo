import { auth } from '@/lib/auth';
import { apiFetch, type ApiFetchOptions } from './client';
import { ApiError } from './types';

/** La sesión no existe, o el token de 30 minutos del backend ya venció. */
export class SessionExpiredError extends Error {
  constructor(message = 'La sesión expiró. Vuelva a iniciar sesión.') {
    super(message);
    this.name = 'SessionExpiredError';
  }
}

/**
 * Igual que `apiFetch`, pero toma el token de la sesión de NextAuth.
 * Solo para el servidor (Server Components, Server Actions, Route Handlers).
 *
 * El llamador decide qué hacer ante `SessionExpiredError` (normalmente
 * `signOut({ redirectTo: '/' })`); aquí no se redirige a propósito, para que
 * esta capa siga siendo reutilizable.
 */
export async function authedFetch<T>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const session = await auth();

  if (!session?.accessToken) {
    throw new SessionExpiredError('Sesión no iniciada');
  }

  try {
    return await apiFetch<T>(path, { ...options, token: session.accessToken });
  } catch (error) {
    // El backend es la única fuente de verdad sobre la expiración: si rechaza
    // el token, la sesión ya no sirve aunque la cookie siga viva.
    if (error instanceof ApiError && error.status === 401) {
      throw new SessionExpiredError();
    }
    throw error;
  }
}
