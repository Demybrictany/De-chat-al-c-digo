import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { ArchivePatientDto } from './dto/archive-patient.dto';
import { AuthUser } from 'src/common/decorators/current-user.decorator';
import { AuditService } from 'src/modules/audit/audit.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { Patient } from './entities/patient.entity';
import { PatientsRepository } from './patients.repository';

@Injectable()
export class PatientsService {
  constructor(
    private readonly repo: PatientsRepository,
    private readonly audit: AuditService,
    private readonly dataSource: DataSource,
  ) {}

  findAll(includeArchived = false, actor?: AuthUser): Promise<Patient[]> {
    if (includeArchived) this.requireAdmin(actor);
    return this.repo.findAll({
      where: includeArchived ? {} : { isArchived: false }, order: { id: 'ASC' },
    });
  }

  async findById(id: number): Promise<Patient> {
    const patient = await this.repo.findById(id);
    if (!patient) throw new NotFoundException(`Paciente ${id} no encontrado`);
    return patient;
  }

  private requireAdmin(actor?: AuthUser): void {
    if (actor?.roleName !== 'admin') throw new ForbiddenException('Solo admin puede consultar o administrar el archivo');
  }

  private async lockPatient(id: number, manager: EntityManager): Promise<Patient> {
    const patient = await this.repo.findByIdForUpdate(id, manager);
    if (!patient) throw new NotFoundException('Paciente ' + id + ' no encontrado');
    return patient;
  }

  /** Comparte el bloqueo con archive/restore hasta finalizar la nueva cita o receta. */
  withActivePatient<T>(id: number, operation: (manager: EntityManager) => Promise<T>): Promise<T> {
    return this.dataSource.transaction(async manager => {
      const patient = await this.lockPatient(id, manager);
      if (patient.isArchived) throw new ConflictException('El paciente esta archivado; restaurelo antes de crear citas o recetas');
      return operation(manager);
    });
  }

  async archive(id: number, dto: ArchivePatientDto, actor: AuthUser, ip?: string): Promise<Patient> {
    this.requireAdmin(actor);
    return this.dataSource.transaction(async manager => {
      const patient = await this.lockPatient(id, manager);
      if (patient.isArchived) return patient;
      const futureAppointments = await this.repo.countAppointmentsAfter(id, new Date(), 'scheduled', manager);
      const activeAlerts = await this.repo.countAlertsByStatus(id, 'active', manager);
      if (futureAppointments || activeAlerts) {
        throw new ConflictException({
          message: 'Antes de archivar revise ' + futureAppointments + ' citas futuras programadas y ' + activeAlerts + ' alertas activas',
          futureAppointments, activeAlerts,
        });
      }
      const before = this.snapshot(patient);
      patient.isArchived = true;
      patient.archivedAt = new Date();
      patient.archivedById = actor.id;
      patient.archiveReason = dto.reason;
      patient.updatedById = actor.id;
      const saved = await this.repo.saveInTransaction(patient, manager);
      await this.audit.recordInTransaction({
        userId: actor.id, action: 'UPDATE', entityName: 'patients', entityId: id,
        oldValues: before, newValues: { ...this.snapshot(saved), operation: 'ARCHIVE' }, ipAddress: ip,
      }, manager);
      return saved;
    });
  }

  async restore(id: number, actor: AuthUser, ip?: string): Promise<Patient> {
    this.requireAdmin(actor);
    return this.dataSource.transaction(async manager => {
      const patient = await this.lockPatient(id, manager);
      if (!patient.isArchived) return patient;
      const before = this.snapshot(patient);
      patient.isArchived = false;
      patient.archivedAt = null;
      patient.archivedById = null;
      patient.archiveReason = null;
      patient.updatedById = actor.id;
      const saved = await this.repo.saveInTransaction(patient, manager);
      await this.audit.recordInTransaction({
        userId: actor.id, action: 'UPDATE', entityName: 'patients', entityId: id,
        oldValues: before, newValues: { ...this.snapshot(saved), operation: 'RESTORE' }, ipAddress: ip,
      }, manager);
      return saved;
    });
  }

  async create(dto: CreatePatientDto, actor: AuthUser): Promise<Patient> {
    if (dto.nationalId && (await this.repo.findByNationalId(dto.nationalId))) {
      throw new ConflictException(`Ya existe un paciente con documento ${dto.nationalId}`);
    }
    const entity = this.repo.create({ ...dto, createdById: actor.id, updatedById: actor.id });
    const saved = await this.repo.save(entity);
    await this.audit.record({
      userId: actor.id,
      action: 'CREATE',
      entityName: 'patients',
      entityId: saved.id,
      newValues: { ...dto },
    });
    return saved;
  }

  async update(id: number, dto: UpdatePatientDto, actor: AuthUser): Promise<Patient> {
    return this.dataSource.transaction(async manager => {
      const patient = await this.lockPatient(id, manager);
      if (dto.nationalId && dto.nationalId !== patient.nationalId) {
        const clash = await this.repo.findByNationalId(dto.nationalId);
        if (clash && clash.id !== id) throw new ConflictException(`Documento ${dto.nationalId} ya registrado`);
      }
      const before = { ...patient };
      Object.assign(patient, dto, { updatedById: actor.id });
      const saved = await this.repo.saveInTransaction(patient, manager);
      await this.audit.recordInTransaction({
        userId: actor.id,
        action: 'UPDATE',
        entityName: 'patients',
        entityId: id,
        oldValues: this.snapshot(before),
        newValues: { ...dto },
      }, manager);
      return saved;
    });
  }

  /** Regla de negocio: marcar paciente como fallecido fija deceased_at una sola vez. */
  async markAsDeceased(id: number, actor: AuthUser): Promise<Patient> {
    return this.dataSource.transaction(async manager => {
      const patient = await this.lockPatient(id, manager);
      if (patient.isDeceased) throw new BadRequestException('El paciente ya figura como fallecido');
      patient.isDeceased = true;
      patient.deceasedAt = new Date();
      patient.isPriority = false; // un fallecido no es paciente prioritario
      patient.updatedById = actor.id;
      const saved = await this.repo.saveInTransaction(patient, manager);
      await this.audit.recordInTransaction({
        userId: actor.id,
        action: 'UPDATE',
        entityName: 'patients',
        entityId: id,
        newValues: { isDeceased: true, deceasedAt: saved.deceasedAt },
      }, manager);
      return saved;
    });
  }

  /** Regla de negocio: alternar prioridad; un fallecido no puede marcarse prioritario. */
  async setPriority(id: number, isPriority: boolean, actor: AuthUser): Promise<Patient> {
    return this.dataSource.transaction(async manager => {
      const patient = await this.lockPatient(id, manager);
      if (isPriority && patient.isDeceased) {
        throw new BadRequestException('Un paciente fallecido no puede marcarse como prioritario');
      }
      patient.isPriority = isPriority;
      patient.updatedById = actor.id;
      const saved = await this.repo.saveInTransaction(patient, manager);
      await this.audit.recordInTransaction({
        userId: actor.id,
        action: 'UPDATE',
        entityName: 'patients',
        entityId: id,
        newValues: { isPriority },
      }, manager);
      return saved;
    });
  }

  private snapshot(p: Patient) {
    const { createdBy, updatedBy, archivedBy, ...rest } = p as any;
    return rest;
  }
}
