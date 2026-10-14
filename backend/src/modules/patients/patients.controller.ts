import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { ArchivePatientDto } from './dto/archive-patient.dto';
import { ListPatientsDto } from './dto/list-patients.dto';
import { AuthUser, CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';
import { CreatePatientDto } from './dto/create-patient.dto';
import { SetPriorityDto } from './dto/set-priority.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { PatientsService } from './patients.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('patients')
export class PatientsController {
  constructor(private readonly service: PatientsService) {}

  @Get()
  findAll(@Query() query: ListPatientsDto, @CurrentUser() actor: AuthUser) {
    return this.service.findAll(query.includeArchived === 'true', actor);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findById(id);
  }

  @Post()
  @Roles('admin', 'doctor', 'nurse', 'receptionist')
  create(@Body() dto: CreatePatientDto, @CurrentUser() actor: AuthUser) {
    return this.service.create(dto, actor);
  }

  @Patch(':id')
  @Roles('admin', 'doctor', 'nurse', 'receptionist')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePatientDto, @CurrentUser() actor: AuthUser) {
    return this.service.update(id, dto, actor);
  }

  @Patch(':id/archive')
  @Roles('admin')
  archive(@Param('id', ParseIntPipe) id: number, @Body() dto: ArchivePatientDto,
    @CurrentUser() actor: AuthUser, @Req() request: Request) {
    return this.service.archive(id, dto, actor, request.ip);
  }

  @Patch(':id/restore')
  @Roles('admin')
  restore(@Param('id', ParseIntPipe) id: number, @CurrentUser() actor: AuthUser,
    @Req() request: Request) {
    return this.service.restore(id, actor, request.ip);
  }

  @Patch(':id/deceased')
  @Roles('admin', 'doctor')
  markDeceased(@Param('id', ParseIntPipe) id: number, @CurrentUser() actor: AuthUser) {
    return this.service.markAsDeceased(id, actor);
  }

  @Patch(':id/priority')
  @Roles('admin', 'doctor', 'nurse')
  setPriority(@Param('id', ParseIntPipe) id: number, @Body() dto: SetPriorityDto, @CurrentUser() actor: AuthUser) {
    return this.service.setPriority(id, dto.isPriority, actor);
  }
}
