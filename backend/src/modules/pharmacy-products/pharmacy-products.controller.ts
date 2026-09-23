import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthUser, CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';
import { AdjustStockDto } from './dto/adjust-stock.dto';
import { CreatePharmacyProductDto } from './dto/create-pharmacy-product.dto';
import { UpdatePharmacyProductDto } from './dto/update-pharmacy-product.dto';
import { PharmacyProductsService } from './pharmacy-products.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('pharmacy-products')
export class PharmacyProductsController {
  constructor(private readonly service: PharmacyProductsService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findById(id);
  }

  @Post()
  @Roles('admin', 'pharmacist')
  create(@Body() dto: CreatePharmacyProductDto, @CurrentUser() actor: AuthUser) {
    return this.service.create(dto, actor);
  }

  @Patch(':id')
  @Roles('admin', 'pharmacist')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePharmacyProductDto, @CurrentUser() actor: AuthUser) {
    return this.service.update(id, dto, actor);
  }

  @Patch(':id/stock')
  @Roles('admin', 'pharmacist')
  adjustStock(@Param('id', ParseIntPipe) id: number, @Body() dto: AdjustStockDto, @CurrentUser() actor: AuthUser) {
    return this.service.adjustStock(id, dto.delta, actor);
  }
}
