/**
 * Inicio de sesión con redes sociales: deshabilitado.
 *
 * El backend solo expone autenticación por credenciales
 * (`POST /api/auth/login`), así que no hay proveedor OAuth que respaldar.
 * Se conserva el componente vacío porque lo importan las pantallas de auth
 * del template (login, register, login2/3, register2/3).
 */
const Social = ({ locale }: { locale?: string }) => null;

export default Social;
