import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from 'src/common/base/base.repository';
import { Patient } from './entities/patient.entity';

@Injectable()
export class PatientsRepository extends BaseRepository<Patient> {
  constructor(
    @InjectRepository(Patient)
    repo: Repository<Patient>,
  ) {
    super(repo);
  }

  findByNationalId(nationalId: string): Promise<Patient | null> {
    return this.repo.findOne({ where: { nationalId } });
  }
}
