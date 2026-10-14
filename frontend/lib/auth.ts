import NextAuth, { CredentialsSignin } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { login } from '@/lib/api/auth';
import { ApiError } from '@/lib/api/types';

/**
 * El backend no respondio. Se distingue de "credenciales invalidas" para poder
 * dar un mensaje util; el `code` viaja al cliente en el parametro `code` de la URL.
 */
class BackendUnreachable extends CredentialsSignin {
  code = 'backend_unreachable';
}

export const { auth, handlers, signIn, signOut } = NextAuth({
  session: {
    strategy: 'jwt',
    // Espeja la expiracion del JWT del backend (JWT_EXPIRES_IN=30m).
    // Al vencer, el usuario debe autenticarse de nuevo: no hay refresh token.
    maxAge: 30 * 60,
  },
  pages: {
    // La pantalla de login es la raiz del sitio.
    signIn: '/',
  },
  providers: [
    CredentialsProvider({
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          const { accessToken, user } = await login(
            credentials.email as string,
            credentials.password as string,
          );

          return {
            id: String(user.id),
            email: user.email,
            name: user.fullName,
            accessToken,
            role: user.role,
          };
        } catch (error) {
          if (error instanceof ApiError) {
            // 401 (credenciales) o 400 (validacion): el backend colapsa todas las
            // causas de fallo en una sola respuesta, asi que `null` basta.
            // Devolver null produce el CredentialsSignin estandar.
            console.error(`Login rechazado (${error.status}): ${error.message}`);
            return null;
          }

          console.error('No se pudo contactar al backend:', error);
          throw new BackendUnreachable();
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.accessToken;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      if (session.user) {
        session.user.role = token.role;
      }
      return session;
    },
  },
});
