import { plainToInstance } from 'class-transformer';
import { IsIn, IsNotEmpty, IsNumberString, IsOptional, IsString, validateSync } from 'class-validator';

class EnvVars {
  @IsNotEmpty() @IsString() DB_HOST: string;
  @IsNumberString() DB_PORT: string;
  @IsNotEmpty() @IsString() DB_USERNAME: string;
  @IsOptional() @IsString() DB_PASSWORD: string;
  @IsNotEmpty() @IsString() DB_DATABASE: string;
  @IsNotEmpty() @IsString() JWT_SECRET: string;
  @IsOptional() @IsString() JWT_EXPIRES_IN: string;
  @IsOptional() @IsNumberString() PORT: string;
  @IsOptional() @IsIn(['true', 'false']) DB_SYNCHRONIZE: string;
}

export function validateEnv(config: Record<string, unknown>) {
  const validated = plainToInstance(EnvVars, config, { enableImplicitConversion: true });
  const errors = validateSync(validated, { skipMissingProperties: false });
  if (errors.length > 0) {
    throw new Error(`Configuracion de entorno invalida:\n${errors.toString()}`);
  }
  return validated;
}
