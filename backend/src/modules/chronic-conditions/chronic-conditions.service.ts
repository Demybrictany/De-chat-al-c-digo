import { Injectable, NotFoundException } from '@nestjs/common';
import { AuthUser } from 'src/common/decorators/current-user.decorator';
import { AuditService } from 'src/modules/audit/audit.service';
import { AlertsService } from 'src/modules/alerts/alerts.service';
import { PatientsService } from 'src/modules/patients/patients.service';
import { ChronicConditionsRepository } from './chronic-conditions.repository';
import { CreateChronicConditionDto } from './dto/create-chronic-condition.dto';
import { UpdateChronicConditionDto } from './dto/update-chronic-condition.dto';
import { ChronicCondition } from './entities/chronic-condition.entity';

@Injectable()
export class ChronicConditionsService {
  constructor(
    private readonly repo: ChronicConditionsRepository,
    private readonly patients: PatientsService,
    private readonly alerts: AlertsService,
    private readonly audit: AuditService,
  ) {}

  findByPatient(patientId: number): Promise<ChronicCondition[]> {
    return this.repo.findByPatient(patientId);
  }

  async findById(id: number): Promise<ChronicCondition> {
    const cond = await this.repo.findById(id);
    if (!cond) throw new NotFoundException(`Condicion cronica ${id} no encontrada`);
    return cond;
  }

  async create(dto: CreateChronicConditionDto, actor: AuthUser): Promise<ChronicCondition> {
    await this.patients.findById(dto.patientId);
    const isActive = dto.isActive ?? true;
    const entity = this.repo.create({ ...dto, isActive, createdById: actor.id, updatedById: actor.id });
    const saved = await this.repo.save(entity);
    await this.audit.record({
      userId: actor.id,
      action: 'CREATE',
      entityName: 'chronic_conditions',
      entityId: saved.id,
      newValues: { ...dto },
    });
    // Regla de negocio: una condicion cronica activa dispara una alerta de seguimiento.
    if (isActive) await this.raiseFollowUpAlert(saved, actor);
    return saved;
  }

  async update(id: number, dto: UpdateChronicConditionDto, actor: AuthUser): Promise<ChronicCondition> {
    const cond = await this.findById(id);
    const wasActive = cond.isActive;
    Object.assign(cond, dto, { updatedById: actor.id });
    const saved = await this.repo.save(cond);
    await this.audit.record({
      userId: actor.id,
      action: 'UPDATE',
      entityName: 'chronic_conditions',
      entityId: id,
      newValues: { ...dto },
    });
    // Se dispara alerta solo en la transicion inactiva -> activa (evita duplicados).
    if (!wasActive && saved.isActive) await this.raiseFollowUpAlert(saved, actor);
    return saved;
  }

  private raiseFollowUpAlert(cond: ChronicCondition, actor: AuthUser) {
    return this.alerts.trigger(
      {
        patientId: cond.patientId,
        chronicConditionId: cond.id,
        alertType: 'chronic_follow_up',
        message: `Seguimiento requerido por condicion cronica activa: ${cond.conditionName}`,
      },
      actor,
    );
  }
}
