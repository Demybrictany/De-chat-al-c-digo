import type { DefaultSession } from 'next-auth';

/**
 * Extiende los tipos de NextAuth para llevar el JWT del backend y el rol
 * a través de la sesión.
 */
declare module 'next-auth' {
  interface Session {
    /** JWT emitido por el backend (NestJS). */
    accessToken: string;
    user: {
      /** Nombre del rol, ej. "admin". */
      role: string;
    } & DefaultSession['user'];
  }

  interface User {
    accessToken: string;
    role: string;
  }
}

/**
 * En next-auth v5 el tipo `JWT` se declara en `@auth/core/jwt`; `next-auth/jwt`
 * solo lo reexporta. Hay que aumentar el modulo original para que la
 * augmentacion surta efecto.
 */
declare module '@auth/core/jwt' {
  interface JWT {
    accessToken: string;
    role: string;
  }
}
