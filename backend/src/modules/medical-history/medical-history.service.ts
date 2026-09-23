import { Injectable, NotFoundException } from '@nestjs/common';
import { AuthUser } from 'src/common/decorators/current-user.decorator';
import { AuditService } from 'src/modules/audit/audit.service';
import { PatientsService } from 'src/modules/patients/patients.service';
import { CreateMedicalHistoryDto } from './dto/create-medical-history.dto';
import { UpdateMedicalHistoryDto } from './dto/update-medical-history.dto';
import { MedicalHistory } from './entities/medical-history.entity';
import { MedicalHistoryRepository } from './medical-history.repository';

@Injectable()
export class MedicalHistoryService {
  constructor(
    private readonly repo: MedicalHistoryRepository,
    private readonly patients: PatientsService,
    private readonly audit: AuditService,
  ) {}

  findByPatient(patientId: number): Promise<MedicalHistory[]> {
    return this.repo.findByPatient(patientId);
  }

  async findById(id: number): Promise<MedicalHistory> {
    const entry = await this.repo.findById(id);
    if (!entry) throw new NotFoundException(`Historial ${id} no encontrado`);
    return entry;
  }

  async create(dto: CreateMedicalHistoryDto, actor: AuthUser): Promise<MedicalHistory> {
    await this.patients.findById(dto.patientId); // valida existencia
    const entity = this.repo.create({
      ...dto,
      visitDate: new Date(dto.visitDate),
      createdById: actor.id,
      updatedById: actor.id,
    });
    const saved = await this.repo.save(entity);
    await this.audit.record({
      userId: actor.id,
      action: 'CREATE',
      entityName: 'medical_histories',
      entityId: saved.id,
      newValues: { ...dto },
    });
    return saved;
  }

  async update(id: number, dto: UpdateMedicalHistoryDto, actor: AuthUser): Promise<MedicalHistory> {
    const entry = await this.findById(id);
    if (dto.patientId) await this.patients.findById(dto.patientId);
    Object.assign(entry, dto, {
      updatedById: actor.id,
      ...(dto.visitDate ? { visitDate: new Date(dto.visitDate) } : {}),
    });
    const saved = await this.repo.save(entry);
    await this.audit.record({
      userId: actor.id,
      action: 'UPDATE',
      entityName: 'medical_histories',
      entityId: id,
      newValues: { ...dto },
    });
    return saved;
  }
}
