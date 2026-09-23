import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthUser } from 'src/common/decorators/current-user.decorator';
import { AuditService } from 'src/modules/audit/audit.service';
import { AppointmentStatus } from 'src/modules/catalogs/entities/appointment-status.entity';
import { PatientsService } from 'src/modules/patients/patients.service';
import { AppointmentsRepository } from './appointments.repository';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { Appointment } from './entities/appointment.entity';

const DEFAULT_STATUS = 'scheduled';

@Injectable()
export class AppointmentsService {
  constructor(
    private readonly repo: AppointmentsRepository,
    @InjectRepository(AppointmentStatus) private readonly statuses: Repository<AppointmentStatus>,
    private readonly patients: PatientsService,
    private readonly audit: AuditService,
  ) {}

  find(patientId?: number, doctorId?: number): Promise<Appointment[]> {
    if (patientId) return this.repo.findByPatient(patientId);
    if (doctorId) return this.repo.findByDoctor(doctorId);
    return this.repo.findAll({ order: { scheduledAt: 'DESC' } });
  }

  async findById(id: number): Promise<Appointment> {
    const appt = await this.repo.findById(id);
    if (!appt) throw new NotFoundException(`Cita ${id} no encontrada`);
    return appt;
  }

  async create(dto: CreateAppointmentDto, actor: AuthUser): Promise<Appointment> {
    await this.patients.findById(dto.patientId);
    const status = await this.statusByName(DEFAULT_STATUS);
    const entity = this.repo.create({
      patientId: dto.patientId,
      doctorId: dto.doctorId,
      statusId: status.id,
      scheduledAt: new Date(dto.scheduledAt),
      reason: dto.reason ?? null,
      notes: dto.notes ?? null,
      createdById: actor.id,
      updatedById: actor.id,
    });
    const saved = await this.repo.save(entity);
    await this.audit.record({
      userId: actor.id,
      action: 'CREATE',
      entityName: 'appointments',
      entityId: saved.id,
      newValues: { ...dto },
    });
    return saved;
  }

  async update(id: number, dto: UpdateAppointmentDto, actor: AuthUser): Promise<Appointment> {
    const appt = await this.findById(id);
    if (dto.patientId) await this.patients.findById(dto.patientId);
    Object.assign(appt, dto, {
      updatedById: actor.id,
      ...(dto.scheduledAt ? { scheduledAt: new Date(dto.scheduledAt) } : {}),
    });
    const saved = await this.repo.save(appt);
    await this.audit.record({
      userId: actor.id,
      action: 'UPDATE',
      entityName: 'appointments',
      entityId: id,
      newValues: { ...dto },
    });
    return saved;
  }

  async changeStatus(id: number, statusName: string, actor: AuthUser): Promise<Appointment> {
    const appt = await this.findById(id);
    const status = await this.statusByName(statusName);
    appt.statusId = status.id;
    appt.updatedById = actor.id;
    const saved = await this.repo.save(appt);
    await this.audit.record({
      userId: actor.id,
      action: 'UPDATE',
      entityName: 'appointments',
      entityId: id,
      newValues: { status: statusName },
    });
    return saved;
  }

  private async statusByName(name: string): Promise<AppointmentStatus> {
    const status = await this.statuses.findOne({ where: { name } });
    if (!status) throw new NotFoundException(`Catalogo appointment_statuses sin '${name}' (falta seed)`);
    return status;
  }
}
