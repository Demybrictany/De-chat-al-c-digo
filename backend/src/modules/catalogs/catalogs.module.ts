import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CatalogsController } from './catalogs.controller';
import { CatalogsService } from './catalogs.service';
import { AlertStatus } from './entities/alert-status.entity';
import { AppointmentStatus } from './entities/appointment-status.entity';
import { ProductType } from './entities/product-type.entity';
import { Role } from './entities/role.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Role, AppointmentStatus, AlertStatus, ProductType])],
  controllers: [CatalogsController],
  providers: [CatalogsService],
  exports: [TypeOrmModule],
})
export class CatalogsModule {}
