import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from 'src/common/base/base.repository';
import { PharmacyProduct } from './entities/pharmacy-product.entity';

@Injectable()
export class PharmacyProductsRepository extends BaseRepository<PharmacyProduct> {
  constructor(
    @InjectRepository(PharmacyProduct)
    repo: Repository<PharmacyProduct>,
  ) {
    super(repo);
  }
}
