export const locales = ['es'];

/**
 * URL base de la API del backend NestJS, incluido el prefijo `/api`.
 * Se configura con NEXT_PUBLIC_API_URL (ver `.env.example`).
 */
export const apiBaseURL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

// Alias heredado: lo usa el cliente de chat del template.
export const baseURL = apiBaseURL;
