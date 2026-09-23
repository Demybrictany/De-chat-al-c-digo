import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from 'src/common/base/base.repository';
import { MedicalHistory } from './entities/medical-history.entity';

@Injectable()
export class MedicalHistoryRepository extends BaseRepository<MedicalHistory> {
  constructor(
    @InjectRepository(MedicalHistory)
    repo: Repository<MedicalHistory>,
  ) {
    super(repo);
  }

  findByPatient(patientId: number): Promise<MedicalHistory[]> {
    return this.repo.find({ where: { patientId }, order: { visitDate: 'DESC' } });
  }
}
