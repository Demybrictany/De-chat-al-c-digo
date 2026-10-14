import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { BaseRepository } from 'src/common/base/base.repository';
import { Appointment } from './entities/appointment.entity';

@Injectable()
export class AppointmentsRepository extends BaseRepository<Appointment> {
  constructor(
    @InjectRepository(Appointment)
    repo: Repository<Appointment>,
  ) {
    super(repo);
  }

  saveInTransaction(entity: Appointment, manager: EntityManager): Promise<Appointment> {
    return manager.getRepository(Appointment).save(entity);
  }

  findByPatient(patientId: number): Promise<Appointment[]> {
    return this.repo.find({ where: { patientId }, order: { scheduledAt: 'DESC' } });
  }

  findByDoctor(doctorId: number): Promise<Appointment[]> {
    return this.repo.find({ where: { doctorId }, order: { scheduledAt: 'DESC' } });
  }
}
