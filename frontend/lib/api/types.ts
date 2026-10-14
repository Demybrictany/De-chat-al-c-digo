/**
 * Tipos compartidos de la capa de API.
 * Reflejan el contrato real del backend NestJS (`backend/src/modules/...`).
 */

/** Respuesta de `POST /api/auth/login` (`auth.service.ts`). */
export interface LoginResponse {
  accessToken: string;
  user: {
    id: number;
    email: string;
    fullName: string;
    /** Nombre del rol, ej. "admin". No es un objeto. */
    role: string;
  };
}

/**
 * Respuesta de `GET /api/auth/me`.
 * Ojo: la forma NO es igual a la del login — aquí no viene `fullName`
 * y el rol se llama `roleName` en lugar de `role`.
 */
export interface AuthUser {
  id: number;
  email: string;
  roleId: number;
  roleName: string;
}

/** Cuerpo de error del filtro global `AllExceptionsFilter`. */
export interface ApiErrorBody {
  statusCode: number;
  /** Los errores de `class-validator` llegan como arreglo. */
  message: string | string[];
  path?: string;
  timestamp?: string;
}

/** Error de la API, ya normalizado a un mensaje plano en español. */
export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}
