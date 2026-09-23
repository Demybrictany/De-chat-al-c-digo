import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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

  findByPatient(patientId: number): Promise<Prescription[]> {
    return this.repo.find({ where: { patientId }, order: { issuedAt: 'DESC' } });
  }
}
