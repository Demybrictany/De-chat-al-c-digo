import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatientsModule } from 'src/modules/patients/patients.module';
import { MedicalHistory } from './entities/medical-history.entity';
import { MedicalHistoryController } from './medical-history.controller';
import { MedicalHistoryRepository } from './medical-history.repository';
import { MedicalHistoryService } from './medical-history.service';

@Module({
  imports: [TypeOrmModule.forFeature([MedicalHistory]), PatientsModule],
  controllers: [MedicalHistoryController],
  providers: [MedicalHistoryService, MedicalHistoryRepository],
  exports: [MedicalHistoryService],
})
export class MedicalHistoryModule {}
