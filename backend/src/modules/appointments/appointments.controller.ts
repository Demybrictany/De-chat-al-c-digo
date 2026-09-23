import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { AuthUser, CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';
import { AppointmentsService } from './appointments.service';
import { ChangeStatusDto } from './dto/change-status.dto';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly service: AppointmentsService) {}

  @Get()
  find(@Query('patientId') patientId?: string, @Query('doctorId') doctorId?: string) {
    return this.service.find(patientId ? Number(patientId) : undefined, doctorId ? Number(doctorId) : undefined);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findById(id);
  }

  @Post()
  @Roles('admin', 'doctor', 'nurse', 'receptionist')
  create(@Body() dto: CreateAppointmentDto, @CurrentUser() actor: AuthUser) {
    return this.service.create(dto, actor);
  }

  @Patch(':id')
  @Roles('admin', 'doctor', 'nurse', 'receptionist')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateAppointmentDto, @CurrentUser() actor: AuthUser) {
    return this.service.update(id, dto, actor);
  }

  @Patch(':id/status')
  @Roles('admin', 'doctor', 'nurse', 'receptionist')
  changeStatus(@Param('id', ParseIntPipe) id: number, @Body() dto: ChangeStatusDto, @CurrentUser() actor: AuthUser) {
    return this.service.changeStatus(id, dto.status, actor);
  }
}
