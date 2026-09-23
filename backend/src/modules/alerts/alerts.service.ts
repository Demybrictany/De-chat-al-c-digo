import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthUser } from 'src/common/decorators/current-user.decorator';
import { AuditService } from 'src/modules/audit/audit.service';
import { AlertStatus } from 'src/modules/catalogs/entities/alert-status.entity';
import { AlertsRepository } from './alerts.repository';
import { CreateAlertDto } from './dto/create-alert.dto';
import { Alert } from './entities/alert.entity';

export const ALERT_STATUS = { ACTIVE: 'active', RESOLVED: 'resolved' } as const;

@Injectable()
export class AlertsService {
  constructor(
    private readonly repo: AlertsRepository,
    @InjectRepository(AlertStatus) private readonly statuses: Repository<AlertStatus>,
    private readonly audit: AuditService,
  ) {}

  findByPatient(patientId: number): Promise<Alert[]> {
    return this.repo.findByPatient(patientId);
  }

  findActive(): Promise<Alert[]> {
    return this.repo.findByStatusName(ALERT_STATUS.ACTIVE);
  }

  async findById(id: number): Promise<Alert> {
    const alert = await this.repo.findById(id);
    if (!alert) throw new NotFoundException(`Alerta ${id} no encontrada`);
    return alert;
  }

  async create(dto: CreateAlertDto, actor: AuthUser): Promise<Alert> {
    return this.trigger(
      { patientId: dto.patientId, chronicConditionId: dto.chronicConditionId, alertType: dto.alertType, message: dto.message },
      actor,
    );
  }

  /**
   * Punto de entrada programatico y por API: crea una alerta activa.
   * Lo usa ChronicConditionsService cuando una condicion cronica activa dispara seguimiento.
   */
  async trigger(
    input: { patientId: number; chronicConditionId?: number | null; alertType: string; message: string },
    actor: AuthUser,
  ): Promise<Alert> {
    const status = await this.statusByName(ALERT_STATUS.ACTIVE);
    const entity = this.repo.create({
      patientId: input.patientId,
      chronicConditionId: input.chronicConditionId ?? null,
      statusId: status.id,
      alertType: input.alertType,
      message: input.message,
      triggeredAt: new Date(),
      createdById: actor.id,
      updatedById: actor.id,
    });
    const saved = await this.repo.save(entity);
    await this.audit.record({
      userId: actor.id,
      action: 'CREATE',
      entityName: 'alerts',
      entityId: saved.id,
      newValues: { patientId: input.patientId, alertType: input.alertType },
    });
    return saved;
  }

  async resolve(id: number, actor: AuthUser): Promise<Alert> {
    const alert = await this.findById(id);
    const resolved = await this.statusByName(ALERT_STATUS.RESOLVED);
    if (alert.statusId === resolved.id) throw new BadRequestException('La alerta ya esta resuelta');
    alert.statusId = resolved.id;
    alert.resolvedAt = new Date();
    alert.resolvedById = actor.id;
    alert.updatedById = actor.id;
    const saved = await this.repo.save(alert);
    await this.audit.record({
      userId: actor.id,
      action: 'UPDATE',
      entityName: 'alerts',
      entityId: id,
      newValues: { status: ALERT_STATUS.RESOLVED, resolvedById: actor.id },
    });
    return saved;
  }

  private async statusByName(name: string): Promise<AlertStatus> {
    const status = await this.statuses.findOne({ where: { name } });
    if (!status) throw new NotFoundException(`Catalogo alert_statuses sin '${name}' (falta seed)`);
    return status;
  }
}
