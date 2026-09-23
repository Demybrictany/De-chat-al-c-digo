import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from 'src/common/base/base.repository';
import { Alert } from './entities/alert.entity';

@Injectable()
export class AlertsRepository extends BaseRepository<Alert> {
  constructor(
    @InjectRepository(Alert)
    repo: Repository<Alert>,
  ) {
    super(repo);
  }

  findByPatient(patientId: number): Promise<Alert[]> {
    return this.repo.find({ where: { patientId }, order: { triggeredAt: 'DESC' } });
  }

  findByStatusName(name: string): Promise<Alert[]> {
    return this.repo.find({ where: { status: { name } }, order: { triggeredAt: 'DESC' } });
  }
}
