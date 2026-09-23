import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AlertStatus } from './entities/alert-status.entity';
import { AppointmentStatus } from './entities/appointment-status.entity';
import { ProductType } from './entities/product-type.entity';
import { Role } from './entities/role.entity';

@Injectable()
export class CatalogsService {
  constructor(
    @InjectRepository(Role) private readonly roles: Repository<Role>,
    @InjectRepository(AppointmentStatus) private readonly appointmentStatuses: Repository<AppointmentStatus>,
    @InjectRepository(AlertStatus) private readonly alertStatuses: Repository<AlertStatus>,
    @InjectRepository(ProductType) private readonly productTypes: Repository<ProductType>,
  ) {}

  findRoles() {
    return this.roles.find({ order: { id: 'ASC' } });
  }

  findAppointmentStatuses() {
    return this.appointmentStatuses.find({ order: { id: 'ASC' } });
  }

  findAlertStatuses() {
    return this.alertStatuses.find({ order: { id: 'ASC' } });
  }

  findProductTypes() {
    return this.productTypes.find({ order: { id: 'ASC' } });
  }
}
