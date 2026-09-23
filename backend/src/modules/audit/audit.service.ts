import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditAction, AuditLog } from './entities/audit-log.entity';

export interface AuditRecord {
  userId: number | null;
  action: AuditAction;
  entityName: string;
  entityId?: number | null;
  oldValues?: Record<string, unknown> | null;
  newValues?: Record<string, unknown> | null;
  ipAddress?: string | null;
}

/**
 * Servicio compartido de auditoria. Inyectado en cada service de dominio,
 * inserta un registro en audit_logs tras cada escritura exitosa.
 * Nunca actualiza ni borra la bitacora.
 */
@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    @InjectRepository(AuditLog)
    private readonly repo: Repository<AuditLog>,
  ) {}

  async record(entry: AuditRecord): Promise<void> {
    try {
      await this.repo.insert({
        userId: entry.userId,
        action: entry.action,
        entityName: entry.entityName,
        entityId: entry.entityId ?? null,
        oldValues: (entry.oldValues ?? null) as any,
        newValues: (entry.newValues ?? null) as any,
        ipAddress: entry.ipAddress ?? null,
      });
    } catch (err) {
      // La auditoria nunca debe tumbar la operacion de negocio ya cometida.
      this.logger.error(`No se pudo registrar auditoria (${entry.action} ${entry.entityName})`, err as Error);
    }
  }
}
