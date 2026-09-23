import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export function buildTypeOrmOptions(config: ConfigService): TypeOrmModuleOptions {
  return {
    type: 'mysql',
    host: config.get<string>('DB_HOST'),
    port: parseInt(config.get<string>('DB_PORT', '3306'), 10),
    username: config.get<string>('DB_USERNAME'),
    password: config.get<string>('DB_PASSWORD', ''),
    database: config.get<string>('DB_DATABASE'),
    // Carga automatica de todas las entidades registradas con forFeature.
    autoLoadEntities: true,
    // Solo dev: crea/actualiza el esquema desde las entidades. Nunca en produccion.
    synchronize: config.get<string>('DB_SYNCHRONIZE') === 'true',
  };
}
