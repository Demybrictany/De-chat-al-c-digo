import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlertsModule } from 'src/modules/alerts/alerts.module';
import { PatientsModule } from 'src/modules/patients/patients.module';
import { ChronicConditionsController } from './chronic-conditions.controller';
import { ChronicConditionsRepository } from './chronic-conditions.repository';
import { ChronicConditionsService } from './chronic-conditions.service';
import { ChronicCondition } from './entities/chronic-condition.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ChronicCondition]), PatientsModule, AlertsModule],
  controllers: [ChronicConditionsController],
  providers: [ChronicConditionsService, ChronicConditionsRepository],
  exports: [ChronicConditionsService],
})
export class ChronicConditionsModule {}
