import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { BaseRepository } from 'src/common/base/base.repository';
import { Prescription } from './entities/prescription.entity';

@Injectable()
export class PrescriptionsRepository extends BaseRepository<Prescription> {
  constructor(
    @InjectRepository(Prescription)
    repo: Repository<Prescription>,
  ) {
    super(repo);
  }

  saveInTransaction(entity: Prescription, manager: EntityManager): Promise<Prescription> {
    return manager.getRepository(Prescription).save(entity);
  }

  findByIdInTransaction(id: number, manager: EntityManager): Promise<Prescription> {
    return manager.getRepository(Prescription).findOneOrFail({ where: { id }, relations: { items: true } });
  }

  findByPatient(patientId: number): Promise<Prescription[]> {
    return this.repo.find({ where: { patientId }, order: { issuedAt: 'DESC' } });
  }
}
