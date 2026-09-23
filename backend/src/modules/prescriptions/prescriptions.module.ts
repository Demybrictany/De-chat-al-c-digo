import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedicalHistoryModule } from 'src/modules/medical-history/medical-history.module';
import { PatientsModule } from 'src/modules/patients/patients.module';
import { PharmacyProductsModule } from 'src/modules/pharmacy-products/pharmacy-products.module';
import { Prescription } from './entities/prescription.entity';
import { PrescriptionItem } from './entities/prescription-item.entity';
import { PrescriptionsController } from './prescriptions.controller';
import { PrescriptionsRepository } from './prescriptions.repository';
import { PrescriptionsService } from './prescriptions.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Prescription, PrescriptionItem]),
    PatientsModule,
    PharmacyProductsModule,
    MedicalHistoryModule,
  ],
  controllers: [PrescriptionsController],
  providers: [PrescriptionsService, PrescriptionsRepository],
  exports: [PrescriptionsService],
})
export class PrescriptionsModule {}
