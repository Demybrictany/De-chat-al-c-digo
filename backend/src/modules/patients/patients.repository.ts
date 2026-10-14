import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, MoreThanOrEqual, Repository } from 'typeorm';
import { BaseRepository } from 'src/common/base/base.repository';
import { Appointment } from 'src/modules/appointments/entities/appointment.entity';
import { Alert } from 'src/modules/alerts/entities/alert.entity';
import { Patient } from './entities/patient.entity';

@Injectable()
export class PatientsRepository extends BaseRepository<Patient> {
  constructor(
    @InjectRepository(Patient)
    repo: Repository<Patient>,
  ) {
    super(repo);
  }

  findByIdForUpdate(id: number, manager: EntityManager): Promise<Patient | null> {
    return manager.getRepository(Patient).findOne({
      where: { id }, lock: { mode: 'pessimistic_write' },
    });
  }

  saveInTransaction(patient: Patient, manager: EntityManager): Promise<Patient> {
    return manager.getRepository(Patient).save(patient);
  }

  countAppointmentsAfter(patientId: number, date: Date, statusName: string, manager: EntityManager) {
    return manager.getRepository(Appointment).count({
      where: { patientId, scheduledAt: MoreThanOrEqual(date), status: { name: statusName } },
    });
  }

  countAlertsByStatus(patientId: number, statusName: string, manager: EntityManager) {
    return manager.getRepository(Alert).count({ where: { patientId, status: { name: statusName } } });
  }

  findByNationalId(nationalId: string): Promise<Patient | null> {
    return this.repo.findOne({ where: { nationalId } });
  }
}
