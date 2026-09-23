import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { AuthUser, CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';
import { ChronicConditionsService } from './chronic-conditions.service';
import { CreateChronicConditionDto } from './dto/create-chronic-condition.dto';
import { UpdateChronicConditionDto } from './dto/update-chronic-condition.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('chronic-conditions')
export class ChronicConditionsController {
  constructor(private readonly service: ChronicConditionsService) {}

  @Get()
  findByPatient(@Query('patientId', ParseIntPipe) patientId: number) {
    return this.service.findByPatient(patientId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findById(id);
  }

  @Post()
  @Roles('admin', 'doctor', 'nurse')
  create(@Body() dto: CreateChronicConditionDto, @CurrentUser() actor: AuthUser) {
    return this.service.create(dto, actor);
  }

  @Patch(':id')
  @Roles('admin', 'doctor', 'nurse')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateChronicConditionDto, @CurrentUser() actor: AuthUser) {
    return this.service.update(id, dto, actor);
  }
}
