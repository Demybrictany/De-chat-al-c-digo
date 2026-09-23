import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
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
  ) {}

  findAll(): Promise<Patient[]> {
    return this.repo.findAll({ order: { id: 'ASC' } });
  }

  async findById(id: number): Promise<Patient> {
    const patient = await this.repo.findById(id);
    if (!patient) throw new NotFoundException(`Paciente ${id} no encontrado`);
    return patient;
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
    const patient = await this.findById(id);
    if (dto.nationalId && dto.nationalId !== patient.nationalId) {
      const clash = await this.repo.findByNationalId(dto.nationalId);
      if (clash && clash.id !== id) throw new ConflictException(`Documento ${dto.nationalId} ya registrado`);
    }
    const before = { ...patient };
    Object.assign(patient, dto, { updatedById: actor.id });
    const saved = await this.repo.save(patient);
    await this.audit.record({
      userId: actor.id,
      action: 'UPDATE',
      entityName: 'patients',
      entityId: id,
      oldValues: this.snapshot(before),
      newValues: { ...dto },
    });
    return saved;
  }

  /** Regla de negocio: marcar paciente como fallecido fija deceased_at una sola vez. */
  async markAsDeceased(id: number, actor: AuthUser): Promise<Patient> {
    const patient = await this.findById(id);
    if (patient.isDeceased) throw new BadRequestException('El paciente ya figura como fallecido');
    patient.isDeceased = true;
    patient.deceasedAt = new Date();
    patient.isPriority = false; // un fallecido no es paciente prioritario
    patient.updatedById = actor.id;
    const saved = await this.repo.save(patient);
    await this.audit.record({
      userId: actor.id,
      action: 'UPDATE',
      entityName: 'patients',
      entityId: id,
      newValues: { isDeceased: true, deceasedAt: saved.deceasedAt },
    });
    return saved;
  }

  /** Regla de negocio: alternar prioridad; un fallecido no puede marcarse prioritario. */
  async setPriority(id: number, isPriority: boolean, actor: AuthUser): Promise<Patient> {
    const patient = await this.findById(id);
    if (isPriority && patient.isDeceased) {
      throw new BadRequestException('Un paciente fallecido no puede marcarse como prioritario');
    }
    patient.isPriority = isPriority;
    patient.updatedById = actor.id;
    const saved = await this.repo.save(patient);
    await this.audit.record({
      userId: actor.id,
      action: 'UPDATE',
      entityName: 'patients',
      entityId: id,
      newValues: { isPriority },
    });
    return saved;
  }

  private snapshot(p: Patient) {
    const { createdBy, updatedBy, ...rest } = p as any;
    return rest;
  }
}
