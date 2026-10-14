import { apiBaseURL } from '@/config';
import { ApiError, type ApiErrorBody } from './types';

export interface ApiFetchOptions extends RequestInit {
  /** JWT del backend. Se envía como `Authorization: Bearer <token>`. */
  token?: string;
}

/**
 * Aplana el error del backend a un solo mensaje.
 * El filtro global devuelve `message` como string (401, 404, …) o como
 * arreglo de `class-validator` (400), así que hay que cubrir ambos.
 */
function normalizeMessage(body: unknown, status: number): string {
  const { message } = (body ?? {}) as ApiErrorBody;

  if (Array.isArray(message)) return message.join('. ');
  if (typeof message === 'string' && message.trim()) return message;

  return `Error ${status} al comunicarse con el servidor`;
}

/**
 * Cliente HTTP único hacia el backend NestJS.
 *
 * A propósito no conoce la sesión: el token entra por `options.token`.
 * Así se evita un ciclo de imports con `lib/auth.ts`. Para llamadas
 * autenticadas desde el servidor usa `authedFetch` de `lib/api/server.ts`.
 */
export async function apiFetch<T>(
  path: string,
  { token, headers, ...init }: ApiFetchOptions = {},
): Promise<T> {
  const response = await fetch(`${apiBaseURL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    cache: 'no-store',
  });

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(
      normalizeMessage(body, response.status),
      response.status,
    );
  }

  return body as T;
}
