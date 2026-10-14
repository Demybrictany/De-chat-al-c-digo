import 'reflect-metadata';
import { config } from 'dotenv';
import { extname, join, resolve } from 'path';
import { DataSource } from 'typeorm';

// Ruta fija al .env del backend; no depende del directorio desde el que se invoque.
config({ path: resolve(__dirname, '../../.env') });

const required = ['DB_HOST', 'DB_USERNAME', 'DB_DATABASE'] as const;
for (const key of required) {
  if (!process.env[key]?.trim()) throw new Error('Falta configurar ' + key);
}
if (process.env.DB_DATABASE !== 'clinicas') {
  throw new Error('Las migraciones de este proyecto solo se ejecutan en clinicas.');
}
if (process.env.DB_SYNCHRONIZE !== undefined && process.env.DB_SYNCHRONIZE !== 'false') {
  throw new Error('DB_SYNCHRONIZE debe permanecer en false.');
}
const port = Number(process.env.DB_PORT ?? '3306');
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('DB_PORT debe ser un puerto valido.');
}
const extension = extname(__filename);

// Exportar la instancia no abre la conexion. Solo el CLI la inicializa al invocarlo.
export default new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST,
  port,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD ?? '',
  database: 'clinicas',
  charset: 'utf8mb4_unicode_ci',
  entities: [join(__dirname, '../modules/**/*.entity' + extension)],
  migrations: [join(__dirname, 'migrations/*' + extension)],
  migrationsTableName: 'migrations',
  migrationsTransactionMode: 'none',
  synchronize: false,
  migrationsRun: false,
  dropSchema: false,
});
