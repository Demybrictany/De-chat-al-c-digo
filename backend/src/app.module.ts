import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { buildTypeOrmOptions } from './config/database.config';
import { validateEnv } from './config/env.validation';
import { AlertsModule } from './modules/alerts/alerts.module';
import { AppointmentsModule } from './modules/appointments/appointments.module';
import { AuditModule } from './modules/audit/audit.module';
import { AuthModule } from './modules/auth/auth.module';
import { CatalogsModule } from './modules/catalogs/catalogs.module';
import { ChronicConditionsModule } from './modules/chronic-conditions/chronic-conditions.module';
import { MedicalHistoryModule } from './modules/medical-history/medical-history.module';
import { PatientsModule } from './modules/patients/patients.module';
import { PharmacyProductsModule } from './modules/pharmacy-products/pharmacy-products.module';
import { PrescriptionsModule } from './modules/prescriptions/prescriptions.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: buildTypeOrmOptions,
    }),
    AuditModule,
    CatalogsModule,
    AuthModule,
    UsersModule,
    PatientsModule,
    MedicalHistoryModule,
    ChronicConditionsModule,
    AlertsModule,
    AppointmentsModule,
    PharmacyProductsModule,
    PrescriptionsModule,
  ],
})
export class AppModule {}
