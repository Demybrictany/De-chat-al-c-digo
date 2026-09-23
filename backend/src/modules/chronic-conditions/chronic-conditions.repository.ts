import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from 'src/common/base/base.repository';
import { ChronicCondition } from './entities/chronic-condition.entity';

@Injectable()
export class ChronicConditionsRepository extends BaseRepository<ChronicCondition> {
  constructor(
    @InjectRepository(ChronicCondition)
    repo: Repository<ChronicCondition>,
  ) {
    super(repo);
  }

  findByPatient(patientId: number): Promise<ChronicCondition[]> {
    return this.repo.find({ where: { patientId }, order: { id: 'ASC' } });
  }
}
