import { apiFetch } from './client';
import type { AuthUser, LoginResponse } from './types';

/** `POST /api/auth/login` — devuelve el token y los datos del usuario. */
export function login(email: string, password: string) {
  return apiFetch<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

/** `GET /api/auth/me` — perfil del usuario autenticado. */
export function me(token: string) {
  return apiFetch<AuthUser>('/auth/me', { token });
}
