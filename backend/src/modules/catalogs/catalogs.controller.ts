import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { CatalogsService } from './catalogs.service';

/** Catalogos de solo lectura para poblar selects del frontend. */
@UseGuards(JwtAuthGuard)
@Controller('catalogs')
export class CatalogsController {
  constructor(private readonly service: CatalogsService) {}

  @Get('roles')
  roles() {
    return this.service.findRoles();
  }

  @Get('appointment-statuses')
  appointmentStatuses() {
    return this.service.findAppointmentStatuses();
  }

  @Get('alert-statuses')
  alertStatuses() {
    return this.service.findAlertStatuses();
  }

  @Get('product-types')
  productTypes() {
    return this.service.findProductTypes();
  }
}
