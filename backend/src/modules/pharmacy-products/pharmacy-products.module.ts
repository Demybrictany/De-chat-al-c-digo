import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CatalogsModule } from 'src/modules/catalogs/catalogs.module';
import { PharmacyProduct } from './entities/pharmacy-product.entity';
import { PharmacyProductsController } from './pharmacy-products.controller';
import { PharmacyProductsRepository } from './pharmacy-products.repository';
import { PharmacyProductsService } from './pharmacy-products.service';

@Module({
  imports: [TypeOrmModule.forFeature([PharmacyProduct]), CatalogsModule],
  controllers: [PharmacyProductsController],
  providers: [PharmacyProductsService, PharmacyProductsRepository],
  exports: [PharmacyProductsService],
})
export class PharmacyProductsModule {}
